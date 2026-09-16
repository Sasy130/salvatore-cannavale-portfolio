export type Priority = "Normal" | "High";
export type RequestStatus = "Review needed" | "Saved" | "Task created";

export interface OperationalRequest {
  id: string;
  source: string;
  customer: string | null;
  intent: string;
  originalDate: string | null;
  requestedDate: string | null;
  callback: string | null;
  priority: Priority;
  status: RequestStatus;
  createdAt: string;
  mode: "demo";
  matchedExample: boolean;
}

/** Server-side boundary. A future LLM adapter must return this same reviewed shape. */
export interface OperationalRequestProcessor {
  process(input: string): Promise<OperationalRequest>;
}

export interface ProcessResponse {
  request: OperationalRequest;
}
