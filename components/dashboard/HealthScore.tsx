export function HealthScore({ score, caption }: { score: number; caption: string }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex items-center gap-4">
      <svg width="112" height="112" viewBox="0 0 112 112" aria-hidden>
        <circle cx="56" cy="56" r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="none" />
        <circle
          cx="56"
          cy="56"
          r={radius}
          stroke="#22d3ee"
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 56 56)"
        />
        <text x="56" y="60" textAnchor="middle" fill="#f8fafc" fontSize="22" fontFamily="ui-sans-serif">
          {score}
        </text>
      </svg>
      <div>
        <p className="text-sm font-medium text-white">Health score</p>
        <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">{caption}</p>
      </div>
    </div>
  );
}
