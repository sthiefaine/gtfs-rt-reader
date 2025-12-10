"use client";

import { transit_realtime as gtfs } from "gtfs-realtime-bindings";

type VehicleTableProps = {
  items: gtfs.IFeedEntity[];
};

export const VehicleTable = ({ items }: VehicleTableProps) => {
  if (!items.length) {
    return <p className="text-sm text-slate-400">Aucun véhicule dans ce flux.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="text-left text-slate-400">
          <tr className="border-b border-slate-800">
            <th className="px-3 py-2">ID</th>
            <th className="px-3 py-2">Trip</th>
            <th className="px-3 py-2">Route</th>
            <th className="px-3 py-2">Position</th>
            <th className="px-3 py-2">Vitesse</th>
          </tr>
        </thead>
        <tbody className="text-slate-200">
          {items.map((item) => {
            const v = item.vehicle;
            const pos = v?.position;
            return (
              <tr key={item.id} className="border-b border-slate-800/80">
                <td className="px-3 py-2">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-white">{v?.vehicle?.id ?? item.id ?? "—"}</span>
                    {item.id && (
                      <span className="w-fit rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-slate-200">
                        Entity ID: {item.id}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-col">
                    <span>{v?.trip?.tripId ?? "—"}</span>
                    <span className="text-xs text-slate-400">{v?.trip?.startDate ?? ""}</span>
                  </div>
                </td>
                <td className="px-3 py-2">{v?.trip?.routeId ?? "—"}</td>
                <td className="px-3 py-2">
                  {pos
                    ? `${pos.latitude?.toFixed?.(4) ?? pos.latitude}, ${pos.longitude?.toFixed?.(4) ?? pos.longitude}`
                    : "—"}
                </td>
                <td className="px-3 py-2">
                  {pos?.speed ? `${(pos.speed * 3.6).toFixed(1)} km/h` : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};


