/** Keep temporary artifacts and retired tooling out of commits. */
export function repositoryHygieneIssues(paths: string[]): string[] {
  return paths.flatMap((path) => {
    if (/^docs\/(?:research(?:\/|$)|usability(?:\/|[-.]))/.test(path))
      return [`${path}: retired process notes must not be reintroduced`];
    if (/^evals\//i.test(path))
      return [`${path}: retired evaluation tooling must not be reintroduced`];
    if (
      /(^|\/)(node_modules|dist|test-results|playwright-report|__pycache__|\.superpowers|superpowers|\.wrangler|\.cloudflare)\//.test(
        path,
      ) ||
      /(^|\/)\.DS_Store$|\.(log|tmp|bak|orig|rej|pyc)$|~$/.test(path) ||
      /^(public\/downloads|mcp\/generated)\//.test(path)
    ) {
      return [`${path}: generated or temporary artifact must stay ignored`];
    }
    return [];
  });
}
