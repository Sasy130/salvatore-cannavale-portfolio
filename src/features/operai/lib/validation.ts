export const MAX_INPUT_LENGTH = 2000;

export function validateInput(body: unknown): string {
  if (
    !body ||
    typeof body !== "object" ||
    !("input" in body) ||
    typeof body.input !== "string"
  ) {
    throw new Error("Provide a request as text.");
  }
  const input = body.input.trim();
  if (input.length < 10)
    throw new Error("Add a little more detail (at least 10 characters).");
  if (input.length > MAX_INPUT_LENGTH)
    throw new Error(`Keep the request under ${MAX_INPUT_LENGTH} characters.`);
  return input;
}
