import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, companiesTable, internshipsTable, applicationsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

async function getCompanyProfile(companyId: number) {
  const [company] = await db.select().from(companiesTable).where(eq(companiesTable.id, companyId)).limit(1);
  if (!company) return null;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, company.userId)).limit(1);
  if (!user) return null;
  return {
    id: company.id,
    userId: company.userId,
    name: user.name,
    email: user.email,
    companyName: company.companyName ?? null,
    industry: company.industry ?? null,
    description: company.description ?? null,
    website: company.website ?? null,
    logoUrl: company.logoUrl ?? null,
    verified: company.verified,
  };
}

// GET /api/companies/:id
router.get("/companies/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const profile = await getCompanyProfile(id);
  if (!profile) return res.status(404).json({ error: "Company not found" });
  return res.json(profile);
});

// PUT /api/companies/:id
router.put("/companies/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { companyName, industry, description, website, logoUrl } = req.body;

  const [company] = await db.select().from(companiesTable).where(eq(companiesTable.id, id)).limit(1);
  if (!company) return res.status(404).json({ error: "Company not found" });

  const updates: Partial<typeof companiesTable.$inferInsert> = {};
  if (companyName !== undefined) updates.companyName = companyName;
  if (industry !== undefined) updates.industry = industry;
  if (description !== undefined) updates.description = description;
  if (website !== undefined) updates.website = website;
  if (logoUrl !== undefined) updates.logoUrl = logoUrl;

  await db.update(companiesTable).set(updates).where(eq(companiesTable.id, id));
  const profile = await getCompanyProfile(id);
  return res.json(profile);
});

// GET /api/companies/:id/internships
router.get("/companies/:id/internships", async (req, res) => {
  const companyId = parseInt(req.params.id);
  const [company] = await db.select().from(companiesTable).where(eq(companiesTable.id, companyId)).limit(1);
  if (!company) return res.status(404).json({ error: "Company not found" });

  const internships = await db
    .select({
      internship: internshipsTable,
      applicantsCount: sql<number>`(select count(*) from applications where internship_id = ${internshipsTable.id})`.as("applicants_count"),
    })
    .from(internshipsTable)
    .where(eq(internshipsTable.companyId, companyId));

  return res.json(
    internships.map(({ internship, applicantsCount }) => ({
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
    }))
  );
});

export default router;
