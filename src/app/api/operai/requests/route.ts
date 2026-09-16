import { NextResponse } from "next/server";
import { requestProcessor } from "@/features/operai/lib/processors";
import { validateInput } from "@/features/operai/lib/validation";

export async function POST(request: Request) {
  let input: string;
  try {
    // Bound streamed bytes as well as validated text; do not trust Content-Length.
    const reader = request.body?.getReader();
    if (!reader)
      return NextResponse.json(
        { error: "A request body is required." },
        { status: 400 },
      );
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 16000) {
        await reader.cancel();
        return NextResponse.json(
          { error: "Request body is too large." },
          { status: 413 },
        );
      }
      chunks.push(value);
    }
    input = validateInput(JSON.parse(Buffer.concat(chunks).toString("utf8")));
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof SyntaxError
            ? "Send valid JSON."
            : error instanceof Error
              ? error.message
              : "Invalid request.",
      },
      { status: 400 },
    );
  }
  try {
    return NextResponse.json(
      { request: await requestProcessor.process(input) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Processing is unavailable. Please try again." },
      { status: 500 },
    );
  }
}
