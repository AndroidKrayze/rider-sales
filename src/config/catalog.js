export const statuses = {
  not_visited: "Not visited",
  contacted: "Contacted",
  interested: "Interested",
  sold: "Sold"
};

export const territories = {
  se16: {
    id: "se16",
    title: "SE16 rider sales",
    heading: "SE16",
    summary: "Bermondsey, Surrey Quays and Rotherhithe"
  },
  nw: {
    id: "nw",
    title: "NW3 and NW8 rider sales",
    heading: "NW3 / NW8",
    summary: "Belsize Park and St John's Wood"
  }
};

export const businesses = [
  {
    slug: "servewell_cafe",
    name: "Servewell Cafe",
    territory: "se16",
    area: "4–6 West Lane, Bermondsey, SE16 4NY",
    demoUrl: "https://androidkrayze.github.io/servewell-cafe-demo/",
    image: "https://androidkrayze.github.io/servewell-cafe-demo/assets/hero.jpg",
    status: "not_visited"
  },
  {
    slug: "la_cigale",
    name: "La Cigale",
    territory: "se16",
    area: "172 Lower Road, Surrey Quays, SE16 2UN",
    demoUrl: "https://androidkrayze.github.io/la-cigale-demo/",
    image: "https://androidkrayze.github.io/la-cigale-demo/images/hero-storefront.jpg",
    status: "not_visited"
  },
  {
    slug: "pop_inn_cafe",
    name: "Pop Inn Cafe",
    territory: "se16",
    area: "258 Southwark Park Road, Bermondsey, SE16 3RN",
    demoUrl: "https://androidkrayze.github.io/pop-inn-cafe-demo/",
    image: "https://androidkrayze.github.io/pop-inn-cafe-demo/photos/hero.jpg",
    status: "not_visited"
  },
  {
    slug: "harryliz_barbers",
    name: "Harryliz Barbers",
    territory: "se16",
    area: "134 Lower Road, Surrey Quays, SE16 2UG",
    demoUrl: "https://androidkrayze.github.io/harryliz-barbers-demo/",
    image: "https://androidkrayze.github.io/harryliz-barbers-demo/images/hero-exterior.jpg",
    status: "not_visited"
  },
  {
    slug: "albion_fish_bar",
    name: "Albion Fish Bar",
    territory: "se16",
    area: "36 Albion Street, Rotherhithe, SE16 7JQ",
    demoUrl: "https://androidkrayze.github.io/albion-fish-bar-demo/",
    image: "https://androidkrayze.github.io/albion-fish-bar-demo/images/hero-fish-chips.jpg",
    status: "not_visited"
  },
  {
    slug: "dry_cleaners_hampstead",
    name: "Dry Cleaners of Hampstead",
    territory: "nw",
    area: "80 Haverstock Hill, Belsize Park, NW3 2BE",
    demoUrl: "https://androidkrayze.github.io/dry-cleaners-hampstead-demo/",
    image: "https://androidkrayze.github.io/dry-cleaners-hampstead-demo/assets/hero.jpg",
    status: "not_visited"
  },
  {
    slug: "jimmys_barber",
    name: "Jimmy's Barber",
    territory: "nw",
    area: "92 Haverstock Hill, Belsize Park, NW3 2BD",
    demoUrl: "https://androidkrayze.github.io/jimmys-barber-demo/",
    image: "https://androidkrayze.github.io/jimmys-barber-demo/assets/hero.jpg",
    status: "not_visited"
  },
  {
    slug: "bonjour_brioche",
    name: "Bonjour Brioche",
    territory: "nw",
    area: "2A England's Lane, Belsize Park, NW3 4TG",
    demoUrl: "https://androidkrayze.github.io/bonjour-brioche-demo/",
    image: "https://androidkrayze.github.io/bonjour-brioche-demo/assets/hero.jpg",
    status: "not_visited"
  },
  {
    slug: "perfect_dry_cleaners",
    name: "Perfect Dry Cleaners",
    territory: "nw",
    area: "55 Abbey Road, St John's Wood, NW8 0AD",
    demoUrl: "https://androidkrayze.github.io/perfect-dry-cleaners-demo/",
    image: "https://androidkrayze.github.io/perfect-dry-cleaners-demo/assets/hero.jpg",
    status: "not_visited"
  }
];

export function businessesFor(territoryId) {
  return businesses.filter((business) => business.territory === territoryId);
}
