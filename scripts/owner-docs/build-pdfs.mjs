// Builds the owner handoff PDFs from the screenshots in docs/owner/screens/.
//   node scripts/owner-docs/build-pdfs.mjs
// Re-run capture-screens.mjs first if the dashboard changed.
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const OUT = path.join("docs", "owner");
const SCREENS = path.join(OUT, "screens");
const SITE = "martinmxpark.com";
const ADMIN = `${SITE}/admin`;
const SUPPORT = "luke@unyxwebsolutions.com";

const img = async (name) => `data:image/png;base64,${(await fs.readFile(path.join(SCREENS, `${name}.png`))).toString("base64")}`;
const logo = `data:image/svg+xml;base64,${(await fs.readFile("public/brand/martinmx-logo-white.svg")).toString("base64")}`;

// ---------------------------------------------------------------------------------
// Shared layout

const css = `
@page { size: Letter; margin: 0.65in 0.7in 0.75in; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin: 0; font-family: Archivo, Arial, sans-serif; font-size: 10.5pt; line-height: 1.5; color: #1a1a1a; }
h1, h2, h3, .display { font-family: Kanit, Arial, sans-serif; font-style: italic; font-weight: 800; text-transform: uppercase; letter-spacing: -0.01em; line-height: 1; }
h2 { font-size: 24pt; margin: 0 0 6pt; break-after: avoid; }
h2 .num { color: #338e00; margin-right: 6pt; }
h3 { font-size: 13pt; margin: 16pt 0 4pt; break-after: avoid; }
p { margin: 0 0 7pt; }
.lead { font-size: 11.5pt; color: #444; margin-bottom: 12pt; }
section { break-before: page; }
section.flow { break-before: auto; margin-top: 22pt; }
ol, ul { margin: 0 0 8pt; padding-left: 16pt; }
li { margin-bottom: 3pt; }
strong { font-weight: 700; }
.ui { font-weight: 700; background: #eef3e8; border: 1px solid #cfe0bf; border-radius: 3pt; padding: 0 3pt; white-space: nowrap; }
.two { display: grid; grid-template-columns: 1fr 2.05in; gap: 18pt; align-items: start; }
.two.left { grid-template-columns: 2.05in 1fr; }
.shots { display: grid; grid-template-columns: repeat(2, 2.05in); gap: 12pt; justify-content: start; margin: 6pt 0 10pt; }
figure { margin: 0; break-inside: avoid; }
figure img { width: 100%; border-radius: 10pt; border: 1px solid #d8d8d2; box-shadow: 0 2pt 6pt rgba(0,0,0,.08); display: block; }
figcaption { font-size: 8pt; color: #777; margin-top: 4pt; text-align: center; }
.tip, .warn { border-radius: 5pt; padding: 8pt 10pt; margin: 8pt 0 10pt; break-inside: avoid; font-size: 10pt; }
.tip { background: #eef6e6; border-left: 4pt solid #338e00; }
.warn { background: #fff4dd; border-left: 4pt solid #e09b00; }
.tip b, .warn b { display: block; font-family: Kanit, sans-serif; font-style: italic; text-transform: uppercase; font-size: 9.5pt; letter-spacing: .04em; margin-bottom: 2pt; }
table { width: 100%; border-collapse: collapse; margin: 6pt 0 10pt; font-size: 9.5pt; break-inside: auto; }
th, td { text-align: left; vertical-align: top; padding: 5pt 7pt; border-bottom: 1px solid #e3e3dd; }
th { background: #f2f1ec; font-size: 8pt; text-transform: uppercase; letter-spacing: .06em; color: #555; }
tr { break-inside: avoid; }
.cover { height: 9.6in; background: #0b0b0b; color: #fff; border-radius: 6pt; padding: 0.7in 0.6in; display: flex; flex-direction: column; justify-content: space-between; position: relative; overflow: hidden; }
.cover .bar { position: absolute; left: 0; top: 0; bottom: 0; width: 10pt; background: #5fd400; }
.cover img.logo { height: 26pt; width: auto; align-self: flex-start; }
.cover .eyebrow { font-weight: 700; letter-spacing: .22em; text-transform: uppercase; font-size: 9pt; color: rgba(255,255,255,.7); }
.cover h1 { font-size: 54pt; margin: 10pt 0 0; }
.cover h1 span { display: block; color: #5fd400; }
.cover .sub { font-size: 12pt; color: rgba(255,255,255,.75); max-width: 4.6in; margin-top: 14pt; }
.cover .meta { font-size: 9pt; color: rgba(255,255,255,.55); }
.toc { columns: 2; column-gap: 24pt; padding: 0; list-style: none; }
.toc li { break-inside: avoid; padding: 4pt 0; border-bottom: 1px solid #ecebe6; }
.toc li span { color: #338e00; font-weight: 700; margin-right: 6pt; }
.check { list-style: none; padding: 0; margin: 4pt 0 10pt; }
.check li { display: grid; grid-template-columns: 14pt 1fr; gap: 8pt; padding: 6pt 0; border-bottom: 1px solid #ecebe6; break-inside: avoid; }
.check li::before { content: ""; width: 11pt; height: 11pt; border: 1.5pt solid #333; border-radius: 2pt; margin-top: 2pt; }
.check .exp { display: block; color: #555; font-size: 9.5pt; margin-top: 1pt; }
.check .exp::before { content: "You should see: "; font-weight: 700; color: #338e00; }
.signoff { margin-top: 18pt; display: grid; grid-template-columns: 1fr 1fr; gap: 20pt; }
.signoff div { border-top: 1.2pt solid #333; padding-top: 4pt; font-size: 9pt; color: #555; }
`;

