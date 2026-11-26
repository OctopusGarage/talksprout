import { readFileSync } from "node:fs";
import {
  createBehaviorPilotCases,
  createBehaviorExpansionCases,
  createBehaviorControlCases,
} from "./behavior-cases";
import {
  validateBehaviorSession,
  validateBehaviorRunCoverage,
} from "./behavior-validate";
import { validateBehaviorArchive } from "./behavior-archive";
const paths = process.argv.slice(2);
if (!paths.length) {
  const report = validateBehaviorArchive();
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.issues.length ? 1 : 0);
}
if (!paths.length) throw Error("Pass actual behavior run.json paths");
const cases = new Map(
  [
    ...createBehaviorPilotCases(),
    ...createBehaviorExpansionCases(),
    ...createBehaviorControlCases(),
  ].map((c) => [c.id, c]),
);
const reports = paths.map((path) => {
  const raw = JSON.parse(readFileSync(path, "utf8"));
  const issues: string[] = validateBehaviorRunCoverage(raw, [
    ...cases.values(),
  ]);
  const sessions = raw.sessions.map((session: any) => {
    const expected = cases.get(session.case?.id);
    if (!expected) {
      issues.push("Unknown case " + session.case?.id);
      return { id: session.case?.id };
    }
    const checked = validateBehaviorSession(session, expected);
    issues.push(
      ...checked.issues,
      ...(checked.observations ?? []).map(
        (s) =>
          session.case.id +
          "/" +
          session.route +
          ": unaccepted integration: " +
          s,
      ),
    );
    return {
      id: session.case.id,
      route: session.route,
      turns: session.turns.length,
      rawJudge: session.judge?.output ?? null,
      ...checked,
    };
  });
  return { path, method: raw.method, issues, sessions };
});
console.log(JSON.stringify(reports, null, 2));
if (reports.some((r) => r.issues.length)) process.exitCode = 1;
