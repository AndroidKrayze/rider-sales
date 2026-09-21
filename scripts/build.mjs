import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { businesses, businessesFor, statuses, territories } from "../src/config/catalog.js";
import { SETUP_NOTE, plans } from "../src/config/plans.js";
import { riders } from "../src/config/riders.js";
import { clientReferenceId, withClientReference } from "../src/lib/checkout.js";
import { findSecrets } from "../src/lib/secrets.js";
import { paymentWhatsappMessage, whatsappMessage, whatsappUrls } from "../src/lib/share.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const linksPath = path.join(root, "src/config/stripe-links.json");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function readStripeLinks() {
  const parsed = JSON.parse(fs.readFileSync(linksPath, "utf8"));
  return {
    annual: parsed.annual || "",
    six_month: parsed.six_month || "",
    monthly: parsed.monthly || ""
  };
}

function checkoutHref(baseUrl, reference) {
  if (!baseUrl) return "";
  return withClientReference(baseUrl, reference);
}

function planMarkup(plan, href, business) {
  const popular = plan.popular ? `<p class="badge">Most Popular</p>` : "";
  const checkout = href
    ? `<a class="button button-primary" href="${escapeHtml(href)}">Checkout · ${escapeHtml(plan.todayLabel)} today</a>`
    : `<button class="button button-primary" type="button" disabled>Checkout unavailable</button>`;
  const share = href
    ? `<div class="plan-share">
        <button class="button button-secondary" type="button" data-copy data-url="${escapeHtml(href)}" data-copied="Payment link copied" data-fallback="Copy this payment link">Copy payment link</button>
        <p class="copy-status" role="status" aria-live="polite"></p>
        <label class="copy-fallback" hidden>
          Copy this payment link
          <input readonly value="${escapeHtml(href)}">
        </label>
        <a class="button button-secondary" data-whatsapp data-payment data-name="${escapeHtml(business.name)}" data-plan="${escapeHtml(plan.name)}" data-summary="${escapeHtml(plan.label)}" data-url="${escapeHtml(href)}" href="${escapeHtml(whatsappUrls(paymentWhatsappMessage(business.name, plan.name, href, plan.label)).mobile)}">Share via WhatsApp</a>
      </div>`
    : "";
  return `<li class="plan${plan.popular ? " popular" : ""}">
    <div class="plan-heading">
      <h3>${escapeHtml(plan.name)}</h3>
      ${popular}
    </div>
    <p class="today-price">${escapeHtml(plan.todayLabel)} <span>today</span></p>
    <p>${escapeHtml(plan.label)}</p>
    <p class="renews">Then ${escapeHtml(plan.renewsLabel)}. The setup fee is not charged again.</p>
    ${checkout}
    ${share}
  </li>`;
}

function cardMarkup(business, riderCode, links, index) {
  const reference = clientReferenceId(riderCode, business.slug);
  const status = statuses[business.status] ?? business.status;
  const message = whatsappMessage(business.name, business.demoUrl);
  const whatsapp = whatsappUrls(message);
  const loading = index === 0 ? "eager" : "lazy";
  const plansHtml = plans
    .map((plan) => planMarkup(plan, checkoutHref(links[plan.id], reference), business))
    .join("\n");

  return `<article class="card" data-name="${escapeHtml(business.name)}" data-area="${escapeHtml(business.area)}" data-reference="${escapeHtml(reference)}">
    <div class="preview-wrap">
      <img class="preview" src="${escapeHtml(business.image)}" alt="Website preview of ${escapeHtml(business.name)}" loading="${loading}" decoding="async">
      <p class="status" data-status="${escapeHtml(business.status)}">${escapeHtml(status)}</p>
    </div>
    <div class="card-body">
      <h2>${escapeHtml(business.name)}</h2>
      <p class="area">${escapeHtml(business.area)}</p>
      <p class="offer">From £300 today</p>
      <div class="actions">
        <a class="button button-secondary" href="${escapeHtml(business.demoUrl)}" target="_blank" rel="noopener noreferrer">View website demo</a>
        <div class="action-row">
          <button class="button button-secondary" type="button" data-copy data-url="${escapeHtml(business.demoUrl)}">Copy demo link</button>
          <a class="button button-secondary" data-whatsapp data-name="${escapeHtml(business.name)}" data-demo="${escapeHtml(business.demoUrl)}" href="${escapeHtml(whatsapp.mobile)}">Share via WhatsApp</a>
        </div>
        <p class="copy-status" role="status" aria-live="polite"></p>
        <label class="copy-fallback" hidden>
          Copy this demo link
          <input readonly value="${escapeHtml(business.demoUrl)}">
        </label>
        <button class="button button-secondary" type="button" data-share data-name="${escapeHtml(business.name)}" data-demo="${escapeHtml(business.demoUrl)}" hidden>Share</button>
        <button class="button button-primary button-purchase" type="button" data-purchase>Purchase website</button>
      </div>
    </div>
    <dialog aria-labelledby="plans-${escapeHtml(business.slug)}">
      <div class="dialog-toolbar">
        <h2 id="plans-${escapeHtml(business.slug)}">${escapeHtml(business.name)}</h2>
        <button class="button button-secondary" type="button" data-close>Close</button>
      </div>
      <p class="setup-note">${escapeHtml(SETUP_NOTE)}</p>
      <ol class="plans">${plansHtml}</ol>
    </dialog>
  </article>`;
}