const fonts = `<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;700&family=Kanit:ital,wght@1,700;1,800&display=block" rel="stylesheet">`;

const doc = (title, body) => `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>${fonts}<style>${css}</style></head><body>${body}</body></html>`;

const cover = (eyebrow, line1, line2, sub) => `
<div class="cover"><div class="bar"></div>
  <img class="logo" src="${logo}">
  <div><div class="eyebrow">${eyebrow}</div><h1>${line1}<span>${line2}</span></h1><p class="sub">${sub}</p></div>
  <div class="meta">${SITE} · Owner dashboard: ${ADMIN}<br>Prepared by Unyx Web Solutions · ${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</div>
</div>`;

const fig = async (name, caption) => `<figure><img src="${await img(name)}"><figcaption>${caption}</figcaption></figure>`;
const tip = (t, body) => `<div class="tip"><b>${t}</b>${body}</div>`;
const warn = (t, body) => `<div class="warn"><b>${t}</b>${body}</div>`;
const ui = (t) => `<span class="ui">${t}</span>`;

// ---------------------------------------------------------------------------------
// 1. Owner Guide

const chapters = [
  "Welcome to your new site",
  "Signing in",
  "The Today screen",
  "Cancelling practice",
  "The schedule",
  "Online registration & payments",
  "Refunds",
  "Memberships",
  "Rider lists, printing & export",
  "Editing the website",
  "Photos: gallery & sponsors",
  "The announcement banner",
  "Inbox: applications & messages",
  "Team: who can sign in",
  "Prices, spots & hours",
  "Emails the site sends",
  "Troubleshooting & FAQ",
  "Getting help",
];
const h = (n) => `<h2><span class="num">${String(n).padStart(2, "0")}</span>${chapters[n - 1]}</h2>`;

