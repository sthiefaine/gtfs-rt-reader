"use client";

import { useFeedStore } from "@/app/store/feedStore";
import { useShallow } from "zustand/react/shallow";
import { UrlHistoryItem } from "@/app/store/feedStore";

type UrlHistoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectUrl: (url: string) => void;
};

const formatDateTime = (timestamp: number) =>
  new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "medium"
  }).format(new Date(timestamp));

export const UrlHistoryModal = ({ isOpen, onClose, onSelectUrl }: UrlHistoryModalProps) => {
  const [urlHistory, removeUrlFromHistory] = useFeedStore(
    useShallow((s) => [s.urlHistory, s.removeUrlFromHistory])
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <h2 className="text-xl font-semibold text-white">Historique des URLs</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            ✕
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
          {urlHistory.length === 0 ? (
            <p className="py-8 text-center text-slate-400">Aucune URL dans l&apos;historique</p>
          ) : (
            <div className="space-y-2">
              {urlHistory.map((item: UrlHistoryItem) => (
                <div
                  key={`${item.url}-${item.timestamp}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/50 p-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-white">{item.url}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatDateTime(item.timestamp)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        onSelectUrl(item.url);
                        onClose();
                      }}
                      className="rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                    >
                      Charger
                    </button>
                    <button
                      onClick={() => removeUrlFromHistory(item.url)}
                      className="rounded-lg border border-slate-700 px-4 py-2 text-xs text-slate-300 transition hover:border-red-500 hover:text-red-400"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


