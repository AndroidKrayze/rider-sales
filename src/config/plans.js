export const PRODUCT_NAME = "Local Business Website";
export const PRODUCT_METADATA_KEY = "local_business_website";
export const SOURCE = "localai_rider_sales";
export const SETUP_NOTE = "The £250 one-time setup fee applies to every plan.";
export const SETUP_PENCE = 25000;

export const stripePrices = [
  {
    lookupKey: "website_setup_gbp_250",
    unitAmount: 25000,
    currency: "gbp",
    recurring: null,
    nickname: "One-time setup fee"
  },
  {
    lookupKey: "website_annual_gbp_250",
    unitAmount: 25000,
    currency: "gbp",
    recurring: { interval: "year", intervalCount: 1 },
    nickname: "Annual renewal"
  },
  {
    lookupKey: "website_six_month_gbp_200",
    unitAmount: 20000,
    currency: "gbp",
    recurring: { interval: "month", intervalCount: 6 },
    nickname: "Six-month renewal"
  },
  {
    lookupKey: "website_monthly_gbp_50",
    unitAmount: 5000,
    currency: "gbp",
    recurring: { interval: "month", intervalCount: 1 },
    nickname: "Monthly renewal"
  }
];

export const plans = [
  {
    id: "annual",
    name: "Annual",
    label: "£250 setup + £250 annually — £500 today",
    popular: false,
    setupLookupKey: "website_setup_gbp_250",
    recurringLookupKey: "website_annual_gbp_250",
    setupPence: 25000,
    recurringPence: 25000,
    todayPence: 50000,
    interval: "year",
    intervalCount: 1,
    todayLabel: "£500",
    renewsLabel: "£250 each year",
    confirmation:
      "Thank you. £500 was charged today: the £250 one-time setup fee and the first annual payment of £250. The setup fee is not charged again. The plan renews at £250 each year."
  },
  {
    id: "six_month",
    name: "Six-monthly",
    label: "£250 setup + £200 every 6 months — £450 today",
    popular: true,
    setupLookupKey: "website_setup_gbp_250",
    recurringLookupKey: "website_six_month_gbp_200",
    setupPence: 25000,
    recurringPence: 20000,
    todayPence: 45000,
    interval: "month",
    intervalCount: 6,
    todayLabel: "£450",
    renewsLabel: "£200 every 6 months",
    confirmation:
      "Thank you. £450 was charged today: the £250 one-time setup fee and the first six-month payment of £200. The setup fee is not charged again. The plan renews at £200 every 6 months."
  },
  {
    id: "monthly",
    name: "Monthly",
    label: "£250 setup + £50 monthly — £300 today",
    popular: false,
    setupLookupKey: "website_setup_gbp_250",
    recurringLookupKey: "website_monthly_gbp_50",
    setupPence: 25000,
    recurringPence: 5000,
    todayPence: 30000,
    interval: "month",
    intervalCount: 1,
    todayLabel: "£300",
    renewsLabel: "£50 each month",
    confirmation:
      "Thank you. £300 was charged today: the £250 one-time setup fee and the first monthly payment of £50. The setup fee is not charged again. The plan renews at £50 each month."
  }
];
