"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const CodeEditor = dynamic(
  () => import("@/components/editor/monaco-pane").then((mod) => mod.CodeEditor),
  { ssr: false, loading: () => <Skeleton className="h-full min-h-[320px] w-full" /> },
);

export function SourceEditor(props: { value: string; language: string }) {
  return <CodeEditor {...props} />;
}
