import assert from "node:assert/strict";
import test from "node:test";
import { assertLiveKey, assertTestKey, redact } from "../scripts/setup-stripe.mjs";

test("setup refuses any key that is not a real test key", () => {
  assert.throws(() => assertTestKey(""), /sk_test_/);
  assert.throws(() => assertTestKey("sk_test_REPLACE_ME"), /real sk_test_/);
  assert.throws(() => assertTestKey("sk_" + "live_" + "example"), /sk_test_/);
  assert.doesNotThrow(() => assertTestKey("sk_test_example"));
});

test("live mode accepts only a real live key", () => {
  const live = "sk_" + "live_" + "example";
  const restricted = "rk_" + "live_" + "example";
  assert.throws(() => assertLiveKey("sk_test_example"), /sk_live_/);
  assert.throws(() => assertLiveKey(""), /sk_live_/);
  assert.doesNotThrow(() => assertLiveKey(live));
  assert.doesNotThrow(() => assertLiveKey(restricted));
});

test("errors do not keep the secret key", () => {
  const secret = "sk_test_example";
  const redacted = redact(`Invalid API Key provided: ${secret}`, secret);
  assert.equal(redacted.includes(secret), false);
  assert.match(redacted, /\[redacted\]/);
});