const guide = doc(
  "Martin MX Owner Guide",
  `
${cover("Owner guide", "Run the park", "from your phone.", "Everything the new Martin MX website and dashboard can do, and exactly how to do it.")}

<section>
  <h2>Contents</h2>
  <ul class="toc">${chapters.map((c, i) => `<li><span>${String(i + 1).padStart(2, "0")}</span>${c}</li>`).join("")}</ul>
  ${tip("How to use this guide", "You don't need to read it all at once. Skim chapters 1 to 4 before your first ride day; the rest is here when you need it. Every screen shown is the real dashboard on a phone.")}
</section>

<section>
  ${h(1)}
  <p class="lead">The new site does a lot of the work that used to happen by hand, and you control all of it from a dashboard that works on your phone.</p>
  <h3>What riders get</h3>
  <ul>
    <li><strong>Live track status</strong> on the home page: open now, later today, cancelled (with your reason), or the next ride day, plus the forecast.</li>
    <li><strong>Online registration</strong> for the days you open, paid by card through Stripe. Spots are held while they pay, so a class can never be oversold.</li>
    <li><strong>Instant confirmation emails</strong> with their details, waiver links and what to bring.</li>
    <li><strong>Track info, waivers, the schedule, gallery and sponsors</strong>, all kept current by you.</li>
  </ul>
  <h3>What you get</h3>
  <ul>
    <li><strong>One dashboard</strong> at <strong>${ADMIN}</strong>: today's riders, check-in at the gate, cancelling, the schedule, and every word and photo on the site.</li>
    <li><strong>Payments are recorded automatically.</strong> Nobody has to type riders into a list; paid riders simply appear.</li>
    <li><strong>Job applications and messages</strong> land in your inbox and your email.</li>
  </ul>
  ${tip("Nothing to install", "The dashboard is a website, not an app. Add it to your home screen (chapter 2) and it opens like one.")}
</section>

<section>
  ${h(2)}
  <div class="two">
    <div>
      <ol>
        <li>Go to <strong>${ADMIN}</strong> on your phone or computer.</li>
        <li>Enter your email and password, then tap ${ui("Sign in")}.</li>
        <li>If you see a yellow bar saying you're on a <strong>temporary password</strong>, tap ${ui("Change it")} and pick your own (at least 10 characters; a few random words works well).</li>
      </ol>
      <p>You stay signed in on that device for <strong>30 days</strong>. Use the ${ui("Sign out")} icon (top right on phones) on shared computers.</p>
      <h3>Put it on your home screen</h3>
      <p><strong>iPhone:</strong> open ${ADMIN} in Safari, tap the Share button, then <strong>Add to Home Screen</strong>.<br>
      <strong>Android:</strong> open it in Chrome, tap the ⋮ menu, then <strong>Add to Home screen</strong>.</p>
      ${warn("Locked out?", "After 5 wrong passwords in a row the account locks for 15 minutes. Any other owner can give you a new temporary password from the Team screen (chapter 14).")}
    </div>
    ${await fig("login", "The sign-in screen")}
  </div>
  <h3>Getting around</h3>
  <p>On a phone, the tabs along the bottom are: <strong>Today</strong> (the current or next ride day), <strong>Schedule</strong>, <strong>Riders</strong>, and <strong>More</strong> (everything else: editing the site, inbox, team, settings and these guides). On a computer the same items are in the black sidebar.</p>
</section>

<section>
  ${h(3)}
  <p class="lead">The screen you'll use most. It always shows today's ride day, or the next one if there's nothing today.</p>
  <div class="shots">${await fig("today", "Today: status, switches and totals")}${await fig("gate-list", "The gate list")}</div>
  <h3>The switches</h3>
  <ul>
    <li><strong>Practice registration on the site</strong>: the master switch for the whole season (also at the top of Schedule). Turn it off and every Register button disappears from the website and the Register page says practice registration is closed. Memberships keep selling either way. Turn it back on and the buttons return for any day with online registration on.</li>
    <li><strong>Practice is on / Cancel</strong>: see chapter 4.</li>
    <li><strong>Online registration</strong>: turn it on and riders can sign up and pay for this day on the website. Turn it off and the form disappears. Sign-ups for a day also stop on their own once that day's riding ends.</li>
  </ul>
  <h3>Totals and spots</h3>
  <p><strong>Registered</strong> is paid riders, <strong>Checked in</strong> counts as you tap people in, and <strong>Paid online</strong> is what came in through the site for this day. Below that, each class shows spots used (for example 23/60). "Paying now" means someone is at the payment screen holding a spot.</p>
  <h3>Checking riders in at the gate</h3>
  <ol>
    <li>Type a name or rider number into the search box, or tap a class to filter.</li>
    <li><strong>Tap the rider</strong> to check them in. The circle turns green. Tap again to undo.</li>
    <li>A yellow <strong>MINOR</strong> tag means they're under 18: make sure a parent or a notarized guardian release is there.</li>
  </ol>
  ${tip("Walk-ups", "Riders who pay cash at the gate aren't in this list; it only shows online registrations. Keep handling walk-ups the way you do today.")}
</section>

<section>
  ${h(4)}
  <div class="two">
    <div>
      <ol>
        <li>On <strong>Today</strong> (or on the day in <strong>Schedule</strong>), tap ${ui("Cancel")}.</li>
        <li>Tap a quick reason (Rain, Track conditions…) or type your own. Riders see this on the website.</li>
        <li>If riders have registered, leave <strong>Email the riders who registered</strong> checked to send each of them a cancellation notice with your reason and phone number.</li>
        <li>Tap ${ui("Cancel practice")}.</li>
      </ol>
      <p>The website updates <strong>immediately</strong>: the home page status turns red, the schedule shows the day crossed out with your reason, and online registration for that day closes.</p>
      <h3>Changed your mind?</h3>
      <p>Tap ${ui("Turn back on")}. The day goes back to normal on the site. (Riders who were emailed aren't sent a second email, so give them a call or post on Facebook.)</p>
      ${warn("Refunds are not automatic", "Cancelling doesn't refund anyone. If you want to refund riders, do it in Stripe (chapter 7). A full refund removes the rider from your list automatically.")}
    </div>
    ${await fig("cancel-dialog", "Cancelling with a reason")}
  </div>
</section>

<section>
  ${h(5)}
  <div class="shots">${await fig("schedule", "The schedule")}${await fig("add-day", "Adding a ride day")}</div>
  <h3>Add a single day</h3>
  <ol><li>Tap ${ui("Add ride day")}.</li><li>Pick the date and the open and close times, and name it (Open Practice, Race Day, Youth Day…).</li><li>Optionally switch on online registration now, then tap ${ui("Add ride day")}.</li></ol>
  <h3>Fill in your regular weeks</h3>
  <p>${ui("Fill next 4 weeks")} adds a ride day for each of your regular days (set in <strong>Prices, spots &amp; hours</strong>) for the next four weeks, skipping any date already on the schedule. Run it once a month during the season.</p>
  <h3>Change or remove a day</h3>
  <p>Tap a day to open it. From there you can cancel it, switch registration on or off, ${ui("Edit")} the times or name, or ${ui("Delete")} it.</p>
  ${tip("Delete vs. cancel", "Delete a day only if nobody has registered: it disappears from the site. If riders have paid, the site won't let you delete it or change its date. Cancel it instead, so riders can see what happened.")}
</section>

<section>
  ${h(6)}
  <div class="two">
    <div>
      <h3>What riders do</h3>
      <ol>
        <li>On the website they tap <strong>Register</strong>. Only days with online registration switched on appear.</li>
        <li>They pick the day and class, enter the rider's details, and tick the waiver acknowledgment.</li>
        <li>They pay on a secure Stripe page (card, Apple Pay, Google Pay and so on).</li>
        <li>They land on a confirmation page and get a confirmation email. They show up on your <strong>Today</strong> list right away.</li>
      </ol>
      <h3>Spots</h3>
      <p>Each class has a set number of spots per day (chapter 15). A spot is <strong>held for 30 minutes</strong> while someone is paying; if they give up, it frees up again. When a class fills, it shows as Full and can't be picked. That's why a class can never be oversold, even if lots of people register at once.</p>
      <h3>Where the money goes</h3>
      <p>Payments go to <strong>Martin MX's own Stripe account</strong> and are paid out to your bank on your normal Stripe schedule. To see them, open the Stripe app or dashboard.stripe.com. Each payment is labeled with the date, class and rider name.</p>
    </div>
    ${await fig("site-register", "What riders see on the website")}
  </div>
  ${tip("Prices", "Riders always pay the prices in your Settings at the moment they register. Changing a price doesn't change what earlier riders paid.")}
</section>

<section>
  ${h(7)}
  <p class="lead">Refunds are done in Stripe, and the site keeps up on its own.</p>
  <ol>
    <li>Open the <strong>Stripe app</strong> or <strong>dashboard.stripe.com</strong> and make sure you're in the <strong>Martin MX</strong> account.</li>
    <li>Go to <strong>Payments</strong> and search for the rider's name or email.</li>
    <li>Open the payment and tap <strong>Refund</strong>. Choose the full amount and confirm.</li>
  </ol>
  <p>For a <strong>full refund</strong>, the site automatically removes the rider from your gate list and frees their spot within a few seconds. A <strong>partial refund</strong> keeps them registered.</p>
  ${tip("Stripe fees", "Stripe keeps its processing fee on refunded payments. That's standard for card processing, not something the website controls.")}
</section>

<section>
  ${h(8)}
  <ol>
    <li>Riders buy a yearly membership from <strong>Register → Membership</strong> on the site. Stripe collects their mailing address and phone.</li>
    <li>You get a <strong>"New member"</strong> email with their name, email, phone and mailing address. <strong>Mail them their membership card.</strong></li>
    <li>They get a welcome email saying the card is on its way.</li>
  </ol>
  <p>Turn membership sales on or off, change the price, and edit "what's included" in <strong>More → Prices, spots &amp; hours</strong>. Every membership is also in Stripe under Payments.</p>
  ${tip("Keep the emails", "Make a Gmail label for “New member” emails. It becomes your list of who has paid and who still needs a card.")}
</section>

<section>
  ${h(9)}
  <div class="two">
    <div>
      <p>The <strong>Riders</strong> tab shows paid riders for any ride day, grouped by class. Pick the day from the drop-down.</p>
      <ul>
        <li>${ui("Print")} makes a clean gate sheet: each class on its own table with rider number, name, bike size, age group, phone and a check-in box. Best printed from a computer.</li>
        <li>${ui("CSV")} downloads a spreadsheet of the day (opens in Excel or Google Sheets).</li>
        <li>On a phone, tap a rider's phone number to call them.</li>
      </ul>
      ${tip("Printer trouble at the gate?", "Print the sheet the night before as a backup. If your cell signal drops at the gate, work from the printed list.")}
    </div>
    ${await fig("riders", "Riders grouped by class")}
  </div>
</section>

<section>
  ${h(10)}
  <div class="shots">${await fig("more", "More: everything you can edit")}${await fig("edit-home", "Editing the home page")}</div>
  <p>Open <strong>More</strong> and pick what to change. Every section works the same way:</p>
  <ol><li>Change the text or photos.</li><li>Tap the green ${ui("Save changes")} bar at the bottom. It turns to “All changes saved”.</li><li>Tap <strong>View on site</strong> to check it. Changes are live immediately.</li></ol>
  <p>If you try to leave with unsaved changes, your phone will warn you first.</p>
  ${warn("The email in Contact & links matters", "It's where rider replies, new-member notices and job applications are sent. Keep it an inbox you check.")}
  <table>
    <tr><th>Section</th><th>What it controls</th></tr>
    <tr><td>Prices, spots &amp; hours</td><td>Practice prices, spots per class, regular hours, membership price and perks</td></tr>
    <tr><td>Announcement banner</td><td>A strip across the top of every page (chapter 12)</td></tr>
    <tr><td>Home page</td><td>Main photo, headline, scrolling ticker, section headlines, “find us” note</td></tr>
    <tr><td>Tracks</td><td>Photos, names, taglines, three stats and descriptions for both tracks</td></tr>
    <tr><td>Track info &amp; rules</td><td>Intro, required gear, minor-rider rules, house rules, special events, concessions</td></tr>
    <tr><td>Waivers</td><td>The PDFs riders download (upload a new PDF to replace one)</td></tr>
    <tr><td>Gallery / Sponsors</td><td>Photos and logos (chapter 11)</td></tr>
    <tr><td>Hiring / Contact page</td><td>Whether you're taking applications, positions, availability, intros</td></tr>
    <tr><td>Contact &amp; links</td><td>Phone, email, address, Facebook, Instagram, merch store. Used everywhere on the site and in emails</td></tr>
  </table>
</section>

<section>
  ${h(11)}
  <div class="two">
    <div>
      <h3>Gallery</h3>
      <ol>
        <li>More → <strong>Gallery</strong> → ${ui("Add photos")}. Pick one or many photos from your camera roll.</li>
        <li>They upload one at a time (they're shrunk on your phone first, so it's quick even on cell signal).</li>
        <li>Tap the <strong>star</strong> on a photo to show it in the home page photo strip (the first 10 starred show there). Every photo appears on the Gallery page.</li>
        <li>Optionally type a short description under each photo (helps Google and screen readers).</li>
        <li>Use the arrows to reorder and the trash can to delete, then ${ui("Save changes")}.</li>
      </ol>
      <h3>Sponsors</h3>
      <p>More → <strong>Sponsors</strong>: upload a logo, add their name and website or Facebook link, and choose <strong>Show on site</strong>. Turn on <strong>Title sponsor</strong> to give someone the big spot. A PNG logo with a transparent background looks best.</p>
    </div>
    ${await fig("edit-gallery", "Gallery: star = on the home page")}
  </div>
</section>

<section>
  ${h(12)}
  <div class="two">
    <div>
      <p>Use the banner for anything riders need to see right away: “Closed this weekend for track work”, “Race day Saturday: practice cancelled”, “Season opens April 5”.</p>
      <ol>
        <li>More → <strong>Announcement banner</strong>.</li>
        <li>Switch on <strong>Show the banner</strong>, pick <strong>Green</strong> (news) or <strong>Yellow</strong> (heads up) and type the message.</li>
        <li>Optionally add a link, for example <strong>/schedule</strong>.</li>
        <li>${ui("Save changes")}. It shows on every page right away.</li>
      </ol>
      ${tip("Remember to turn it off", "Banners stay up until you switch them off.")}
    </div>
    ${await fig("edit-announcement", "The announcement editor")}
  </div>
</section>

<section>
  ${h(13)}
  <div class="two">
    <div>
      <p>Job applications from <strong>Work With Us</strong> and messages from <strong>Contact</strong> arrive two ways: as an <strong>email to you</strong>, and in the dashboard <strong>Inbox</strong> (More → Inbox). A red badge on the More tab shows how many are new.</p>
      <ul>
        <li>Tap one to read everything they entered.</li>
        <li>${ui("Email")} or ${ui("Call")} them in one tap, or simply <strong>reply to the email</strong> you received: it goes straight to them.</li>
        <li>${ui("Archive")} when you're done. Archived items are kept under “Archived”.</li>
      </ul>
      <p>To stop taking applications, go to More → <strong>Hiring</strong> and switch off <strong>Taking applications</strong>. You can also edit the positions and availability choices there.</p>
      ${tip("Spam", "The forms quietly block most bots, so what reaches you should be real people.")}
    </div>
    ${await fig("inbox", "Reading an application")}
  </div>
</section>

<section>
  ${h(14)}
  <div class="two">
    <div>
      <h3>Add someone</h3>
      <ol>
        <li>More → <strong>Team</strong>. Under <strong>Add someone</strong>, enter their name and email, then tap ${ui("Add person")}.</li>
        <li>A <strong>temporary password</strong> appears <strong>once</strong>. Tap ${ui("Copy login details")} or ${ui("Email it to them")}.</li>
        <li>They sign in at ${ADMIN} and the site asks them to pick their own password.</li>
      </ol>
      <h3>Forgot their password?</h3>
      <p>Tap ${ui("New password")} next to their name and share the new temporary password.</p>
      <h3>Remove someone</h3>
      <p>Tap the trash can. They lose access right away on every device. You can't remove yourself, and there's always at least one login.</p>
      ${warn("Everyone is a full owner", "Anyone on the Team can do everything, including cancelling days and adding people. Only add people you trust.")}
    </div>
    ${await fig("team", "Team")}
  </div>
</section>

<section>
  ${h(15)}
  <div class="two">
    <div>
      <ul>
        <li><strong>Practice prices</strong>: main track (per class), junior track, spectators.</li>
        <li><strong>Spots per class</strong>: how many riders can register online per class per day.</li>
        <li><strong>Regular hours</strong>: shown on the site and used by “Fill next 4 weeks”. Seasonal change (like earlier fall hours)? Update them here.</li>
        <li><strong>Yearly membership</strong>: on sale or not, price, and what's included.</li>
      </ul>
      <p>Your own password is at the bottom of this screen.</p>
    </div>
    ${await fig("settings", "Prices, spots & hours")}
  </div>
</section>

<section>
  ${h(16)}
  <p>All emails come from <strong>no-reply@martinmxpark.com</strong>. When someone replies, the reply goes to the email in <strong>Contact &amp; links</strong>.</p>
  <table>
    <tr><th>Email</th><th>Sent to</th><th>When</th></tr>
    <tr><td>Registration confirmed</td><td>Rider</td><td>Right after they pay. Includes their details, waiver link and what to bring.</td></tr>
    <tr><td>Practice cancelled</td><td>Registered riders</td><td>When you cancel a day and leave “Email the riders” checked.</td></tr>
    <tr><td>Membership welcome</td><td>New member</td><td>Right after they pay.</td></tr>
    <tr><td><strong>New member</strong></td><td><strong>You</strong></td><td>With their mailing address, so you can mail the card.</td></tr>
    <tr><td><strong>New job application / message</strong></td><td><strong>You</strong></td><td>Each time someone submits a form. Reply to answer them.</td></tr>
    <tr><td>We got your application / message</td><td>The person who submitted</td><td>A short receipt.</td></tr>
  </table>
  ${tip("Not seeing emails?", "Check your Gmail spam and Promotions tabs the first time, and mark them “Not spam”.")}
</section>

<section>
  ${h(17)}
  <table>
    <tr><th>Problem</th><th>What to do</th></tr>
    <tr><td>I can't sign in</td><td>Check the email address. After 5 wrong tries, wait 15 minutes. Another owner can issue a new temporary password from Team. Otherwise contact us.</td></tr>
    <tr><td>The site still shows old info</td><td>Pull down to refresh, or close and reopen the page. Saved changes are live immediately.</td></tr>
    <tr><td>A rider says they paid but isn't on the list</td><td>Search Stripe → Payments for their name or email. If there's no payment there, it didn't go through. If there is one, contact us with their name and the time.</td></tr>
    <tr><td>Registration isn't showing on the website</td><td>Practice registration on the site must be on, online registration must be switched on for that day, the day can't be cancelled, and it closes when the day ends.</td></tr>
    <tr><td>A class shows Full but the gate isn't</td><td>Raise <strong>Spots per class</strong> in Settings. Spots held by someone mid-payment free up after 30 minutes.</td></tr>
    <tr><td>A photo won't upload</td><td>Try Wi-Fi, or pick a regular photo instead of a Live Photo or screenshot. Very large files may need a second try.</td></tr>
    <tr><td>I refunded someone and they're still on the list</td><td>Only full refunds remove riders. A partial refund keeps them registered.</td></tr>
    <tr><td>I deleted something by mistake</td><td>Contact us. Most changes can be put back.</td></tr>
  </table>
</section>

<section>
  ${h(18)}
  <p class="lead">Your site was built by Unyx Web Solutions, and we look after it.</p>
  <p><strong>Email:</strong> ${SUPPORT}<br><strong>Website:</strong> unyxwebsolutions.com</p>
  <p>When you write, it helps to include what you were doing, the page or screen, and a screenshot if you can.</p>
  ${tip("Good to know", "The site, the database and photo storage run on Amazon Web Services; payments run on your own Stripe account. Rider and payment information is only visible to people on your Team and in your Stripe account.")}
</section>
`,
);

