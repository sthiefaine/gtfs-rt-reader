"use client";

const formatDateTime = (timestamp?: number) =>
  timestamp
    ? new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "short",
        timeStyle: "medium"
      }).format(new Date(timestamp))
    : "—";

type StatsSectionProps = {
  header?: {
    gtfsVersion?: string;
    incrementality?: string;
    timestamp?: number;
  };
};

export const StatsSection = ({ header }: StatsSectionProps) => (
  <section className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 shadow-panel">
    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-200">
      <span className="font-semibold text-white">Header GTFS-RT</span>
      <span className="text-slate-400">•</span>
      <span>Version: <span className="font-semibold text-white">{header?.gtfsVersion ?? "—"}</span></span>
      <span className="text-slate-400">•</span>
      <span>Incrementality: <span className="font-semibold text-white">{header?.incrementality ?? "—"}</span></span>
      <span className="text-slate-400">•</span>
      <span>Timestamp: <span className="font-semibold text-white">{formatDateTime(header?.timestamp)}</span></span>
    </div>
  </section>
);

