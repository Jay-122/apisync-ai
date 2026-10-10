import { Node, SyntaxKind, type CallExpression, type SourceFile } from "ts-morph";
import type { MigrationRule } from "@/lib/ast/rules";

export type PlannedEdit = {
  apply: () => void;
  description: string;
  confidence: number;
};

export function planFileEdits(source: SourceFile, rules: MigrationRule[]) {
  const edits: PlannedEdit[] = [];

  for (const rule of rules) {
    const calls = source
      .getDescendantsOfKind(SyntaxKind.CallExpression)
      .filter((call) => matchesMethod(call, rule.oldMethod));

    for (const call of calls) {
      const planned = planCall(call, rule);
      if (!planned) {
        return {
          ok: false as const,
          reason: `Transformation skipped. Reason: AST pattern did not match safely (${rule.oldMethod}).`,
        };
      }
      edits.push(...planned);
    }
  }

  return { ok: true as const, edits };
}

function matchesMethod(call: CallExpression, methodName: string) {
  const expression = call.getExpression();
  return Node.isPropertyAccessExpression(expression) && expression.getName() === methodName;
}

function planCall(call: CallExpression, rule: MigrationRule): PlannedEdit[] | null {
  const expression = call.getExpression();
  if (!Node.isPropertyAccessExpression(expression)) return null;

  const receiver = expression.getExpression();
  if (!Node.isIdentifier(receiver) && !Node.isPropertyAccessExpression(receiver)) return null;

  const args = call.getArguments();
  if (args.length !== 1 || !Node.isObjectLiteralExpression(args[0])) return null;
  const firstArg = args[0];

  const renames: { name: string; next: string }[] = [];
  for (const property of firstArg.getProperties()) {
    if (Node.isSpreadAssignment(property)) return null;
    if (Node.isShorthandPropertyAssignment(property)) {
      if (rule.paramRenames[property.getName()]) return null;
      continue;
    }
    if (!Node.isPropertyAssignment(property)) return null;
    const nameNode = property.getNameNode();
    if (!Node.isIdentifier(nameNode) && !Node.isStringLiteral(nameNode)) return null;
    const next = rule.paramRenames[property.getName()];
    if (next) renames.push({ name: property.getName(), next });
  }

  const receiverText = receiver.getText();
  const nextExpression = `${receiverText}.${rule.newMethod}`;
  const edits: PlannedEdit[] = [
    {
      confidence: rule.confidence,
      description: `${receiverText}.${rule.oldMethod}() → ${nextExpression}()`,
      apply: () => expression.replaceWithText(nextExpression),
    },
  ];

  for (const rename of renames) {
    edits.push({
      confidence: rule.confidence,
      description: `${rename.name} → ${rename.next}`,
      apply: () => {
        const property = firstArg
          .getProperties()
          .find((item) => Node.isPropertyAssignment(item) && item.getName() === rename.name);
        if (property && Node.isPropertyAssignment(property) && !property.wasForgotten()) {
          property.getNameNode().replaceWithText(rename.next);
        }
      },
    });
  }

  if (rule.unwrapData) {
    const unwrap = planDataUnwrap(call);
    if (unwrap === "unsafe") return null;
    if (unwrap) edits.push(unwrap);
  }

  return edits;
}

function planDataUnwrap(call: CallExpression): PlannedEdit | "unsafe" | null {
  const awaitOrCall = call.getParentIfKind(SyntaxKind.AwaitExpression) ?? call;
  const declaration = awaitOrCall.getParentIfKind(SyntaxKind.VariableDeclaration);
  if (!declaration) return null;

  const nameNode = declaration.getNameNode();
  if (!Node.isIdentifier(nameNode)) return "unsafe";

  const statement = declaration.getVariableStatement();
  if (!statement || statement.getDeclarationKind() !== "const") return "unsafe";

  const name = nameNode.getText();
  const scope = declaration.getFirstAncestorByKind(SyntaxKind.Block) ?? declaration.getSourceFile();
  const accesses = scope.getDescendantsOfKind(SyntaxKind.PropertyAccessExpression).filter((access) => {
    return access.getName() === "data" && access.getExpression().getText() === name;
  });

  if (accesses.length === 0) return null;

  return {
    confidence: 0.96,
    description: `${name}.data → ${name}`,
    apply: () => {
      for (const access of [...accesses].reverse()) {
        if (!access.wasForgotten()) access.replaceWithText(name);
      }
    },
  };
}
