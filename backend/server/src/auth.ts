import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const PASSWORD_HASH_PREFIX = "scrypt";
const PASSWORD_KEY_LENGTH = 64;
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function getSessionSecret() {
  const configuredSecret = process.env.AUTH_TOKEN_SECRET?.trim();
  if (configuredSecret) {
    if (configuredSecret.length < 32) {
      throw new Error("AUTH_TOKEN_SECRET must be at least 32 characters.");
    }
    return configuredSecret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_TOKEN_SECRET must be configured in production.");
  }

  console.warn(
    "AUTH_TOKEN_SECRET is not configured; development sessions will expire when the server restarts.",
  );
  return randomBytes(32).toString("hex");
}

const sessionSecret = getSessionSecret();

export function createSessionToken(userId: number, now = Date.now()) {
  const issuedAt = Math.floor(now / 1000);
  const payload = Buffer.from(
    JSON.stringify({ sub: userId, iat: issuedAt, exp: issuedAt + SESSION_TTL_SECONDS }),
  ).toString("base64url");
  const signature = createHmac("sha256", sessionSecret)
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

export function getSessionUserId(authorization: string, now = Date.now()) {
  const parts = authorization.trim().split(/\s+/);
  if (parts.length !== 2 || parts[0] !== "Bearer" || !parts[1]) return null;
  const token = parts[1];

  const [payload, providedSignature, extra] = token.split(".");
  if (!payload || !providedSignature || extra) return null;

  const expectedSignature = createHmac("sha256", sessionSecret)
    .update(payload)
    .digest();
  let actualSignature: Buffer;
  try {
    actualSignature = Buffer.from(providedSignature, "base64url");
  } catch {
    return null;
  }
  if (
    actualSignature.length !== expectedSignature.length ||
    !timingSafeEqual(actualSignature, expectedSignature)
  ) {
    return null;
  }

  try {
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      sub?: unknown;
      exp?: unknown;
    };
    if (
      typeof claims.sub !== "number" ||
      !Number.isSafeInteger(claims.sub) ||
      claims.sub <= 0 ||
      typeof claims.exp !== "number" ||
      !Number.isSafeInteger(claims.exp) ||
      claims.exp <= Math.floor(now / 1000)
    ) {
      return null;
    }
    return claims.sub;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const derivedKey = (await scryptAsync(
    password,
    salt,
    PASSWORD_KEY_LENGTH,
  )) as Buffer;
  return `${PASSWORD_HASH_PREFIX}$${salt.toString("base64url")}$${derivedKey.toString("base64url")}`;
}

export async function verifyPassword(password: string, storedValue: string) {
  if (!storedValue.startsWith(`${PASSWORD_HASH_PREFIX}$`)) {
    const candidate = Buffer.from(password);
    const legacyValue = Buffer.from(storedValue);
    const valid =
      candidate.length === legacyValue.length && timingSafeEqual(candidate, legacyValue);
    return {
      valid,
      needsRehash: valid,
    };
  }

  const [, saltValue, hashValue, extra] = storedValue.split("$");
  if (!saltValue || !hashValue || extra) {
    return { valid: false, needsRehash: false };
  }

  try {
    const salt = Buffer.from(saltValue, "base64url");
    const expected = Buffer.from(hashValue, "base64url");
    if (expected.length !== PASSWORD_KEY_LENGTH) {
      return { valid: false, needsRehash: false };
    }
    const actual = (await scryptAsync(password, salt, PASSWORD_KEY_LENGTH)) as Buffer;
    return {
      valid: timingSafeEqual(actual, expected),
      needsRehash: false,
    };
  } catch {
    return { valid: false, needsRehash: false };
  }
}
