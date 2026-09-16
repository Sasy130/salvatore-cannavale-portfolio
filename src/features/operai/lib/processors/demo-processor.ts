import { DEMO_EXAMPLES } from "../../data/demo";
import type { OperationalRequestProcessor } from "../../types/operational-request";

const normalize = (text: string) =>
  text.trim().toLowerCase().replace(/\s+/g, " ");

/** Deliberate fixture matching, not simulated intelligence or guessed extraction. */
export class DemoProcessor implements OperationalRequestProcessor {
  async process(input: string) {
    const example = DEMO_EXAMPLES.find(
      (item) => normalize(item.source) === normalize(input),
    );
    return {
      id: crypto.randomUUID(),
      source: input,
      customer: example?.customer ?? null,
      intent: example?.intent ?? "Manual review required",
      originalDate: example?.originalDate ?? null,
      requestedDate: example?.requestedDate ?? null,
      callback: example?.callback ?? null,
      priority: example?.priority ?? ("Normal" as const),
      status: "Review needed" as const,
      createdAt: new Date().toISOString(),
      mode: "demo" as const,
      matchedExample: Boolean(example),
    };
  }
}
