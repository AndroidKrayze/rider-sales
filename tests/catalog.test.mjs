import assert from "node:assert/strict";
import test from "node:test";
import { businesses, statuses } from "../src/config/catalog.js";
import { riders } from "../src/config/riders.js";

const expected = [
  ["Servewell Cafe", "se16", "https://androidkrayze.github.io/servewell-cafe-demo/"],
  ["La Cigale", "se16", "https://androidkrayze.github.io/la-cigale-demo/"],
  ["Pop Inn Cafe", "se16", "https://androidkrayze.github.io/pop-inn-cafe-demo/"],
  ["Harryliz Barbers", "se16", "https://androidkrayze.github.io/harryliz-barbers-demo/"],
  ["Albion Fish Bar", "se16", "https://androidkrayze.github.io/albion-fish-bar-demo/"],
  ["Dry Cleaners of Hampstead", "nw", "https://androidkrayze.github.io/dry-cleaners-hampstead-demo/"],
  ["Jimmy's Barber", "nw", "https://androidkrayze.github.io/jimmys-barber-demo/"],
  ["Bonjour Brioche", "nw", "https://androidkrayze.github.io/bonjour-brioche-demo/"],
  ["Perfect Dry Cleaners", "nw", "https://androidkrayze.github.io/perfect-dry-cleaners-demo/"]
];

test("every listed business points at the correct demo", () => {
  assert.deepEqual(
    businesses.map((business) => [business.name, business.territory, business.demoUrl]),
    expected
  );
  assert.deepEqual(riders, { se16: "rider_se16", nw: "rider_nw" });
  for (const business of businesses) {
    assert.ok(statuses[business.status], business.status);
    assert.ok(business.area);
    assert.ok(business.image.startsWith("https://androidkrayze.github.io/"));
  }
});
