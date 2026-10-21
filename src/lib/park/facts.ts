/**
 * Stable facts about Martin MX Park. These change rarely and are edited in code.
 * Anything the owners change week to week (practice status, schedule, prices,
 * spots, sponsors, gallery) lives in `live.ts` instead.
 */

export const park = {
  name: "Martin MX Park",
  shortName: "Martin MX",
  url: "https://www.martinmxpark.com",
  timeZone: "America/Detroit",
  address: {
    street: "1479 12th St",
    city: "Martin",
    region: "MI",
    postalCode: "49070",
    full: "1479 12th St, Martin, MI 49070",
    directionsNote: "Just off US-131 in Martin, Michigan",
  },
  geo: { lat: 42.5285482, lng: -85.6641986 },
  weatherGeo: { lat: 42.5359, lng: -85.6386 },
  phone: { display: "(616) 426-9232", href: "tel:+16164269232" },
  email: "martinmxpark@gmail.com",
  social: {
    facebook: "https://www.facebook.com/martinmxpark",
    instagram: "https://www.instagram.com/martinmxpark",
    twitter: "https://twitter.com/martinmxpark",
  },
  storeUrl: "https://martin-mx-store.printful.me/",
  mapsUrl: "https://www.google.com/maps/dir/?api=1&destination=1479+12th+St,+Martin,+MI+49070",
  mapsEmbedUrl:
    "https://www.google.com/maps?q=1479+12th+St,+Martin,+MI+49070&output=embed",
  trackModelUrl:
    "https://sketchfab.com/models/308b91191bbc435abdfefa38b272beb4/embed?autostart=1&ui_controls=1&ui_infos=0&ui_inspector=0&ui_watermark=0&ui_stop=0&ui_settings=0&ui_animations=0&ui_annotations=0&ui_loading=0&transparent=1",
  droneVideo: {
    src: "https://a3edrone.com/Videos/MartinMX/MartinMX.mp4",
    credit: "A3E Drone Services",
    creditUrl: "https://a3edrone.com",
  },
} as const;

export type TrackId = "main" | "junior";

export const tracks: Record<
  TrackId,
  {
    number: string;
    name: string;
    tagline: string;
    image: string;
    imageAlt: string;
    imagePosition: string;
    stats: { value: string; label: string }[];
    body: string[];
  }
> = {
  main: {
    number: "01",
    name: "Main Track",
    tagline: "Rider-friendly flow. Still fast enough to hurt.",
    image: "/media/gallery/strapi-main-2.jpg",
    imageAlt: "Martin MX main track jumps and berms",
    imagePosition: "center 80%",
    stats: [
      { value: "22", label: "Turns" },
      { value: "3X", label: "Stadium triple" },
      { value: "All", label: "Skill levels" },
    ],
    body: [
      "Built for every level of rider: the average rider feels comfortable and the fast guys are still challenged. Roughly 22 turns, a stadium triple, multiple tabletops, rollers and a rhythm section tie it together.",
      "The layout keeps evolving with new jumps and turns, and most upgrades go into the riding itself: fresh dirt, better watering, and better prep.",
    ],
  },
  junior: {
    number: "02",
    name: "Junior Track",
    tagline: "Where the next generation learns to ride.",
    image: "/media/gallery/strapi-youth-2.jpg",
    imageAlt: "Tabletop jumps on the Martin MX junior track",
    imagePosition: "center 70%",
    stats: [
      { value: "Hard", label: "Pack surface" },
      { value: "100%", label: "Tabletops" },
      { value: "0", label: "Pit bikes" },
    ],
    body: [
      "A hard-pack track made for newer riders, with rights, lefts and off-camber turns that build real skills. Every jump is a tabletop: no doubles, no triples.",
      "Young riders are the future of the sport, and their safety comes first while they learn on our track.",
    ],
  },
};

export const gearRequirements = [
  "DOT-approved helmet",
  "Goggles",
  "Long pants",
  "Long-sleeve shirt",
  "Boots over the ankle",
  "No kickstands",
  "No training wheels",
];

export const minorPolicy = {
  intro:
    "These policies are firm and strictly enforced. We can't make exceptions.",
  rules: [
    "Riders must be older than 4.",
    "Riders under 18 need a parent or legal guardian on site the entire time they're at the park.",
    "A parent or legal guardian must come in with the minor and fill out the required waivers at check-in.",
    "Once waivers are signed, the parent or guardian stays at the track until the minor is done riding for the day.",
  ],
  noParent: {
    title: "No parent available?",
    body: "A parent or legal guardian can designate another adult (18+) as guardian for the day using the Guardian Release. It must be presented at sign-in and it must be notarized.",
  },
};

export const waivers = [
  {
    id: "guardian",
    label: "Guardian Release",
    note: "Must be notarized",
    href: "/media/waivers/guardian-release.pdf",
  },
  {
    id: "minor",
    label: "Minor Waiver",
    note: "Riders under 18",
    href: "/media/waivers/minor-waiver.pdf",
  },
  {
    id: "adult",
    label: "Adult Waiver",
    note: "Riders 18+",
    href: "/media/waivers/rider-waiver.pdf",
  },
] as const;

export const trackRules: { title: string; body: string }[] = [
  {
    title: "Sign in before you park",
    body: "Everyone in your vehicle, spectators included, checks in and signs the liability waiver before entering the facility.",
  },
  {
    title: "No drugs or alcohol",
    body: "Alcohol isn't permitted on the premises and riding under the influence is strictly prohibited. Anyone suspected will be asked to leave without a refund, and authorities may be contacted.",
  },
  {
    title: "Respect everyone",
    body: "Loud, obnoxious, aggressive or harassing behavior toward riders, spectators or staff isn't tolerated, and you'll be asked to leave.",
  },
  {
    title: "No riding before opening",
    body: "Staff run equipment on the track right up to opening. Riding early gets you a quick escort off the grounds.",
  },
  {
    title: "Early arrival welcome",
    body: "Beat the traffic and grab your spot. Arriving early doesn't mean the track opens early.",
  },
  {
    title: "Tents & canopies allowed",
    body: "Set up and stay comfortable. Use only the space you actually need.",
  },
  {
    title: "Leashed pets only",
    body: "Pets must be leashed at all times and cleaned up after. Staff may move loud or aggressive pets to remote parking.",
  },
  {
    title: "Re-entry needs a wristband",
    body: "Leaving temporarily? Show your wristband at check-in when you come back.",
  },
  {
    title: "No drones",
    body: "Drones are prohibited during open practice unless approved by Martin MX Park.",
  },
  {
    title: "No camping, no fires",
    body: "Overnight camping and fires aren't allowed.",
  },
  {
    title: "No pit bikes on the Jr track",
    body: "The junior track is for proper youth motocross bikes only.",
  },
];

export const concessions = {
  body: "Water ($1) and Monster ($2) at the check-in building. Bring your own food. There's a gas station and Subway half a mile away.",
};

export const specialEventPolicies = [
  {
    title: "Limited infield access",
    body: "Inside areas of the track are limited to approved individuals. Parents (not guardians) of small-bike class riders are the only exception.",
  },
  { title: "Spectators $5", body: "The spectator fee applies at special events." },
  { title: "Free parking", body: "Parking stays free during special events." },
];
