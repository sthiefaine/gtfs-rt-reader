type StatusPillProps = {
  label: string;
  value: string;
};

export const StatusPill = ({ label, value }: StatusPillProps) => (
  <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1 text-xs text-slate-200">
    <span className="h-2 w-2 rounded-full bg-emerald-400" />
    {label}: <span className="font-semibold text-white">{value}</span>
  </span>
);


