import { Router } from "express";
import { db } from "@workspace/db";
import {
  usersTable,
  studentsTable,
  companiesTable,
  universitiesTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const router = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function makeToken(userId: number): string {
  return Buffer.from(`${userId}:${Date.now()}:${Math.random()}`).toString("base64");
}

function userToResponse(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl ?? null,
    createdAt: user.createdAt.toISOString(),
  };
}

// POST /api/auth/register
router.post("/auth/register", async (req, res) => {
  const { email, password, name, role } = req.body;

  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const validRoles = ["student", "company", "university", "admin"];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) {
    return res.status(400).json({ error: "Email already registered" });
  }

  const [user] = await db.insert(usersTable).values({
    email,
    passwordHash: hashPassword(password),
    name,
    role,
  }).returning();

  // Create profile row
  if (role === "student") {
    await db.insert(studentsTable).values({ userId: user.id }).onConflictDoNothing();
  } else if (role === "company") {
    await db.insert(companiesTable).values({ userId: user.id }).onConflictDoNothing();
  } else if (role === "university") {
    await db.insert(universitiesTable).values({ userId: user.id }).onConflictDoNothing();
  }

  const token = makeToken(user.id);
  return res.status(201).json({ token, user: userToResponse(user) });
});

// POST /api/auth/login
router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Missing credentials" });
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user || user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = makeToken(user.id);
  return res.json({ token, user: userToResponse(user) });
});

// GET /api/auth/me  — reads userId from x-user-id header (set by client after login)
router.get("/auth/me", async (req, res) => {
  const userId = parseInt(req.headers["x-user-id"] as string);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) return res.status(404).json({ error: "User not found" });

  return res.json(userToResponse(user));
});

export default router;
