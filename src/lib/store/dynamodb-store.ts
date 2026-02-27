import { ConditionalCheckFailedException, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import type { SignupRecord, SignupStore } from "@/lib/store/types";

const tableName = process.env.SIGNUP_TABLE_NAME;
const region = process.env.AWS_REGION;

function getClient() {
  if (!tableName || !region) {
    throw new Error("SIGNUP_TABLE_NAME and AWS_REGION are required for DynamoDB store.");
  }
  const raw = new DynamoDBClient({ region });
  return DynamoDBDocumentClient.from(raw);
}

export class DynamoDbSignupStore implements SignupStore {
  private readonly client = getClient();

  async putIfAbsent(record: SignupRecord): Promise<{ created: boolean; existingReferenceId?: string }> {
    try {
      await this.client.send(
        new PutCommand({
          TableName: tableName,
          Item: {
            pk: `SIGNUP#${record.idempotencyKey}`,
            sk: `FORM#${record.formType}`,
            ...record,
          },
          ConditionExpression: "attribute_not_exists(pk)",
        }),
      );
      return { created: true };
    } catch (error) {
      if (!(error instanceof ConditionalCheckFailedException)) {
        throw error;
      }
      const existing = await this.client.send(
        new GetCommand({
          TableName: tableName,
          Key: {
            pk: `SIGNUP#${record.idempotencyKey}`,
            sk: `FORM#${record.formType}`,
          },
        }),
      );
      const existingReferenceId =
        typeof existing.Item?.referenceId === "string" ? existing.Item.referenceId : undefined;
      return { created: false, existingReferenceId };
    }
  }

  async decrementSpotCounter(dateKey: string, bikeClass: string): Promise<number> {
    const result = await this.client.send(
      new UpdateCommand({
        TableName: tableName,
        Key: {
          pk: `COUNTER#${dateKey}`,
          sk: `CLASS#${bikeClass}`,
        },
        UpdateExpression: "SET spotsLeft = if_not_exists(spotsLeft, :seed) - :dec",
        ConditionExpression: "attribute_not_exists(spotsLeft) OR spotsLeft > :min",
        ExpressionAttributeValues: {
          ":seed": 100,
          ":dec": 1,
          ":min": 0,
        },
        ReturnValues: "UPDATED_NEW",
      }),
    );

    return Number(result.Attributes?.spotsLeft ?? 0);
  }

  async listSignups(filters?: { selectedDate?: string; bikeClass?: string }) {
    const result = await this.client.send(
      new ScanCommand({
        TableName: tableName,
        FilterExpression: "begins_with(pk, :signupPrefix)",
        ExpressionAttributeValues: {
          ":signupPrefix": "SIGNUP#",
        },
      }),
    );

    const mapped = (result.Items ?? []).map((item) => ({
      referenceId: String(item.referenceId ?? ""),
      formType: String(item.formType ?? ""),
      createdAt: String(item.createdAt ?? ""),
      payload: (item.payload ?? {}) as Record<string, unknown>,
    }));

    return mapped.filter((item) => {
      const selectedDate = String(item.payload.selectedDate ?? "");
      const bikeClass = String(item.payload.bikeClass ?? "");
      if (filters?.selectedDate && selectedDate !== filters.selectedDate) {
        return false;
      }
      if (filters?.bikeClass && bikeClass !== filters.bikeClass) {
        return false;
      }
      return true;
    });
  }
}