export function renderTerritory(territoryId, options = {}) {
  const territory = territories[territoryId];
  const riderCode = riders[territoryId];
  const links = options.links ?? readStripeLinks();
  const list = businessesFor(territoryId);
  const cards = list.map((business, index) => cardMarkup(business, riderCode, links, index)).join("\n");

  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#142033">
  <title>${escapeHtml(territory.title)}</title>
  <link rel="icon" href="../../assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="../../assets/rider.css">
</head>
<body>
  <a class="skip" href="#businesses">Skip to businesses</a>
  <header class="masthead">
    <div class="site-header">
      <p class="eyebrow"><a href="../../">Rider sales</a></p>
      <h1>${escapeHtml(territory.heading)}</h1>
      <p>${escapeHtml(territory.summary)}. Show the demo, share it, then take payment.</p>
    </div>
  </header>
  <div class="search-bar">
    <div class="search-panel">
      <form role="search">
        <label for="business-search">Find a business</label>
        <input id="business-search" type="search" placeholder="Name or area" autocomplete="off" enterkeyhint="search">
      </form>
      <p id="search-count" role="status" aria-live="polite">${list.length} businesses</p>
      <p class="setup-note">${escapeHtml(SETUP_NOTE)}</p>
    </div>
  </div>
  <main id="businesses" class="cards">
    ${cards}
    <p id="search-empty" hidden>No businesses match that search.</p>
  </main>
  <footer class="site-footer">
    <p>Card payments are taken by Stripe. This page does not collect card numbers.</p>
  </footer>
  <script type="module" src="../../assets/rider.js"></script>
</body>
</html>
`;
}

export function renderHome() {
  const sections = Object.values(territories)
    .map((territory) => {
      const names = businessesFor(territory.id)
        .map((business) => `<li>${escapeHtml(business.name)}</li>`)
        .join("");
      const count = businessesFor(territory.id).length;
      return `<a class="territory" href="riders/${escapeHtml(territory.id)}/">
        <p class="territory-count">${count} businesses</p>
        <h2>${escapeHtml(territory.heading)}</h2>
        <p>${escapeHtml(territory.summary)}</p>
        <ul>${names}</ul>
      </a>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#142033">
  <title>Rider sales</title>
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="assets/rider.css">
</head>
<body>
  <header class="masthead">
    <div class="site-header">
      <p class="eyebrow">Local business websites</p>
      <h1>Rider sales</h1>
      <p>Choose a territory. ${escapeHtml(SETUP_NOTE)}</p>
    </div>
  </header>
  <main class="territories">
    ${sections}
  </main>
</body>
</html>
`;
}

function scanDist() {
  const files = [];
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(fullPath);
      else files.push(fullPath);
    }
  }
  walk(dist);
  const hits = [];
  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    const found = findSecrets(text);
    if (found.length) hits.push({ file: path.relative(dist, file), found });
  }
  if (hits.length) {
    const summary = hits.map((hit) => `${hit.file}: ${hit.found.join(", ")}`).join("; ");
    throw new Error(`Secret key pattern found in the production build (${summary}).`);
  }
}

export function build() {
  fs.rmSync(dist, { recursive: true, force: true });
  fs.mkdirSync(path.join(dist, "assets"), { recursive: true });
  fs.mkdirSync(path.join(dist, "riders/se16"), { recursive: true });
  fs.mkdirSync(path.join(dist, "riders/nw"), { recursive: true });

  fs.copyFileSync(path.join(root, "src/styles/rider.css"), path.join(dist, "assets/rider.css"));
  fs.copyFileSync(path.join(root, "src/client/rider.js"), path.join(dist, "assets/rider.js"));
  fs.copyFileSync(path.join(root, "src/lib/share.js"), path.join(dist, "assets/share.js"));
  fs.copyFileSync(path.join(root, "src/assets/favicon.svg"), path.join(dist, "assets/favicon.svg"));

  const links = readStripeLinks();
  fs.writeFileSync(path.join(dist, "index.html"), renderHome());
  fs.writeFileSync(path.join(dist, "riders/se16/index.html"), renderTerritory("se16", { links }));
  fs.writeFileSync(path.join(dist, "riders/nw/index.html"), renderTerritory("nw", { links }));
  scanDist();
  return { businesses: businesses.length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  build();
}
