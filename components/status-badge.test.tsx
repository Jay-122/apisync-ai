/** @vitest-environment happy-dom */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DependencyTable } from "@/components/dashboard/DependencyTable";
import { StatusBadge } from "@/components/status-badge";

describe("status UI", () => {
  it("renders loading, error, empty, and success states", () => {
    const { rerender } = render(<StatusBadge status="fixing" label="Loading migration" />);
    expect(screen.getByText("Loading migration")).toBeTruthy();

    rerender(<StatusBadge status="breaking" label="Migration failed" />);
    expect(screen.getByText("Migration failed")).toBeTruthy();

    rerender(<DependencyTable rows={[]} />);
    expect(screen.getByText(/No supported dependencies/)).toBeTruthy();

    rerender(<StatusBadge status="fixed" label="Migration prepared" />);
    expect(screen.getByText("Migration prepared")).toBeTruthy();
  });
});
