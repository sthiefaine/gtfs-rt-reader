"use client";

import { useState } from "react";
import { TabButton } from "../ui/TabButton";
import { VehicleTable } from "../tables/VehicleTable";
import { TripTable } from "../tables/TripTable";
import { AlertTable } from "../tables/AlertTable";
import { transit_realtime as gtfs } from "gtfs-realtime-bindings";

type DataTableSectionProps = {
  vehicles: gtfs.IFeedEntity[];
  trips: gtfs.IFeedEntity[];
  alerts: gtfs.IFeedEntity[];
  isLoading: boolean;
};

export const DataTableSection = ({ vehicles, trips, alerts, isLoading }: DataTableSectionProps) => {
  const [tab, setTab] = useState<"vehicles" | "trips" | "alerts">("vehicles");

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-panel">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <TabButton active={tab === "vehicles"} onClick={() => setTab("vehicles")}>
          Véhicules ({vehicles.length})
        </TabButton>
        <TabButton active={tab === "trips"} onClick={() => setTab("trips")}>
          Trip updates ({trips.length})
        </TabButton>
        <TabButton active={tab === "alerts"} onClick={() => setTab("alerts")}>
          Alertes ({alerts.length})
        </TabButton>
      </div>
      <div className="mt-4">
        {isLoading ? <p className="text-sm text-slate-400">Chargement…</p> : null}
        {tab === "vehicles" ? (
          <VehicleTable items={vehicles} />
        ) : tab === "trips" ? (
          <TripTable items={trips} />
        ) : (
          <AlertTable items={alerts} />
        )}
      </div>
    </section>
  );
};


