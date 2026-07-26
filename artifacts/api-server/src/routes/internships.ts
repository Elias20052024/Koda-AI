import { Router } from "express";
import { db } from "@workspace/db";
import { internshipsTable, companiesTable, applicationsTable, studentsTable, usersTable } from "@workspace/db";
import { eq, ilike, sql, and } from "drizzle-orm";

const router = Router();

async function buildInternshipResponse(internship: typeof internshipsTable.$inferSelect, company: typeof companiesTable.$inferSelect, applicantsCount: number) {
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
    applicantsCount,
    createdAt: internship.createdAt.toISOString(),
  };
}

// GET /api/internships
router.get("/internships", async (req, res) => {
  const { search, location, type, skill } = req.query as Record<string, string>;

  const internships = await db
    .select({
      internship: internshipsTable,
      company: companiesTable,
      applicantsCount: sql<number>`(select count(*) from applications where internship_id = ${internshipsTable.id})`.as("applicants_count"),
    })
    .from(internshipsTable)
    .innerJoin(companiesTable, eq(internshipsTable.companyId, companiesTable.id))
    .where(eq(internshipsTable.status, "open"));

  let result = internships;

  if (search) {
    const s = search.toLowerCase();
    result = result.filter(
      ({ internship, company }) =>
        internship.title.toLowerCase().includes(s) ||
        (company.companyName ?? "").toLowerCase().includes(s) ||
        internship.description.toLowerCase().includes(s)
    );
  }
  if (location) {
    result = result.filter(({ internship }) =>
      (internship.location ?? "").toLowerCase().includes(location.toLowerCase())
    );
  }
  if (type) {
    result = result.filter(({ internship }) =>
      (internship.type ?? "").toLowerCase() === type.toLowerCase()
    );
  }
  if (skill) {
    result = result.filter(({ internship }) =>
      (internship.skills ?? []).some((s) => s.toLowerCase().includes(skill.toLowerCase()))
    );
  }

  return res.json(
    await Promise.all(
      result.map(({ internship, company, applicantsCount }) =>
        buildInternshipResponse(internship, company, Number(applicantsCount))
      )
    )
  );
});

// POST /api/internships
router.post("/internships", async (req, res) => {
  const { companyId, title, description, location, type, duration, skills, salary, status, deadline } = req.body;
  if (!companyId || !title || !description) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const [internship] = await db.insert(internshipsTable).values({
    companyId,
    title,
    description,
    location,
    type,
    duration,
    skills: skills ?? [],
    salary,
    status: status ?? "open",
    deadline,
  }).returning();

  const [company] = await db.select().from(companiesTable).where(eq(companiesTable.id, companyId)).limit(1);
  return res.status(201).json(await buildInternshipResponse(internship, company, 0));
});

// GET /api/internships/:id
router.get("/internships/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [internship] = await db.select().from(internshipsTable).where(eq(internshipsTable.id, id)).limit(1);
  if (!internship) return res.status(404).json({ error: "Internship not found" });

  const [company] = await db.select().from(companiesTable).where(eq(companiesTable.id, internship.companyId)).limit(1);
  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(applicationsTable)
    .where(eq(applicationsTable.internshipId, id));

  return res.json({
    id: internship.id,
    companyId: internship.companyId,
    companyName: company?.companyName ?? "Company",
    companyLogo: company?.logoUrl ?? null,
    companyWebsite: company?.website ?? null,
    companyIndustry: company?.industry ?? null,
    title: internship.title,
    description: internship.description,
    location: internship.location ?? null,
    type: internship.type ?? null,
    duration: internship.duration ?? null,
    skills: internship.skills ?? [],
    salary: internship.salary ?? null,
    status: internship.status,
    deadline: internship.deadline ?? null,
    applicantsCount: Number(countResult?.count ?? 0),
    createdAt: internship.createdAt.toISOString(),
  });
});

