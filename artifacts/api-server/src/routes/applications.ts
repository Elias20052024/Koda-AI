import { Router } from "express";
import { db } from "@workspace/db";
import { applicationsTable, internshipsTable, companiesTable, studentsTable, notificationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// POST /api/applications
router.post("/applications", async (req, res) => {
  const { studentId, internshipId, coverLetter } = req.body;
  if (!studentId || !internshipId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const [internship] = await db.select().from(internshipsTable).where(eq(internshipsTable.id, internshipId)).limit(1);
  if (!internship) return res.status(404).json({ error: "Internship not found" });

  const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, studentId)).limit(1);
  if (!student) return res.status(404).json({ error: "Student not found" });

  // Calculate match score
  const required = internship.skills ?? [];
  const studentSkills = student.skills ?? [];
  const matched = studentSkills.filter((s: string) =>
    required.some((r) => r.toLowerCase() === s.toLowerCase())
  );
  const matchScore = required.length > 0 ? Math.round((matched.length / required.length) * 100) : 75;

  const [application] = await db.insert(applicationsTable).values({
    studentId,
    internshipId,
    coverLetter,
    matchScore,
    status: "pending",
  }).returning();

  const [company] = await db.select().from(companiesTable).where(eq(companiesTable.id, internship.companyId)).limit(1);

  return res.status(201).json({
    id: application.id,
    studentId: application.studentId,
    internshipId: application.internshipId,
    internshipTitle: internship.title,
    companyName: company?.companyName ?? "Company",
    companyLogo: company?.logoUrl ?? null,
    coverLetter: application.coverLetter ?? null,
    matchScore: application.matchScore ?? null,
    status: application.status,
    createdAt: application.createdAt.toISOString(),
  });
});

// PUT /api/applications/:id/status
router.put("/applications/:id/status", async (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: "Missing status" });

  const [application] = await db
    .update(applicationsTable)
    .set({ status })
    .where(eq(applicationsTable.id, id))
    .returning();

  if (!application) return res.status(404).json({ error: "Application not found" });

  const [internship] = await db.select().from(internshipsTable).where(eq(internshipsTable.id, application.internshipId)).limit(1);
  const [company] = internship
    ? await db.select().from(companiesTable).where(eq(companiesTable.id, internship.companyId)).limit(1)
    : [null];

  // Create notification for student
  if (internship) {
    const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, application.studentId)).limit(1);
    if (student) {
      const statusMsg = status === "accepted" ? "accepted" : status === "rejected" ? "not moved forward" : "updated";
      await db.insert(notificationsTable).values({
        userId: student.userId,
        title: status === "accepted" ? "Application Accepted!" : "Application Update",
        message: `Your application for "${internship.title}" at ${company?.companyName ?? "Company"} has been ${statusMsg}.`,
        type: status === "accepted" ? "success" : "info",
      });
    }
  }

  return res.json({
    id: application.id,
    studentId: application.studentId,
    internshipId: application.internshipId,
    internshipTitle: internship?.title ?? "",
    companyName: company?.companyName ?? "Company",
    companyLogo: company?.logoUrl ?? null,
    coverLetter: application.coverLetter ?? null,
    matchScore: application.matchScore ?? null,
    status: application.status,
    createdAt: application.createdAt.toISOString(),
  });
});

export default router;
