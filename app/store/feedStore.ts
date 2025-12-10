import { create } from "zustand";
import { persist } from "zustand/middleware";
import { arrayBufferToBase64, base64ToArrayBuffer, parseGtfsRt } from "@/lib/gtfs";

type FeedSource =
  | { type: "url"; url: string }
  | { type: "file"; name: string };

export type UrlHistoryItem = {
  url: string;
  timestamp: number;
};

type FeedState = {
  status: "idle" | "loading" | "ok" | "error";
  error?: string;
  lastUpdated?: number;
  source?: FeedSource;
  rawBase64?: string;
  parsed?: ReturnType<typeof parseGtfsRt>;
  lastUrl?: string;
  urlHistory: UrlHistoryItem[];
  setFromBuffer: (buffer: ArrayBuffer, source: FeedSource) => void;
  setLoading: () => void;
  setError: (message: string) => void;
  loadFromCache: () => void;
  clear: () => void;
  addUrlToHistory: (url: string) => void;
  removeUrlFromHistory: (url: string) => void;
};

type Persisted = {
  rawBase64?: string;
  source?: FeedSource;
  lastUpdated?: number;
  lastUrl?: string;
  urlHistory: UrlHistoryItem[];
};

export const useFeedStore = create<FeedState>()(
  persist(
    (set, get) => ({
      status: "idle",
      rawBase64: undefined,
      parsed: undefined,
      source: undefined,
      error: undefined,
      lastUpdated: undefined,
      lastUrl: undefined,
      urlHistory: [],
      setLoading: () => set({ status: "loading", error: undefined }),
      setError: (message) => set({ status: "error", error: message }),
      setFromBuffer: (buffer, source) => {
        try {
          const parsed = parseGtfsRt(buffer);
          const rawBase64 = arrayBufferToBase64(buffer);
          const newLastUrl = source.type === "url" ? source.url : undefined;
          if (newLastUrl) {
            get().addUrlToHistory(newLastUrl);
          }
          set({
            status: "ok",
            parsed,
            rawBase64,
            source,
            error: undefined,
            lastUpdated: Date.now(),
            lastUrl: newLastUrl
          });
        } catch (error) {
          console.error("parse error", error);
          set({ status: "error", error: "Impossible de parser le flux." });
        }
      },
      loadFromCache: () => {
        const state = get();
        if (state.parsed || !state.rawBase64) return;
        try {
          const buffer = base64ToArrayBuffer(state.rawBase64);
          const parsed = parseGtfsRt(buffer);
          set({ parsed, status: "ok" });
        } catch (error) {
          console.error("cache parse error", error);
          set({ status: "error", error: "Cache corrompu, recharger un flux." });
        }
      },
      clear: () =>
        set({
          status: "idle",
          parsed: undefined,
          rawBase64: undefined,
          source: undefined,
          error: undefined,
          lastUpdated: undefined,
          lastUrl: undefined
        }),
      addUrlToHistory: (url) => {
        const state = get();
        const trimmedUrl = url.trim();
        const filtered = state.urlHistory.filter((item) => item.url !== trimmedUrl);
        const newHistory = [{ url: trimmedUrl, timestamp: Date.now() }, ...filtered].slice(0, 100);
        set({ urlHistory: newHistory });
      },
      removeUrlFromHistory: (url) => {
        const state = get();
        const filtered = state.urlHistory.filter((item) => item.url !== url);
        set({ urlHistory: filtered });
      }
    }),
    {
      name: "gtfs-rt-cache",
      partialize: (state): Persisted => ({
        rawBase64: state.rawBase64,
        source: state.source,
        lastUpdated: state.lastUpdated,
        lastUrl: state.lastUrl,
        urlHistory: state.urlHistory
      })
    }
  )
);

