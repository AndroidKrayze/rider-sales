import assert from "node:assert/strict";
import test from "node:test";
import { businesses } from "../src/config/catalog.js";
import { riders } from "../src/config/riders.js";
import { businessSlug, clientReferenceId, withClientReference } from "../src/lib/checkout.js";

test("rider and business references are unique and lowercase", () => {
  assert.equal(businessSlug("Jimmy's Barber"), "jimmys_barber");
  assert.equal(businessSlug("Dry Cleaners of Hampstead"), "dry_cleaners_hampstead");
  assert.equal(clientReferenceId(riders.se16, "servewell_cafe"), "rider_se16_servewell_cafe");
  assert.equal(clientReferenceId(riders.nw, "dry_cleaners_hampstead"), "rider_nw_dry_cleaners_hampstead");

  const references = businesses.map((business) => clientReferenceId(riders[business.territory], business.slug));
  assert.equal(new Set(references).size, businesses.length);
  for (const reference of references) {
    assert.match(reference, /^[a-z0-9_]+$/);
    assert.equal(reference, clientReferenceId(riders[reference.startsWith("rider_se16") ? "se16" : "nw"], reference.split("_").slice(2).join("_")));
  }
  for (const business of businesses) {
    assert.equal(business.slug, businessSlug(business.name));
  }
});

test("client references use ? or & to match the existing query string", () => {
  const plain = withClientReference(
    "https://buy.stripe.com/test_annual",
    "rider_se16_servewell_cafe"
  );
  assert.equal(plain, "https://buy.stripe.com/test_annual?client_reference_id=rider_se16_servewell_cafe");

  const existing = new URL(withClientReference(
    "https://buy.stripe.com/test_six?prefilled_email=owner%40example.com",
    "rider_nw_dry_cleaners_hampstead"
  ));
  assert.equal(existing.searchParams.get("prefilled_email"), "owner@example.com");
  assert.equal(existing.searchParams.get("client_reference_id"), "rider_nw_dry_cleaners_hampstead");
  assert.match(existing.search, /&/);
});
