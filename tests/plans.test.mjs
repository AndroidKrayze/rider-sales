import assert from "node:assert/strict";
import test from "node:test";
import { SETUP_PENCE, plans, stripePrices } from "../src/config/plans.js";

test("initial totals are £500, £450 and £300", () => {
  const totals = Object.fromEntries(plans.map((plan) => [plan.id, plan.todayPence]));
  assert.deepEqual(totals, {
    annual: 50000,
    six_month: 45000,
    monthly: 30000
  });
  for (const plan of plans) {
    assert.equal(plan.todayPence, plan.setupPence + plan.recurringPence);
  }
});

test("recurring intervals match the three billing schedules", () => {
  const intervals = Object.fromEntries(
    stripePrices
      .filter((price) => price.recurring)
      .map((price) => [price.lookupKey, price.recurring])
  );
  assert.deepEqual(intervals, {
    website_annual_gbp_250: { interval: "year", intervalCount: 1 },
    website_six_month_gbp_200: { interval: "month", intervalCount: 6 },
    website_monthly_gbp_50: { interval: "month", intervalCount: 1 }
  });

  const byPlan = Object.fromEntries(plans.map((plan) => [plan.id, [plan.interval, plan.intervalCount]]));
  assert.deepEqual(byPlan, {
    annual: ["year", 1],
    six_month: ["month", 6],
    monthly: ["month", 1]
  });
});

test("the setup fee is included in all three plans", () => {
  assert.equal(plans.length, 3);
  for (const plan of plans) {
    assert.equal(plan.setupPence, SETUP_PENCE);
    assert.equal(plan.setupLookupKey, "website_setup_gbp_250");
    assert.match(plan.label, /£250 setup/);
    assert.match(plan.confirmation, /setup fee is not charged again/);
  }
  const setup = stripePrices.find((price) => price.lookupKey === "website_setup_gbp_250");
  assert.equal(setup.unitAmount, 25000);
  assert.equal(setup.recurring, null);
  assert.equal(plans.filter((plan) => plan.popular).map((plan) => plan.id).join(), "six_month");
});
