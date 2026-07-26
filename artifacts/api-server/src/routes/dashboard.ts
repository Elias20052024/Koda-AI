import { Router } from "express";
import { db } from "@workspace/db";
import {
  applicationsTable,
  internshipsTable,
  companiesTable,
  studentsTable,
  verificationRequestsTable,
  usersTable,
} from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

// GET /api/dashboard/student
router.get("/dashboard/student", async (req, res) => {
  const studentId = parseInt(req.query.studentId as string);
  if (!studentId) return res.status(400).json({ error: "studentId required" });

  const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, studentId)).limit(1);
  if (!student) return res.status(404).json({ error: "Student not found" });

  const apps = await db.select().from(applicationsTable).where(eq(applicationsTable.studentId, studentId));

  const totalApplications = apps.length;
  const pendingApplications = apps.filter((a) => a.status === "pending").length;
  const acceptedApplications = apps.filter((a) => a.status === "accepted").length;
  const rejectedApplications = apps.filter((a) => a.status === "rejected").length;

  // Profile completeness
  let completeness = 20; // base
  if (student.bio) completeness += 15;
  if (student.university) completeness += 15;
  if (student.gpa) completeness += 10;
  if ((student.skills ?? []).length > 0) completeness += 20;
  if (student.resumeUrl) completeness += 20;
  completeness = Math.min(completeness, 100);

  // Recent applications
  const recentApps = apps.slice(-5).reverse();
  const recentApplications = await Promise.all(
    recentApps.map(async (app) => {
      const [internship] = await db.select().from(internshipsTable).where(eq(internshipsTable.id, app.internshipId)).limit(1);
      const [company] = internship
        ? await db.select().from(companiesTable).where(eq(companiesTable.id, internship.companyId)).limit(1)
        : [null];
      return {
        id: app.id,
        studentId: app.studentId,
        internshipId: app.internshipId,
        internshipTitle: internship?.title ?? "",
        companyName: company?.companyName ?? "Company",
        companyLogo: company?.logoUrl ?? null,
        coverLetter: app.coverLetter ?? null,
        matchScore: app.matchScore ?? null,
        status: app.status,
        createdAt: app.createdAt.toISOString(),
      };
    })
  );

  const openInternships = await db.select().from(internshipsTable).where(eq(internshipsTable.status, "open"));

  return res.json({
    totalApplications,
    pendingApplications,
    acceptedApplications,
    rejectedApplications,
    profileCompleteness: completeness,
    recommendedCount: openInternships.length,
    recentApplications,
  });
});

// GET /api/dashboard/company
router.get("/dashboard/company", async (req, res) => {
  const companyId = parseInt(req.query.companyId as string);
  if (!companyId) return res.status(400).json({ error: "companyId required" });

  const internships = await db.select().from(internshipsTable).where(eq(internshipsTable.companyId, companyId));
  const internshipIds = internships.map((i) => i.id);

  const totalInternships = internships.length;
  const activeInternships = internships.filter((i) => i.status === "open").length;

  let allApps: typeof applicationsTable.$inferSelect[] = [];
  for (const id of internshipIds) {
    const apps = await db.select().from(applicationsTable).where(eq(applicationsTable.internshipId, id));
    allApps = [...allApps, ...apps];
  }

  const totalApplicants = allApps.length;
  const pendingApplicants = allApps.filter((a) => a.status === "pending").length;
  const acceptedApplicants = allApps.filter((a) => a.status === "accepted").length;

  const [company] = await db.select().from(companiesTable).where(eq(companiesTable.id, companyId)).limit(1);

  const recentApplications = await Promise.all(
    allApps.slice(-5).reverse().map(async (app) => {
      const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, app.studentId)).limit(1);
      const [user] = student
        ? await db.select().from(usersTable).where(eq(usersTable.id, student.userId)).limit(1)
        : [null];
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

  return res.json({
    totalInternships,
    activeInternships,
    totalApplicants,
    pendingApplicants,
    acceptedApplicants,
    recentApplications,
  });
});

// GET /api/dashboard/university
router.get("/dashboard/university", async (req, res) => {
  const universityId = parseInt(req.query.universityId as string);
  if (!universityId) return res.status(400).json({ error: "universityId required" });

  const verifications = await db
    .select()
    .from(verificationRequestsTable)
    .where(eq(verificationRequestsTable.universityId, universityId));

  const totalStudents = verifications.length;
  const verifiedStudents = verifications.filter((v) => v.status === "approved").length;
  const pendingVerifications = verifications.filter((v) => v.status === "pending").length;

  // Placed = verified students who have accepted applications
  const verifiedStudentIds = verifications.filter((v) => v.status === "approved").map((v) => v.studentId);
  let placedStudents = 0;
  for (const sid of verifiedStudentIds) {
    const apps = await db.select().from(applicationsTable).where(eq(applicationsTable.studentId, sid));
    if (apps.some((a) => a.status === "accepted")) placedStudents++;
  }

  const recentVerifications = await Promise.all(
    verifications.slice(-5).reverse().map(async (v) => {
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
    })
  );

  return res.json({
    totalStudents,
    verifiedStudents,
    pendingVerifications,
    placedStudents,
    recentVerifications,
  });
});

export default router;
