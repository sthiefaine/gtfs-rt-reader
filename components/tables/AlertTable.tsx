"use client";

import { useState } from "react";
import { transit_realtime as gtfs } from "gtfs-realtime-bindings";

type AlertTableProps = {
  items: gtfs.IFeedEntity[];
};

const CAUSE_LABELS: Record<number, string> = {
  1: "Cause inconnue",
  2: "Autre cause",
  3: "Problème technique",
  4: "Grève",
  5: "Manifestation",
  6: "Accident",
  7: "Vacances",
  8: "Météo",
  9: "Maintenance",
  10: "Construction",
  11: "Activité de police",
  12: "Urgence médicale"
};

const EFFECT_LABELS: Record<number, string> = {
  1: "Aucun service",
  2: "Service réduit",
  3: "Retards importants",
  4: "Détour",
  5: "Prestation supplémentaire",
  6: "Prestation modifiée",
  7: "Arrêt déplacé",
  8: "Autre effet",
  9: "Effet inconnu",
  10: "Aucun effet",
  11: "Problème Accessibilité"
};

const getCauseLabel = (cause: number | null | undefined): string => {
  if (cause == null) return "—";
  return CAUSE_LABELS[cause] ?? `Cause ${cause}`;
};

const getEffectLabel = (effect: number | null | undefined): string => {
  if (effect == null) return "—";
  return EFFECT_LABELS[effect] ?? `Effet ${effect}`;
};

const getEntityLabel = (entity: any): string => {
  if (entity.routeId) return `Route: ${entity.routeId}`;
  if (entity.stopId) return `Stop: ${entity.stopId}`;
  if (entity.trip?.routeId) return `Trip Route: ${entity.trip.routeId}`;
  if (entity.trip?.tripId) return `Trip: ${entity.trip.tripId}`;
  if (entity.agencyId) return `Agency: ${entity.agencyId}`;
  return "—";
};

type AlertItemProps = {
  item: gtfs.IFeedEntity;
};

const AlertItem = ({ item }: AlertItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const a = item.alert;
  const header = a?.headerText?.translation?.[0]?.text ?? "Alerte";
  const desc = a?.descriptionText?.translation?.[0]?.text;
  const informedEntities = a?.informedEntity ?? [];
  const displayedEntities = isExpanded ? informedEntities : informedEntities.slice(0, 4);

  return (
    <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-amber-50">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <p className="font-semibold">{header}</p>
          {item.id && (
            <span className="rounded-full bg-amber-700/40 px-2 py-0.5 text-xs font-mono text-amber-200/80">
              ID: {item.id}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {informedEntities.length > 0 && (
            <span className="rounded-full bg-amber-600/30 px-3 py-1 text-xs font-medium">
              {informedEntities.length}
            </span>
          )}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {a?.cause != null && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-amber-200/70">Cause:</span>
            <span className="rounded-full bg-amber-600/30 px-3 py-1 text-xs font-medium">
              {a.cause} - {getCauseLabel(a.cause)}
            </span>
          </div>
        )}
        {a?.effect != null && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-amber-200/70">Effet:</span>
            <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium">
              {a.effect} - {getEffectLabel(a.effect)}
            </span>
          </div>
        )}
      </div>
      {desc ? <p className="mt-2 text-sm text-amber-100/90">{desc}</p> : null}
      {informedEntities.length > 0 ? (
        <div className="mt-2">
          <p className="text-xs text-amber-100/80">
            Portée: {displayedEntities.map(getEntityLabel).join(", ")}
            {!isExpanded && informedEntities.length > 4 && "…"}
          </p>
          {informedEntities.length > 4 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 text-xs text-amber-300 hover:text-amber-200 transition"
            >
              {isExpanded
                ? "▲ Masquer les entités supplémentaires"
                : `▼ Afficher les ${informedEntities.length - 4} entités supplémentaires`}
            </button>
          )}
        </div>
      ) : null}
      {a?.url?.translation?.[0]?.text && (
        <a
          href={a.url.translation[0].text}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block text-xs text-amber-300 hover:text-amber-200 underline"
        >
          Lien: {a.url.translation[0].text}
        </a>
      )}
      <button
        onClick={() => setShowRaw(!showRaw)}
        className="mt-3 text-xs text-amber-200/80 hover:text-amber-100 transition"
      >
        {showRaw ? "▲ Masquer les données brutes" : "▼ Afficher les données brutes"}
      </button>
      {showRaw && (
        <div className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
          <pre className="overflow-x-auto text-[10px] text-amber-50">
            {JSON.stringify(item.alert, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export const AlertTable = ({ items }: AlertTableProps) => {
  if (!items.length) {
    return <p className="text-sm text-slate-400">Pas d&apos;alertes.</p>;
  }
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <AlertItem key={item.id} item={item} />
      ))}
    </div>
  );
};

