"use client";

import Editor, { DiffEditor as MonacoDiff, type Monaco } from "@monaco-editor/react";
import { Skeleton } from "@/components/ui/skeleton";

function defineTheme(monaco: Monaco) {
  monaco.editor.defineTheme("apisync", {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#0D1117",
      "editor.foreground": "#E2E8F0",
      "editorLineNumber.foreground": "#475569",
      "diffEditor.insertedTextBackground": "#22d3ee22",
      "diffEditor.removedTextBackground": "#f8717122",
    },
  });
}

const options = {
  readOnly: true,
  minimap: { enabled: false },
  fontSize: 13,
  fontFamily: "JetBrains Mono, ui-monospace, monospace",
  scrollBeyondLastLine: false,
  padding: { top: 12, bottom: 12 },
  renderSideBySide: true,
  wordWrap: "on" as const,
};

export function CodeEditor({ value, language }: { value: string; language: string }) {
  return (
    <Editor
      height="100%"
      language={language}
      value={value}
      theme="apisync"
      beforeMount={defineTheme}
      loading={<Skeleton className="h-full w-full" />}
      options={options}
    />
  );
}

export function MonacoDiffEditor({
  original,
  modified,
  language,
}: {
  original: string;
  modified: string;
  language: string;
}) {
  return (
    <MonacoDiff
      height="100%"
      language={language}
      original={original}
      modified={modified}
      theme="apisync"
      beforeMount={defineTheme}
      loading={<Skeleton className="h-full w-full" />}
      options={options}
    />
  );
}
