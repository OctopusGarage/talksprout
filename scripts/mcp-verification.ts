/** Verify the entire document instead of accepting an answer-bearing marker. */
export function assertCompleteDocument(value: unknown, expected: string): void {
  const response = value as {
    content?: { type?: string; text?: string }[];
  } | null;
  if (
    !expected ||
    !Array.isArray(response?.content) ||
    response.content.length !== 1 ||
    response.content[0]?.type !== "text" ||
    response.content[0]?.text !== expected
  )
    throw Error("MCP returned an incomplete or mismatched document");
}
