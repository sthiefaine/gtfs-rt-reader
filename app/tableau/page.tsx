"use client";

import { useMemo } from "react";
import { useFeedStore } from "../store/feedStore";
import { useShallow } from "zustand/react/shallow";
import { VehicleTable } from "@/components/tables/VehicleTable";
import { TripTable } from "@/components/tables/TripTable";
import { AlertTable } from "@/components/tables/AlertTable";
import { TabButton } from "@/components/ui/TabButton";
import { useState } from "react";
import { transit_realtime as gtfs } from "gtfs-realtime-bindings";

export default function TableauPage() {
  const [tab, setTab] = useState<"vehicles" | "trips" | "alerts">("vehicles");
  const parsed = useFeedStore(useShallow((s) => s.parsed));

  const entities = parsed?.entities ?? [];
  const vehicles = entities.filter((e) => e.vehicle);
  const trips = entities.filter((e) => e.tripUpdate);
  const alerts = entities.filter((e) => e.alert);

  if (!parsed) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-4 px-4 pt-20">
        <p className="text-slate-400">Aucun flux chargé. Retournez à la page d&apos;accueil pour charger un flux.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pt-20">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4">
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

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-panel">
        {tab === "vehicles" ? (
          <VehicleTable items={vehicles} />
        ) : tab === "trips" ? (
          <TripTable items={trips} />
        ) : (
          <AlertTable items={alerts} />
        )}
      </div>
    </div>
  );
}

