const SMALL_WORDS = new Set(["of", "the", "and"]);

export function businessSlug(name) {
  return name
    .normalize("NFKD")
    .replace(/['’]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((part) => part && !SMALL_WORDS.has(part))
    .join("_");
}

export function clientReferenceId(riderCode, slug) {
  const reference = `${riderCode}_${slug}`;
  if (!/^[a-z0-9_]+$/.test(reference)) {
    throw new Error("Client reference must use lowercase letters, numbers, and underscores.");
  }
  return reference;
}

export function withClientReference(paymentLinkUrl, referenceId) {
  const url = new URL(paymentLinkUrl);
  url.searchParams.set("client_reference_id", referenceId);
  return url.toString();
}
