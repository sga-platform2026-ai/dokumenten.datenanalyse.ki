import assert from "node:assert/strict";
import { test } from "node:test";
import { isPublicPath } from "@/lib/auth/publicPaths";

test("isPublicPath erlaubt /login und /login/", () => {
  assert.equal(isPublicPath("/login"), true);
  assert.equal(isPublicPath("/login/"), true);
});

test("isPublicPath erlaubt Auth-API", () => {
  assert.equal(isPublicPath("/api/auth/login"), true);
  assert.equal(isPublicPath("/api/auth/status"), true);
});

test("isPublicPath blockiert geschützte Routen", () => {
  assert.equal(isPublicPath("/"), false);
  assert.equal(isPublicPath("/api/analyze"), false);
});
