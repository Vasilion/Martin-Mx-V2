// One-time: copy content/live/*.json into the DynamoDB table so the owner dashboard can edit it.
// Usage: MARTIN_TABLE=martin-mx node scripts/seed-live-data.mjs [--force]
// Without --force, existing items are left alone (never clobbers owner edits).
import fs from "node:fs/promises";
import { DynamoDBClient, ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const table = process.env.MARTIN_TABLE;
if (!table) throw new Error("Set MARTIN_TABLE");
const force = process.argv.includes("--force");
const db = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION ?? "us-east-1" }));
const read = async (f) => JSON.parse(await fs.readFile(`content/live/${f}`, "utf8"));

async function put(Item) {
  try {
    await db.send(new PutCommand({ TableName: table, Item, ...(force ? {} : { ConditionExpression: "attribute_not_exists(pk)" }) }));
    return "written";
  } catch (err) {
    if (err instanceof ConditionalCheckFailedException) return "kept existing";
    throw err;
  }
}

const now = new Date().toISOString();
for (const name of ["practice", "membership", "sponsors"]) {
  console.log(`CONFIG/${name}:`, await put({ pk: "CONFIG", sk: name, value: await read(`${name}.json`), updatedAt: now }));
}
for (const day of (await read("schedule.json")).events) {
  console.log(`SCHEDULE/${day.date}:`, await put({ pk: "SCHEDULE", sk: day.date, day }));
}
