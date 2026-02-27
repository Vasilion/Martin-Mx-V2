export type SignupRecord = {
  idempotencyKey: string;
  referenceId: string;
  formType: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

export type SignupRecordSummary = {
  referenceId: string;
  formType: string;
  createdAt: string;
  payload: Record<string, unknown>;
};

export interface SignupStore {
  putIfAbsent(record: SignupRecord): Promise<{ created: boolean; existingReferenceId?: string }>;
  decrementSpotCounter(dateKey: string, bikeClass: string): Promise<number>;
  listSignups(filters?: {
    selectedDate?: string;
    bikeClass?: string;
  }): Promise<SignupRecordSummary[]>;
}
