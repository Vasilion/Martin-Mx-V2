import type { SignupRecord, SignupRecordSummary, SignupStore } from "@/lib/store/types";

const records = new Map<string, SignupRecord>();
const counters = new Map<string, number>();

export class MemorySignupStore implements SignupStore {
  async putIfAbsent(record: SignupRecord): Promise<{ created: boolean; existingReferenceId?: string }> {
    const existing = records.get(record.idempotencyKey);
    if (existing) {
      return { created: false, existingReferenceId: existing.referenceId };
    }
    records.set(record.idempotencyKey, record);
    return { created: true };
  }

  async decrementSpotCounter(dateKey: string, bikeClass: string): Promise<number> {
    const key = `${dateKey}#${bikeClass}`;
    const current = counters.get(key) ?? 100;
    const next = Math.max(0, current - 1);
    counters.set(key, next);
    return next;
  }

  async listSignups(filters?: {
    selectedDate?: string;
    bikeClass?: string;
    formType?: string;
  }): Promise<SignupRecordSummary[]> {
    const list = Array.from(records.values()).map((record) => ({
      referenceId: record.referenceId,
      formType: record.formType,
      createdAt: record.createdAt,
      payload: record.payload,
    }));

    return list.filter((item) => {
      const selectedDate = String(item.payload.selectedDate ?? "");
      const bikeClass = String(item.payload.bikeClass ?? "");
      if (filters?.selectedDate && selectedDate !== filters.selectedDate) {
        return false;
      }
      if (filters?.bikeClass && bikeClass !== filters.bikeClass) {
        return false;
      }
      if (filters?.formType && item.formType !== filters.formType) {
        return false;
      }
      return true;
    });
  }
}
