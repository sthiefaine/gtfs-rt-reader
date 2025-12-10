"use client";

import { useMemo, useState } from "react";
import { useFeedStore } from "../store/feedStore";
import { useShallow } from "zustand/react/shallow";

export default function RawPage() {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const [parsed, rawBase64, source] = useFeedStore(
    useShallow((s) => [s.parsed, s.rawBase64, s.source])
  );

  const jsonString = useMemo(() => {
    if (!parsed) return "";
    return JSON.stringify(parsed, null, 2);
  }, [parsed]);

  const handleCopy = async () => {
    if (!rawBase64) return;
    try {
      await navigator.clipboard.writeText(rawBase64);
      setCopied(true);
      setError(undefined);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error(err);
      setError("Impossible de copier dans le presse-papiers.");
    }
  };

  if (!parsed) {
    return (
      <main className="mx-auto flex max-w-6xl flex-col gap-4 px-4 pt-20 pb-16">
        <h1 className="text-2xl font-semibold text-white">Données brutes</h1>
        <p className="text-slate-400">
          Aucun flux chargé. Retournez à l&apos;accueil pour charger une URL ou un fichier, puis revenez ici.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-4 px-4 pt-20 pb-16">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-white">Données brutes</h1>
        <p className="text-slate-300 text-sm">
          JSON complet du flux GTFS-RT décodé (inclut les IDs d&apos;entités). Utile pour inspection et débogage.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3">
        <span className="text-sm text-slate-300">
          Source:{" "}
          <span className="font-medium text-white">
            {source?.type === "url" ? source.url : source?.type === "file" ? source.name : "Inconnue"}
          </span>
        </span>
        <span className="text-sm text-slate-300">
          Taille JSON: <span className="font-medium text-white">{jsonString.length.toLocaleString("fr-FR")} caractères</span>
        </span>
        {rawBase64 && (
          <button
            onClick={handleCopy}
            className="rounded-lg bg-cyan-600 px-3 py-1 text-xs font-medium text-white hover:bg-cyan-500 transition"
          >
            {copied ? "Copié" : "Copier le flux (base64)"}
          </button>
        )}
        {error && <span className="text-xs text-amber-400">{error}</span>}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/80">
        <pre className="max-h-[70vh] overflow-auto p-4 text-[11px] leading-5 text-slate-100">
          {jsonString}
        </pre>
      </div>
    </main>
  );
}