// PUT /api/internships/:id
router.put("/internships/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, description, location, type, duration, skills, salary, status, deadline } = req.body;

  const [internship] = await db.select().from(internshipsTable).where(eq(internshipsTable.id, id)).limit(1);
  if (!internship) return res.status(404).json({ error: "Internship not found" });

  const updates: Partial<typeof internshipsTable.$inferInsert> = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (location !== undefined) updates.location = location;
  if (type !== undefined) updates.type = type;
  if (duration !== undefined) updates.duration = duration;
  if (skills !== undefined) updates.skills = skills;
  if (salary !== undefined) updates.salary = salary;
  if (status !== undefined) updates.status = status;
  if (deadline !== undefined) updates.deadline = deadline;

  const [updated] = await db.update(internshipsTable).set(updates).where(eq(internshipsTable.id, id)).returning();
  const [company] = await db.select().from(companiesTable).where(eq(companiesTable.id, updated.companyId)).limit(1);
  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(applicationsTable)
    .where(eq(applicationsTable.internshipId, id));

  return res.json(await buildInternshipResponse(updated, company, Number(countResult?.count ?? 0)));
});

// DELETE /api/internships/:id
router.delete("/internships/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(internshipsTable).where(eq(internshipsTable.id, id));
  return res.status(204).send();
});

// GET /api/internships/:id/applicants
router.get("/internships/:id/applicants", async (req, res) => {
  const internshipId = parseInt(req.params.id);
  const apps = await db
    .select()
    .from(applicationsTable)
    .where(eq(applicationsTable.internshipId, internshipId));

  const result = await Promise.all(
    apps.map(async (app) => {
      const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, app.studentId)).limit(1);
      const [user] = student ? await db.select().from(usersTable).where(eq(usersTable.id, student.userId)).limit(1) : [null];
      return {
        id: app.id,
        studentId: app.studentId,
        internshipId: app.internshipId,
        studentName: user?.name ?? "Student",
        studentEmail: user?.email ?? "",
        studentAvatar: user?.avatarUrl ?? null,
        studentSkills: student?.skills ?? [],
        studentUniversity: student?.university ?? null,
        coverLetter: app.coverLetter ?? null,
        matchScore: app.matchScore ?? null,
        status: app.status,
        createdAt: app.createdAt.toISOString(),
      };
    })
  );
  return res.json(result);
});

// GET /api/internships/:id/match
router.get("/internships/:id/match", async (req, res) => {
  const internshipId = parseInt(req.params.id);
  const studentId = parseInt(req.query.studentId as string);

  const [internship] = await db.select().from(internshipsTable).where(eq(internshipsTable.id, internshipId)).limit(1);
  if (!internship) return res.status(404).json({ error: "Internship not found" });

  const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, studentId)).limit(1);
  if (!student) return res.status(404).json({ error: "Student not found" });

  const required = internship.skills ?? [];
  const studentSkills = student.skills ?? [];
  const matched = studentSkills.filter((s: string) =>
    required.some((r) => r.toLowerCase() === s.toLowerCase())
  );
  const missing = required.filter(
    (r) => !studentSkills.some((s: string) => s.toLowerCase() === r.toLowerCase())
  );

  const matchScore = required.length > 0
    ? Math.round((matched.length / required.length) * 100)
    : 75;

  const matchExplanation =
    matchScore >= 80
      ? `Excellent match! You have ${matched.length} of ${required.length} required skills: ${matched.join(", ")}.`
      : matchScore >= 50
      ? `Good match. You have ${matched.length} of ${required.length} required skills. To strengthen your application, consider learning ${missing.slice(0, 2).join(" and ")}.`
      : `Developing match. You currently have ${matched.length} of ${required.length} required skills. Key skills to develop: ${missing.join(", ")}.`;

  return res.json({ matchScore, matchExplanation, matchedSkills: matched, missingSkills: missing });
});

export default router;
