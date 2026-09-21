import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { businesses } from "../src/config/catalog.js";
import { SETUP_NOTE } from "../src/config/plans.js";
import { findSecrets } from "../src/lib/secrets.js";
import { build, renderTerritory } from "../scripts/build.mjs";

const root = path.resolve(import.meta.dirname, "..");

test("rendered checkout links append references with ? and &", () => {
  const html = renderTerritory("se16", {
    links: {
      annual: "https://buy.stripe.com/test_annual",
      six_month: "https://buy.stripe.com/test_six?existing=1",
      monthly: "https://buy.stripe.com/test_month"
    }
  });
  assert.match(html, /https:\/\/buy\.stripe\.com\/test_annual\?client_reference_id=rider_se16_servewell_cafe/);
  const sixMonth = [...html.matchAll(/https:\/\/buy\.stripe\.com\/test_six[^"']+/g)].map(
    (match) => new URL(match[0].replaceAll("&amp;", "&"))
  );
  assert.ok(sixMonth.length >= 1);
  for (const url of sixMonth) {
    assert.equal(url.searchParams.get("existing"), "1");
    assert.match(url.searchParams.get("client_reference_id"), /^rider_se16_/);
    assert.match(url.search, /&/);
  }
  assert.match(html, /Most Popular/);
  assert.match(html, new RegExp(SETUP_NOTE.replace(/[£]/g, "£")));
  assert.equal(findSecrets(html).length, 0);
});

test("empty payment links do not invent a checkout URL", () => {
  const html = renderTerritory("nw", {
    links: { annual: "", six_month: "", monthly: "" }
  });
  assert.equal(html.includes("buy.stripe.com"), false);
  assert.match(html, /Checkout unavailable/);
  assert.match(html, /data-reference="rider_nw_dry_cleaners_hampstead"/);
  assert.match(html, /data-reference="rider_nw_jimmys_barber"/);
});

test("the production build lists every demo and contains no secret keys", () => {
  build();
  const pages = [
    fs.readFileSync(path.join(root, "dist/riders/se16/index.html"), "utf8"),
    fs.readFileSync(path.join(root, "dist/riders/nw/index.html"), "utf8")
  ].join("\n");

  for (const business of businesses) {
    assert.match(pages, new RegExp(business.demoUrl.replaceAll(".", "\\.")));
    assert.match(pages, new RegExp(`target="_blank" rel="noopener noreferrer"`));
    assert.match(pages, new RegExp(`data-url="${business.demoUrl}"`));
  }
  assert.match(pages, /Jimmy%27s%20Barber/);
  assert.match(pages, /Copy demo link/);
  assert.match(pages, /Share via WhatsApp/);
  assert.match(pages, /View website demo/);
  assert.match(pages, /Purchase website/);

  const files = [];
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(fullPath);
      else files.push(fullPath);
    }
  }
  walk(path.join(root, "dist"));
  assert.ok(files.length > 0);
  for (const file of files) {
    assert.deepEqual(findSecrets(fs.readFileSync(file, "utf8")), [], path.relative(root, file));
  }
});
