import assert from "node:assert/strict";
import test from "node:test";
import {
  createSessionToken,
  getSessionUserId,
  hashPassword,
  verifyPassword,
} from "./auth.js";

test("session tokens are signed, expiring, and bound to a user id", () => {
  const issuedAt = 1_700_000_000_000;
  const token = createSessionToken(42, issuedAt);
  const tamperedToken = `${token[0] === "A" ? "B" : "A"}${token.slice(1)}`;
  assert.equal(getSessionUserId(`Bearer ${token}`, issuedAt), 42);
  assert.equal(getSessionUserId(`Bearer ${token}`, issuedAt + 8 * 24 * 60 * 60 * 1000), null);
  assert.equal(getSessionUserId(`Bearer ${tamperedToken}`, issuedAt), null);
  assert.equal(getSessionUserId(`Bearer ${token}`, issuedAt + 10_000), 42);
  assert.equal(getSessionUserId(`Basic ${token}`, issuedAt), null);
  assert.equal(getSessionUserId(`Bearer ${token} ignored`, issuedAt), null);
});

test("password hashes verify without storing the submitted password", async () => {
  const stored = await hashPassword("a-long-test-password");
  assert.notEqual(stored, "a-long-test-password");
  assert.match(stored, /^scrypt\$/);
  assert.deepEqual(await verifyPassword("a-long-test-password", stored), {
    valid: true,
    needsRehash: false,
  });
  assert.deepEqual(await verifyPassword("incorrect", stored), {
    valid: false,
    needsRehash: false,
  });
});

test("legacy plaintext passwords are accepted once and marked for rehash", async () => {
  assert.deepEqual(await verifyPassword("legacy-password", "legacy-password"), {
    valid: true,
    needsRehash: true,
  });
  assert.deepEqual(await verifyPassword("incorrect", "legacy-password"), {
    valid: false,
    needsRehash: false,
  });
});
