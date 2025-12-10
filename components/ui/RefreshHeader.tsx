"use client";

type RefreshFooterProps = {
  interval: number;
  onIntervalChange: (interval: number) => void;
  isEnabled: boolean;
  timeUntilRefresh?: number;
};

const REFRESH_OPTIONS = [
  { label: "10s", value: 10000 },
  { label: "30s", value: 30000 },
  { label: "1min", value: 60000 },
  { label: "2min", value: 120000 },
  { label: "5min", value: 300000 },
  { label: "Désactivé", value: 0 }
];

export const RefreshFooter = ({
  interval,
  onIntervalChange,
  isEnabled,
  timeUntilRefresh
}: RefreshFooterProps) => {
  if (!isEnabled) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between border-t border-slate-800 bg-slate-900/95 backdrop-blur-sm px-4 py-2 shadow-lg">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">Refresh automatique:</span>
          <select
            value={interval}
            onChange={(e) => onIntervalChange(Number(e.target.value))}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-white outline-none focus:border-cyan-500"
          >
            {REFRESH_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        {interval > 0 && timeUntilRefresh !== undefined && timeUntilRefresh > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Prochain refresh dans</span>
            <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-300">
              {timeUntilRefresh}s
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

