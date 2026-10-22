// Captures phone screenshots of the dashboard for the owner guides.
// Needs the dev server running and AWS access to the table:
//   MARTIN_TABLE=martin-mx node scripts/owner-docs/capture-screens.mjs [http://localhost:3100]
// Seeds clearly-fake demo riders + one demo application, then removes them (and the temp login).
import fs from "node:fs/promises";
import path from "node:path";
import { randomBytes, scrypt as scryptCb } from "node:crypto";
import { promisify } from "node:util";
import { chromium, devices } from "playwright";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const B = process.argv[2] ?? "http://localhost:3100";
const T = process.env.MARTIN_TABLE;
if (!T) throw new Error("Set MARTIN_TABLE");
const OUT = path.join("docs", "owner", "screens");
await fs.mkdir(OUT, { recursive: true });
const db = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "us-east-1" }), { marshallOptions: { removeUndefinedValues: true } });
const scrypt = promisify(scryptCb);

const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Detroit" }).format(new Date());
const days = (await db.send(new QueryCommand({ TableName: T, KeyConditionExpression: "pk = :p", ExpressionAttributeValues: { ":p": "SCHEDULE" } }))).Items.map((i) => i.day).sort((a, b) => a.date.localeCompare(b.date));
const focus = days.find((d) => d.date === today) ?? days.find((d) => d.date > today);
const next = days.find((d) => d.date > today);
if (!focus || !next) throw new Error("Need at least one upcoming ride day on the schedule.");

// --- demo data ------------------------------------------------------------------
const created = [];
const put = async (Item) => {
  await db.send(new PutCommand({ TableName: T, Item }));
  created.push({ pk: Item.pk, sk: Item.sk });
};
const EMAIL = "docs-demo@martinmx.invalid";
const PASSWORD = "docs-demo-password-1";
const salt = randomBytes(16);
await put({ pk: "OWNER", sk: EMAIL, email: EMAIL, name: "Front Gate (example)", passwordHash: `scrypt$${salt.toString("base64")}$${(await scrypt(PASSWORD, salt, 64)).toString("base64")}`, createdAt: new Date().toISOString() });

const riders = [["Jake", "Miller", "AB", "22", 450, "adult", true], ["Ty", "Brooks", "AB", "7", 250, "adult", true], ["Cole", "Hanson", "C", "118", 250, "adult", true], ["Mason", "Reyes", "C", "41", 125, "minor", false], ["Liam", "Carter", "MINI", "95", 85, "minor", false], ["Ava", "Nguyen", "MINI", "3", 65, "minor", false], ["Eli", "Foster", "JR", "12", 50, "minor", false], ["Ryan", "DeVries", "C", "292", 250, "adult", false]];
const counts = {};
for (const [i, [firstName, lastName, classId, riderNumber, bikeSize, ageGroup, checkedIn]] of riders.entries()) {
  const id = `demo0000-0000-4000-8000-00000000000${i}`;
  const createdAt = new Date(Date.now() - i * 600000).toISOString();
  await put({ pk: `REG#${id}`, sk: "REG", gsi1pk: `DAY#${focus.date}`, gsi1sk: `${createdAt}#${id}`, id, status: "paid", amount: classId === "JR" ? 25 : 40, createdAt, paidAt: createdAt, date: focus.date, classId, firstName, lastName, email: "rider@example.com", phone: "6165550100", riderNumber, bikeSize, ageGroup, checkedIn });
  counts[classId] = (counts[classId] ?? 0) + 1;
}
const prevCounters = {};
for (const [c, n] of Object.entries(counts)) {
  const key = { pk: `DAY#${focus.date}`, sk: `CLASS#${c}` };
  prevCounters[c] = (await db.send(new GetCommand({ TableName: T, Key: key }))).Item ?? null;
  await db.send(new PutCommand({ TableName: T, Item: { ...key, taken: (prevCounters[c]?.taken ?? 0) + n } }));
}
const appId = "demo-app-0001";
const appAt = new Date(Date.now() - 3600000).toISOString();
await put({
  pk: `MSG#${appId}`, sk: "MSG", gsi1pk: "INBOX#application", gsi1sk: `${appAt}#${appId}`, id: appId, kind: "application", createdAt: appAt, read: false, archived: false,
  name: "Sam Example", email: "sam@example.com", phone: "6165550123",
  fields: [{ label: "Position", value: "Flagger" }, { label: "Availability", value: "Weekends" }, { label: "Age", value: "19" }, { label: "City", value: "Wayland" }, { label: "Customer service experience", value: "Yes" }, { label: "Rides motocross", value: "Yes" }, { label: "Can start training", value: "Next week" }],
});
// Open registration on the next ride day so the public form can be captured.
const nextWasOpen = next.registrationOpen;
const setReg = (open) => db.send(new UpdateCommand({ TableName: T, Key: { pk: "SCHEDULE", sk: next.date }, UpdateExpression: "SET #d.registrationOpen = :o", ExpressionAttributeNames: { "#d": "day" }, ExpressionAttributeValues: { ":o": open } }));
await setReg(true);

