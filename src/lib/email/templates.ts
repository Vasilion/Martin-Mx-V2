import { park } from "@/lib/park/facts";
import type { SiteInfo } from "@/lib/park/content";
import { formatDay, formatPrice, formatTimeRange } from "@/lib/park/format";
import { emailLogoUrl } from "@/lib/media";

/**
 * Transactional email templates. Table layout + inline styles because email clients
 * ignore most CSS; every user-supplied value goes through esc().
 */

const esc = (v: unknown) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const C = { ink: "#0b0b0b", ink2: "#161616", line: "#2a2a2a", text: "#f5f5f2", muted: "#a3a39c", volt: "#5fd400" };

function layout({ site, preheader, eyebrow, title, body }: { site: SiteInfo; preheader: string; eyebrow: string; title: string; body: string }) {
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"></head>
<body style="margin:0;padding:0;background:${C.ink};">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.ink};">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${C.ink2};border:1px solid ${C.line};">
  <tr><td style="height:4px;background:${C.volt};font-size:0;line-height:0">&nbsp;</td></tr>
  <tr><td style="padding:28px 32px 8px;">
    <img src="${emailLogoUrl}" width="220" height="28" alt="Martin MX" style="display:block;border:0;">
  </td></tr>
  <tr><td style="padding:24px 32px 0;font-family:Arial,Helvetica,sans-serif;">
    <p style="margin:0;color:${C.volt};font-size:12px;font-weight:bold;letter-spacing:3px;text-transform:uppercase;">${esc(eyebrow)}</p>
    <h1 style="margin:10px 0 0;color:${C.text};font-size:30px;line-height:1.1;font-style:italic;font-weight:900;text-transform:uppercase;">${esc(title)}</h1>
  </td></tr>
  <tr><td style="padding:20px 32px 32px;font-family:Arial,Helvetica,sans-serif;color:${C.text};font-size:15px;line-height:1.55;">${body}</td></tr>
  <tr><td style="padding:20px 32px;border-top:1px solid ${C.line};font-family:Arial,Helvetica,sans-serif;color:${C.muted};font-size:12px;line-height:1.6;">
    ${esc(park.name)} · ${esc(site.addressFull)}<br>
    <a href="${site.phoneHref}" style="color:${C.muted};">${esc(site.phone)}</a> · <a href="mailto:${site.email}" style="color:${C.muted};">${esc(site.email)}</a>
  </td></tr>
</table></td></tr></table></body></html>`;
}

function rows(items: [string, string][]) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;border-top:1px solid ${C.line};">${items
    .map(
      ([k, v]) =>
        `<tr><td style="padding:10px 0;border-bottom:1px solid ${C.line};color:${C.muted};font-size:13px;">${esc(k)}</td><td align="right" style="padding:10px 0;border-bottom:1px solid ${C.line};color:${C.text};font-size:14px;font-weight:bold;">${esc(v)}</td></tr>`,
    )
    .join("")}</table>`;
}

function button(href: string, label: string) {
  return `<a href="${href}" style="display:inline-block;background:${C.volt};color:${C.ink};padding:12px 20px;font-weight:bold;font-style:italic;text-transform:uppercase;text-decoration:none;font-size:14px;letter-spacing:1px;">${esc(label)}</a>`;
}

