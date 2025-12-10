"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useFeedStore } from "@/app/store/feedStore";
import { useShallow } from "zustand/react/shallow";
import { RefreshFooter } from "@/components/ui/RefreshHeader";

export const RefreshFooterWrapper = () => {
  const pathname = usePathname();
  const [refreshInterval, setRefreshInterval] = useState(60000); // 1min par défaut
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(60);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Désactiver le refresh automatique sur la page mock pour éviter d'écraser les modifications
  const isMockPage = pathname === "/mock";

  const [source, setLoading, setError, setFromBuffer] = useFeedStore(
    useShallow((s) => [s.source, s.setLoading, s.setError, s.setFromBuffer])
  );

  const handleFetch = useCallback(
    async (url: string) => {
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
        console.error("fetch error", err);
        const message =
          err instanceof Error ? err.message : "Impossible de récupérer le flux (URL ou réseau).";
        setError(message);
      }
    },
    [setLoading, setFromBuffer, setError]
  );

  useEffect(() => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }

    const urlSource = source?.type === "url" ? source.url : null;
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    // Désactiver le refresh sur la page mock pour éviter d'écraser les modifications
    const isRefreshEnabled = !isMockPage && refreshInterval > 0 && urlSource && isOnline;

    if (!isRefreshEnabled) {
      setTimeUntilRefresh(0);
      return;
    }

    setTimeUntilRefresh(Math.ceil(refreshInterval / 1000));
    countdownRef.current = setInterval(() => {
      setTimeUntilRefresh((prev) => {
        if (prev <= 1) {
          return Math.ceil(refreshInterval / 1000);
        }
        return prev - 1;
      });
    }, 1000);

    refreshTimerRef.current = setInterval(() => {
      if (urlSource && isOnline) {
        handleFetch(urlSource);
      }
    }, refreshInterval);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [refreshInterval, source, handleFetch]);

  const isUrlSource = source?.type === "url";

  return (
    <RefreshFooter
      interval={refreshInterval}
      onIntervalChange={setRefreshInterval}
      isEnabled={isUrlSource}
      timeUntilRefresh={timeUntilRefresh}
    />
  );
};

