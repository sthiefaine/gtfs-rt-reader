"use client";

import { useEffect, useState } from "react";
import { StatusPill } from "../ui/StatusPill";
import {
  extractVehiclePositions,
  calculateAveragePosition,
  detectCityFromPosition
} from "@/lib/cityDetector";
import { transit_realtime as gtfs } from "gtfs-realtime-bindings";

const formatDateTime = (timestamp?: number) =>
  timestamp
    ? new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "short",
        timeStyle: "medium"
      }).format(new Date(timestamp))
    : "—";

type HeaderSectionProps = {
  status: "idle" | "loading" | "ok" | "error";
  error?: string;
  source?: { type: "url"; url: string } | { type: "file"; name: string };
  lastUpdated?: number;
  isOnline: boolean;
  entities?: gtfs.IFeedEntity[];
};

export const HeaderSection = ({
  status,
  error,
  source,
  lastUpdated,
  isOnline,
  entities = []
}: HeaderSectionProps) => {
  const [cityFromPosition, setCityFromPosition] = useState<string | null>(null);

  useEffect(() => {
    if (!isOnline || entities.length === 0) {
      setCityFromPosition(null);
      return;
    }

    const positions = extractVehiclePositions(entities);
    if (positions.length === 0) {
      setCityFromPosition(null);
      return;
    }

    const avgPos = calculateAveragePosition(positions);
    if (!avgPos) {
      setCityFromPosition(null);
      return;
    }

    detectCityFromPosition(avgPos.lat, avgPos.lon)
      .then((city) => {
        setCityFromPosition(city);
      })
      .catch(() => {
        setCityFromPosition(null);
      });
  }, [entities, isOnline]);

  return (
    <header className="flex flex-col gap-3">
      <h1 className="text-3xl font-bold text-white md:text-4xl">
        Lecture & visualisation des flux temps réel
      </h1>
      <p className="text-slate-400">
        Importe un .pb ou colle l&apos;URL du flux, l&apos;app le met en cache pour consultation
        hors connexion. Parsing protobuf via gtfs-realtime-bindings.
      </p>
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
        <StatusPill
          label="Etat"
          value={
            status === "loading"
              ? "Chargement…"
              : status === "ok"
                ? "Flux chargé"
                : "En attente"
          }
        />
        <StatusPill label="Réseau" value={isOnline ? "En ligne" : "Hors ligne"} />
        {cityFromPosition && (
          <StatusPill label="Ville" value={cityFromPosition} />
        )}
        {source ? (
          <StatusPill
            label="Source"
            value={source.type === "url" ? source.url : `Fichier : ${source.name}`}
          />
        ) : null}
        {lastUpdated ? (
          <StatusPill label="Dernier chargement" value={formatDateTime(lastUpdated)} />
        ) : null}
      </div>
      {error ? (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}
    </header>
  );
};

