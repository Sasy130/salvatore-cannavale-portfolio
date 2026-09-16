import type { OperationalRequest } from "../types/operational-request";

export function generateResponse(request: OperationalRequest): string {
  if (!request.matchedExample)
    return "Thank you for your request. Our team will review the details and get back to you. This message does not confirm any operational changes.";
  const greeting = `Hello ${request.customer}, thank you for getting in touch.`;
  const detail =
    request.intent === "Reschedule delivery"
      ? `We have received your request to move your delivery from ${request.originalDate} to ${request.requestedDate}.`
      : request.intent === "Replace damaged item"
        ? `We are sorry your item arrived damaged. We have received your request for a replacement by ${request.requestedDate}.`
        : "We have received your request for a copy of your invoice.";
  return `${greeting} ${detail}${request.callback ? ` Your callback preference is ${request.callback.toLowerCase()}.` : ""} Our team will review and confirm the next steps.`;
}

export function generateTask(request: OperationalRequest): string {
  const missing = request.matchedExample ? "Not specified" : "Needs review";
  return `TASK — ${request.intent}\nCustomer: ${request.customer ?? "Needs review"}\nOriginal date: ${request.originalDate ?? missing}\nRequested date: ${request.requestedDate ?? missing}\nCallback: ${request.callback ?? missing}\nPriority: ${request.matchedExample ? request.priority : "Needs review"}\n\nOriginal request:\n${request.source}\n\nReview and confirm details before taking action.\nCreated in OPERAI demo mode.`;
}
