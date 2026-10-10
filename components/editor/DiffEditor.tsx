"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const MonacoDiffEditor = dynamic(
  () => import("@/components/editor/monaco-pane").then((mod) => mod.MonacoDiffEditor),
  { ssr: false, loading: () => <Skeleton className="h-full min-h-[320px] w-full" /> },
);

export function DiffEditor(props: { original: string; modified: string; language: string }) {
  return <MonacoDiffEditor {...props} />;
}
