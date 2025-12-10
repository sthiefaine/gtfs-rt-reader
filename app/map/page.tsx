"use client";

import { useEffect, useRef, useState } from "react";
import { useFeedStore } from "../store/feedStore";
import { useShallow } from "zustand/react/shallow";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { extractVehiclePositions, calculateAveragePosition } from "@/lib/cityDetector";

export default function MapPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const hasInitializedRef = useRef(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapStyle, setMapStyle] = useState<maplibregl.StyleSpecification | null>(null);
  const parsed = useFeedStore(useShallow((s) => s.parsed));

  useEffect(() => {
    const loadStyle = async () => {
      try {
        const res = await fetch("https://tiles.openfreemap.org/styles/liberty");
        const data = await res.json();
        setMapStyle(data as maplibregl.StyleSpecification);
      } catch (error) {
        console.error("Error loading map style", error);
        setMapStyle("https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json" as any);
      }
    };
    loadStyle();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || map.current || !mapStyle) return;

    let initialCenter: [number, number] = [2.3522, 48.8566];
    let initialZoom = 10;

    if (parsed) {
      const positions = extractVehiclePositions(parsed.entities);
      const avgPosition = calculateAveragePosition(positions);
      if (avgPosition) {
        initialCenter = [avgPosition.lon, avgPosition.lat];
        if (positions.length > 0) {
          initialZoom = 12;
        }
      }
    }

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: initialCenter,
      zoom: initialZoom,
      pitch: 0,
      bearing: 0
    });

    map.current.dragRotate.enable();
    map.current.touchPitch.enable();
    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    map.current.on("load", () => {
      setIsMapLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapStyle]);

  useEffect(() => {
    if (!map.current || !isMapLoaded || !parsed) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const markers: maplibregl.Marker[] = [];

    parsed.entities.forEach((entity) => {
      const pos = entity.vehicle?.position;
      if (pos?.latitude != null && pos?.longitude != null) {
        const lat = typeof pos.latitude === "number" ? pos.latitude : Number(pos.latitude);
        const lon = typeof pos.longitude === "number" ? pos.longitude : Number(pos.longitude);

        if (!isNaN(lat) && !isNaN(lon)) {
          const el = document.createElement("div");
          el.className = "vehicle-marker";
          el.style.width = "12px";
          el.style.height = "12px";
          el.style.borderRadius = "50%";
          el.style.backgroundColor = "#22d3ee";
          el.style.border = "2px solid white";
          el.style.cursor = "pointer";

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat([lon, lat])
            .setPopup(
              new maplibregl.Popup().setHTML(`
                <div class="text-sm">
                  <p class="font-semibold">Véhicule ${entity.vehicle?.vehicle?.id || entity.id || "—"}</p>
                  <p>Route: ${entity.vehicle?.trip?.routeId || "—"}</p>
                  <p>Trip: ${entity.vehicle?.trip?.tripId || "—"}</p>
                </div>
              `)
            )
            .addTo(map.current!);

          markers.push(marker);
        }
      }
    });

    markersRef.current = markers;

    if (markers.length > 0 && map.current && !hasInitializedRef.current) {
      const bounds = new maplibregl.LngLatBounds();
      markers.forEach((marker) => {
        const lngLat = marker.getLngLat();
        bounds.extend([lngLat.lng, lngLat.lat]);
      });
      map.current.fitBounds(bounds, { padding: 50 });
      hasInitializedRef.current = true;
    }
  }, [parsed, isMapLoaded]);

  if (!parsed) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-4 px-4 pt-20">
        <p className="text-slate-400">Aucun flux chargé. Retournez à la page d&apos;accueil pour charger un flux.</p>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full pt-16">
      <div ref={mapContainer} className="h-full w-full" />
      <div className="absolute top-20 left-4 rounded-lg border border-slate-800 bg-slate-900/90 px-4 py-2 text-sm text-white">
        {parsed.entities.filter((e) => e.vehicle?.position).length} véhicule(s) affiché(s)
      </div>
    </div>
  );
}