// ---------------------------------------------------------------------------------
// 2. Go-live checklist

const item = (what, expect) => `<li><span>${what}${expect ? `<span class="exp">${expect}</span>` : ""}</span></li>`;
const checklist = doc(
  "Martin MX Go-Live Test Checklist",
  `
${cover("Before launch", "Go-live", "test checklist.", "Walk through every part of the site once before it goes live. About 45 minutes. Check each box as you go and note anything that looks wrong.")}

<section>
  <h2>Before you start</h2>
  <ul>
    <li>Use <strong>your phone</strong> for most steps; that's how you'll run the park.</li>
    <li>Your web team will send you the <strong>test link</strong> for the new site. Payments on the test site are pretend. Pay with card <strong>4242 4242 4242 4242</strong>, any future expiry date, any 3-digit code and any ZIP. No money moves.</li>
    <li>Have your Gmail open: several steps send you an email.</li>
    <li>Write down anything that's wrong or confusing next to the step and send it to ${SUPPORT}.</li>
  </ul>

  <section class="flow"><h3>A. Sign in</h3><ul class="check">
    ${item("Open the dashboard link and sign in with your email and temporary password.", "the Today screen.")}
    ${item("Tap “Change it” on the yellow bar and set your own password. Sign out, then sign back in with it.", "you're signed in, and the yellow bar is gone.")}
    ${item("Add the dashboard to your phone's home screen (Owner Guide, chapter 2).", "a Martin MX icon on your home screen.")}
  </ul></section>

  <section class="flow"><h3>B. Check your information</h3><ul class="check">
    ${item("More → Prices, spots & hours: check main, junior and spectator prices, spots per class, regular hours and the membership price.", "everything matches what you charge today.")}
    ${item("More → Contact & links: check phone, email, address, Facebook, Instagram and store link.", "all correct. The email is one you check.")}
    ${item("Open the public site's Track Info page and read it top to bottom.", "rules, gear and minor policies are right. Fix anything in More → Track info & rules.")}
    ${item("On Track Info, download each waiver.", "the correct, current PDFs.")}
    ${item("Open Sponsors and Gallery on the public site.", "the right sponsors and photos.")}
  </ul></section>
</section>

<section>
  <h3>C. Schedule</h3><ul class="check">
    ${item("Schedule → check upcoming ride days and times.", "the days you plan to open.")}
    ${item("Add a test ride day for next week, named “TEST”.", "it appears in the dashboard and on the public Schedule page.")}
  </ul>

  <h3>D. Registration and payment (on the test site)</h3><ul class="check">
    ${item("On the TEST day, switch on Online registration.", "on the public site, Register shows the TEST day.")}
    ${item("On your phone, register a pretend rider: pick the TEST day, a class, fill in details (use your own email), tick the waiver box, Continue to payment.", "the Stripe payment page with the right class and price.")}
    ${item("Pay with 4242 4242 4242 4242.", "“You're on the gate list” and a confirmation email in your inbox.")}
    ${item("Open Today (or Riders → the TEST day).", "your pretend rider in the right class, and totals updated.")}
    ${item("Start a second registration but tap the back arrow on the payment page instead of paying.", "you're back on the form, and no rider was added.")}
    ${item("Today → switch off Practice registration on the site, then refresh the public site.", "no Register buttons anywhere, the Register page says practice registration is closed, and Membership still works.")}
    ${item("Switch Practice registration on the site back on.", "Register buttons are back.")}
  </ul>

  <h3>E. Gate and printing</h3><ul class="check">
    ${item("Search for the pretend rider and tap them.", "the green check. Tap again to undo.")}
    ${item("Riders → TEST day → Print (from a computer).", "a clean sheet grouped by class.")}
  </ul>

  <h3>F. Cancelling</h3><ul class="check">
    ${item("Cancel the TEST day with the reason “Test”, leaving “Email the riders” checked.", "a cancellation email to you, and the day shows cancelled with “Test” on the public Schedule.")}
    ${item("Tap Turn back on.", "the day is back to normal on the site.")}
  </ul>
</section>

<section>
  <h3>G. Refund (test site)</h3><ul class="check">
    ${item("With your web team, refund the pretend payment in Stripe's test mode.", "the rider disappears from the TEST day list.")}
  </ul>

  <h3>H. Editing the site</h3><ul class="check">
    ${item("More → Announcement banner: turn it on with “Test banner”, save.", "the banner across the top of the public site.")}
    ${item("Turn the banner off and save.", "it's gone.")}
    ${item("More → Gallery → Add photos: upload one photo from your phone, star it, save.", "it shows in the home page photo strip and on the Gallery page.")}
    ${item("Delete that photo and save.", "it's gone from both.")}
    ${item("Change one word on the home page (More → Home page), save, check the site, then change it back.", "the change appears, then reverts.")}
  </ul>

  <h3>I. Forms and inbox</h3><ul class="check">
    ${item("On the public site, submit a test job application on Work With Us.", "an email to you, a receipt email, and the application in More → Inbox.")}
    ${item("Submit a test message on Contact.", "an email to you and the message in the Inbox under Messages.")}
    ${item("Archive both.", "they move to Archived.")}
  </ul>

  <h3>J. Team</h3><ul class="check">
    ${item("Add anyone else who needs access (More → Team) and send them their login.", "they can sign in.")}
  </ul>

  <h3>K. Clean up</h3><ul class="check">
    ${item("Delete the TEST ride day (if it won't delete because of the pretend rider, cancel it; your web team will clear test data before launch).", "it's no longer on the schedule.")}
  </ul>

  <div class="signoff"><div>Tested by</div><div>Date</div></div>
  <p style="margin-top:14pt">Everything checked? Tell ${SUPPORT} and we'll switch the site live.</p>
</section>
`,
);

