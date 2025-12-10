type StatCardProps = {
  label: string;
  value: number;
  emoji: string;
};

export const StatCard = ({ label, value, emoji }: StatCardProps) => (
  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-panel">
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-lg">{emoji}</span>
    </div>
    <p className="mt-2 text-2xl font-bold text-white">{value}</p>
  </div>
);


