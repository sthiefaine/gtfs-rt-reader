type TabButtonProps = {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
};

export const TabButton = ({ active, children, onClick }: TabButtonProps) => (
  <button
    onClick={onClick}
    className={`rounded-xl px-4 py-2 text-sm transition ${
      active
        ? "border border-accent/60 bg-cyan-500/10 text-white"
        : "border border-slate-800 bg-slate-950 text-slate-200 hover:border-slate-700"
    }`}
  >
    {children}
  </button>
);


