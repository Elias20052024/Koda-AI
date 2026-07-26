import { Router } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as LinkedInStrategy } from "passport-linkedin-oauth2";
import { db } from "@workspace/db";
import { usersTable, studentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeToken(userId: number): string {
  return Buffer.from(`${userId}:${Date.now()}:${Math.random()}`).toString("base64");
}

/** Find an existing user by email or create one (always as student for social sign-up). */
async function findOrCreateUser(email: string, name: string, avatarUrl?: string) {
  const [existing] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (existing) return existing;

  const [user] = await db
    .insert(usersTable)
    .values({ email, name, role: "student", avatarUrl: avatarUrl ?? null, passwordHash: "" })
    .returning();

  await db.insert(studentsTable).values({ userId: user.id }).onConflictDoNothing();
  return user;
}

/** Build the frontend redirect URL after a successful OAuth flow. */
function successRedirect(token: string, user: typeof usersTable.$inferSelect): string {
  const frontendBase = process.env["FRONTEND_URL"] ?? "";
  const payload = encodeURIComponent(
    JSON.stringify({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl ?? null,
      },
    })
  );
  return `${frontendBase}/oauth-callback?payload=${payload}`;
}

function failureRedirect(reason: string): string {
  const frontendBase = process.env["FRONTEND_URL"] ?? "";
  return `${frontendBase}/login?error=${encodeURIComponent(reason)}`;
}

// Derive callback base: prefer explicit BACKEND_URL, then REPLIT_DEV_DOMAIN, then localhost
function callbackBase(): string {
  if (process.env["BACKEND_URL"]) return process.env["BACKEND_URL"];
  if (process.env["REPLIT_DEV_DOMAIN"]) return `https://${process.env["REPLIT_DEV_DOMAIN"]}`;
  return `http://localhost:${process.env["PORT"] ?? 8080}`;
}

// ─── Google ───────────────────────────────────────────────────────────────────

const googleEnabled =
  !!process.env["GOOGLE_CLIENT_ID"] && !!process.env["GOOGLE_CLIENT_SECRET"];

if (googleEnabled) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env["GOOGLE_CLIENT_ID"]!,
        clientSecret: process.env["GOOGLE_CLIENT_SECRET"]!,
        callbackURL: `${callbackBase()}/api/auth/google/callback`,
        scope: ["profile", "email"],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email =
            profile.emails?.[0]?.value ?? `${profile.id}@google.oauth`;
          const name = profile.displayName ?? email.split("@")[0];
          const avatarUrl = profile.photos?.[0]?.value;
          const user = await findOrCreateUser(email, name, avatarUrl);
          done(null, user);
        } catch (err) {
          done(err as Error);
        }
      }
    )
  );
}

router.get("/auth/google", (req, res, next) => {
  if (!googleEnabled) {
    return res.redirect(failureRedirect("Google login is not configured yet."));
  }
  passport.authenticate("google")(req, res, next);
});

router.get(
  "/auth/google/callback",
  (req, res, next) => {
    passport.authenticate("google", { session: false }, async (err: Error | null, user: typeof usersTable.$inferSelect | false) => {
      if (err || !user) {
        return res.redirect(failureRedirect(err?.message ?? "Google authentication failed"));
      }
      const token = makeToken(user.id);
      res.redirect(successRedirect(token, user));
    })(req, res, next);
  }
);

// ─── GitHub ───────────────────────────────────────────────────────────────────

const githubEnabled =
  !!process.env["GITHUB_CLIENT_ID"] && !!process.env["GITHUB_CLIENT_SECRET"];

if (githubEnabled) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env["GITHUB_CLIENT_ID"]!,
        clientSecret: process.env["GITHUB_CLIENT_SECRET"]!,
        callbackURL: `${callbackBase()}/api/auth/github/callback`,
        scope: ["user:email"],
      },
      async (_accessToken: string, _refreshToken: string, profile: any, done: (err: Error | null, user?: any) => void) => {
        try {
          const email =
            profile.emails?.[0]?.value ?? `${profile.username}@github.oauth`;
          const name = profile.displayName ?? profile.username ?? email.split("@")[0];
          const avatarUrl = profile.photos?.[0]?.value;
          const user = await findOrCreateUser(email, name, avatarUrl);
          done(null, user);
        } catch (err) {
          done(err as Error);
        }
      }
    )
  );
}

router.get("/auth/github", (req, res, next) => {
  if (!githubEnabled) {
    return res.redirect(failureRedirect("GitHub login is not configured yet."));
  }
  passport.authenticate("github")(req, res, next);
});

router.get(
  "/auth/github/callback",
  (req, res, next) => {
    passport.authenticate("github", { session: false }, async (err: Error | null, user: typeof usersTable.$inferSelect | false) => {
      if (err || !user) {
        return res.redirect(failureRedirect(err?.message ?? "GitHub authentication failed"));
      }
      const token = makeToken(user.id);
      res.redirect(successRedirect(token, user));
    })(req, res, next);
  }
);

// ─── LinkedIn ─────────────────────────────────────────────────────────────────

const linkedinEnabled =
  !!process.env["LINKEDIN_CLIENT_ID"] && !!process.env["LINKEDIN_CLIENT_SECRET"];

if (linkedinEnabled) {
  passport.use(
    new LinkedInStrategy(
      {
        clientID: process.env["LINKEDIN_CLIENT_ID"]!,
        clientSecret: process.env["LINKEDIN_CLIENT_SECRET"]!,
        callbackURL: `${callbackBase()}/api/auth/linkedin/callback`,
        scope: ["openid", "profile", "email"],
      },
      async (_accessToken: string, _refreshToken: string, profile: any, done: (err: Error | null, user?: any) => void) => {
        try {
          const email =
            profile.emails?.[0]?.value ?? `${profile.id}@linkedin.oauth`;
          const name = profile.displayName ?? email.split("@")[0];
          const avatarUrl = profile.photos?.[0]?.value;
          const user = await findOrCreateUser(email, name, avatarUrl);
          done(null, user);
        } catch (err) {
          done(err as Error);
        }
      }
    )
  );
}

router.get("/auth/linkedin", (req, res, next) => {
  if (!linkedinEnabled) {
    return res.redirect(failureRedirect("LinkedIn login is not configured yet."));
  }
  passport.authenticate("linkedin")(req, res, next);
});

router.get(
  "/auth/linkedin/callback",
  (req, res, next) => {
    passport.authenticate("linkedin", { session: false }, async (err: Error | null, user: typeof usersTable.$inferSelect | false) => {
      if (err || !user) {
        return res.redirect(failureRedirect(err?.message ?? "LinkedIn authentication failed"));
      }
      const token = makeToken(user.id);
      res.redirect(successRedirect(token, user));
    })(req, res, next);
  }
);

export default router;
