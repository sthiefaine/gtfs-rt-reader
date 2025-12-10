type RowProps = {
  label: string;
  value: string;
};

export const Row = ({ label, value }: RowProps) => (
  <div className="flex items-center justify-between text-xs text-slate-400">
    <span>{label}</span>
    <span className="text-white">{value}</span>
  </div>
);

