import type { OperationalRequest } from "../types/operational-request";

// Fictional fixtures. These are never represented as real business activity.
export const DEMO_EXAMPLES = [
  {
    label: "Delivery change",
    source:
      "The customer Rossi wants to move Friday's delivery to Monday and asks to be called after 4 PM.",
    customer: "Rossi",
    intent: "Reschedule delivery",
    originalDate: "Friday",
    requestedDate: "Monday",
    callback: "After 16:00",
    priority: "Normal" as const,
  },
  {
    label: "Urgent replacement",
    source:
      "Customer Taylor received a damaged desk lamp and needs a replacement by Thursday. This is urgent. Please call before 10 AM.",
    customer: "Taylor",
    intent: "Replace damaged item",
    originalDate: null,
    requestedDate: "Thursday",
    callback: "Before 10:00",
    priority: "High" as const,
  },
  {
    label: "Invoice question",
    source:
      "Customer Morgan requests a copy of invoice INV-2048 and would like a callback after 2 PM.",
    customer: "Morgan",
    intent: "Send invoice copy",
    originalDate: null,
    requestedDate: null,
    callback: "After 14:00",
    priority: "Normal" as const,
  },
];

export const DEMO_REQUESTS: OperationalRequest[] = DEMO_EXAMPLES.map(
  (example, index) => ({
    ...example,
    id: `demo-${index + 1}`,
    createdAt: `2026-09-14T${["14:42", "13:18", "11:06"][index]}:00.000Z`,
    status: index === 2 ? "Saved" : "Review needed",
    mode: "demo",
    matchedExample: true,
  }),
);
