import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { and, asc, desc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  applicationsTable,
  assessmentAnswersTable,
  assessmentAttemptsTable,
  assessmentQuestionsTable,
  assessmentSkillScoresTable,
  assessmentTemplatesTable,
  assessmentVersionsTable,
  companyAssessmentConsentsTable,
  companiesTable,
  internshipMatchSnapshotsTable,
  internshipTalentRequirementsTable,
  internshipsTable,
  itRolesTable,
  roleSkillRequirementsTable,
  skillCatalogTable,
  studentEducationTable,
  studentExperienceTable,
  studentProjectsTable,
  studentDataAccessAuditTable,
  studentsTable,
  universityAnalyticsConsentsTable,
  universitiesTable,
  usersTable,
} from "@workspace/db/schema";
import { getSessionUserId } from "../auth.js";
import { AssistantError, generateAssistantReply } from "../ai/assistant.js";
import {
  calculateQuestionPoints,
  isReadyQuestion,
  validateAssessmentAnswer,
} from "./assessment-scoring.js";
import { parseQuestionDrafts } from "./question-drafts.js";
import {
  calculateInternshipEvidenceMatch,
  explainMatch,
  MATCH_WEIGHTS,
} from "./matching.js";

type AssessmentQuestion = typeof assessmentQuestionsTable.$inferSelect;

function parseId(value: unknown) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function normalize(value: string) {
  return value.trim().toLocaleLowerCase();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function readText(value: unknown, maximumLength: number, required = false) {
  if (typeof value !== "string") return required ? null : "";
  const text = value.trim();
  if (required && !text) return null;
  return text.length <= maximumLength ? text : null;
}

function readTextList(value: unknown, maxItems = 50, maxLength = 100) {
  if (!Array.isArray(value) || value.length > maxItems) return null;
  const items: string[] = [];
  for (const item of value) {
    if (typeof item !== "string" || item.trim().length > maxLength) return null;
    const text = item.trim();
    if (text && !items.includes(text)) items.push(text);
  }
  return items;
}

function readDate(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function readInternshipInput(value: unknown) {
  if (!isRecord(value)) return null;
  const title = readText(value.title, 160, true);
  const description = readText(value.description, 10_000, true);
  const location = readText(value.location ?? "", 200);
  const type = readText(value.type ?? "", 100);
  const duration = readText(value.duration ?? "", 100);
  const skills = readTextList(value.skills ?? [], 50);
  const salary = readText(value.salary ?? "", 100);
  const deadline = readText(value.deadline ?? "", 80);
  const status = value.status === undefined ? "open" : value.status;
  if (
    title === null || description === null || location === null || type === null ||
    duration === null || !skills || salary === null || deadline === null ||
    !["open", "closed", "draft"].includes(String(status))
  ) {
    return null;
  }
  return {
    title,
    description,
    location: location || null,
    type: type || null,
    duration: duration || null,
    skills,
    salary: salary || null,
    deadline: deadline || null,
    status: status as "open" | "closed" | "draft",
  };
}

async function getStudent(request: FastifyRequest, reply: FastifyReply) {
  const userId = getSessionUserId(request.headers.authorization ?? "");
  if (!userId) {
    reply.code(401);
    return null;
  }

  const user = (await db.select({ id: usersTable.id, role: usersTable.role })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1))[0];
  if (!user || user.role !== "student") {
    reply.code(403);
    return null;
  }

  let student = (await db.select().from(studentsTable)
    .where(eq(studentsTable.userId, user.id))
    .limit(1))[0];
  if (!student) {
    const inserted = await db.insert(studentsTable)
      .values({ userId: user.id })
      .onConflictDoNothing()
      .returning();
    student = inserted[0] ?? (await db.select().from(studentsTable)
      .where(eq(studentsTable.userId, user.id))
      .limit(1))[0];
  }
  if (!student) {
    reply.code(500);
    return null;
  }

  return student;
}

async function getCompany(request: FastifyRequest, reply: FastifyReply) {
  const userId = getSessionUserId(request.headers.authorization ?? "");
  if (!userId) {
    reply.code(401);
    return null;
  }

  const user = (await db.select({ id: usersTable.id, role: usersTable.role })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1))[0];
  if (!user || user.role !== "company") {
    reply.code(403);
    return null;
  }

  const company = (await db.select().from(companiesTable)
    .where(eq(companiesTable.userId, user.id))
    .limit(1))[0];
  if (!company) {
    reply.code(404);
    return null;
  }
  return company;
}

async function getUniversity(request: FastifyRequest, reply: FastifyReply) {
  const userId = getSessionUserId(request.headers.authorization ?? "");
  if (!userId) {
    reply.code(401);
    return null;
  }

  const user = (await db.select({ id: usersTable.id, role: usersTable.role })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1))[0];
  if (!user || user.role !== "university") {
    reply.code(403);
    return null;
  }

  const university = (await db.select().from(universitiesTable)
    .where(eq(universitiesTable.userId, user.id))
    .limit(1))[0];
  if (!university) {
    reply.code(404);
    return null;
  }
  return university;
}

async function getAdminUser(request: FastifyRequest, reply: FastifyReply) {
  const userId = getSessionUserId(request.headers.authorization ?? "");
  if (!userId) {
    reply.code(401);
    return null;
  }
  const user = (await db.select({ id: usersTable.id, role: usersTable.role })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1))[0];
  if (!user || user.role !== "admin") {
    reply.code(403);
    return null;
  }
  return user;
}

async function getOwnedAttempt(attemptId: number, studentId: number) {
  return (await db.select().from(assessmentAttemptsTable)
    .where(and(
      eq(assessmentAttemptsTable.id, attemptId),
      eq(assessmentAttemptsTable.studentId, studentId),
    ))
    .limit(1))[0] ?? null;
}

async function expireIfNeeded(attempt: typeof assessmentAttemptsTable.$inferSelect) {
  if (attempt.status !== "in_progress" || attempt.expiresAt.getTime() > Date.now()) {
    return attempt.status === "expired";
  }
  await db.update(assessmentAttemptsTable)
    .set({ status: "expired" })
    .where(eq(assessmentAttemptsTable.id, attempt.id));
  return true;
}

async function buildAttemptResponse(attempt: typeof assessmentAttemptsTable.$inferSelect) {
  const questions = await db.select().from(assessmentQuestionsTable)
    .where(eq(assessmentQuestionsTable.versionId, attempt.versionId))
    .orderBy(asc(assessmentQuestionsTable.position));
  const answers = await db.select().from(assessmentAnswersTable)
    .where(eq(assessmentAnswersTable.attemptId, attempt.id));
  const answersByQuestion = new Map(answers.map((answer) => [answer.questionId, answer]));
  return {
    id: attempt.id,
    status: attempt.status,
    startedAt: attempt.startedAt,
    expiresAt: attempt.expiresAt,
    submittedAt: attempt.submittedAt,
    overallScore: attempt.overallScore,
    resultExplanation: attempt.resultExplanation,
    explanationModel: attempt.explanationModel,
    questions: questions.map((question) => {
      const answer = answersByQuestion.get(question.id);
      return {
        id: question.id,
        position: question.position,
        skillId: question.skillId,
        type: question.type,
        difficulty: question.difficulty,
        prompt: question.prompt,
        options: question.options,
        answer: answer?.answer ?? null,
        earnedPoints: attempt.status === "submitted" ? answer?.pointsEarned ?? null : null,
        explanation: attempt.status === "submitted" ? question.explanation : null,
      };
    }),
  };
}

function isUniqueViolation(error: unknown) {
  return Boolean(
    error &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code?: unknown }).code === "23505",
  );
}

