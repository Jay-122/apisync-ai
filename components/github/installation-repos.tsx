"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ScanResult } from "@/types";

type Repo = {
  owner: string;
  name: string;
  fullName: string;
  private: boolean;
  defaultBranch: string;
};

export function InstallationRepos() {
  const [repos, setRepos] = useState<Repo[] | null>(null);
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [pullRequestUrl, setPullRequestUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function loadRepos() {
    setBusy("list");
    setError(null);
    try {
      const response = await fetch("/api/github/repos");
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error?.message ?? "Could not list repositories.");
        return;
      }
      setRepos(payload.repositories);
    } catch {
      setError("Could not list repositories.");
    } finally {
      setBusy(null);
    }
  }

  async function scanRepo(repo: Repo) {
    setBusy(repo.fullName);
    setError(null);
    setScan(null);
    setPullRequestUrl(null);
    try {
      const response = await fetch("/api/github/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner: repo.owner, repo: repo.name }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error?.message ?? "Scan failed.");
        return;
      }
      setScan(payload as ScanResult);
    } catch {
      setError("Scan failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <Button type="button" variant="secondary" onClick={loadRepos} disabled={busy === "list"}>
        {busy === "list" ? "Loading repositories..." : "Choose repository"}
      </Button>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      {repos ? (
        <ul className="divide-y divide-white/8 rounded-lg border border-white/8">
          {repos.length === 0 ? (
            <li className="px-3 py-3 text-sm text-slate-400">This installation has no repositories yet. Install the app on a repository first.</li>
          ) : (
            repos.map((repo) => (
              <li key={repo.fullName} className="flex items-center justify-between gap-3 px-3 py-2">
                <span className="text-sm text-slate-100">
                  {repo.fullName}
                  <span className="ml-2 text-xs text-slate-500">{repo.private ? "private" : "public"}</span>
                </span>
                <Button type="button" size="sm" variant="secondary" onClick={() => scanRepo(repo)} disabled={busy === repo.fullName}>
                  {busy === repo.fullName ? "Scanning..." : "Scan"}
                </Button>
              </li>
            ))
          )}
        </ul>
      ) : null}
      {scan ? (
        <section className="rounded-lg border border-white/8 p-3">
          <p className="text-sm text-white">{scan.repository}</p>
          <p className="mt-1 text-xs text-slate-400">
            {scan.packageManager} · {scan.ecosystem} · {scan.dependencies.length} supported packages. This was a real GitHub read.
          </p>
          <ul className="mt-3 space-y-1 text-sm text-slate-300">
            {scan.dependencies.length === 0 ? <li>No supported dependency usage was found in the indexed files.</li> : null}
            {scan.dependencies.map((dependency) => (
              <li key={dependency.packageName}>
                {dependency.packageName} {dependency.version} · {dependency.usageCount} usages
              </li>
            ))}
          </ul>
          {scan.notes.map((note) => (
            <p key={note} className="mt-2 text-xs text-slate-500">
              {note}
            </p>
          ))}
          {scan.repository === "Jay-122/apisync-openai-demo" ? (
            <Button
              type="button"
              className="mt-3"
              disabled={busy === "pr"}
              onClick={async () => {
                setBusy("pr");
                setError(null);
                try {
                  const response = await fetch("/api/github/create-pr", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ owner: "Jay-122", repo: "apisync-openai-demo" }),
                  });
                  const payload = await response.json();
                  if (!response.ok) {
                    setError(payload.error?.message ?? "Pull request was not created.");
                    return;
                  }
                  setPullRequestUrl(payload.pullRequest?.url ?? null);
                } catch {
                  setError("Pull request was not created.");
                } finally {
                  setBusy(null);
                }
              }}
            >
              {busy === "pr" ? "Opening pull request..." : "Open pull request"}
            </Button>
          ) : null}
          {pullRequestUrl ? (
            <a className="mt-3 block text-sm text-cyan-300" href={pullRequestUrl}>
              {pullRequestUrl}
            </a>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
