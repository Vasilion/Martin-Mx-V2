// Create or reset an owner login for the dashboard.
// Usage: MARTIN_TABLE=martin-mx node scripts/create-owner.mjs <email> "<Name>" [password]
// Without a password, a strong one is generated and printed once.
import { randomBytes, scrypt as scryptCb } from "node:crypto";
import { promisify } from "node:util";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const scrypt = promisify(scryptCb);
const [email, name, given] = process.argv.slice(2);
if (!process.env.MARTIN_TABLE || !email || !name) {
  console.error('Usage: MARTIN_TABLE=martin-mx node scripts/create-owner.mjs <email> "<Name>" [password]');
  process.exit(1);
}
// Readable generated password: 4 groups, no ambiguous characters.
const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
const password = given ?? Array.from({ length: 4 }, () => Array.from(randomBytes(4), (b) => alphabet[b % alphabet.length]).join("")).join("-");
if (password.length < 10) throw new Error("Use at least 10 characters.");
const salt = randomBytes(16);
const hash = await scrypt(password, salt, 64);
const db = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION ?? "us-east-1" }));
await db.send(
  new PutCommand({
    TableName: process.env.MARTIN_TABLE,
    Item: { pk: "OWNER", sk: email.toLowerCase(), email: email.toLowerCase(), name, passwordHash: `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`, createdAt: new Date().toISOString() },
  }),
);
console.log(`Owner ${email.toLowerCase()} saved.${given ? "" : ` Password: ${password}`}`);
