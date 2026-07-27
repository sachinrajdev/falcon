"use client";

import { ProgressState } from "@/hooks/useActionProgress";

type Props = {
  progress: ProgressState;
};

export function ActionProgress({ progress }: Props) {
  if (!progress.visible) return null;

  const title =
    progress.action === "upload"
      ? "Uploading Resume"
      : progress.action === "tailor"
        ? "Tailoring Resume"
        : progress.action === "outreach"
          ? "Generating HR Outreach"
          : "Processing";

  const pct = progress.total > 0 ? Math.round((progress.step / progress.total) * 100) : 0;

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        background: "#f8fafc",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <strong>{title}</strong>
        <span>Elapsed: {progress.elapsedSec}s</span>
      </div>

      <div style={{ marginBottom: 8 }}>
        Step {progress.step}/{progress.total}: {progress.message}
      </div>

      <div style={{ height: 8, background: "#e2e8f0", borderRadius: 999 }}>
        <div
          style={{
            height: 8,
            borderRadius: 999,
            background: "#2563eb",
            width: pct + "%",
            transition: "width 300ms ease",
          }}
        />
      </div>

      <div style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
        This can take 30-120 seconds depending on model and network load.
      </div>
    </div>
  );
}