export function practiceConfirmationEmail(site: SiteInfo, r: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  riderNumber: string;
  bikeSize: number;
  ageGroup: "adult" | "minor";
  classLabel: string;
  date: string;
  start: string;
  end: string;
  amount: number;
}) {
  const when = `${formatDay(r.date, "long")}, ${formatTimeRange(r.start, r.end)}`;
  const details: [string, string][] = [
    ["Rider", `${r.firstName} ${r.lastName}`],
    ["Rider number", `#${r.riderNumber}`],
    ["Class", r.classLabel],
    ["Bike", `${r.bikeSize}cc`],
    ["Ride day", when],
    ["Paid", formatPrice(r.amount)],
    ["Confirmation", r.id.slice(0, 8).toUpperCase()],
  ];
  const minorNote =
    r.ageGroup === "minor"
      ? `<p style="margin:16px 0 0;padding:12px 14px;background:#2a2410;border-left:3px solid #ffb539;color:${C.text};font-size:14px;">Riders under 18 need a parent or legal guardian on site all day. If a parent can't come, bring a <strong>notarized</strong> <a href="${park.url}/track-info#waivers" style="color:#ffb539;">Guardian Release</a>.</p>`
      : "";
  const html = layout({
    site,
    preheader: `You're registered for ${when}.`,
    eyebrow: "Registration confirmed",
    title: "You're on the gate list.",
    body: `<p style="margin:0;">Thanks, ${esc(r.firstName)}. Your spot is locked in for <strong>${esc(when)}</strong>.</p>
      ${rows(details)}
      <p style="margin:0 0 6px;font-weight:bold;">At check-in</p>
      <ul style="margin:0;padding-left:18px;color:${C.text};">
        <li>Everyone signs a waiver before parking. Print yours ahead of time to get through faster.</li>
        <li>Bring an ID and this email.</li>
        <li>Required gear: DOT helmet, goggles, boots over the ankle, long pants and sleeves.</li>
      </ul>
      ${minorNote}
      <p style="margin:24px 0 0;">${button(`${park.url}/track-info#waivers`, "Print your waivers")}</p>
      <p style="margin:20px 0 0;color:${C.muted};font-size:13px;">Days can change with weather. Check <a href="${park.url}/schedule" style="color:${C.volt};">the schedule</a> before you load up. Questions? Just reply to this email.</p>`,
  });
  const text = [
    `You're registered at ${park.name}.`,
    "",
    ...details.map(([k, v]) => `${k}: ${v}`),
    "",
    "At check-in: everyone signs a waiver before parking. Bring an ID and this email.",
    `Waivers: ${park.url}/track-info#waivers`,
    r.ageGroup === "minor" ? "Riders under 18 need a parent or legal guardian on site (or a notarized Guardian Release)." : "",
    `Schedule: ${park.url}/schedule`,
  ]
    .filter((l) => l !== null)
    .join("\n");
  return { subject: `You're registered: ${formatDay(r.date)} at Martin MX`, html, text };
}

export function membershipConfirmationEmail(site: SiteInfo, m: { name: string; amount: number; year: number; address?: string }) {
  const html = layout({
    site,
    preheader: "Welcome to Martin MX unlimited.",
    eyebrow: "Membership confirmed",
    title: "Unlimited. All season.",
    body: `<p style="margin:0;">Welcome aboard, ${esc(m.name.split(" ")[0] || "rider")}. Your ${m.year} unlimited membership is paid (${esc(formatPrice(m.amount))}).</p>
      <p style="margin:16px 0 0;">We'll mail your membership card${m.address ? ` to <strong>${esc(m.address)}</strong>` : ""}. Show it at check-in and ride any open practice day.</p>
      <p style="margin:24px 0 0;">${button(`${park.url}/schedule`, "See ride days")}</p>
      <p style="margin:20px 0 0;color:${C.muted};font-size:13px;">Questions? Just reply to this email.</p>`,
  });
  const text = `Welcome to Martin MX unlimited.\n\nYour ${m.year} membership is paid (${formatPrice(m.amount)}). We'll mail your membership card${m.address ? ` to ${m.address}` : ""}.\n\nRide days: ${park.url}/schedule`;
  return { subject: "Your Martin MX unlimited membership", html, text };
}

/** To the owners: everything they need to mail the card, no Stripe digging. */
export function newMemberOwnerEmail(site: SiteInfo, m: { name: string; email: string; phone?: string; address?: string; amount: number; year: number }) {
  const details: [string, string][] = [
    ["Name", m.name],
    ["Email", m.email],
    ["Phone", m.phone ?? "—"],
    ["Mail card to", m.address ?? "— (not collected)"],
    ["Paid", formatPrice(m.amount)],
  ];
  const html = layout({
    site,
    preheader: `${m.name} bought a ${m.year} membership.`,
    eyebrow: "New member",
    title: `${m.name} joined.`,
    body: `<p style="margin:0;">A ${m.year} unlimited membership was just paid online. Mail their card to the address below.</p>${rows(details)}`,
  });
  const text = `New ${m.year} membership\n\n${details.map(([k, v]) => `${k}: ${v}`).join("\n")}`;
  return { subject: `New member: ${m.name}`, html, text };
}

/** To the owners: a new job application or contact message, all answers inline. */
export function inboxOwnerEmail(
  site: SiteInfo,
  item: { kind: "application" | "message"; name: string; email: string; phone?: string; fields: { label: string; value: string }[] },
) {
  const isApp = item.kind === "application";
  const details: [string, string][] = [
    ["Name", item.name],
    ["Email", item.email],
    ["Phone", item.phone || "—"],
    ...item.fields.map((f) => [f.label, f.value || "—"] as [string, string]),
  ];
  const html = layout({
    site,
    preheader: isApp ? `${item.name} applied to work at Martin MX.` : `${item.name} sent a message.`,
    eyebrow: isApp ? "New job application" : "New message",
    title: item.name,
    body: `<p style="margin:0;">${isApp ? "Someone applied to work at the track." : "Someone sent a message from the website."} Reply to this email to answer them directly. It's also saved in your dashboard inbox.</p>${rows(details)}<p style="margin:16px 0 0;">${button(`${park.url}/admin/inbox`, "Open inbox")}</p>`,
  });
  const text = `${isApp ? "New job application" : "New message"}\n\n${details.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nInbox: ${park.url}/admin/inbox`;
  return { subject: isApp ? `New job application: ${item.name}` : `New message from ${item.name}`, html, text };
}

/** To the person who submitted: confirms it arrived. */
export function inboxReceiptEmail(site: SiteInfo, item: { kind: "application" | "message"; name: string }) {
  const isApp = item.kind === "application";
  const first = item.name.split(" ")[0] || "there";
  const html = layout({
    site,
    preheader: isApp ? "We got your application." : "We got your message.",
    eyebrow: isApp ? "Application received" : "Message received",
    title: isApp ? "Thanks for applying." : "Thanks for reaching out.",
    body: `<p style="margin:0;">Hi ${esc(first)}, ${isApp ? "we got your application to work at Martin MX Park. We'll reach out if it's a fit." : "we got your message and will get back to you soon."}</p><p style="margin:16px 0 0;color:${C.muted};font-size:13px;">Need us sooner? Call <a href="${site.phoneHref}" style="color:${C.volt};">${esc(site.phone)}</a>.</p>`,
  });
  const text = isApp
    ? `Hi ${first}, we got your application to work at Martin MX Park. We'll reach out if it's a fit.`
    : `Hi ${first}, we got your message and will get back to you soon.`;
  return { subject: isApp ? "We got your application" : "We got your message", html, text };
}
