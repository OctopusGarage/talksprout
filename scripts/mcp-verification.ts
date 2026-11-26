/** Verify the entire document instead of accepting an answer-bearing marker. */
export async function waitForDeploymentIdentity(
  load: () => Promise<Record<string, unknown>>,
  expected: Record<string, unknown>,
  pause: (milliseconds: number) => Promise<void> = (milliseconds) =>
    new Promise((resolve) => setTimeout(resolve, milliseconds)),
): Promise<void> {
  let mismatches: string[] = [];
  for (let attempt = 0; attempt < 5; attempt++) {
    const actual = await load();
    mismatches = Object.keys(expected).filter(
      (key) => actual[key] !== expected[key],
    );
    if (!mismatches.length) return;
    if (attempt < 4) await pause(2000 * 2 ** attempt);
  }
  throw Error(
    "Deployed identity not ready after five checks: " + mismatches.join(", "),
  );
}

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
