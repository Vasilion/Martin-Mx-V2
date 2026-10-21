/** Everything owners can edit, in the order the "More" screen lists it. */
export const editSections = [
  { href: "/admin/settings", title: "Prices, spots & hours", desc: "Practice prices, spots per class, regular hours, membership" },
  { href: "/admin/content/announcement", title: "Announcement banner", desc: "A strip across the top of every page" },
  { href: "/admin/content/home", title: "Home page", desc: "Main photo, headlines, ticker" },
  { href: "/admin/content/tracks", title: "Tracks", desc: "Photos, descriptions and stats for both tracks" },
  { href: "/admin/content/trackInfo", title: "Track info & rules", desc: "Gear, minor riders, house rules, special events" },
  { href: "/admin/content/waivers", title: "Waivers", desc: "The PDFs riders download" },
  { href: "/admin/content/gallery", title: "Gallery", desc: "Add photos from your phone" },
  { href: "/admin/content/sponsors", title: "Sponsors", desc: "Logos and links" },
  { href: "/admin/content/hiring", title: "Hiring", desc: "Taking applications, positions, availability" },
  { href: "/admin/content/contact", title: "Contact page", desc: "The intro on the contact page" },
  { href: "/admin/content/site", title: "Contact & links", desc: "Phone, email, address, Facebook, Instagram, store" },
] as const;
