import { Router } from "express";
import { db } from "@workspace/db";
import {
  usersTable,
  studentsTable,
  applicationsTable,
  internshipsTable,
  companiesTable,
} from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

async function getStudentProfile(studentId: number) {
  const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, studentId)).limit(1);
  if (!student) return null;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, student.userId)).limit(1);
  if (!user) return null;
  return {
    id: student.id,
    userId: student.userId,
    name: user.name,
    email: user.email,
    university: student.university ?? null,
    gpa: student.gpa ?? null,
    bio: student.bio ?? null,
    resumeUrl: student.resumeUrl ?? null,
    skills: student.skills ?? [],
    verified: student.verified,
    avatarUrl: user.avatarUrl ?? null,
  };
}

// GET /api/students/:id
router.get("/students/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const profile = await getStudentProfile(id);
  if (!profile) return res.status(404).json({ error: "Student not found" });
  return res.json(profile);
});

// PUT /api/students/:id
router.put("/students/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { university, gpa, bio, resumeUrl, skills, avatarUrl } = req.body;

  const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, id)).limit(1);
  if (!student) return res.status(404).json({ error: "Student not found" });

  const updates: Partial<typeof studentsTable.$inferInsert> = {};
  if (university !== undefined) updates.university = university;
  if (gpa !== undefined) updates.gpa = gpa;
  if (bio !== undefined) updates.bio = bio;
  if (resumeUrl !== undefined) updates.resumeUrl = resumeUrl;
  if (skills !== undefined) updates.skills = skills;

  await db.update(studentsTable).set(updates).where(eq(studentsTable.id, id));

  if (avatarUrl !== undefined) {
    await db.update(usersTable).set({ avatarUrl }).where(eq(usersTable.id, student.userId));
  }

  const profile = await getStudentProfile(id);
  return res.json(profile);
});

// GET /api/students/:id/applications
router.get("/students/:id/applications", async (req, res) => {
  const studentId = parseInt(req.params.id);
  const apps = await db
    .select({
      id: applicationsTable.id,
      studentId: applicationsTable.studentId,
      internshipId: applicationsTable.internshipId,
      coverLetter: applicationsTable.coverLetter,
      matchScore: applicationsTable.matchScore,
      status: applicationsTable.status,
      createdAt: applicationsTable.createdAt,
      internshipTitle: internshipsTable.title,
      companyId: internshipsTable.companyId,
    })
    .from(applicationsTable)
    .innerJoin(internshipsTable, eq(applicationsTable.internshipId, internshipsTable.id))
    .where(eq(applicationsTable.studentId, studentId));

  const result = await Promise.all(
    apps.map(async (app) => {
      const [company] = await db.select().from(companiesTable).where(eq(companiesTable.id, app.companyId)).limit(1);
      return {
        id: app.id,
        studentId: app.studentId,
        internshipId: app.internshipId,
        internshipTitle: app.internshipTitle,
        companyName: company?.companyName ?? "Company",
        companyLogo: company?.logoUrl ?? null,
        coverLetter: app.coverLetter ?? null,
        matchScore: app.matchScore ?? null,
        status: app.status,
        createdAt: app.createdAt.toISOString(),
      };
    })
  );
  return res.json(result);
});

// GET /api/students/:id/recommended
router.get("/students/:id/recommended", async (req, res) => {
  const studentId = parseInt(req.params.id);

  const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, studentId)).limit(1);
  if (!student) return res.status(404).json({ error: "Student not found" });

  const studentSkills = student.skills ?? [];

  const internships = await db
    .select({
      internship: internshipsTable,
      company: companiesTable,
      applicantsCount: sql<number>`(select count(*) from applications where internship_id = ${internshipsTable.id})`.as("applicants_count"),
    })
    .from(internshipsTable)
    .innerJoin(companiesTable, eq(internshipsTable.companyId, companiesTable.id))
    .where(eq(internshipsTable.status, "open"))
    .limit(20);

  const withMatch = internships.map(({ internship, company, applicantsCount }) => {
    const required = internship.skills ?? [];
    const matched = studentSkills.filter((s: string) =>
      required.some((r) => r.toLowerCase() === s.toLowerCase())
    );
    const matchScore = required.length > 0
      ? Math.round((matched.length / required.length) * 100)
      : 50;

    const missing = required.filter(
      (r) => !studentSkills.some((s: string) => s.toLowerCase() === r.toLowerCase())
    );
    const matchExplanation =
      matchScore >= 80
        ? `Strong match — you have ${matched.length} of ${required.length} required skills.`
        : matchScore >= 50
        ? `Good match — you have ${matched.length} of ${required.length} required skills. Consider learning ${missing.slice(0, 2).join(", ")}.`
        : `Partial match — you have ${matched.length} of ${required.length} required skills.`;

    return {
      id: internship.id,
      companyId: internship.companyId,
      companyName: company.companyName ?? "Company",
      companyLogo: company.logoUrl ?? null,
      title: internship.title,
      description: internship.description,
      location: internship.location ?? null,
      type: internship.type ?? null,
      duration: internship.duration ?? null,
      skills: internship.skills ?? [],
      salary: internship.salary ?? null,
      status: internship.status,
      deadline: internship.deadline ?? null,
      applicantsCount: Number(applicantsCount),
      createdAt: internship.createdAt.toISOString(),
      matchScore,
      matchExplanation,
    };
  });

  withMatch.sort((a, b) => b.matchScore - a.matchScore);
  return res.json(withMatch);
});

export default router;
