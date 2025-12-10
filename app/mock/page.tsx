"use client";

import { useState, useEffect } from "react";
import { useFeedStore } from "../store/feedStore";
import { useShallow } from "zustand/react/shallow";
import { transit_realtime as gtfs } from "gtfs-realtime-bindings";
import { encodeGtfsRt, ParsedFeed } from "@/lib/gtfs";

const CAUSE_OPTIONS = [
  { value: 1, label: "Cause inconnue" },
  { value: 2, label: "Autre cause" },
  { value: 3, label: "Problème technique" },
  { value: 4, label: "Grève" },
  { value: 5, label: "Manifestation" },
  { value: 6, label: "Accident" },
  { value: 7, label: "Vacances" },
  { value: 8, label: "Météo" },
  { value: 9, label: "Maintenance" },
  { value: 10, label: "Construction" },
  { value: 11, label: "Activité de police" },
  { value: 12, label: "Urgence médicale" }
];

const EFFECT_OPTIONS = [
  { value: 1, label: "Aucun service" },
  { value: 2, label: "Service réduit" },
  { value: 3, label: "Retards importants" },
  { value: 4, label: "Détour" },
  { value: 5, label: "Prestation supplémentaire" },
  { value: 6, label: "Prestation modifiée" },
  { value: 7, label: "Arrêt déplacé" },
  { value: 8, label: "Autre effet" },
  { value: 9, label: "Effet inconnu" },
  { value: 10, label: "Aucun effet" },
  { value: 11, label: "Problème Accessibilité" }
];

