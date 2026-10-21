import 'dotenv/config';
import { randomBytes as cryptoRandomBytes } from 'node:crypto';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { and, eq, inArray, isNull } from 'drizzle-orm';
import { db } from '@workspace/db';
import { createSessionToken, getSessionUserId, hashPassword, verifyPassword } from './auth.js';
import { registerTalentRoutes } from './talent/routes.js';
import { hasValidCompanyAssessmentConsent } from './talent/privacy.js';
import {
  usersTable,
  studentsTable,
  companiesTable,
  universitiesTable,
  internshipsTable,
  applicationsTable,
  verificationRequestsTable,
  companyAssessmentConsentsTable,
} from '@workspace/db/schema';

type UserRole = 'student' | 'company' | 'university' | 'admin';

interface UserRecord {
  id: number;
  email: string;
  passwordHash?: string | null;
  name: string;
  role: UserRole;
  avatarUrl?: string | null;
  createdAt: string | Date | null;
}

function normalizeRole(role?: string): UserRole {
  if (role === 'company' || role === 'university') {
    return role;
  }
  return 'student';
}

function toUserResponse(user: UserRecord) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl ?? null,
    createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt ?? new Date().toISOString(),
  };
}

function buildAuthResponse(user: UserRecord) {
  return {
    token: createSessionToken(user.id),
    user: toUserResponse(user),
  };
}

async function createUser(payload: {
  email: string;
  name: string;
  role?: string;
  passwordHash?: string | null;
  avatarUrl?: string | null;
}) {
  const role = normalizeRole(payload.role);
  const passwordHash = payload.passwordHash ?? await hashPassword(randomSocialPassword());
  const record = await db.transaction(async (transaction) => {
    const inserted = await transaction.insert(usersTable).values({
      email: payload.email,
      passwordHash,
      name: payload.name,
      role,
      avatarUrl: payload.avatarUrl ?? null,
    }).returning();
    const user = inserted[0];

    if (role === 'student') {
      await transaction.insert(studentsTable).values({ userId: user.id });
    } else if (role === 'company') {
      await transaction.insert(companiesTable).values({ userId: user.id, companyName: payload.name });
    } else if (role === 'university') {
      await transaction.insert(universitiesTable).values({ userId: user.id, universityName: payload.name });
    }

    return user;
  });
  return {
    id: record.id,
    email: record.email,
    passwordHash: record.passwordHash,
    name: record.name,
    role: record.role as UserRole,
    avatarUrl: record.avatarUrl,
    createdAt: record.createdAt,
  } satisfies UserRecord;
}

async function ensureRoleProfile(user: UserRecord) {
  if (user.role === 'student') {
    await db.insert(studentsTable)
      .values({ userId: user.id })
      .onConflictDoNothing({ target: studentsTable.userId });
  } else if (user.role === 'company') {
    await db.insert(companiesTable)
      .values({ userId: user.id, companyName: user.name })
      .onConflictDoNothing({ target: companiesTable.userId });
  } else if (user.role === 'university') {
    await db.insert(universitiesTable)
      .values({ userId: user.id, universityName: user.name })
      .onConflictDoNothing({ target: universitiesTable.userId });
  }
}

async function getUserByEmail(email: string) {
  const rows = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  const row = rows[0];

  if (!row) return null;

  return {
    id: row.id,
    email: row.email,
    passwordHash: row.passwordHash,
    name: row.name,
    role: row.role as UserRole,
    avatarUrl: row.avatarUrl,
    createdAt: row.createdAt,
  } satisfies UserRecord;
}

async function updateSocialUser(email: string, payload: { name?: string; avatarUrl?: string | null }) {
  const updatedRows = await db.update(usersTable).set({
    name: payload.name ?? undefined,
    avatarUrl: payload.avatarUrl ?? null,
  }).where(eq(usersTable.email, email)).returning();

  const row = updatedRows[0];
  if (!row) return null;

  return {
    id: row.id,
    email: row.email,
    passwordHash: row.passwordHash,
    name: row.name,
    role: row.role as UserRole,
    avatarUrl: row.avatarUrl,
    createdAt: row.createdAt,
  } satisfies UserRecord;
}

function randomSocialPassword() {
  return Buffer.from(cryptoRandomBytes(32)).toString('hex');
}

async function authenticateRequest(request: { headers: { authorization?: string } }) {
  const userId = getSessionUserId(request.headers.authorization ?? '');
  if (!userId) return null;
  const row = (await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1))[0];
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.passwordHash,
    name: row.name,
    role: row.role as UserRole,
    avatarUrl: row.avatarUrl,
    createdAt: row.createdAt,
  } satisfies UserRecord;
}

