"use client";

import { FormEvent, useEffect, useState } from "react";
import { useFeedStore } from "@/app/store/feedStore";
import { useShallow } from "zustand/react/shallow";
import { UrlHistoryModal } from "../ui/UrlHistoryModal";

type URLFormProps = {
  onFetch: (url: string) => void;
  onClear: () => void;
  isLoading: boolean;
};

export const URLForm = ({ onFetch, onClear, isLoading }: URLFormProps) => {
  const lastUrl = useFeedStore(useShallow((s) => s.lastUrl));
  const [url, setUrl] = useState(lastUrl || "");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    if (lastUrl) {
      setUrl(lastUrl);
    }
  }, [lastUrl]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!url.trim()) return;
    onFetch(url.trim());
  };

  const handleSelectUrl = (selectedUrl: string) => {
    setUrl(selectedUrl);
    onFetch(selectedUrl);
  };

  return (
    <>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-panel">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-white">Charger via URL</h2>
          <span className="text-xs text-slate-400">Fetch en direct</span>
        </div>
        <form onSubmit={handleSubmit} className="mt-3 space-y-3">
          <input
            className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-3 text-sm text-white outline-none focus:border-accent"
            placeholder="https://exemple.com/flux.pb"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:translate-y-px disabled:opacity-60"
              disabled={isLoading}
            >
              ⚡ Charger
            </button>
            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-700"
            >
              📜 Historique
            </button>
            <button
              type="button"
              onClick={() => {
                onClear();
                setUrl("");
              }}
              className="inline-flex items-center justify-center rounded-xl border border-slate-700 px-4 py-3 text-sm text-slate-200 transition hover:border-slate-500"
            >
              Réinitialiser
            </button>
          </div>
        </form>
      </div>
      <UrlHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectUrl={handleSelectUrl}
      />
    </>
  );
};

