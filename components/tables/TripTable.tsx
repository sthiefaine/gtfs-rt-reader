"use client";

import { useState } from "react";
import { transit_realtime as gtfs } from "gtfs-realtime-bindings";

type TripTableProps = {
  items: gtfs.IFeedEntity[];
};

const formatDateTime = (timestamp?: number) =>
  timestamp
    ? new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "short",
        timeStyle: "medium"
      }).format(new Date(timestamp))
    : "—";

const toMs = (value: number) => Number(value) * 1000;

type TripItemProps = {
  item: gtfs.IFeedEntity;
};

const TripItem = ({ item }: TripItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const t = item.tripUpdate;
  const firstStop = t?.stopTimeUpdate?.[0];
  const delay = firstStop?.departure?.delay ?? firstStop?.arrival?.delay;
  const stopUpdates = t?.stopTimeUpdate ?? [];
  const displayedStops = isExpanded ? stopUpdates : stopUpdates.slice(0, 5);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">
            Trip {t?.trip?.tripId ?? "—"}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            {item.id && (
              <span className="rounded-full bg-slate-800 px-2 py-0.5 font-mono text-[11px] text-slate-200">
                Entity ID: {item.id}
              </span>
            )}
            <span>Route ID: <span className="text-white font-medium">{t?.trip?.routeId ?? "—"}</span></span>
            {t?.trip?.directionId != null && (
              <span>• Direction: <span className="text-white font-medium">{t.trip.directionId}</span></span>
            )}
            {t?.trip?.startDate && (
              <span>• Start Date: <span className="text-white font-medium">{t.trip.startDate}</span></span>
            )}
            {t?.trip?.startTime && (
              <span>• Start Time: <span className="text-white font-medium">{t.trip.startTime}</span></span>
            )}
            {t?.trip?.scheduleRelationship != null && (
              <span>• Schedule Relationship: <span className="text-white font-medium">{t.trip.scheduleRelationship}</span></span>
            )}
            {t?.trip?.tripId && (
              <span>• Trip ID: <span className="text-white font-medium">{t.trip.tripId}</span></span>
            )}
            {t?.delay != null && (
              <span>• Delay: <span className="text-white font-medium">{t.delay}s</span></span>
            )}
            {t?.timestamp != null && (
              <span>• Timestamp: <span className="text-white font-medium">{formatDateTime(toMs(t.timestamp))}</span></span>
            )}
          </div>
          {(t?.vehicle?.id || t?.vehicle?.label || t?.vehicle?.licensePlate) && (
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="font-medium text-slate-300">Véhicule:</span>
              {t.vehicle.id && (
                <span>ID: <span className="text-white font-medium">{t.vehicle.id}</span></span>
              )}
              {t.vehicle.label && (
                <span>• Label: <span className="text-white font-medium">{t.vehicle.label}</span></span>
              )}
              {t.vehicle.licensePlate && (
                <span>• Plaque: <span className="text-white font-medium">{t.vehicle.licensePlate}</span></span>
              )}
            </div>
          )}
        </div>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-200">
          {delay != null ? `${delay} sec de retard` : "Pas de retard"}
        </span>
      </div>
      {stopUpdates.length > 0 ? (
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="text-slate-400">
              <tr className="border-b border-slate-800">
                <th className="px-2 py-1 text-left">Stop ID</th>
                <th className="px-2 py-1 text-left">Stop Sequence</th>
                <th className="px-2 py-1 text-left">Arrivée</th>
                <th className="px-2 py-1 text-left">Arr. Delay</th>
                <th className="px-2 py-1 text-left">Arr. Uncertainty</th>
                <th className="px-2 py-1 text-left">Départ</th>
                <th className="px-2 py-1 text-left">Dep. Delay</th>
                <th className="px-2 py-1 text-left">Dep. Uncertainty</th>
                <th className="px-2 py-1 text-left">Schedule Relationship</th>
              </tr>
            </thead>
            <tbody className="text-slate-100">
              {displayedStops.map((s: any, idx: number) => (
                <tr key={`${item.id}-${idx}`} className="border-b border-slate-900/50">
                  <td className="px-2 py-1 font-medium">{s.stopId ?? "—"}</td>
                  <td className="px-2 py-1 text-slate-400">{s.stopSequence ?? "—"}</td>
                  <td className="px-2 py-1">
                    {s.arrival?.time ? formatDateTime(toMs(s.arrival.time)) : "—"}
                  </td>
                  <td className="px-2 py-1 text-slate-400">
                    {s.arrival?.delay != null ? `${s.arrival.delay}s` : "—"}
                  </td>
                  <td className="px-2 py-1 text-slate-400">
                    {s.arrival?.uncertainty != null ? `${s.arrival.uncertainty}s` : "—"}
                  </td>
                  <td className="px-2 py-1">
                    {s.departure?.time ? formatDateTime(toMs(s.departure.time)) : "—"}
                  </td>
                  <td className="px-2 py-1 text-slate-400">
                    {s.departure?.delay != null ? `${s.departure.delay}s` : "—"}
                  </td>
                  <td className="px-2 py-1 text-slate-400">
                    {s.departure?.uncertainty != null ? `${s.departure.uncertainty}s` : "—"}
                  </td>
                  <td className="px-2 py-1 text-slate-400">{s.scheduleRelationship ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {stopUpdates.length > 5 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 transition"
            >
              {isExpanded
                ? "▲ Masquer les arrêts supplémentaires"
                : `▼ Afficher les ${stopUpdates.length - 5} arrêts supplémentaires`}
            </button>
          )}
        </div>
      ) : null}
      <button
        onClick={() => setShowRaw(!showRaw)}
        className="mt-3 text-xs text-slate-400 hover:text-slate-300 transition"
      >
        {showRaw ? "▲ Masquer les données brutes" : "▼ Afficher les données brutes"}
      </button>
      {showRaw && (
        <div className="mt-2 rounded-lg border border-slate-700 bg-slate-900/50 p-3">
          <pre className="overflow-x-auto text-[10px] text-slate-300">
            {JSON.stringify(t, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export const TripTable = ({ items }: TripTableProps) => {
  if (!items.length) {
    return <p className="text-sm text-slate-400">Pas de trip updates.</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <TripItem key={item.id} item={item} />
      ))}
    </div>
  );
};