function isPublicRole(role: string): role is Exclude<UserRole, 'admin'> {
  return role === 'student' || role === 'company' || role === 'university';
}

async function getVerifiedSocialUser(accessToken: string) {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Social sign-in is not configured on the server.');
  }

  const endpoint = new URL('/auth/v1/user', supabaseUrl);
  const response = await fetch(endpoint, {
    headers: {
      apikey: supabaseKey,
      authorization: `Bearer ${accessToken}`,
    },
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) return null;

  const providerUser = await response.json() as {
    email?: unknown;
    user_metadata?: Record<string, unknown>;
  };
  if (typeof providerUser.email !== 'string' || !providerUser.email.includes('@')) {
    return null;
  }

  const metadata = providerUser.user_metadata ?? {};
  const name = [metadata.full_name, metadata.name, metadata.user_name]
    .find((value): value is string => typeof value === 'string' && value.trim().length > 0);
  const avatarUrl = [metadata.avatar_url, metadata.picture]
    .find((value): value is string => typeof value === 'string' && value.length > 0);
  return { email: providerUser.email.trim().toLowerCase(), name, avatarUrl };
}

function parseIntegerQuery(value: unknown) {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

async function buildStudentDashboard(studentId: number) {
  const student = (await db.select().from(studentsTable).where(eq(studentsTable.userId, studentId)).limit(1))[0];
  if (!student) {
    return null;
  }

  const applications = await db.select().from(applicationsTable).where(eq(applicationsTable.studentId, student.id));
  const totalApplications = applications.length;
  const pendingApplications = applications.filter((item) => item.status === 'pending').length;
  const acceptedApplications = applications.filter((item) => item.status === 'accepted').length;
  const rejectedApplications = applications.filter((item) => item.status === 'rejected').length;

  const profileCompleteness = [
    Boolean(student.university),
    student.gpa !== null && student.gpa !== undefined,
    Boolean(student.bio),
    Boolean(student.resumeUrl),
    Array.isArray(student.skills) && student.skills.length > 0,
  ].reduce((sum, value) => sum + (value ? 20 : 0), 0);

  const openInternships = await db.select().from(internshipsTable).where(eq(internshipsTable.status, 'open'));
  const recommendedCount = Math.max(0, openInternships.length - totalApplications);

  const recentApplications = await Promise.all(
    applications
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(async (app) => {
        const internship = (await db.select().from(internshipsTable).where(eq(internshipsTable.id, app.internshipId)).limit(1))[0];
        const company = internship
          ? (await db.select().from(companiesTable).where(eq(companiesTable.id, internship.companyId)).limit(1))[0]
          : null;

        return {
          id: app.id,
          studentId: app.studentId,
          internshipId: app.internshipId,
          internshipTitle: internship?.title ?? 'Unknown Role',
          companyName: company?.companyName ?? 'Unknown Company',
          companyLogo: company?.logoUrl ?? null,
          status: app.status,
          createdAt: app.createdAt instanceof Date ? app.createdAt.toISOString() : app.createdAt,
          matchScore: app.matchScore ?? null,
        };
      }),
  );

  return {
    totalApplications,
    pendingApplications,
    acceptedApplications,
    rejectedApplications,
    profileCompleteness,
    recommendedCount,
    recentApplications,
  };
}

async function buildCompanyDashboard(companyUserId: number) {
  const company = (await db.select().from(companiesTable).where(eq(companiesTable.userId, companyUserId)).limit(1))[0];
  if (!company) {
    return null;
  }

  const internships = await db.select().from(internshipsTable).where(eq(internshipsTable.companyId, company.id));
  const totalInternships = internships.length;
  const activeInternships = internships.filter((job) => job.status === 'open').length;
  const internshipIds = internships.map((job) => job.id);

  const allApplications = internshipIds.length
    ? await db.select().from(applicationsTable)
    : [];

  const companyApplications = allApplications.filter((application) => internshipIds.includes(application.internshipId));
  const totalApplicants = companyApplications.length;
  const pendingApplicants = companyApplications.filter((application) => application.status === 'pending').length;
  const acceptedApplicants = companyApplications.filter((application) => application.status === 'accepted').length;
  const activeConsents = companyApplications.length
    ? await db.select({
        applicationId: companyAssessmentConsentsTable.applicationId,
        studentId: companyAssessmentConsentsTable.studentId,
        revokedAt: companyAssessmentConsentsTable.revokedAt,
      }).from(companyAssessmentConsentsTable)
        .where(and(
          inArray(companyAssessmentConsentsTable.applicationId, companyApplications.map((application) => application.id)),
          isNull(companyAssessmentConsentsTable.revokedAt),
        ))
    : [];

  const recentApplications = await Promise.all(
    companyApplications
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(async (app) => {
        const student = (await db.select().from(studentsTable).where(eq(studentsTable.id, app.studentId)).limit(1))[0];
        const user = student
          ? (await db.select().from(usersTable).where(eq(usersTable.id, student.userId)).limit(1))[0]
          : null;
        const internship = internships.find((item) => item.id === app.internshipId);

        return {
          id: app.id,
          studentId: app.studentId,
          internshipId: app.internshipId,
          studentName: user?.name ?? 'Unknown Student',
          studentEmail: user?.email ?? '',
          studentAvatar: user?.avatarUrl ?? null,
          studentSkills: student?.skills ?? [],
          coverLetter: app.coverLetter ?? null,
          matchScore: hasValidCompanyAssessmentConsent(activeConsents, app.id, app.studentId)
            ? app.matchScore ?? null
            : null,
          status: app.status,
          internshipTitle: internship?.title ?? 'Unknown Role',
          createdAt: app.createdAt instanceof Date ? app.createdAt.toISOString() : app.createdAt,
        };
      }),
  );

  return {
    totalInternships,
    activeInternships,
    totalApplicants,
    pendingApplicants,
    acceptedApplicants,
    recentApplications,
  };
}

async function buildUniversityDashboard(universityUserId: number) {
  const university = (await db.select().from(universitiesTable).where(eq(universitiesTable.userId, universityUserId)).limit(1))[0];
  if (!university) {
    return null;
  }

  const students = university.universityName
    ? await db.select().from(studentsTable).where(eq(studentsTable.university, university.universityName))
    : [];
  const totalStudents = students.length;
  const verifiedStudents = students.filter((student) => student.verified).length;

  const studentIds = students.map((student) => student.id);
  const verificationRequests = await db.select().from(verificationRequestsTable).where(eq(verificationRequestsTable.universityId, university.id));
  const pendingVerifications = verificationRequests.filter((request) => request.status === 'pending').length;

  const allApplications = studentIds.length
    ? await db.select().from(applicationsTable)
    : [];
  const placedStudents = new Set(
    allApplications
      .filter((application) => application.status === 'accepted' && studentIds.includes(application.studentId))
      .map((application) => application.studentId),
  ).size;

  const recentVerifications = await Promise.all(
    verificationRequests
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(async (request) => {
        const student = (await db.select().from(studentsTable).where(eq(studentsTable.id, request.studentId)).limit(1))[0];
        const user = student
          ? (await db.select().from(usersTable).where(eq(usersTable.id, student.userId)).limit(1))[0]
          : null;

        return {
          id: request.id,
          studentId: request.studentId,
          universityId: request.universityId,
          studentName: user?.name ?? 'Unknown Student',
          studentEmail: user?.email ?? '',
          status: request.status,
          createdAt: request.createdAt instanceof Date ? request.createdAt.toISOString() : request.createdAt,
        };
      }),
  );

  return {
    totalStudents,
    verifiedStudents,
    pendingVerifications,
    placedStudents,
    recentVerifications,
  };
}

async function start() {
  const app = Fastify({ logger: false });
  await app.register(cors, { origin: true });

  app.get('/api/healthz', async () => ({ ok: true, service: 'koda-ai-server' }));
  app.get('/healthz', async () => ({ ok: true, service: 'koda-ai-server' }));

  registerTalentRoutes(app);

  app.post('/api/auth/register', async (request, reply) => {
    const body = (request.body && typeof request.body === 'object' ? request.body : {}) as Record<string, unknown>;
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');
    const name = String(body.name ?? '').trim();
    const role = String(body.role ?? 'student');

    if (!email || !password || !name) {
      reply.code(400);
      return { error: 'email, password and name are required' };
    }
    if (
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      password.length < 8 ||
      password.length > 256 ||
      name.length < 2 ||
      name.length > 120
    ) {
      reply.code(400);
      return { error: 'email, password or name is invalid' };
    }
    if (!isPublicRole(role)) {
      reply.code(400);
      return { error: 'role must be student, company or university' };
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      reply.code(409);
      return { error: 'user already exists' };
    }

    const user = await createUser({
      email,
      name,
      role,
      passwordHash: await hashPassword(password),
    });

    return buildAuthResponse(user);
  });

  app.post('/api/auth/login', async (request, reply) => {
    const body = (request.body && typeof request.body === 'object' ? request.body : {}) as Record<string, unknown>;
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');
    if (!email || email.length > 254 || !password || password.length > 256) {
      reply.code(400);
      return { error: 'email and password are required' };
    }
    const user = await getUserByEmail(email);
    const passwordCheck = user?.passwordHash
      ? await verifyPassword(password, user.passwordHash)
      : { valid: false, needsRehash: false };

    if (!user || !passwordCheck.valid) {
      reply.code(401);
      return { error: 'invalid credentials' };
    }

    if (passwordCheck.needsRehash) {
      await db.update(usersTable)
        .set({ passwordHash: await hashPassword(password) })
        .where(eq(usersTable.id, user.id));
    }

    await ensureRoleProfile(user);
    return buildAuthResponse(user);
  });

  app.post('/api/auth/social', async (request, reply) => {
    const body = (request.body && typeof request.body === 'object' ? request.body : {}) as Record<string, unknown>;
    const accessToken = typeof body.accessToken === 'string' ? body.accessToken : '';
    const requestedRole = String(body.role ?? 'student');
    if (!accessToken || accessToken.length > 8192 || !isPublicRole(requestedRole)) {
      reply.code(400);
      return { error: 'a valid provider session and role are required' };
    }

    let providerUser: Awaited<ReturnType<typeof getVerifiedSocialUser>> | null;
    try {
      providerUser = await getVerifiedSocialUser(accessToken);
    } catch {
      reply.code(503);
      return { error: 'identity provider is temporarily unavailable' };
    }
    if (!providerUser) {
      reply.code(401);
      return { error: 'invalid provider session' };
    }

    const { email } = providerUser;
    let user = await getUserByEmail(email);
    if (!user) {
      user = await createUser({
        email,
        name: providerUser.name ?? email.split('@')[0],
        role: requestedRole,
        avatarUrl: providerUser.avatarUrl ?? null,
      });
    } else {
      user = await updateSocialUser(email, {
        name: providerUser.name ?? user.name,
        avatarUrl: providerUser.avatarUrl ?? null,
      });
    }

    if (!user) {
      reply.code(500);
      return { error: 'failed to resolve user account' };
    }

    await ensureRoleProfile(user);
    return buildAuthResponse(user);
  });

  app.get<{ Querystring: { studentId?: string } }>('/api/dashboard/student', async (request, reply) => {
    const user = await authenticateRequest(request);
    if (!user) {
      reply.code(401);
      return { error: 'authentication required' };
    }
    if (user.role !== 'student') {
      reply.code(403);
      return { error: 'student access required' };
    }

    await ensureRoleProfile(user);
    const studentId = parseIntegerQuery(request.query.studentId);
    if (!studentId || studentId !== user.id) {
      reply.code(400);
      return { error: 'studentId must match the authenticated user' };
    }

    const dashboard = await buildStudentDashboard(studentId);
    if (!dashboard) {
      reply.code(404);
      return { error: 'student dashboard not found' };
    }

    return dashboard;
  });

  app.get<{ Querystring: { companyId?: string } }>('/api/dashboard/company', async (request, reply) => {
    const user = await authenticateRequest(request);
    if (!user) {
      reply.code(401);
      return { error: 'authentication required' };
    }
    if (user.role !== 'company') {
      reply.code(403);
      return { error: 'company access required' };
    }

    await ensureRoleProfile(user);
    const companyId = parseIntegerQuery(request.query.companyId);
    if (!companyId || companyId !== user.id) {
      reply.code(400);
      return { error: 'companyId must match the authenticated user' };
    }

    const dashboard = await buildCompanyDashboard(companyId);
    if (!dashboard) {
      reply.code(404);
      return { error: 'company dashboard not found' };
    }

    return dashboard;
  });

  app.get<{ Querystring: { universityId?: string } }>('/api/dashboard/university', async (request, reply) => {
    const user = await authenticateRequest(request);
    if (!user) {
      reply.code(401);
      return { error: 'authentication required' };
    }
    if (user.role !== 'university') {
      reply.code(403);
      return { error: 'university access required' };
    }

    await ensureRoleProfile(user);
    const universityId = parseIntegerQuery(request.query.universityId);
    if (!universityId || universityId !== user.id) {
      reply.code(400);
      return { error: 'universityId must match the authenticated user' };
    }

    const dashboard = await buildUniversityDashboard(universityId);
    if (!dashboard) {
      reply.code(404);
      return { error: 'university dashboard not found' };
    }

    return dashboard;
  });

  app.get<{ Querystring: { universityId?: string } }>('/api/verification', async (request, reply) => {
    const user = await authenticateRequest(request);
    if (!user) {
      reply.code(401);
      return { error: 'authentication required' };
    }
    if (user.role !== 'university') {
      reply.code(403);
      return { error: 'university access required' };
    }

    const universityId = parseIntegerQuery(request.query.universityId);
    if (!universityId || universityId !== user.id) {
      reply.code(400);
      return { error: 'universityId must match the authenticated user' };
    }

    const university = (await db.select().from(universitiesTable).where(eq(universitiesTable.userId, universityId)).limit(1))[0];
    if (!university) {
      reply.code(404);
      return { error: 'university not found' };
    }

    const requests = await db.select().from(verificationRequestsTable).where(eq(verificationRequestsTable.universityId, university.id));
    const result = await Promise.all(
      requests.map(async (requestRow) => {
        const student = (await db.select().from(studentsTable).where(eq(studentsTable.id, requestRow.studentId)).limit(1))[0];
        const studentUser = student
          ? (await db.select().from(usersTable).where(eq(usersTable.id, student.userId)).limit(1))[0]
          : null;

        return {
          id: requestRow.id,
          studentId: requestRow.studentId,
          universityId: requestRow.universityId,
          status: requestRow.status,
          createdAt: requestRow.createdAt instanceof Date ? requestRow.createdAt.toISOString() : requestRow.createdAt,
          studentName: studentUser?.name ?? 'Unknown Student',
          studentEmail: studentUser?.email ?? '',
        };
      }),
    );

    return result;
  });

  app.put<{ Params: { id: string } }>('/api/verification/:id/status', async (request, reply) => {
    const user = await authenticateRequest(request);
    if (!user) {
      reply.code(401);
      return { error: 'authentication required' };
    }
    if (user.role !== 'university') {
      reply.code(403);
      return { error: 'university access required' };
    }

    const id = Number(request.params.id);
    const body = request.body && typeof request.body === 'object' && !Array.isArray(request.body)
      ? request.body as Record<string, unknown>
      : {};
    const status = body.status;

    if (
      !Number.isSafeInteger(id) ||
      id <= 0 ||
      (status !== 'approved' && status !== 'rejected')
    ) {
      reply.code(400);
      return { error: 'invalid id or status' };
    }

    const university = (await db.select().from(universitiesTable).where(eq(universitiesTable.userId, user.id)).limit(1))[0];
    if (!university) {
      reply.code(404);
      return { error: 'university not found' };
    }
    const requestRow = await db.transaction(async (transaction) => {
      const updated = (await transaction.update(verificationRequestsTable)
        .set({ status })
        .where(and(
          eq(verificationRequestsTable.id, id),
          eq(verificationRequestsTable.universityId, university.id),
          eq(verificationRequestsTable.status, 'pending'),
        ))
        .returning())[0];
      if (!updated) return null;

      if (status === 'approved') {
        await transaction.update(studentsTable)
          .set({ verified: true })
          .where(eq(studentsTable.id, updated.studentId));
      }
      return updated;
    });
    if (!requestRow) {
      const existingRequest = (await db.select({ id: verificationRequestsTable.id })
        .from(verificationRequestsTable)
        .where(and(
          eq(verificationRequestsTable.id, id),
          eq(verificationRequestsTable.universityId, university.id),
        ))
        .limit(1))[0];
      reply.code(existingRequest ? 409 : 404);
      return { error: existingRequest
        ? 'verification request has already been reviewed'
        : 'verification request not found' };
    }

    const student = (await db.select().from(studentsTable).where(eq(studentsTable.id, requestRow.studentId)).limit(1))[0];
    const studentUser = student
      ? (await db.select().from(usersTable).where(eq(usersTable.id, student.userId)).limit(1))[0]
      : null;

    return {
      id: requestRow.id,
      studentId: requestRow.studentId,
      universityId: requestRow.universityId,
      status: requestRow.status,
      createdAt: requestRow.createdAt instanceof Date ? requestRow.createdAt.toISOString() : requestRow.createdAt,
      studentName: studentUser?.name ?? 'Unknown Student',
      studentEmail: studentUser?.email ?? '',
    };
  });

  app.get('/api/auth/me', async (request, reply) => {
    const user = await authenticateRequest(request);
    if (!user) {
      reply.code(401);
      return { error: 'invalid or expired token' };
    }

    return toUserResponse(user);
  });

  const host = process.env.HOST ?? '0.0.0.0';
  const port = Number(process.env.PORT ?? process.env.SERVER_PORT ?? 4174);
  await app.listen({ host, port });
  console.log(`Server listening on http://${host}:${port}`);
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
