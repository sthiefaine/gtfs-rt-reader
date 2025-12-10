"use client";

import { useEffect, useMemo, useState } from "react";
import { useFeedStore } from "./store/feedStore";
import { useShallow } from "zustand/react/shallow";
import { HeaderSection } from "@/components/sections/HeaderSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { DataTableSection } from "@/components/sections/DataTableSection";
import { URLForm } from "@/components/forms/URLForm";
import { FileImport } from "@/components/forms/FileImport";

export default function HomePage() {
  const [isOnline, setIsOnline] = useState(true);

  const [
    status,
    error,
    parsed,
    source,
    lastUpdated,
    setLoading,
    setError,
    setFromBuffer,
    loadFromCache,
    clear
  ] = useFeedStore(
    useShallow((s) => [
      s.status,
      s.error,
      s.parsed,
      s.source,
      s.lastUpdated,
      s.setLoading,
      s.setError,
      s.setFromBuffer,
      s.loadFromCache,
      s.clear
    ])
  );

  useEffect(() => {
    loadFromCache();
  }, [loadFromCache]);

  useEffect(() => {
    setIsOnline(typeof navigator === "undefined" ? true : navigator.onLine);
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => console.warn("SW registration failed", err));
    }
  }, []);

  const handleFetch = async (url: string) => {
    try {
      setLoading();
      const res = await fetch(url, { cache: "no-cache" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buffer = await res.arrayBuffer();
      setFromBuffer(buffer, { type: "url", url });
    } catch (err) {
      console.error("fetch error", err);
      const message =
        err instanceof Error ? err.message : "Impossible de récupérer le flux (URL ou réseau).";
      setError(message);
    }
  };

  const handleFile = async (file: File) => {
    try {
      setLoading();
      const buffer = await file.arrayBuffer();
      setFromBuffer(buffer, { type: "file", name: file.name });
    } catch (err) {
      console.error(err);
      setError("Lecture du fichier impossible.");
    }
  };

  const header = parsed?.header;

  const entities = parsed?.entities ?? [];
  const vehicles = entities.filter((e) => e.vehicle);
  const trips = entities.filter((e) => e.tripUpdate);
  const alerts = entities.filter((e) => e.alert);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pt-20">
        <HeaderSection
          status={status}
          error={error}
          source={source}
          lastUpdated={lastUpdated}
          isOnline={isOnline}
          entities={entities}
        />

      <section className="grid gap-4 md:grid-cols-2">
        <URLForm
          onFetch={handleFetch}
          onClear={clear}
          isLoading={status === "loading"}
        />
        <FileImport onFileSelect={handleFile} />
      </section>

      <StatsSection header={header} />

      <DataTableSection
        vehicles={vehicles}
        trips={trips}
        alerts={alerts}
        isLoading={status === "loading"}
      />
    </main>
  );
}
