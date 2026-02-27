import { DynamoDbSignupStore } from "@/lib/store/dynamodb-store";
import { MemorySignupStore } from "@/lib/store/memory-store";

export function getSignupStore() {
  if (process.env.SIGNUP_STORE_PROVIDER === "dynamodb") {
    return new DynamoDbSignupStore();
  }
  return new MemorySignupStore();
}
