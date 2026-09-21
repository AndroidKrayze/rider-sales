import assert from "node:assert/strict";
import test from "node:test";
import { assertTestKey, redact } from "../scripts/setup-stripe.mjs";

test("setup refuses any key that is not a real test key", () => {
  assert.throws(() => assertTestKey(""), /sk_test_/);
  assert.throws(() => assertTestKey("sk_test_REPLACE_ME"), /real sk_test_/);
  assert.throws(() => assertTestKey("sk_" + "live_" + "example"), /sk_test_/);
  assert.doesNotThrow(() => assertTestKey("sk_test_example"));
});

test("errors do not keep the secret key", () => {
  const secret = "sk_test_example";
  const redacted = redact(`Invalid API Key provided: ${secret}`, secret);
  assert.equal(redacted.includes(secret), false);
  assert.match(redacted, /\[redacted\]/);
});
