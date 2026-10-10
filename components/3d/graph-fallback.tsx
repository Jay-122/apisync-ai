const nodes = [
  { label: "OpenAI", state: "Breaking" },
  { label: "Stripe", state: "Healthy" },
  { label: "Twilio", state: "Warning" },
  { label: "Supabase", state: "Healthy" },
  { label: "PostHog", state: "Healthy" },
  { label: "AWS", state: "Healthy" },
];

export function GraphFallback() {
  return (
    <div className="grid h-full w-full place-items-center" aria-hidden>
      <div className="relative h-72 w-72">
        <div className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-cyan-300/40 bg-cyan-300/10 text-center text-[10px] font-medium text-cyan-100">
          CODE
        </div>
        {nodes.map((node, index) => {
          const angle = (index / nodes.length) * Math.PI * 2 - Math.PI / 2;
          const x = 50 + Math.cos(angle) * 38;
          const y = 50 + Math.sin(angle) * 38;
          return (
            <div
              key={node.label}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-center"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <div className="mx-auto h-2.5 w-2.5 rounded-full bg-slate-200" />
              <div className="mt-1 text-[10px] text-slate-300">{node.label}</div>
              <div className="text-[9px] uppercase tracking-wide text-slate-500">{node.state}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