// --- capture --------------------------------------------------------------------
const browser = await chromium.launch();
try {
  const ctx = await browser.newContext({ ...devices["iPhone 13"] });
  const page = await ctx.newPage();
  const shot = async (name, opts = {}) => {
    await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(OUT, `${name}.png`), ...opts });
    console.log("  ", name);
  };
  const go = async (url) => page.goto(`${B}${url}`, { waitUntil: "networkidle", timeout: 120000 });

  await go("/admin/login");
  await shot("login");
  await page.fill("#email", EMAIL);
  await page.fill("#password", PASSWORD);
  await Promise.all([page.waitForURL(`${B}/admin`), page.click("button[type=submit]")]);
  await page.waitForLoadState("networkidle");
  await shot("today");
  await page.evaluate(() => window.scrollTo(0, document.querySelector("#riders-heading").getBoundingClientRect().top + window.scrollY - 70));
  await shot("gate-list");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.getByRole("button", { name: "Rain" }).click();
  await shot("cancel-dialog");
  await page.keyboard.press("Escape");

  await go("/admin/schedule");
  await shot("schedule");
  await page.getByRole("button", { name: /Add ride day/ }).click();
  await shot("add-day");
  await page.keyboard.press("Escape");

  await go(`/admin/riders?date=${focus.date}`);
  await shot("riders");
  await go("/admin/more");
  await shot("more");
  await go("/admin/settings");
  await shot("settings");
  await go("/admin/content/home");
  await shot("edit-home");
  await go("/admin/content/gallery");
  await shot("edit-gallery");
  await go("/admin/content/announcement");
  await shot("edit-announcement");
  await go("/admin/content/sponsors");
  await shot("edit-sponsors");
  await go("/admin/inbox");
  await page.getByRole("button", { name: /Sam Example/ }).click();
  await shot("inbox");
  await go("/admin/team");
  await shot("team");
  await go("/admin/help");
  await shot("help");

  const site = await browser.newContext({ ...devices["iPhone 13"] });
  const sp = await site.newPage();
  await sp.goto(`${B}/`, { waitUntil: "networkidle" });
  await sp.waitForTimeout(1500);
  await sp.screenshot({ path: path.join(OUT, "site-home.png") });
  await sp.goto(`${B}/register?day=${next.date}`, { waitUntil: "networkidle" });
  await sp.waitForTimeout(800);
  await sp.evaluate(() => window.scrollTo(0, 260));
  await sp.waitForTimeout(500);
  await sp.screenshot({ path: path.join(OUT, "site-register.png") });
  console.log("   site-home, site-register");
} finally {
  await browser.close();
  // --- clean up ---------------------------------------------------------------------
  await setReg(nextWasOpen);
  for (const k of created) await db.send(new DeleteCommand({ TableName: T, Key: k }));
  for (const [c, prev] of Object.entries(prevCounters)) {
    const key = { pk: `DAY#${focus.date}`, sk: `CLASS#${c}` };
    if (prev) await db.send(new PutCommand({ TableName: T, Item: prev }));
    else await db.send(new DeleteCommand({ TableName: T, Key: key }));
  }
  console.log("demo data removed");
}
