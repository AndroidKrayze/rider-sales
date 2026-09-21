const SECRET_PATTERNS = [
  /sk_test_/,
  /sk_live_/,
  /rk_test_/,
  /rk_live_/,
  /whsec_/
];

export function findSecrets(text) {
  return SECRET_PATTERNS.filter((pattern) => pattern.test(text)).map((pattern) => pattern.source);
}
