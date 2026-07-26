import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, universitiesTable, studentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

async function getUniversityProfile(universityId: number) {
  const [university] = await db.select().from(universitiesTable).where(eq(universitiesTable.id, universityId)).limit(1);
  if (!university) return null;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, university.userId)).limit(1);
  if (!user) return null;
  return {
    id: university.id,
    userId: university.userId,
    name: user.name,
    email: user.email,
    universityName: university.universityName ?? null,
    country: university.country ?? null,
    website: university.website ?? null,
  };
}

// GET /api/universities/:id
router.get("/universities/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const profile = await getUniversityProfile(id);
  if (!profile) return res.status(404).json({ error: "University not found" });
  return res.json(profile);
});

// GET /api/universities/:id/students
router.get("/universities/:id/students", async (req, res) => {
  const universityId = parseInt(req.params.id);
  const [university] = await db.select().from(universitiesTable).where(eq(universitiesTable.id, universityId)).limit(1);
  if (!university) return null;

  const universityRecord = await getUniversityProfile(universityId);
  const universityName = universityRecord?.universityName ?? "";

  const students = await db.select().from(studentsTable).where(eq(studentsTable.university, universityName));
  const result = await Promise.all(
    students.map(async (student) => {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, student.userId)).limit(1);
      return {
        id: student.id,
        userId: student.userId,
        name: user?.name ?? "",
        email: user?.email ?? "",
        university: student.university ?? null,
        gpa: student.gpa ?? null,
        bio: student.bio ?? null,
        resumeUrl: student.resumeUrl ?? null,
        skills: student.skills ?? [],
        verified: student.verified,
        avatarUrl: user?.avatarUrl ?? null,
      };
    })
  );
  return res.json(result);
});

export default router;