// ---------------------------------------------------------------------------------
// 3. Race day quick card (one page)

const card = doc(
  "Martin MX Race Day Quick Card",
  `
<style>
  @page { margin: 0.45in 0.5in; }
  .card-head { background: #0b0b0b; color: #fff; border-radius: 5pt; padding: 12pt 16pt; display: flex; justify-content: space-between; align-items: center; }
  .card-head img { height: 18pt; }
  .card-head h1 { font-size: 22pt; margin: 0; } .card-head h1 span { color: #5fd400; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10pt; margin-top: 10pt; }
  .box { border: 1.2pt solid #d8d8d2; border-radius: 5pt; padding: 9pt 11pt; break-inside: avoid; }
  .box h3 { margin: 0 0 4pt; font-size: 12pt; color: #338e00; }
  .box ol, .box ul { margin: 0; padding-left: 14pt; font-size: 9.6pt; }
  .box li { margin-bottom: 2pt; }
  .wide { grid-column: span 2; }
  .foot { margin-top: 10pt; font-size: 9pt; color: #555; display: flex; justify-content: space-between; }
</style>
<div class="card-head"><h1>Race day <span>quick card</span></h1><img src="${logo}"></div>
<div class="grid">
  <div class="box"><h3>Sign in</h3><ul><li><strong>${ADMIN}</strong> (or your home-screen icon)</li><li>The <strong>Today</strong> tab = today's ride day</li></ul></div>
  <div class="box"><h3>Before the gate opens</h3><ol><li>Check the weather and the track.</li><li>Practice on? Leave it. Not riding? Cancel (below).</li><li>Print the gate list as a backup: Riders → Print.</li></ol></div>
  <div class="box"><h3>Cancel practice</h3><ol><li>Today → <strong>Cancel</strong></li><li>Tap a reason (Rain, Track conditions…)</li><li>Keep <strong>Email the riders</strong> checked</li><li><strong>Cancel practice</strong>: the site updates instantly</li><li>Back on? <strong>Turn back on</strong></li></ol></div>
  <div class="box"><h3>Check riders in</h3><ol><li>Today → scroll to <strong>Riders</strong></li><li>Search name or number</li><li><strong>Tap the rider</strong> = checked in (green). Tap again to undo.</li><li>Yellow <strong>MINOR</strong> = parent or notarized guardian release required</li></ol></div>
  <div class="box"><h3>Everyone at check-in</h3><ul><li>Signs a waiver before parking, spectators included</li><li>Gear: DOT helmet, goggles, boots over the ankle, long sleeves and pants</li><li>No pit bikes on the Jr track</li></ul></div>
  <div class="box"><h3>Registration</h3><ul><li>Close practice sign-ups for everything: Today → <strong>Practice registration on the site</strong></li><li>Open or close one day: Today → <strong>Online registration</strong> switch</li><li>Class full? Raise spots: More → Prices, spots &amp; hours</li><li>Walk-ups paying cash aren't on the list</li></ul></div>
  <div class="box wide"><h3>Something wrong?</h3><ul><li><strong>Rider says they paid but isn't listed:</strong> search Stripe → Payments for their name. Payment there? Let them ride and email us their name.</li><li><strong>Refund:</strong> Stripe → Payments → the payment → Refund (full refund removes them from the list).</li><li><strong>Can't sign in:</strong> wait 15 minutes after 5 wrong tries, or have another owner tap New password under More → Team.</li><li><strong>Site down or anything else:</strong> use the printed list and email ${SUPPORT}.</li></ul></div>
</div>
<div class="foot"><span>${SITE}</span><span>Unyx Web Solutions · ${SUPPORT}</span></div>
`,
);

// ---------------------------------------------------------------------------------
// Render

const browser = await chromium.launch();
const page = await browser.newPage();
const footer = (title) => `<div style="width:100%;font-family:Arial;font-size:7.5pt;color:#888;padding:0 0.7in;display:flex;justify-content:space-between"><span>Martin MX · ${title}</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`;
for (const [file, html, title, paged] of [
  ["martin-mx-owner-guide.pdf", guide, "Owner Guide", true],
  ["martin-mx-go-live-checklist.pdf", checklist, "Go-Live Test Checklist", true],
  ["martin-mx-race-day-card.pdf", card, "Race Day Quick Card", false],
]) {
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({
    path: path.join(OUT, file),
    format: "Letter",
    printBackground: true,
    displayHeaderFooter: paged,
    headerTemplate: "<span></span>",
    footerTemplate: footer(title),
    preferCSSPageSize: true,
  });
  const { size } = await fs.stat(path.join(OUT, file));
  console.log(`${file}  ${Math.round(size / 1024)} KB`);
}
await browser.close();
