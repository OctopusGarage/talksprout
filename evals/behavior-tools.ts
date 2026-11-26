import { URL } from "node:url";
import { parse } from "@babel/parser";
import type { BehaviorRoute } from "./behavior-cases";
export interface ForwardedBehaviorTool {
  name: string;
  arguments: Record<string, unknown>;
}
export function isBehaviorWebUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return (
      parsed.protocol === "https:" &&
      !parsed.username &&
      !parsed.password &&
      !parsed.port &&
      !parsed.search &&
      !parsed.hash &&
      !value.includes("%") &&
      !value.includes("\\") &&
      parsed.href === value &&
      ["raw.githubusercontent.com", "github.com"].includes(parsed.hostname) &&
      (parsed.pathname === "/OctopusGarage/talksprout" ||
        parsed.pathname.startsWith("/OctopusGarage/talksprout/"))
    );
  } catch {
    return false;
  }
}
type Ast = { type: string; [key: string]: any };
/** Parse the recorded wrapper as data. Accept only static allowed calls and unchanged result forwarding. Never execute it. */
export function inspectBehaviorWrapper(
  source: string,
  route: BehaviorRoute,
  installedSkillPath?: string,
) {
  const calls: ForwardedBehaviorTool[] = [];
  const emissions: {
    kind: "catalog" | "forwarded";
    calls: ForwardedBehaviorTool[];
  }[] = [];
  const bindingCalls = new Map<string, ForwardedBehaviorTool[]>();
  const bindings = new Map<string, "catalog" | "result" | "parallel">();
  let valid = true;
  let metadataOutput = false;
  let statements: Ast[];
  try {
    statements = parse(source, {
      sourceType: "module",
      allowAwaitOutsideFunction: true,
    }).program.body;
  } catch {
    return { valid: false, calls };
  }
  const allowed = (name: string) =>
    route === "skill-web"
      ? name === "web__run" || (!!installedSkillPath && name === "exec_command")
      : route === "mcp"
        ? /^mcp__talksprout__(get_guide|list_documents|search_documents|read_document)$/.test(
            name,
          )
        : false;
  const member = (n: Ast, object: string, property?: string) =>
    n?.type === "MemberExpression" &&
    !n.computed &&
    n.object.type === "Identifier" &&
    n.object.name === object &&
    n.property.type === "Identifier" &&
    (!property || n.property.name === property);
  const literal = (n: Ast): unknown => {
    if (["StringLiteral", "NumericLiteral", "BooleanLiteral"].includes(n.type))
      return n.value;
    if (n.type === "NullLiteral") return null;
    if (n.type === "ArrayExpression") return n.elements.map(literal);
    if (n.type === "ObjectExpression")
      return Object.fromEntries(
        n.properties.map((p: Ast) => {
          if (
            p.type !== "ObjectProperty" ||
            p.computed ||
            p.method ||
            p.shorthand ||
            !["Identifier", "StringLiteral"].includes(p.key.type)
          )
            throw Error("nonstatic argument");
          return [p.key.name ?? p.key.value, literal(p.value)];
        }),
      );
    throw Error("nonstatic argument");
  };
  const tool = (expression: Ast): boolean => {
    const n =
      expression.type === "AwaitExpression" ? expression.argument : expression;
    if (
      n.type !== "CallExpression" ||
      !member(n.callee, "tools") ||
      !allowed(n.callee.property.name) ||
      n.arguments.length !== 1
    )
      return false;
    try {
      const args = literal(n.arguments[0]);
      if (!args || typeof args !== "object" || Array.isArray(args))
        return false;
      if (n.callee.property.name === "exec_command") {
        const request = args as Record<string, unknown>;
        if (
          !installedSkillPath ||
          request.cmd !== "cat " + installedSkillPath ||
          Object.keys(request).some(
            (k) => !["cmd", "max_output_tokens"].includes(k),
          ) ||
          (request.max_output_tokens !== undefined &&
            (!Number.isInteger(request.max_output_tokens) ||
              (request.max_output_tokens as number) <= 0 ||
              (request.max_output_tokens as number) > 16000))
        )
          return false;
      }
      if (n.callee.property.name === "web__run") {
        const request = args as Record<string, any>;
        if (
          Object.keys(request).some(
            (k) => !["open", "response_length"].includes(k),
          ) ||
          !Array.isArray(request.open) ||
          !request.open.length ||
          request.open.some(
            (entry: any) =>
              !entry ||
              typeof entry !== "object" ||
              Object.keys(entry).some(
                (k) => !["ref_id", "lineno"].includes(k),
              ) ||
              typeof entry.ref_id !== "string" ||
              !isBehaviorWebUrl(entry.ref_id),
          )
        )
          return false;
      }
      calls.push({
        name: n.callee.property.name,
        arguments: args as Record<string, unknown>,
      });
      return true;
    } catch {
      return false;
    }
  };
  const catalog = (n: Ast): boolean => {
    const field = (v: Ast) =>
      member(v, "x", "name") || member(v, "x", "description");
    const subject = (v: Ast): boolean =>
      field(v) ||
      (v.type === "StringLiteral" && v.value === " ") ||
      (v.type === "BinaryExpression" &&
        v.operator === "+" &&
        subject(v.left) &&
        subject(v.right));
    const predicate = (v: Ast): boolean =>
      v.type === "LogicalExpression" && ["&&", "||"].includes(v.operator)
        ? predicate(v.left) && predicate(v.right)
        : v.type === "CallExpression" &&
          v.callee.type === "MemberExpression" &&
          !v.callee.computed &&
          v.callee.object.type === "RegExpLiteral" &&
          v.callee.property.name === "test" &&
          v.arguments.length === 1 &&
          subject(v.arguments[0]);
    const arrow = (v: Ast) =>
      v.type === "ArrowFunctionExpression" &&
      !v.async &&
      v.params.length === 1 &&
      v.params[0].type === "Identifier" &&
      v.params[0].name === "x";
    const filter = (v: Ast) =>
      v.type === "CallExpression" &&
      member(v.callee, "ALL_TOOLS", "filter") &&
      v.arguments.length === 1 &&
      arrow(v.arguments[0]) &&
      predicate(v.arguments[0].body);
    if (filter(n)) return true;
    if (
      n.type !== "CallExpression" ||
      n.callee.type !== "MemberExpression" ||
      n.callee.computed ||
      n.callee.property.name !== "map" ||
      !filter(n.callee.object) ||
      n.arguments.length !== 1 ||
      !arrow(n.arguments[0])
    )
      return false;
    const body = n.arguments[0].body;
    return (
      body.type === "ObjectExpression" &&
      body.properties.length > 0 &&
      body.properties.every((p: Ast) => {
        if (
          p.type !== "ObjectProperty" ||
          p.computed ||
          p.shorthand ||
          p.key.type !== "Identifier" ||
          !["name", "description"].includes(p.key.name)
        )
          return false;
        if (member(p.value, "x", p.key.name)) return true;
        const v = p.value;
        return (
          p.key.name === "description" &&
          v.type === "CallExpression" &&
          v.callee.type === "MemberExpression" &&
          !v.callee.computed &&
          member(v.callee.object, "x", "description") &&
          v.callee.property.name === "slice" &&
          v.arguments.length === 2 &&
          v.arguments[0].type === "NumericLiteral" &&
          v.arguments[0].value === 0 &&
          v.arguments[1].type === "NumericLiteral" &&
          Number.isInteger(v.arguments[1].value) &&
          v.arguments[1].value > 0 &&
          v.arguments[1].value <= 200
        );
      })
    );
  };
  const parallel = (n: Ast): boolean => {
    if (
      n.type !== "AwaitExpression" ||
      n.argument.type !== "CallExpression" ||
      !member(n.argument.callee, "Promise", "allSettled") ||
      n.argument.arguments.length !== 1
    )
      return false;
    const values = n.argument.arguments[0];
    if (values.type === "ArrayExpression")
      return values.elements.length > 0 && values.elements.every(tool);
    if (
      route !== "mcp" ||
      values.type !== "CallExpression" ||
      values.callee.type !== "MemberExpression" ||
      values.callee.computed ||
      values.callee.property.name !== "map" ||
      values.callee.object.type !== "ArrayExpression" ||
      values.arguments.length !== 1
    )
      return false;
    const fn = values.arguments[0],
      paths = values.callee.object.elements;
    if (
      fn.type !== "ArrowFunctionExpression" ||
      fn.async ||
      fn.params.length !== 1 ||
      fn.params[0].type !== "Identifier" ||
      fn.body.type !== "CallExpression" ||
      !member(fn.body.callee, "tools", "mcp__talksprout__read_document") ||
      fn.body.arguments.length !== 1 ||
      !paths.length ||
      paths.length > 20 ||
      paths.some((p: Ast) => p.type !== "StringLiteral")
    )
      return false;
    const argument = fn.body.arguments[0],
      property = argument.properties?.[0];
    if (
      argument.type !== "ObjectExpression" ||
      argument.properties.length !== 1 ||
      property.type !== "ObjectProperty" ||
      property.computed ||
      property.key.name !== "path" ||
      property.value.type !== "Identifier" ||
      property.value.name !== fn.params[0].name
    )
      return false;
    for (const path of paths)
      calls.push({
        name: "mcp__talksprout__read_document",
        arguments: { path: path.value },
      });
    return true;
  };
  for (const statement of statements) {
    if (
      statement.type === "VariableDeclaration" &&
      statement.kind === "const"
    ) {
      for (const d of statement.declarations) {
        if (
          d.id.type !== "Identifier" ||
          !d.init ||
          bindings.has(d.id.name) ||
          ["tools", "text", "ALL_TOOLS", "Promise"].includes(d.id.name)
        ) {
          valid = false;
          continue;
        }
        const before = calls.length;
        if (catalog(d.init)) bindings.set(d.id.name, "catalog");
        else if (tool(d.init)) {
          bindings.set(d.id.name, "result");
          bindingCalls.set(d.id.name, [calls.at(-1)!]);
        } else if (parallel(d.init)) {
          bindings.set(d.id.name, "parallel");
          bindingCalls.set(d.id.name, calls.slice(before));
        } else valid = false;
      }
    } else if (
      statement.type === "ExpressionStatement" &&
      statement.expression.type === "CallExpression"
    ) {
      const c = statement.expression;
      if (
        c.callee.type === "Identifier" &&
        c.callee.name === "text" &&
        c.arguments.length === 1
      ) {
        const arg = c.arguments[0];
        if (
          catalog(arg) ||
          (arg.type === "Identifier" && bindings.get(arg.name) === "catalog")
        ) {
          metadataOutput = true;
          emissions.push({ kind: "catalog", calls: [] });
        } else if (arg.type === "Identifier" && bindings.has(arg.name))
          emissions.push({
            kind: "forwarded",
            calls: bindingCalls.get(arg.name) ?? [],
          });
        else if (tool(arg))
          emissions.push({ kind: "forwarded", calls: [calls.at(-1)!] });
        else valid = false;
      } else if (
        c.callee.type === "MemberExpression" &&
        !c.callee.computed &&
        c.callee.object.type === "Identifier" &&
        bindings.get(c.callee.object.name) === "parallel" &&
        c.callee.property.name === "forEach" &&
        c.arguments.length === 1 &&
        c.arguments[0].type === "Identifier" &&
        c.arguments[0].name === "text"
      ) {
        for (const call of bindingCalls.get(c.callee.object.name) ?? [])
          emissions.push({ kind: "forwarded", calls: [call] });
      } else valid = false;
    } else if (statement.type === "ForStatement") {
      const compact = source
        .slice(statement.start, statement.end)
        .replace(/\s+/g, "");
      const forwarded = compact.match(
        /^for\(leti=0;i<([A-Za-z_]\w*)\.length;i\+\+\)text\(\{i,result:\1\[i\]\}\);?$/,
      );
      if (!forwarded || bindings.get(forwarded[1]) !== "parallel")
        valid = false;
      else
        for (const call of bindingCalls.get(forwarded[1]) ?? [])
          emissions.push({ kind: "forwarded", calls: [call] });
    } else valid = false;
  }
  return { valid, calls, metadataOutput, emissions };
}

/** Split transport viewer sections before attribution; a body never borrows another viewer's URL. */
export function splitBehaviorViewerDocuments(
  text: string,
): { url: string; body: string }[] {
  const headers = [
    ...text.matchAll(
      /^[^\n]*\((https:\/\/[^)\n]+)\)\n[^\n]*Source: open\((\{[^\n]+\})\); Total lines: \d+\n/gm,
    ),
  ];
  return headers.flatMap((h, i) => {
    const url = h[1];
    try {
      if (JSON.parse(h[2]).ref_id !== url) return [];
    } catch {
      return [];
    }
    const body = text
      .slice(h.index! + h[0].length, headers[i + 1]?.index ?? text.length)
      .replace(/\n-{80}\s*$/, "")
      .trimEnd();
    if (!body.split("\n").every((line) => !line || /^L\d+:/.test(line)))
      return [];
    return [{ url, body }];
  });
}
