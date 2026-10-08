"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import { addTiles, hatIcon, limitToWorld } from "./leaflet-setup";

export default function MiniMap({ latitude, longitude }: { latitude: number; longitude: number }) {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!el.current) return;
    const map = L.map(el.current, { center: [latitude, longitude], zoom: 14, scrollWheelZoom: false });
    addTiles(map);
    limitToWorld(map);
    L.marker([latitude, longitude], { icon: hatIcon }).addTo(map);
    return () => void map.remove();
  }, [latitude, longitude]);
  return <div ref={el} className="h-full w-full" />;
}