function generateMockId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export default function MockPage() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modifiedEntities, setModifiedEntities] = useState<gtfs.IFeedEntity[]>([]);
  const [originalParsed, setOriginalParsed] = useState<ParsedFeed | undefined>(undefined);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [mockId, setMockId] = useState<string>("");
  const [newAlert, setNewAlert] = useState({
    id: `alert:${Date.now()}`,
    headerText: "",
    descriptionText: "",
    cause: "" as string | number,
    effect: "" as string | number
  });

  const parsed = useFeedStore(useShallow((s) => s.parsed));
  const setFromBuffer = useFeedStore((s) => s.setFromBuffer);
  const setLoading = useFeedStore((s) => s.setLoading);
  const setErrorStore = useFeedStore((s) => s.setError);

  useEffect(() => {
    const storedId = localStorage.getItem("gtfs-rt-mock-id");
    if (storedId) {
      setMockId(storedId);
    } else {
      const newId = generateMockId();
      setMockId(newId);
      localStorage.setItem("gtfs-rt-mock-id", newId);
    }
  }, []);

  useEffect(() => {
    if (parsed) {
      const alerts = parsed.entities.filter((e) => e.alert);
      setModifiedEntities([...alerts]);
      setOriginalParsed(parsed);
    }
  }, [parsed]);

  const handleLoad = async () => {
    if (!url.trim()) {
      setError("URL requise");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setLoading();
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
      const res = await fetch(proxyUrl, { cache: "no-cache" });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }
      const buffer = await res.arrayBuffer();
      setFromBuffer(buffer, { type: "url", url });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Impossible de charger le flux";
      setError(message);
      setErrorStore(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAlert = (entityId: string, field: "cause" | "effect" | "headerText" | "descriptionText", value: number | string | null) => {
    setModifiedEntities((prev) =>
      prev.map((entity) => {
        if (entity.id === entityId && entity.alert) {
          if (field === "headerText" || field === "descriptionText") {
            return {
              ...entity,
              alert: {
                ...entity.alert,
                [field]: value
                  ? {
                      translation: [{ text: String(value) }]
                    }
                  : undefined
              }
            };
          } else {
            return {
              ...entity,
              alert: {
                ...entity.alert,
                [field]: value ?? undefined
              }
            };
          }
        }
        return entity;
      })
    );
  };

  const handleDeleteAlert = (entityId: string) => {
    setModifiedEntities((prev) => prev.filter((entity) => entity.id !== entityId));
  };

  const handleCreateAlert = () => {
    if (!newAlert.headerText.trim()) {
      alert("Le titre de l'alerte est requis");
      return;
    }

    const alertEntity: gtfs.IFeedEntity = {
      id: newAlert.id.trim() || `alert:${Date.now()}`,
      alert: {
        headerText: {
          translation: [{ text: newAlert.headerText.trim() }]
        },
        descriptionText: newAlert.descriptionText.trim()
          ? {
              translation: [{ text: newAlert.descriptionText.trim() }]
            }
          : undefined,
        cause: newAlert.cause ? Number(newAlert.cause) : undefined,
        effect: newAlert.effect ? Number(newAlert.effect) : undefined
      }
    };

    setModifiedEntities((prev) => [...prev, alertEntity]);
    setNewAlert({
      id: `alert:${Date.now()}`,
      headerText: "",
      descriptionText: "",
      cause: "",
      effect: ""
    });
    setShowCreateForm(false);
  };

  const handleSave = async () => {
    if (!originalParsed) return;

    const vehicles = originalParsed.entities.filter((e) => e.vehicle);
    const trips = originalParsed.entities.filter((e) => e.tripUpdate);
    const allEntities = [...vehicles, ...trips, ...modifiedEntities];

    const now = Math.floor(Date.now() / 1000);

    const modifiedParsed = {
      ...originalParsed,
      header: {
        ...originalParsed.header,
        timestamp: now
      },
      entities: allEntities,
      summary: {
        vehicles: vehicles.length,
        tripUpdates: trips.length,
        alerts: modifiedEntities.length
      }
    };

    try {
      const buffer = encodeGtfsRt(modifiedParsed);
      const response = await fetch(`/api/mock/gtfs-rt?id=${mockId}`, {
        method: "POST",
        headers: { "Content-Type": "application/x-protobuf" },
        body: buffer
      });

      if (!response.ok) throw new Error("Erreur lors de l'enregistrement");

      const data = await response.json();
      if (data.id && data.id !== mockId) {
        setMockId(data.id);
        localStorage.setItem("gtfs-rt-mock-id", data.id);
      }

      alert(`Flux modifié enregistré ! Utilisez l'URL ci-dessous pour le récupérer.`);
    } catch (err) {
      console.error("Save error", err);
      alert("Erreur lors de l'enregistrement");
    }
  };

  if (!parsed || modifiedEntities.length === 0) {
    return (
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pt-20">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-white">Éditeur de Mock GTFS-RT</h1>
          <p className="text-slate-300 text-sm">
            Chargez un flux GTFS-RT pour modifier les alertes et créer un mock pour vos tests.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://app.pysae.com/api/v2/groups/moulins/gtfs-rt"
                className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
              />
              <button
                onClick={handleLoad}
                disabled={isLoading}
                className="rounded-lg bg-cyan-600 px-6 py-2 font-medium text-white hover:bg-cyan-500 disabled:opacity-50 transition"
              >
                {isLoading ? "Chargement..." : "Charger"}
              </button>
            </div>
            {error && <p className="text-sm text-amber-400">{error}</p>}
          </div>
        </div>

        {parsed && modifiedEntities.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-8">
            <p className="text-slate-400 text-sm">Aucune alerte dans ce flux.</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500 transition"
            >
              + Créer une alerte
            </button>
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pt-20 pb-16">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-white">Éditeur de Mock GTFS-RT</h1>
          <p className="text-slate-300 text-sm">
            Modifiez les alertes et enregistrez le flux modifié pour vos tests.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="rounded-lg bg-green-600 px-6 py-2 font-medium text-white hover:bg-green-500 transition"
        >
          Enregistrer le mock
        </button>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">ID du mock:</span>
            <code className="rounded bg-slate-950 px-2 py-1 text-xs font-mono text-cyan-400">
              {mockId || "Génération..."}
            </code>
            <button
              onClick={() => {
                const newId = generateMockId();
                setMockId(newId);
                localStorage.setItem("gtfs-rt-mock-id", newId);
              }}
              className="rounded-lg bg-slate-700 px-2 py-1 text-xs font-medium text-white hover:bg-slate-600 transition"
              title="Générer un nouvel ID"
            >
              🔄
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">URL du mock:</span>
            <code className="rounded bg-slate-950 px-2 py-1 text-xs font-mono text-cyan-400 break-all">
              {typeof window !== "undefined" && mockId
                ? `${window.location.origin}/api/mock/gtfs-rt?id=${mockId}`
                : "/api/mock/gtfs-rt?id=..."}
            </code>
            {typeof window !== "undefined" && mockId && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/api/mock/gtfs-rt?id=${mockId}`);
                  alert("URL copiée dans le presse-papiers !");
                }}
                className="rounded-lg bg-cyan-600 px-2 py-1 text-xs font-medium text-white hover:bg-cyan-500 transition"
                title="Copier l'URL"
              >
                📋
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Alertes ({modifiedEntities.length})</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500 transition"
        >
          {showCreateForm ? "Annuler" : "+ Créer une alerte"}
        </button>
      </div>

      {showCreateForm && (
        <div className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 p-4">
          <h3 className="text-md font-semibold text-cyan-50 mb-4">Nouvelle alerte</h3>
          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-cyan-200/70">ID de l'alerte</label>
              <input
                type="text"
                value={newAlert.id}
                onChange={(e) => setNewAlert({ ...newAlert, id: e.target.value })}
                placeholder="alert:..."
                className="rounded-lg border border-cyan-600/50 bg-cyan-900/30 px-3 py-2 text-sm text-white placeholder:text-cyan-500/50 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-cyan-200/70">Titre *</label>
              <input
                type="text"
                value={newAlert.headerText}
                onChange={(e) => setNewAlert({ ...newAlert, headerText: e.target.value })}
                placeholder="Titre de l'alerte"
                className="rounded-lg border border-cyan-600/50 bg-cyan-900/30 px-3 py-2 text-sm text-white placeholder:text-cyan-500/50 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-cyan-200/70">Description</label>
              <textarea
                value={newAlert.descriptionText}
                onChange={(e) => setNewAlert({ ...newAlert, descriptionText: e.target.value })}
                placeholder="Description de l'alerte (optionnel)"
                rows={3}
                className="rounded-lg border border-cyan-600/50 bg-cyan-900/30 px-3 py-2 text-sm text-white placeholder:text-cyan-500/50 focus:border-cyan-500 focus:outline-none resize-none"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                <label className="text-xs text-cyan-200/70">Cause</label>
                <select
                  value={newAlert.cause}
                  onChange={(e) => setNewAlert({ ...newAlert, cause: e.target.value })}
                  className="rounded-lg border border-cyan-600/50 bg-cyan-900/30 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="">—</option>
                  {CAUSE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.value} - {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                <label className="text-xs text-cyan-200/70">Effet</label>
                <select
                  value={newAlert.effect}
                  onChange={(e) => setNewAlert({ ...newAlert, effect: e.target.value })}
                  className="rounded-lg border border-cyan-600/50 bg-cyan-900/30 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="">—</option>
                  {EFFECT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.value} - {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewAlert({
                    id: `alert:${Date.now()}`,
                    headerText: "",
                    descriptionText: "",
                    cause: "",
                    effect: ""
                  });
                }}
                className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateAlert}
                className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500 transition"
              >
                Créer l'alerte
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {modifiedEntities.map((entity) => {
          const alert = entity.alert;
          if (!alert) return null;

          const header = alert.headerText?.translation?.[0]?.text ?? "Alerte sans titre";
          const desc = alert.descriptionText?.translation?.[0]?.text;

          return (
            <div key={entity.id} className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-col gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={header}
                        onChange={(e) => handleUpdateAlert(entity.id, "headerText", e.target.value)}
                        className="flex-1 rounded-lg border border-amber-600/50 bg-amber-900/30 px-3 py-1.5 text-sm font-semibold text-amber-50 focus:border-amber-500 focus:outline-none"
                        placeholder="Titre de l'alerte"
                      />
                      <span className="rounded-full bg-amber-700/40 px-2 py-0.5 text-xs font-mono text-amber-200/80 whitespace-nowrap">
                        ID: {entity.id}
                      </span>
                    </div>
                    <textarea
                      value={desc || ""}
                      onChange={(e) => handleUpdateAlert(entity.id, "descriptionText", e.target.value || null)}
                      placeholder="Description (optionnel)"
                      rows={2}
                      className="rounded-lg border border-amber-600/50 bg-amber-900/30 px-3 py-1.5 text-sm text-amber-100/90 focus:border-amber-500 focus:outline-none resize-none"
                    />
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-amber-200/70">Cause</label>
                      <select
                        value={alert.cause ?? ""}
                        onChange={(e) =>
                          handleUpdateAlert(entity.id, "cause", e.target.value ? Number(e.target.value) : null)
                        }
                        className="rounded-lg border border-amber-600/50 bg-amber-900/30 px-3 py-1.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                      >
                        <option value="">—</option>
                        {CAUSE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.value} - {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-amber-200/70">Effet</label>
                      <select
                        value={alert.effect ?? ""}
                        onChange={(e) =>
                          handleUpdateAlert(entity.id, "effect", e.target.value ? Number(e.target.value) : null)
                        }
                        className="rounded-lg border border-amber-600/50 bg-amber-900/30 px-3 py-1.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                      >
                        <option value="">—</option>
                        {EFFECT_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.value} - {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteAlert(entity.id)}
                  className="rounded-lg bg-red-600/80 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition"
                >
                  Supprimer
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