export function registerTalentRoutes(app: FastifyInstance) {
  app.post("/api/talent/admin/assessment-drafts", async (request, reply) => {
    const admin = await getAdminUser(request, reply);
    if (!admin) return { error: "administrator access required" };
    const body = isRecord(request.body) ? request.body : {};
    const skillId = parseId(body.skillId);
    const questionCount = parseId(body.questionCount);
    const difficulty = body.difficulty;
    if (
      !skillId ||
      !questionCount ||
      questionCount > 15 ||
      !["beginner", "intermediate", "advanced"].includes(String(difficulty))
    ) {
      reply.code(400);
      return { error: "skillId, questionCount (1-15), and a supported difficulty are required" };
    }
    const skill = (await db.select().from(skillCatalogTable)
      .where(and(eq(skillCatalogTable.id, skillId), eq(skillCatalogTable.active, true)))
      .limit(1))[0];
    if (!skill) {
      reply.code(404);
      return { error: "active skill not found" };
    }

    let generated: Awaited<ReturnType<typeof generateAssistantReply>>;
    try {
      generated = await generateAssistantReply(
        [
          `Create exactly ${questionCount} multiple-choice technical questions about ${skill.name}.`,
          `Target difficulty: ${difficulty}.`,
          "Use practical, unambiguous questions. Use one correct choice per question.",
          "Return only JSON with this shape: {\"questions\":[{\"prompt\":\"...\",\"options\":[{\"id\":\"a\",\"label\":\"...\"},{\"id\":\"b\",\"label\":\"...\"},{\"id\":\"c\",\"label\":\"...\"}],\"answerKey\":\"a\",\"explanation\":\"...\"}]}.",
          "Each question must have 3 to 5 choices with unique short ids. Do not include markdown or code that would need to run.",
        ].join("\n"),
        { role: "admin" },
        "You draft objective technical assessment items for human review. Follow the user's requested JSON shape exactly and return valid JSON only.",
      );
    } catch (error) {
      if (!(error instanceof AssistantError)) throw error;
      reply.code(error.statusCode);
      return { error: error.message };
    }

    let drafts;
    try {
      drafts = parseQuestionDrafts(generated.reply, questionCount);
    } catch {
      reply.code(502);
      return { error: "Gemini returned an invalid question draft. No assessment content was saved." };
    }

    const title = `${skill.name} (${difficulty}) technical assessment`;
    const assessment = await db.transaction(async (transaction) => {
      const [template] = await transaction.insert(assessmentTemplatesTable).values({
        title,
        skillId,
        difficulty: difficulty as "beginner" | "intermediate" | "advanced",
        durationMinutes: Math.min(60, Math.max(10, questionCount * 2)),
        active: false,
      }).returning({ id: assessmentTemplatesTable.id });
      const [version] = await transaction.insert(assessmentVersionsTable).values({
        templateId: template.id,
        version: 1,
        status: "draft",
        configuration: { questionCount, generatedModel: generated.model },
        createdByUserId: admin.id,
      }).returning({ id: assessmentVersionsTable.id });
      const questions = await transaction.insert(assessmentQuestionsTable).values(
        drafts.map((draft, index) => ({
          versionId: version.id,
          skillId,
          position: index + 1,
          type: "single_choice" as const,
          difficulty: difficulty as "beginner" | "intermediate" | "advanced",
          prompt: draft.prompt,
          options: draft.options,
          answerKey: draft.answerKey,
          maxPoints: "1",
          explanation: draft.explanation,
        })),
      ).returning({ id: assessmentQuestionsTable.id });
      return { template, version, questions };
    });

    return {
      assessmentId: assessment.version.id,
      templateId: assessment.template.id,
      title,
      status: "draft",
      questionCount: assessment.questions.length,
      requiresHumanReview: true,
    };
  });

  app.get("/api/talent/admin/assessment-versions/:versionId", async (request, reply) => {
    const admin = await getAdminUser(request, reply);
    if (!admin) return { error: "administrator access required" };
    const versionId = parseId((request.params as { versionId?: unknown }).versionId);
    if (!versionId) {
      reply.code(400);
      return { error: "valid assessment version id is required" };
    }
    const version = (await db.select({
      id: assessmentVersionsTable.id,
      version: assessmentVersionsTable.version,
      status: assessmentVersionsTable.status,
      title: assessmentTemplatesTable.title,
      skillId: assessmentTemplatesTable.skillId,
      difficulty: assessmentTemplatesTable.difficulty,
      durationMinutes: assessmentTemplatesTable.durationMinutes,
    }).from(assessmentVersionsTable)
      .innerJoin(assessmentTemplatesTable, eq(assessmentTemplatesTable.id, assessmentVersionsTable.templateId))
      .where(eq(assessmentVersionsTable.id, versionId))
      .limit(1))[0];
    if (!version) {
      reply.code(404);
      return { error: "assessment version not found" };
    }
    const questions = await db.select().from(assessmentQuestionsTable)
      .where(eq(assessmentQuestionsTable.versionId, versionId))
      .orderBy(asc(assessmentQuestionsTable.position));
    return { ...version, questions };
  });

  app.put("/api/talent/admin/assessment-questions/:questionId", async (request, reply) => {
    const admin = await getAdminUser(request, reply);
    if (!admin) return { error: "administrator access required" };
    const questionId = parseId((request.params as { questionId?: unknown }).questionId);
    const body = isRecord(request.body) ? request.body : {};
    if (!questionId) {
      reply.code(400);
      return { error: "valid question id is required" };
    }
    const question = (await db.select().from(assessmentQuestionsTable)
      .where(eq(assessmentQuestionsTable.id, questionId))
      .limit(1))[0];
    if (!question) {
      reply.code(404);
      return { error: "assessment question not found" };
    }
    const version = (await db.select({ status: assessmentVersionsTable.status })
      .from(assessmentVersionsTable)
      .where(eq(assessmentVersionsTable.id, question.versionId))
      .limit(1))[0];
    if (!version || version.status !== "draft" || question.reviewedAt) {
      reply.code(409);
      return { error: "only unreviewed questions in a draft version can be edited" };
    }
    let draft;
    try {
      [draft] = parseQuestionDrafts(JSON.stringify({ questions: [body] }), 1);
    } catch {
      reply.code(400);
      return { error: "question content is invalid" };
    }

    await db.update(assessmentQuestionsTable).set({
      prompt: draft.prompt,
      options: draft.options,
      answerKey: draft.answerKey,
      explanation: draft.explanation,
    }).where(eq(assessmentQuestionsTable.id, questionId));
    return { updated: true };
  });

  app.post("/api/talent/admin/assessment-questions/:questionId/review", async (request, reply) => {
    const admin = await getAdminUser(request, reply);
    if (!admin) return { error: "administrator access required" };
    const questionId = parseId((request.params as { questionId?: unknown }).questionId);
    if (!questionId) {
      reply.code(400);
      return { error: "valid question id is required" };
    }
    const question = (await db.select().from(assessmentQuestionsTable)
      .where(eq(assessmentQuestionsTable.id, questionId))
      .limit(1))[0];
    if (!question) {
      reply.code(404);
      return { error: "assessment question not found" };
    }
    const version = (await db.select({ status: assessmentVersionsTable.status })
      .from(assessmentVersionsTable)
      .where(eq(assessmentVersionsTable.id, question.versionId))
      .limit(1))[0];
    if (!version || version.status !== "draft") {
      reply.code(409);
      return { error: "only questions in a draft assessment can be reviewed" };
    }
    if (!isReadyQuestion({ ...question, reviewedAt: new Date(), reviewedByUserId: admin.id })) {
      reply.code(400);
      return { error: "question cannot be approved until its options and answer key are valid" };
    }
    await db.update(assessmentQuestionsTable).set({
      reviewedByUserId: admin.id,
      reviewedAt: new Date(),
    }).where(eq(assessmentQuestionsTable.id, questionId));
    return { reviewed: true };
  });

  app.post("/api/talent/admin/assessment-versions/:versionId/publish", async (request, reply) => {
    const admin = await getAdminUser(request, reply);
    if (!admin) return { error: "administrator access required" };
    const versionId = parseId((request.params as { versionId?: unknown }).versionId);
    if (!versionId) {
      reply.code(400);
      return { error: "valid assessment version id is required" };
    }
    const version = (await db.select().from(assessmentVersionsTable)
      .where(eq(assessmentVersionsTable.id, versionId))
      .limit(1))[0];
    if (!version || version.status !== "draft") {
      reply.code(404);
      return { error: "draft assessment version not found" };
    }
    const questions = await db.select().from(assessmentQuestionsTable)
      .where(eq(assessmentQuestionsTable.versionId, versionId));
    if (!questions.length || questions.length > 50 || questions.some((question) => !isReadyQuestion(question))) {
      reply.code(409);
      return { error: "all assessment questions must be reviewed before publishing" };
    }
    const publishedAt = new Date();
    await db.transaction(async (transaction) => {
      await transaction.update(assessmentVersionsTable)
        .set({ status: "published", publishedAt })
        .where(and(
          eq(assessmentVersionsTable.id, versionId),
          eq(assessmentVersionsTable.status, "draft"),
        ));
      await transaction.update(assessmentTemplatesTable)
        .set({ active: true })
        .where(eq(assessmentTemplatesTable.id, version.templateId));
    });
    return { published: true, versionId, publishedAt };
  });

  app.post("/api/talent/privacy/university-consents", async (request, reply) => {
    const student = await getStudent(request, reply);
    if (!student) return { error: "student account not found" };
    const body = isRecord(request.body) ? request.body : {};
    const universityId = parseId(body.universityId);
    if (!universityId) {
      reply.code(400);
      return { error: "valid university id is required" };
    }
    const university = (await db.select({ id: universitiesTable.id })
      .from(universitiesTable)
      .where(eq(universitiesTable.id, universityId))
      .limit(1))[0];
    if (!university) {
      reply.code(404);
      return { error: "university not found" };
    }
    await db.insert(universityAnalyticsConsentsTable).values({
      studentId: student.id,
      universityId,
      grantedAt: new Date(),
      revokedAt: null,
    }).onConflictDoUpdate({
      target: [universityAnalyticsConsentsTable.studentId, universityAnalyticsConsentsTable.universityId],
      set: { grantedAt: new Date(), revokedAt: null },
    });
    return { granted: true, universityId };
  });

  app.delete("/api/talent/privacy/university-consents/:universityId", async (request, reply) => {
    const student = await getStudent(request, reply);
    if (!student) return { error: "student account not found" };
    const universityId = parseId((request.params as { universityId?: unknown }).universityId);
    if (!universityId) {
      reply.code(400);
      return { error: "valid university id is required" };
    }
    await db.update(universityAnalyticsConsentsTable)
      .set({ revokedAt: new Date() })
      .where(and(
        eq(universityAnalyticsConsentsTable.studentId, student.id),
        eq(universityAnalyticsConsentsTable.universityId, universityId),
        isNull(universityAnalyticsConsentsTable.revokedAt),
      ));
    return { revoked: true, universityId };
  });

  app.post("/api/talent/privacy/company-consents", async (request, reply) => {
    const student = await getStudent(request, reply);
    if (!student) return { error: "student account not found" };
    const body = isRecord(request.body) ? request.body : {};
    const applicationId = parseId(body.applicationId);
    if (!applicationId) {
      reply.code(400);
      return { error: "valid application id is required" };
    }
    const application = (await db.select({ id: applicationsTable.id })
      .from(applicationsTable)
      .where(and(
        eq(applicationsTable.id, applicationId),
        eq(applicationsTable.studentId, student.id),
      ))
      .limit(1))[0];
    if (!application) {
      reply.code(404);
      return { error: "application not found" };
    }
    await db.insert(companyAssessmentConsentsTable).values({
      studentId: student.id,
      applicationId,
      grantedAt: new Date(),
      revokedAt: null,
    }).onConflictDoUpdate({
      target: [companyAssessmentConsentsTable.studentId, companyAssessmentConsentsTable.applicationId],
      set: { grantedAt: new Date(), revokedAt: null },
    });
    return { granted: true, applicationId };
  });

  app.delete("/api/talent/privacy/company-consents/:applicationId", async (request, reply) => {
    const student = await getStudent(request, reply);
    if (!student) return { error: "student account not found" };
    const applicationId = parseId((request.params as { applicationId?: unknown }).applicationId);
    if (!applicationId) {
      reply.code(400);
      return { error: "valid application id is required" };
    }
    await db.update(companyAssessmentConsentsTable)
      .set({ revokedAt: new Date() })
      .where(and(
        eq(companyAssessmentConsentsTable.studentId, student.id),
        eq(companyAssessmentConsentsTable.applicationId, applicationId),
        isNull(companyAssessmentConsentsTable.revokedAt),
      ));
    return { revoked: true, applicationId };
  });

  app.get("/api/talent/university/analytics", async (request, reply) => {
    const university = await getUniversity(request, reply);
    if (!university) return { error: "university account not found" };
    const consentedStudents = await db.select({ id: studentsTable.id })
      .from(universityAnalyticsConsentsTable)
      .innerJoin(studentsTable, eq(studentsTable.id, universityAnalyticsConsentsTable.studentId))
      .where(and(
        eq(universityAnalyticsConsentsTable.universityId, university.id),
        isNull(universityAnalyticsConsentsTable.revokedAt),
        eq(studentsTable.verified, true),
      ));
    const studentIds = consentedStudents.map((student) => student.id);
    const minimumCohortSize = 5;
    if (studentIds.length) {
      await db.insert(studentDataAccessAuditTable).values(studentIds.map((studentId) => ({
        accessorUserId: university.userId,
        studentId,
        resource: "university_aggregate_analytics",
        purpose: "consented_verified_student_aggregate",
      })));
    }
    if (studentIds.length < minimumCohortSize) {
      return {
        available: false,
        minimumCohortSize,
        studentCount: null,
        assessmentBySkill: [],
        placementOutcomes: null,
      };
    }

    const [scores, applications] = await Promise.all([
      db.select({
        studentId: assessmentAttemptsTable.studentId,
        skillName: skillCatalogTable.name,
        score: assessmentSkillScoresTable.score,
      }).from(assessmentSkillScoresTable)
        .innerJoin(assessmentAttemptsTable, eq(assessmentAttemptsTable.id, assessmentSkillScoresTable.attemptId))
        .innerJoin(skillCatalogTable, eq(skillCatalogTable.id, assessmentSkillScoresTable.skillId))
        .where(and(
          inArray(assessmentAttemptsTable.studentId, studentIds),
          eq(assessmentAttemptsTable.status, "submitted"),
        ))
        .orderBy(desc(assessmentAttemptsTable.submittedAt), desc(assessmentAttemptsTable.id)),
      db.select({
        studentId: applicationsTable.studentId,
      }).from(applicationsTable)
        .where(and(
          inArray(applicationsTable.studentId, studentIds),
          eq(applicationsTable.status, "accepted"),
        )),
    ]);

    const scoresBySkill = new Map<string, { total: number; count: number; students: Set<number> }>();
    const latestScoreKeys = new Set<string>();
    for (const row of scores) {
      const studentSkillKey = `${row.studentId}:${row.skillName}`;
      if (latestScoreKeys.has(studentSkillKey)) continue;
      latestScoreKeys.add(studentSkillKey);
      const item = scoresBySkill.get(row.skillName) ?? { total: 0, count: 0, students: new Set<number>() };
      item.total += row.score;
      item.count += 1;
      item.students.add(row.studentId);
      scoresBySkill.set(row.skillName, item);
    }
    const placedStudents = new Set(applications.map((application) => application.studentId)).size;
    return {
      available: true,
      minimumCohortSize,
      studentCount: studentIds.length,
      assessmentBySkill: [...scoresBySkill].map(([skill, data]) => ({
        skill,
        averageScore: Math.round(data.total / data.count * 100) / 100,
        studentCount: data.students.size,
      })),
      placementOutcomes: {
        placedStudents,
        placementRate: Math.round(placedStudents / studentIds.length * 10_000) / 100,
      },
    };
  });

  app.get("/api/talent/profile", async (request, reply) => {
    const student = await getStudent(request, reply);
    if (!student) return { error: "student account not found" };
    const [projects, experience, education] = await Promise.all([
      db.select().from(studentProjectsTable).where(eq(studentProjectsTable.studentId, student.id)),
      db.select().from(studentExperienceTable).where(eq(studentExperienceTable.studentId, student.id)),
      db.select().from(studentEducationTable).where(eq(studentEducationTable.studentId, student.id)),
    ]);
    return { skills: student.skills, projects, experience, education };
  });

  app.put("/api/talent/profile", async (request, reply) => {
    const student = await getStudent(request, reply);
    if (!student) return { error: "student account not found" };
    const body = isRecord(request.body) ? request.body : {};
    const skills = readTextList(body.skills, 100, 100);
    if (!skills) {
      reply.code(400);
      return { error: "skills must be a list of at most 100 short text values" };
    }
    await db.update(studentsTable).set({ skills }).where(eq(studentsTable.id, student.id));
    return { skills };
  });

  app.put("/api/talent/profile/evidence", async (request, reply) => {
    const student = await getStudent(request, reply);
    if (!student) return { error: "student account not found" };
    const body = isRecord(request.body) ? request.body : {};
    if (!Array.isArray(body.projects) || !Array.isArray(body.experience) || !Array.isArray(body.education)) {
      reply.code(400);
      return { error: "projects, experience and education must be arrays" };
    }
    if (body.projects.length > 50 || body.experience.length > 50 || body.education.length > 30) {
      reply.code(400);
      return { error: "profile evidence exceeds the maximum item count" };
    }

    const projects = [];
    for (const item of body.projects) {
      if (!isRecord(item)) {
        reply.code(400);
        return { error: "project entry is invalid" };
      }
      const name = readText(item.name, 160, true);
      const description = readText(item.description ?? "", 4000);
      const skills = readTextList(item.skills ?? [], 50);
      const url = readText(item.url ?? "", 2048);
      const startedAt = readDate(item.startedAt);
      const completedAt = readDate(item.completedAt);
      if (
        name === null || description === null || !skills || url === null ||
        startedAt === undefined || completedAt === undefined ||
        (url && !/^https?:\/\//i.test(url))
      ) {
        reply.code(400);
        return { error: "project fields are invalid" };
      }
      projects.push({ studentId: student.id, name, description, skills, url: url || null, startedAt, completedAt });
    }

    const experiences = [];
    for (const item of body.experience) {
      if (!isRecord(item)) {
        reply.code(400);
        return { error: "experience entry is invalid" };
      }
      const organization = readText(item.organization, 160, true);
      const title = readText(item.title, 160, true);
      const description = readText(item.description ?? "", 4000);
      const skills = readTextList(item.skills ?? [], 50);
      const startedAt = readDate(item.startedAt);
      const endedAt = readDate(item.endedAt);
      if (
        organization === null || title === null || description === null || !skills ||
        startedAt === undefined || endedAt === undefined
      ) {
        reply.code(400);
        return { error: "experience fields are invalid" };
      }
      experiences.push({ studentId: student.id, organization, title, description, skills, startedAt, endedAt });
    }

    const education = [];
    for (const item of body.education) {
      if (!isRecord(item)) {
        reply.code(400);
        return { error: "education entry is invalid" };
      }
      const institution = readText(item.institution, 200, true);
      const degree = readText(item.degree ?? "", 160);
      const fieldOfStudy = readText(item.fieldOfStudy ?? "", 160);
      const coursework = readTextList(item.coursework ?? [], 100);
      const startDate = readDate(item.startDate);
      const endDate = readDate(item.endDate);
      if (
        institution === null || degree === null || fieldOfStudy === null || !coursework ||
        startDate === undefined || endDate === undefined
      ) {
        reply.code(400);
        return { error: "education fields are invalid" };
      }
      education.push({
        studentId: student.id,
        institution,
        degree: degree || null,
        fieldOfStudy: fieldOfStudy || null,
        coursework,
        startDate,
        endDate,
      });
    }

    await db.transaction(async (transaction) => {
      await transaction.delete(studentProjectsTable).where(eq(studentProjectsTable.studentId, student.id));
      await transaction.delete(studentExperienceTable).where(eq(studentExperienceTable.studentId, student.id));
      await transaction.delete(studentEducationTable).where(eq(studentEducationTable.studentId, student.id));
      if (projects.length) await transaction.insert(studentProjectsTable).values(projects);
      if (experiences.length) await transaction.insert(studentExperienceTable).values(experiences);
      if (education.length) await transaction.insert(studentEducationTable).values(education);
    });
    return { saved: true };
  });

  app.put("/api/talent/company/internships/:internshipId/requirements", async (request, reply) => {
    const company = await getCompany(request, reply);
    if (!company) return { error: "company account not found" };
    const internshipId = parseId((request.params as { internshipId?: unknown }).internshipId);
    const body = isRecord(request.body) ? request.body : {};
    const requiredCoursework = readTextList(body.requiredCoursework ?? [], 100);
    const requiredFieldsOfStudy = readTextList(body.requiredFieldsOfStudy ?? [], 50);
    const roleIsSet = body.roleId !== null && body.roleId !== undefined && body.roleId !== "";
    const roleId = body.roleId === null || body.roleId === undefined || body.roleId === ""
      ? null
      : parseId(body.roleId);
    if (!internshipId || !requiredCoursework || !requiredFieldsOfStudy || (roleIsSet && roleId === null)) {
      reply.code(400);
      return { error: "valid internship requirements are required" };
    }

    const internship = (await db.select({ id: internshipsTable.id })
      .from(internshipsTable)
      .where(and(
        eq(internshipsTable.id, internshipId),
        eq(internshipsTable.companyId, company.id),
      ))
      .limit(1))[0];
    if (!internship) {
      reply.code(404);
      return { error: "internship not found" };
    }
    if (roleId !== null) {
      const role = (await db.select({ id: itRolesTable.id }).from(itRolesTable)
        .where(and(eq(itRolesTable.id, roleId), eq(itRolesTable.active, true)))
        .limit(1))[0];
      if (!role) {
        reply.code(400);
        return { error: "role is not in the active IT role catalog" };
      }
    }

    const updatedAt = new Date();
    await db.insert(internshipTalentRequirementsTable).values({
      internshipId,
      roleId,
      requiredCoursework,
      requiredFieldsOfStudy,
      updatedAt,
    }).onConflictDoUpdate({
      target: internshipTalentRequirementsTable.internshipId,
      set: { roleId, requiredCoursework, requiredFieldsOfStudy, updatedAt },
    });
    return { internshipId, roleId, requiredCoursework, requiredFieldsOfStudy };
  });

  app.get("/api/talent/skills", async () => {
    const [skills, roles] = await Promise.all([
      db.select({
        id: skillCatalogTable.id,
        slug: skillCatalogTable.slug,
        name: skillCatalogTable.name,
        category: skillCatalogTable.category,
      }).from(skillCatalogTable).where(eq(skillCatalogTable.active, true)).orderBy(asc(skillCatalogTable.name)),
      db.select({
        id: itRolesTable.id,
        slug: itRolesTable.slug,
        name: itRolesTable.name,
        category: itRolesTable.category,
      }).from(itRolesTable).where(eq(itRolesTable.active, true)).orderBy(asc(itRolesTable.name)),
    ]);
    return { skills, roles };
  });

  app.get("/api/talent/assessments", async (request, reply) => {
    const student = await getStudent(request, reply);
    if (!student) return { error: "student account not found" };

    const versions = await db.select({
      versionId: assessmentVersionsTable.id,
      version: assessmentVersionsTable.version,
      templateId: assessmentTemplatesTable.id,
      title: assessmentTemplatesTable.title,
      skillId: assessmentTemplatesTable.skillId,
      difficulty: assessmentTemplatesTable.difficulty,
      durationMinutes: assessmentTemplatesTable.durationMinutes,
    })
      .from(assessmentVersionsTable)
      .innerJoin(assessmentTemplatesTable, eq(assessmentTemplatesTable.id, assessmentVersionsTable.templateId))
      .where(and(
        eq(assessmentVersionsTable.status, "published"),
        eq(assessmentTemplatesTable.active, true),
      ))
      .orderBy(asc(assessmentTemplatesTable.title));
    const skillIds = [...new Set(versions.map((version) => version.skillId))];
    const skills = skillIds.length
      ? await db.select().from(skillCatalogTable).where(inArray(skillCatalogTable.id, skillIds))
      : [];
    const skillsById = new Map(skills.map((skill) => [skill.id, skill]));
    const questions = versions.length
      ? await db.select().from(assessmentQuestionsTable)
          .where(inArray(assessmentQuestionsTable.versionId, versions.map((version) => version.versionId)))
      : [];
    const questionsByVersion = new Map<number, AssessmentQuestion[]>();
    for (const question of questions) {
      const list = questionsByVersion.get(question.versionId) ?? [];
      list.push(question);
      questionsByVersion.set(question.versionId, list);
    }

    return versions.flatMap((version) => {
      const versionQuestions = questionsByVersion.get(version.versionId) ?? [];
      if (!versionQuestions.length || versionQuestions.some((question) => !isReadyQuestion(question))) {
        return [];
      }
      return [{
        id: version.versionId,
        templateId: version.templateId,
        version: version.version,
        title: version.title,
        skill: skillsById.get(version.skillId)?.name ?? "Unknown skill",
        difficulty: version.difficulty,
        durationMinutes: version.durationMinutes,
        questionCount: versionQuestions.length,
      }];
    });
  });

  app.get("/api/talent/assessment-history", async (request, reply) => {
    const student = await getStudent(request, reply);
    if (!student) return { error: "student account not found" };
    const attempts = await db.select({
      id: assessmentAttemptsTable.id,
      versionId: assessmentAttemptsTable.versionId,
      status: assessmentAttemptsTable.status,
      startedAt: assessmentAttemptsTable.startedAt,
      submittedAt: assessmentAttemptsTable.submittedAt,
      overallScore: assessmentAttemptsTable.overallScore,
      title: assessmentTemplatesTable.title,
    }).from(assessmentAttemptsTable)
      .innerJoin(assessmentVersionsTable, eq(assessmentVersionsTable.id, assessmentAttemptsTable.versionId))
      .innerJoin(assessmentTemplatesTable, eq(assessmentTemplatesTable.id, assessmentVersionsTable.templateId))
      .where(eq(assessmentAttemptsTable.studentId, student.id))
      .orderBy(desc(assessmentAttemptsTable.createdAt))
      .limit(100);
    const attemptIds = attempts.map((attempt) => attempt.id);
    const scores = attemptIds.length
      ? await db.select({
          attemptId: assessmentSkillScoresTable.attemptId,
          skill: skillCatalogTable.name,
          score: assessmentSkillScoresTable.score,
        }).from(assessmentSkillScoresTable)
          .innerJoin(skillCatalogTable, eq(skillCatalogTable.id, assessmentSkillScoresTable.skillId))
          .where(inArray(assessmentSkillScoresTable.attemptId, attemptIds))
      : [];
    const scoresByAttempt = new Map<number, typeof scores>();
    for (const score of scores) {
      const list = scoresByAttempt.get(score.attemptId) ?? [];
      list.push(score);
      scoresByAttempt.set(score.attemptId, list);
    }
    return attempts.map((attempt) => ({
      id: attempt.id,
      title: attempt.title,
      status: attempt.status,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
      overallScore: attempt.overallScore,
      skillScores: (scoresByAttempt.get(attempt.id) ?? []).map(({ skill, score }) => ({ skill, score })),
    }));
  });

  app.post("/api/talent/assessments/:versionId/attempts", async (request, reply) => {
    const student = await getStudent(request, reply);
    if (!student) return { error: "student account not found" };
    const versionId = parseId((request.params as { versionId?: unknown }).versionId);
    if (!versionId) {
      reply.code(400);
      return { error: "valid assessment version id is required" };
    }

    const version = (await db.select({
      id: assessmentVersionsTable.id,
      status: assessmentVersionsTable.status,
      templateId: assessmentTemplatesTable.id,
      durationMinutes: assessmentTemplatesTable.durationMinutes,
      active: assessmentTemplatesTable.active,
    }).from(assessmentVersionsTable)
      .innerJoin(assessmentTemplatesTable, eq(assessmentTemplatesTable.id, assessmentVersionsTable.templateId))
      .where(eq(assessmentVersionsTable.id, versionId))
      .limit(1))[0];
    if (!version || version.status !== "published" || !version.active) {
      reply.code(404);
      return { error: "published assessment not found" };
    }

    const questions = await db.select().from(assessmentQuestionsTable)
      .where(eq(assessmentQuestionsTable.versionId, versionId))
      .orderBy(asc(assessmentQuestionsTable.position));
    if (
      questions.length === 0 ||
      questions.length > 50 ||
      questions.some((question) => !isReadyQuestion(question))
    ) {
      reply.code(409);
      return { error: "assessment is not available until all questions are reviewed and supported" };
    }

    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + version.durationMinutes * 60_000);
    try {
      const inserted = await db.insert(assessmentAttemptsTable).values({
        studentId: student.id,
        versionId,
        startedAt,
        expiresAt,
      }).returning();
      return buildAttemptResponse(inserted[0]);
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
      reply.code(409);
      return { error: "an assessment attempt is already in progress" };
    }
  });

  app.get("/api/talent/attempts/:attemptId", async (request, reply) => {
    const student = await getStudent(request, reply);
    if (!student) return { error: "student account not found" };
    const attemptId = parseId((request.params as { attemptId?: unknown }).attemptId);
    if (!attemptId) {
      reply.code(400);
      return { error: "valid attempt id is required" };
    }

    const attempt = await getOwnedAttempt(attemptId, student.id);
    if (!attempt) {
      reply.code(404);
      return { error: "assessment attempt not found" };
    }
    if (await expireIfNeeded(attempt)) {
      reply.code(409);
      return { error: "assessment time has expired" };
    }
    return buildAttemptResponse(attempt);
  });

  app.put("/api/talent/attempts/:attemptId/answers/:questionId", async (request, reply) => {
    const student = await getStudent(request, reply);
    if (!student) return { error: "student account not found" };
    const params = request.params as { attemptId?: unknown; questionId?: unknown };
    const attemptId = parseId(params.attemptId);
    const questionId = parseId(params.questionId);
    const body = request.body && typeof request.body === "object"
      ? request.body as Record<string, unknown>
      : {};
    if (!attemptId || !questionId) {
      reply.code(400);
      return { error: "valid attempt and question ids are required" };
    }

    const attempt = await getOwnedAttempt(attemptId, student.id);
    if (!attempt) {
      reply.code(404);
      return { error: "assessment attempt not found" };
    }
    if (attempt.status !== "in_progress" || await expireIfNeeded(attempt)) {
      reply.code(409);
      return { error: "assessment attempt is no longer open" };
    }
    const question = (await db.select().from(assessmentQuestionsTable)
      .where(and(
        eq(assessmentQuestionsTable.id, questionId),
        eq(assessmentQuestionsTable.versionId, attempt.versionId),
      ))
      .limit(1))[0];
    if (!question || !isReadyQuestion(question)) {
      reply.code(404);
      return { error: "assessment question not found" };
    }
    const answer = validateAssessmentAnswer(question, body.answer);
    if (answer === null) {
      reply.code(400);
      return { error: "answer does not match the question format" };
    }

    const pointsEarned = calculateQuestionPoints(question, answer);
    const answeredAt = new Date();
    await db.insert(assessmentAnswersTable).values({
      attemptId,
      questionId,
      answer,
      pointsEarned: String(pointsEarned),
      deterministic: true,
      answeredAt,
    }).onConflictDoUpdate({
      target: [assessmentAnswersTable.attemptId, assessmentAnswersTable.questionId],
      set: { answer, pointsEarned: String(pointsEarned), answeredAt },
    });
    return { saved: true, answeredAt };
  });

  app.post("/api/talent/attempts/:attemptId/submit", async (request, reply) => {
    const student = await getStudent(request, reply);
    if (!student) return { error: "student account not found" };
    const attemptId = parseId((request.params as { attemptId?: unknown }).attemptId);
    if (!attemptId) {
      reply.code(400);
      return { error: "valid attempt id is required" };
    }

    const attempt = await getOwnedAttempt(attemptId, student.id);
    if (!attempt) {
      reply.code(404);
      return { error: "assessment attempt not found" };
    }
    if (attempt.status !== "in_progress" || await expireIfNeeded(attempt)) {
      reply.code(409);
      return { error: "assessment attempt is no longer open" };
    }

    const [questions, answers] = await Promise.all([
      db.select().from(assessmentQuestionsTable).where(eq(assessmentQuestionsTable.versionId, attempt.versionId)),
      db.select().from(assessmentAnswersTable).where(eq(assessmentAnswersTable.attemptId, attempt.id)),
    ]);
    const answersByQuestion = new Map(answers.map((answer) => [answer.questionId, answer]));
    if (!questions.length || questions.some((question) => !answersByQuestion.has(question.id))) {
      reply.code(400);
      return { error: "answer every question before submitting" };
    }

    let earned = 0;
    let possible = 0;
    const bySkill = new Map<number, { earned: number; possible: number }>();
    for (const question of questions) {
      const answer = answersByQuestion.get(question.id)!;
      const pointsPossible = Number(question.maxPoints);
      const pointsEarned = calculateQuestionPoints(question, answer.answer);
      earned += pointsEarned;
      possible += pointsPossible;
      const skillPoints = bySkill.get(question.skillId) ?? { earned: 0, possible: 0 };
      skillPoints.earned += pointsEarned;
      skillPoints.possible += pointsPossible;
      bySkill.set(question.skillId, skillPoints);
    }

    const overallScore = Math.round(earned / possible * 10_000) / 100;
    const submittedAt = new Date();
    await db.transaction(async (transaction) => {
      for (const [skillId, score] of bySkill) {
        await transaction.insert(assessmentSkillScoresTable).values({
          attemptId: attempt.id,
          skillId,
          score: Math.round(score.earned / score.possible * 10_000) / 100,
          earnedPoints: String(score.earned),
          possiblePoints: String(score.possible),
        }).onConflictDoUpdate({
          target: [assessmentSkillScoresTable.attemptId, assessmentSkillScoresTable.skillId],
          set: {
            score: Math.round(score.earned / score.possible * 10_000) / 100,
            earnedPoints: String(score.earned),
            possiblePoints: String(score.possible),
          },
        });
      }
      await transaction.update(assessmentAttemptsTable).set({
        status: "submitted",
        submittedAt,
        overallScore,
        resultExplanation: "Scores are calculated deterministically from reviewed answer keys. The explanatory text does not affect the score.",
        explanationModel: null,
      }).where(eq(assessmentAttemptsTable.id, attempt.id));
    });

    let explanationWarning: string | undefined;
    try {
      const skillNames = await db.select({
        id: skillCatalogTable.id,
        name: skillCatalogTable.name,
      }).from(skillCatalogTable)
        .where(inArray(skillCatalogTable.id, [...bySkill.keys()]));
      const skillNamesById = new Map(skillNames.map((skill) => [skill.id, skill.name]));
      const explanation = await generateAssistantReply(
        [
          "Explain these completed technical assessment results in plain language.",
          "The numerical scores were calculated deterministically and must not be changed or treated as a hiring decision.",
          "Describe demonstrated strengths and practical next learning steps. Do not infer personal traits.",
          JSON.stringify({
            overallScore,
            skillScores: [...bySkill].map(([skillId, score]) => ({
              skill: skillNamesById.get(skillId) ?? "Technical skill",
              score: Math.round(score.earned / score.possible * 10_000) / 100,
            })),
          }),
        ].join("\n"),
        { role: "student" },
      );
      await db.update(assessmentAttemptsTable).set({
        resultExplanation: explanation.reply,
        explanationModel: explanation.model,
      }).where(eq(assessmentAttemptsTable.id, attempt.id));
    } catch (error) {
      if (!(error instanceof AssistantError)) throw error;
      explanationWarning = error.message;
    }

    const updatedAttempt = (await db.select().from(assessmentAttemptsTable)
      .where(eq(assessmentAttemptsTable.id, attempt.id))
      .limit(1))[0];
    return {
      ...(await buildAttemptResponse(updatedAttempt)),
      ...(explanationWarning ? { explanationWarning } : {}),
    };
  });

  const recommendationHandler = async (
    request: FastifyRequest,
    reply: FastifyReply,
    requestedStudentId?: unknown,
  ) => {
    const student = await getStudent(request, reply);
    if (!student) return { error: "student account not found" };
    if (
      requestedStudentId !== undefined &&
      parseId(requestedStudentId) !== student.id &&
      parseId(requestedStudentId) !== student.userId
    ) {
      reply.code(403);
      return { error: "student access required" };
    }

    const [internships, projects, experience, education, latestAssessmentScores, allSkills] = await Promise.all([
      db.select().from(internshipsTable).where(eq(internshipsTable.status, "open")),
      db.select().from(studentProjectsTable).where(eq(studentProjectsTable.studentId, student.id)),
      db.select().from(studentExperienceTable).where(eq(studentExperienceTable.studentId, student.id)),
      db.select().from(studentEducationTable).where(eq(studentEducationTable.studentId, student.id)),
      db.select({
        skillSlug: skillCatalogTable.slug,
        skillName: skillCatalogTable.name,
        score: assessmentSkillScoresTable.score,
        submittedAt: assessmentAttemptsTable.submittedAt,
      }).from(assessmentSkillScoresTable)
        .innerJoin(assessmentAttemptsTable, eq(assessmentAttemptsTable.id, assessmentSkillScoresTable.attemptId))
        .innerJoin(skillCatalogTable, eq(skillCatalogTable.id, assessmentSkillScoresTable.skillId))
        .where(and(
          eq(assessmentAttemptsTable.studentId, student.id),
          eq(assessmentAttemptsTable.status, "submitted"),
        ))
        .orderBy(desc(assessmentAttemptsTable.submittedAt)),
      db.select({ slug: skillCatalogTable.slug, name: skillCatalogTable.name })
        .from(skillCatalogTable),
    ]);
    const skillAliases = new Map<string, string>();
    for (const skill of allSkills) {
      skillAliases.set(normalize(skill.slug), skill.name);
      skillAliases.set(normalize(skill.name), skill.name);
    }
    const canonicalizeSkills = (skills: string[]) =>
      skills.map((skill) => skillAliases.get(normalize(skill)) ?? skill.trim());
    const internshipIds = internships.map((internship) => internship.id);
    const companyIds = [...new Set(internships.map((internship) => internship.companyId))];
    const [requirements, companies] = await Promise.all([
      internshipIds.length
        ? db.select().from(internshipTalentRequirementsTable)
            .where(inArray(internshipTalentRequirementsTable.internshipId, internshipIds))
        : [],
      companyIds.length
        ? db.select({ id: companiesTable.id, companyName: companiesTable.companyName })
            .from(companiesTable).where(inArray(companiesTable.id, companyIds))
        : [],
    ]);
    const requirementsByInternship = new Map(requirements.map((requirement) => [requirement.internshipId, requirement]));
    const companiesById = new Map(companies.map((company) => [company.id, company.companyName]));
    const roleIds = [...new Set(requirements.map((requirement) => requirement.roleId).filter((id): id is number => id !== null))];
    const roleSkillRows = roleIds.length
      ? await db.select({
          roleId: roleSkillRequirementsTable.roleId,
          skillSlug: skillCatalogTable.slug,
          skillName: skillCatalogTable.name,
        }).from(roleSkillRequirementsTable)
          .innerJoin(skillCatalogTable, eq(skillCatalogTable.id, roleSkillRequirementsTable.skillId))
          .where(inArray(roleSkillRequirementsTable.roleId, roleIds))
      : [];
    const roleSkills = new Map<number, string[]>();
    for (const row of roleSkillRows) {
      const skills = roleSkills.get(row.roleId) ?? [];
      skills.push(row.skillName);
      roleSkills.set(row.roleId, skills);
    }

    const assessmentScores: Record<string, number> = {};
    for (const row of latestAssessmentScores) {
      if (assessmentScores[normalize(row.skillSlug)] === undefined) {
        assessmentScores[normalize(row.skillSlug)] = row.score;
        assessmentScores[normalize(row.skillName)] = row.score;
        const canonicalSkill = skillAliases.get(normalize(row.skillName));
        if (canonicalSkill) assessmentScores[normalize(canonicalSkill)] = row.score;
      }
    }
    const projectSkills = canonicalizeSkills(projects.flatMap((project) => project.skills));
    const experienceSkills = canonicalizeSkills(experience.flatMap((entry) => entry.skills));
    const coursework = education.flatMap((entry) => entry.coursework);
    const fieldsOfStudy = education.flatMap((entry) => entry.fieldOfStudy ? [entry.fieldOfStudy] : []);

    const recommendations = internships.map((internship) => {
      const requirement = requirementsByInternship.get(internship.id);
      const requiredSkills = canonicalizeSkills([
        ...internship.skills,
        ...(requirement?.roleId ? roleSkills.get(requirement.roleId) ?? [] : []),
      ]);
      const requiredSkillSet = [...new Set(requiredSkills)];
      const evidenceSkillSet = new Set(canonicalizeSkills([
        ...student.skills,
        ...projectSkills,
        ...experienceSkills,
      ]).map(normalize));
      const matchedSkills = requiredSkillSet.filter((skill) => evidenceSkillSet.has(normalize(skill)));
      const missingSkills = requiredSkillSet.filter((skill) => !evidenceSkillSet.has(normalize(skill)));
      const breakdown = calculateInternshipEvidenceMatch({
        requiredSkills: requiredSkillSet,
        studentSkills: canonicalizeSkills(student.skills),
        assessmentScores,
        projectSkills,
        experienceSkills,
        requiredCoursework: requirement?.requiredCoursework ?? [],
        coursework,
        requiredFieldsOfStudy: requirement?.requiredFieldsOfStudy ?? [],
        fieldsOfStudy,
      });
      return {
        id: internship.id,
        internshipId: internship.id,
        title: internship.title,
        description: internship.description,
        companyId: internship.companyId,
        companyName: companiesById.get(internship.companyId) ?? "Company",
        companyLogo: null,
        location: internship.location,
        type: internship.type,
        duration: internship.duration,
        skills: internship.skills,
        matchedSkills,
        missingSkills,
        salary: internship.salary,
        status: internship.status,
        deadline: internship.deadline,
        createdAt: internship.createdAt instanceof Date
          ? internship.createdAt.toISOString()
          : String(internship.createdAt),
        matchScore: breakdown.score,
        evidenceCoverage: breakdown.coverage,
        weights: MATCH_WEIGHTS,
        breakdown: breakdown.components,
        matchExplanation: explainMatch(breakdown),
      };
    }).sort((left, right) => (right.matchScore ?? -1) - (left.matchScore ?? -1)).slice(0, 100);
    if (
      request.method === "POST" &&
      request.url.split("?")[0] === "/api/talent/recommendations/refresh" &&
      recommendations.length > 0
    ) {
      await db.insert(internshipMatchSnapshotsTable).values(recommendations.map((recommendation) => ({
        studentId: student.id,
        internshipId: recommendation.internshipId,
        score: recommendation.matchScore,
        coverage: recommendation.evidenceCoverage,
        weights: recommendation.weights,
        breakdown: recommendation.breakdown,
        explanation: recommendation.matchExplanation,
      })));
    }
    return recommendations;
  };
  app.get("/api/talent/recommendations", recommendationHandler);
  app.get("/api/students/:id/recommended", async (request, reply) =>
    recommendationHandler(request, reply, (request.params as { id?: unknown }).id));
  app.post("/api/talent/recommendations/refresh", recommendationHandler);

  app.get("/api/internships", async (request) => {
    const query = request.query as Record<string, unknown>;
    const search = typeof query.search === "string" ? query.search.trim().toLocaleLowerCase() : "";
    const location = typeof query.location === "string" ? query.location.trim().toLocaleLowerCase() : "";
    const type = typeof query.type === "string" ? query.type.trim().toLocaleLowerCase() : "";
    const skill = typeof query.skill === "string" ? query.skill.trim().toLocaleLowerCase() : "";
    const internships = await db.select().from(internshipsTable)
      .where(eq(internshipsTable.status, "open"))
      .orderBy(desc(internshipsTable.createdAt))
      .limit(200);
    const matchingInternships = internships.filter((internship) =>
      (!location || (internship.location ?? "").toLocaleLowerCase().includes(location)) &&
      (!type || (internship.type ?? "").toLocaleLowerCase().includes(type)) &&
      (!skill || internship.skills.some((item) => item.toLocaleLowerCase() === skill)) &&
      (!search || `${internship.title} ${internship.description} ${internship.skills.join(" ")}`
        .toLocaleLowerCase().includes(search)),
    );
    const companyIds = [...new Set(matchingInternships.map((internship) => internship.companyId))];
    const internshipIds = matchingInternships.map((internship) => internship.id);
    const [companies, applications] = await Promise.all([
      companyIds.length
        ? db.select().from(companiesTable).where(inArray(companiesTable.id, companyIds))
        : [],
      internshipIds.length
        ? db.select({ internshipId: applicationsTable.internshipId }).from(applicationsTable)
            .where(inArray(applicationsTable.internshipId, internshipIds))
        : [],
    ]);
    const companiesById = new Map(companies.map((company) => [company.id, company]));
    const applicantCounts = new Map<number, number>();
    for (const application of applications) {
      applicantCounts.set(application.internshipId, (applicantCounts.get(application.internshipId) ?? 0) + 1);
    }
    return matchingInternships.map((internship) => {
      const company = companiesById.get(internship.companyId);
      return {
        ...internship,
        companyName: company?.companyName ?? "Company",
        companyLogo: company?.logoUrl ?? null,
        applicantsCount: applicantCounts.get(internship.id) ?? 0,
      };
    });
  });

  app.get("/api/companies/:id/internships", async (request, reply) => {
    const company = await getCompany(request, reply);
    if (!company) return { error: "company account not found" };
    const requestedId = parseId((request.params as { id?: unknown }).id);
    if (requestedId !== company.id && requestedId !== company.userId) {
      reply.code(403);
      return { error: "company access required" };
    }
    const internships = await db.select().from(internshipsTable)
      .where(eq(internshipsTable.companyId, company.id))
      .orderBy(desc(internshipsTable.createdAt));
    return internships.map((internship) => ({
      ...internship,
      companyName: company.companyName ?? "Company",
      companyLogo: company.logoUrl,
    }));
  });

  app.post("/api/internships", async (request, reply) => {
    const company = await getCompany(request, reply);
    if (!company) return { error: "company account not found" };
    const input = readInternshipInput(request.body);
    if (!input) {
      reply.code(400);
      return { error: "internship fields are invalid" };
    }
    const created = (await db.insert(internshipsTable).values({
      ...input,
      companyId: company.id,
    }).returning())[0];
    reply.code(201);
    return {
      ...created,
      companyName: company.companyName ?? "Company",
      companyLogo: company.logoUrl,
      applicantsCount: 0,
    };
  });

  app.get("/api/internships/:id", async (request, reply) => {
    const id = parseId((request.params as { id?: unknown }).id);
    if (!id) {
      reply.code(400);
      return { error: "valid internship id is required" };
    }
    const internship = (await db.select().from(internshipsTable)
      .where(eq(internshipsTable.id, id))
      .limit(1))[0];
    if (!internship) {
      reply.code(404);
      return { error: "internship not found" };
    }
    let company = (await db.select().from(companiesTable)
      .where(eq(companiesTable.id, internship.companyId))
      .limit(1))[0];
    if (internship.status !== "open") {
      const currentCompany = await getCompany(request, reply);
      if (!currentCompany || currentCompany.id !== internship.companyId) {
        reply.code(404);
        return { error: "internship not found" };
      }
      company = currentCompany;
    }
    const applications = await db.select({ id: applicationsTable.id })
      .from(applicationsTable)
      .where(eq(applicationsTable.internshipId, internship.id));
    return {
      ...internship,
      companyName: company?.companyName ?? "Company",
      companyLogo: company?.logoUrl ?? null,
      companyWebsite: company?.website ?? null,
      companyIndustry: company?.industry ?? null,
      applicantsCount: applications.length,
    };
  });

  app.put("/api/internships/:id", async (request, reply) => {
    const company = await getCompany(request, reply);
    if (!company) return { error: "company account not found" };
    const id = parseId((request.params as { id?: unknown }).id);
    const input = readInternshipInput(request.body);
    if (!id || !input) {
      reply.code(400);
      return { error: "valid internship id and fields are required" };
    }
    const updated = (await db.update(internshipsTable).set(input).where(and(
      eq(internshipsTable.id, id),
      eq(internshipsTable.companyId, company.id),
    )).returning())[0];
    if (!updated) {
      reply.code(404);
      return { error: "internship not found" };
    }
    return { ...updated, companyName: company.companyName ?? "Company", companyLogo: company.logoUrl };
  });

  app.delete("/api/internships/:id", async (request, reply) => {
    const company = await getCompany(request, reply);
    if (!company) return { error: "company account not found" };
    const id = parseId((request.params as { id?: unknown }).id);
    if (!id) {
      reply.code(400);
      return { error: "valid internship id is required" };
    }
    const internship = (await db.select({ id: internshipsTable.id })
      .from(internshipsTable)
      .where(and(
        eq(internshipsTable.id, id),
        eq(internshipsTable.companyId, company.id),
      ))
      .limit(1))[0];
    if (!internship) {
      reply.code(404);
      return { error: "internship not found" };
    }
    const applications = await db.select({ id: applicationsTable.id })
      .from(applicationsTable)
      .where(eq(applicationsTable.internshipId, id))
      .limit(1);
    if (applications.length) {
      reply.code(409);
      return { error: "internships with applications cannot be deleted; close the posting instead" };
    }
    await db.delete(internshipsTable).where(and(
      eq(internshipsTable.id, id),
      eq(internshipsTable.companyId, company.id),
    ));
    reply.code(204);
    return null;
  });

  app.get("/api/internships/:id/match", async (request, reply) => {
    const student = await getStudent(request, reply);
    if (!student) return { error: "student account not found" };
    const id = parseId((request.params as { id?: unknown }).id);
    const requestedStudentId = parseId((request.query as { studentId?: unknown }).studentId);
    if (!id || (requestedStudentId !== student.id && requestedStudentId !== student.userId)) {
      reply.code(403);
      return { error: "match access is limited to the authenticated student" };
    }
    const recommendations = await recommendationHandler(request, reply);
    if (!Array.isArray(recommendations)) return recommendations;
    const match = recommendations.find((recommendation) => recommendation.id === id);
    if (!match) {
      reply.code(404);
      return { error: "internship not found" };
    }
    return {
      matchScore: match.matchScore,
      matchExplanation: match.matchExplanation,
      matchedSkills: match.matchedSkills,
      missingSkills: match.missingSkills,
    };
  });

  app.post("/api/applications", async (request, reply) => {
    const student = await getStudent(request, reply);
    if (!student) return { error: "student account not found" };
    const body = isRecord(request.body) ? request.body : {};
    const internshipId = parseId(body.internshipId);
    const coverLetter = readText(body.coverLetter ?? "", 5000);
    if (!internshipId || coverLetter === null) {
      reply.code(400);
      return { error: "valid internship id and cover letter are required" };
    }
    const internship = (await db.select({ id: internshipsTable.id, status: internshipsTable.status })
      .from(internshipsTable)
      .where(eq(internshipsTable.id, internshipId))
      .limit(1))[0];
    if (!internship || internship.status !== "open") {
      reply.code(404);
      return { error: "open internship not found" };
    }
    const duplicate = (await db.select({ id: applicationsTable.id })
      .from(applicationsTable)
      .where(and(
        eq(applicationsTable.studentId, student.id),
        eq(applicationsTable.internshipId, internshipId),
      ))
      .limit(1))[0];
    if (duplicate) {
      reply.code(409);
      return { error: "you have already applied to this internship" };
    }
    const recommendations = await recommendationHandler(request, reply);
    if (!Array.isArray(recommendations)) return recommendations;
    const match = recommendations.find((recommendation) => recommendation.id === internshipId);
    const matchScore = match?.matchScore === null || match?.matchScore === undefined
      ? null
      : Math.round(match.matchScore);
    const created = (await db.insert(applicationsTable).values({
      studentId: student.id,
      internshipId,
      coverLetter: coverLetter || null,
      matchScore,
    }).returning())[0];
    reply.code(201);
    return created;
  });

  app.get("/api/students/:id/applications", async (request, reply) => {
    const student = await getStudent(request, reply);
    if (!student) return { error: "student account not found" };
    const requestedId = parseId((request.params as { id?: unknown }).id);
    if (requestedId !== student.id && requestedId !== student.userId) {
      reply.code(403);
      return { error: "application access is limited to the authenticated student" };
    }
    const applications = await db.select().from(applicationsTable)
      .where(eq(applicationsTable.studentId, student.id))
      .orderBy(desc(applicationsTable.createdAt));
    const internshipIds = [...new Set(applications.map((application) => application.internshipId))];
    const internships = internshipIds.length
      ? await db.select().from(internshipsTable).where(inArray(internshipsTable.id, internshipIds))
      : [];
    const companyIds = [...new Set(internships.map((internship) => internship.companyId))];
    const companies = companyIds.length
      ? await db.select().from(companiesTable).where(inArray(companiesTable.id, companyIds))
      : [];
    const internshipsById = new Map(internships.map((internship) => [internship.id, internship]));
    const companiesById = new Map(companies.map((company) => [company.id, company]));
    return applications.map((application) => {
      const internship = internshipsById.get(application.internshipId);
      const company = internship ? companiesById.get(internship.companyId) : null;
      return {
        ...application,
        internshipTitle: internship?.title ?? "Unknown Role",
        companyName: company?.companyName ?? "Unknown Company",
        companyLogo: company?.logoUrl ?? null,
      };
    });
  });

  app.get("/api/internships/:id/applicants", async (request, reply) => {
    const company = await getCompany(request, reply);
    if (!company) return { error: "company account not found" };
    const internshipId = parseId((request.params as { id?: unknown }).id);
    if (!internshipId) {
      reply.code(400);
      return { error: "valid internship id is required" };
    }
    const internship = (await db.select({ id: internshipsTable.id })
      .from(internshipsTable)
      .where(and(
        eq(internshipsTable.id, internshipId),
        eq(internshipsTable.companyId, company.id),
      ))
      .limit(1))[0];
    if (!internship) {
      reply.code(404);
      return { error: "internship not found" };
    }
    const applications = await db.select().from(applicationsTable)
      .where(eq(applicationsTable.internshipId, internshipId))
      .orderBy(desc(applicationsTable.createdAt));
    const studentIds = [...new Set(applications.map((application) => application.studentId))];
    const students = studentIds.length
      ? await db.select().from(studentsTable).where(inArray(studentsTable.id, studentIds))
      : [];
    const userIds = students.map((student) => student.userId);
    const users = userIds.length
      ? await db.select().from(usersTable).where(inArray(usersTable.id, userIds))
      : [];
    const studentsById = new Map(students.map((student) => [student.id, student]));
    const usersById = new Map(users.map((user) => [user.id, user]));
    const consents = applications.length
      ? await db.select({
          applicationId: companyAssessmentConsentsTable.applicationId,
          studentId: companyAssessmentConsentsTable.studentId,
        }).from(companyAssessmentConsentsTable)
          .where(and(
            inArray(companyAssessmentConsentsTable.applicationId, applications.map((application) => application.id)),
            isNull(companyAssessmentConsentsTable.revokedAt),
          ))
      : [];
    const consentByApplicationId = new Map(consents.map((consent) => [consent.applicationId, consent.studentId]));
    const consentedStudentIds = [...new Set(consents.map((consent) => consent.studentId))];
    const scores = consentedStudentIds.length
      ? await db.select({
          studentId: assessmentAttemptsTable.studentId,
          skill: skillCatalogTable.name,
          score: assessmentSkillScoresTable.score,
          submittedAt: assessmentAttemptsTable.submittedAt,
          attemptId: assessmentAttemptsTable.id,
        }).from(assessmentSkillScoresTable)
          .innerJoin(assessmentAttemptsTable, eq(assessmentAttemptsTable.id, assessmentSkillScoresTable.attemptId))
          .innerJoin(skillCatalogTable, eq(skillCatalogTable.id, assessmentSkillScoresTable.skillId))
          .where(and(
            inArray(assessmentAttemptsTable.studentId, consentedStudentIds),
            eq(assessmentAttemptsTable.status, "submitted"),
          ))
          .orderBy(desc(assessmentAttemptsTable.submittedAt), desc(assessmentAttemptsTable.id))
      : [];
    const scoresByStudent = new Map<number, { skill: string; score: number }[]>();
    const latestScoreKeys = new Set<string>();
    for (const score of scores) {
      const key = `${score.studentId}:${score.skill}`;
      if (latestScoreKeys.has(key)) continue;
      latestScoreKeys.add(key);
      const list = scoresByStudent.get(score.studentId) ?? [];
      list.push({ skill: score.skill, score: score.score });
      scoresByStudent.set(score.studentId, list);
    }
    return applications.map((application) => {
      const student = studentsById.get(application.studentId);
      const user = student ? usersById.get(student.userId) : null;
      const consentedStudentId = consentByApplicationId.get(application.id);
      return {
        id: application.id,
        studentId: application.studentId,
        internshipId: application.internshipId,
        studentName: user?.name ?? "Unknown Student",
        studentEmail: user?.email ?? "",
        studentAvatar: user?.avatarUrl ?? null,
        studentSkills: student?.skills ?? [],
        studentUniversity: student?.university ?? null,
        coverLetter: application.coverLetter,
        matchScore: application.matchScore,
        status: application.status,
        createdAt: application.createdAt,
        ...(consentedStudentId === application.studentId ? {
          assessmentScores: scoresByStudent.get(consentedStudentId) ?? [],
        } : {}),
      };
    });
  });

  app.put("/api/applications/:id/status", async (request, reply) => {
    const company = await getCompany(request, reply);
    if (!company) return { error: "company account not found" };
    const applicationId = parseId((request.params as { id?: unknown }).id);
    const body = isRecord(request.body) ? request.body : {};
    const status = body.status;
    if (!applicationId || (status !== "accepted" && status !== "rejected")) {
      reply.code(400);
      return { error: "valid application id and review status are required" };
    }
    const application = (await db.select({
      id: applicationsTable.id,
      status: applicationsTable.status,
    })
      .from(applicationsTable)
      .innerJoin(internshipsTable, eq(internshipsTable.id, applicationsTable.internshipId))
      .where(and(
        eq(applicationsTable.id, applicationId),
        eq(internshipsTable.companyId, company.id),
      ))
      .limit(1))[0];
    if (!application) {
      reply.code(404);
      return { error: "application not found" };
    }
    if (application.status !== "pending") {
      reply.code(409);
      return { error: "only pending applications can be reviewed" };
    }
    const updated = (await db.update(applicationsTable).set({ status })
      .where(and(
        eq(applicationsTable.id, applicationId),
        eq(applicationsTable.status, "pending"),
      ))
      .returning())[0];
    if (!updated) {
      reply.code(409);
      return { error: "application has already been reviewed" };
    }
    return updated;
  });

  app.post("/api/talent/recommendations/:internshipId/explanation", async (request, reply) => {
    const internshipId = parseId((request.params as { internshipId?: unknown }).internshipId);
    if (!internshipId) {
      reply.code(400);
      return { error: "valid internship id is required" };
    }
    const recommendations = await recommendationHandler(request, reply);
    if (!Array.isArray(recommendations)) return recommendations;
    const recommendation = recommendations.find((item) => item.id === internshipId);
    if (!recommendation) {
      reply.code(404);
      return { error: "internship recommendation not found" };
    }
    try {
      const generated = await generateAssistantReply(
        [
          "Explain why this internship is recommended using only the provided evidence.",
          "The match score and weights are deterministic and must not be changed.",
          "Do not make or imply a hiring decision. Mention missing evidence and avoid inferring anything not present.",
          JSON.stringify({
            title: recommendation.title,
            score: recommendation.matchScore,
            evidenceCoverage: recommendation.evidenceCoverage,
            weights: recommendation.weights,
            componentScores: recommendation.breakdown,
          }),
        ].join("\n"),
        { role: "student" },
      );
      return { explanation: generated.reply, model: generated.model };
    } catch (error) {
      if (!(error instanceof AssistantError)) throw error;
      reply.code(error.statusCode);
      return { error: error.message };
    }
  });
}
