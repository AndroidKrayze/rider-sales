import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Stripe from "stripe";
import {
  PRODUCT_METADATA_KEY,
  PRODUCT_NAME,
  SOURCE,
  plans,
  stripePrices
} from "../src/config/plans.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const linksPath = path.join(root, "src/config/stripe-links.json");

export function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const values = {};
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }
  return values;
}

export function assertTestKey(key) {
  if (!key || !key.startsWith("sk_test_") || key.includes("REPLACE")) {
    throw new Error("Refusing to run: STRIPE_SECRET_KEY must be a real sk_test_ key.");
  }
}

export function assertLiveKey(key) {
  const liveSecret = key?.startsWith("sk_live_");
  const liveRestricted = key?.startsWith("rk_live_");
  if (!key || key.includes("REPLACE") || (!liveSecret && !liveRestricted)) {
    throw new Error("Refusing to run: live mode needs a real sk_live_ or rk_live_ key.");
  }
}

export function redact(value, secret) {
  const text = String(value ?? "");
  const withoutSecret = secret ? text.split(secret).join("[redacted]") : text;
  return withoutSecret.replace(/(?:sk|rk)_(?:test|live)_[A-Za-z0-9]+/g, "[redacted]");
}

function sameRecurring(actual, expected) {
  if (!expected) return actual == null;
  if (!actual) return false;
  return actual.interval === expected.interval && actual.interval_count === expected.intervalCount;
}

async function findProduct(stripe) {
  let startingAfter;
  do {
    const page = await stripe.products.list({
      active: true,
      limit: 100,
      starting_after: startingAfter
    });
    const found = page.data.find((product) => product.metadata?.key === PRODUCT_METADATA_KEY);
    if (found) return found;
    startingAfter = page.has_more ? page.data.at(-1)?.id : undefined;
  } while (startingAfter);
  return null;
}

async function ensureProduct(stripe) {
  const existing = await findProduct(stripe);
  if (existing) {
    if (existing.name !== PRODUCT_NAME) {
      throw new Error(`Product ${existing.id} is named "${existing.name}" instead of "${PRODUCT_NAME}".`);
    }
    return existing;
  }
  return stripe.products.create(
    {
      name: PRODUCT_NAME,
      metadata: { key: PRODUCT_METADATA_KEY }
    },
    { idempotencyKey: "local-business-website-product" }
  );
}

async function ensurePrices(stripe, productId) {
  const lookupKeys = stripePrices.map((price) => price.lookupKey);
  const listed = await stripe.prices.list({ lookup_keys: lookupKeys, limit: 10 });
  const byKey = new Map(listed.data.map((price) => [price.lookup_key, price]));
  const resolved = {};

  for (const spec of stripePrices) {
    const existing = byKey.get(spec.lookupKey);
    if (existing) {
      const problems = [];
      if (existing.product !== productId) problems.push("product");
      if (existing.currency !== spec.currency) problems.push("currency");
      if (existing.unit_amount !== spec.unitAmount) problems.push("amount");
      if (!existing.active) problems.push("active");
      if (!sameRecurring(existing.recurring, spec.recurring)) problems.push("interval");
      if (problems.length) {
        throw new Error(
          `Price ${spec.lookupKey} (${existing.id}) does not match the expected ${problems.join(", ")}. No duplicate was created.`
        );
      }
      resolved[spec.lookupKey] = existing;
      continue;
    }

    const params = {
      product: productId,
      currency: spec.currency,
      unit_amount: spec.unitAmount,
      lookup_key: spec.lookupKey,
      nickname: spec.nickname,
      metadata: { source: SOURCE }
    };
    if (spec.recurring) {
      params.recurring = {
        interval: spec.recurring.interval,
        interval_count: spec.recurring.intervalCount
      };
    }
    resolved[spec.lookupKey] = await stripe.prices.create(params, {
      idempotencyKey: `price-${spec.lookupKey}`
    });
  }

  return resolved;
}

async function listPaymentLinks(stripe) {
  const links = [];
  let startingAfter;
  do {
    const page = await stripe.paymentLinks.list({
      active: true,
      limit: 100,
      starting_after: startingAfter
    });
    links.push(...page.data);
    startingAfter = page.has_more ? page.data.at(-1)?.id : undefined;
  } while (startingAfter);
  return links;
}

function confirmationFor(plan) {
  return plan.confirmation;
}

async function ensurePaymentLinks(stripe, prices) {
  const existing = await listPaymentLinks(stripe);
  const urls = {};

  for (const plan of plans) {
    const match = existing.find(
      (link) => link.metadata?.source === SOURCE && link.metadata?.plan === plan.id
    );
    if (match) {
      urls[plan.id] = match.url;
      continue;
    }

    const created = await stripe.paymentLinks.create(
      {
        line_items: [
          {
            price: prices[plan.setupLookupKey].id,
            quantity: 1,
            adjustable_quantity: { enabled: false }
          },
          {
            price: prices[plan.recurringLookupKey].id,
            quantity: 1,
            adjustable_quantity: { enabled: false }
          }
        ],
        metadata: {
          plan: plan.id,
          source: SOURCE
        },
        subscription_data: {
          metadata: {
            plan: plan.id,
            source: SOURCE
          }
        },
        phone_number_collection: { enabled: true },
        name_collection: {
          individual: { enabled: true, optional: false }
        },
        custom_fields: [
          {
            key: "businessname",
            label: { type: "custom", custom: "Business name" },
            type: "text",
            optional: false,
            text: { maximum_length: 200 }
          }
        ],
        after_completion: {
          type: "hosted_confirmation",
          hosted_confirmation: {
            custom_message: confirmationFor(plan)
          }
        },
        allow_promotion_codes: false
      },
      { idempotencyKey: `payment-link-${SOURCE}-${plan.id}` }
    );
    urls[plan.id] = created.url;
  }

  return urls;
}

export async function setupStripe(secretKey, { allowLive = false } = {}) {
  if (allowLive) assertLiveKey(secretKey);
  else assertTestKey(secretKey);
  const stripe = new Stripe(secretKey);
  const product = await ensureProduct(stripe);
  const prices = await ensurePrices(stripe, product.id);
  const urls = await ensurePaymentLinks(stripe, prices);

  const publicLinks = {
    annual: urls.annual,
    six_month: urls.six_month,
    monthly: urls.monthly
  };
  fs.writeFileSync(linksPath, `${JSON.stringify(publicLinks, null, 2)}\n`);

  return { product, prices, urls };
}

function printResult({ product, prices, urls }) {
  console.log(`Product: ${product.id}`);
  console.log("Prices:");
  for (const spec of stripePrices) {
    console.log(`  ${spec.lookupKey}: ${prices[spec.lookupKey].id}`);
  }
  console.log("Payment Links:");
  for (const plan of plans) {
    console.log(`  ${plan.id}: ${urls[plan.id]}`);
  }
  console.log("Rebuild the site with npm run build so the rider pages use these links.");
}

async function main() {
  const allowLive = process.env.STRIPE_ALLOW_LIVE === "1";
  const fromFile = loadEnvFile(path.join(root, ".env"));
  const secretKey = process.env.STRIPE_SECRET_KEY || fromFile.STRIPE_SECRET_KEY || "";
  try {
    if (allowLive) assertLiveKey(secretKey);
    else assertTestKey(secretKey);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }

  try {
    const result = await setupStripe(secretKey, { allowLive });
    printResult(result);
  } catch (error) {
    console.error(redact(error?.stack || error?.message || error, secretKey));
    process.exit(1);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
