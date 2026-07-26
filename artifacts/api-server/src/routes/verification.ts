import { Router } from "express";
import { db } from "@workspace/db";
import {
  verificationRequestsTable,
  studentsTable,
  universitiesTable,
  usersTable,
  notificationsTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

async function formatVerification(v: typeof verificationRequestsTable.$inferSelect) {
  const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, v.studentId)).limit(1);
  const [user] = student
    ? await db.select().from(usersTable).where(eq(usersTable.id, student.userId)).limit(1)
    : [null];
  return {
    id: v.id,
    studentId: v.studentId,
    universityId: v.universityId,
    studentName: user?.name ?? "Student",
    studentEmail: user?.email ?? "",
    status: v.status,
    createdAt: v.createdAt.toISOString(),
  };
}

// GET /api/verification
router.get("/verification", async (req, res) => {
  const universityId = parseInt(req.query.universityId as string);
  if (!universityId) return res.status(400).json({ error: "universityId required" });

  const requests = await db
    .select()
    .from(verificationRequestsTable)
    .where(eq(verificationRequestsTable.universityId, universityId));

  return res.json(await Promise.all(requests.map(formatVerification)));
});

// POST /api/verification
router.post("/verification", async (req, res) => {
  const { studentId, universityId } = req.body;
  if (!studentId || !universityId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const [request] = await db.insert(verificationRequestsTable).values({
    studentId,
    universityId,
    status: "pending",
  }).returning();

  return res.status(201).json(await formatVerification(request));
});

// PUT /api/verification/:id/status
router.put("/verification/:id/status", async (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: "Missing status" });

  const [request] = await db
    .update(verificationRequestsTable)
    .set({ status })
    .where(eq(verificationRequestsTable.id, id))
    .returning();

  if (!request) return res.status(404).json({ error: "Verification request not found" });

  // If approved, mark student as verified
  if (status === "approved") {
    await db.update(studentsTable).set({ verified: true }).where(eq(studentsTable.id, request.studentId));
    const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, request.studentId)).limit(1);
    if (student) {
      const [university] = await db.select().from(universitiesTable).where(eq(universitiesTable.id, request.universityId)).limit(1);
      const [uniUser] = university
        ? await db.select().from(usersTable).where(eq(usersTable.id, university.userId)).limit(1)
        : [null];
      await db.insert(notificationsTable).values({
        userId: student.userId,
        title: "Student Verified!",
        message: `Your student status has been verified by ${uniUser?.name ?? "the university"}.`,
        type: "success",
      });
    }
  }

  return res.json(await formatVerification(request));
});

export default router;
