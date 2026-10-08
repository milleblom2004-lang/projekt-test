"use client";

import L from "./leaflet-global";
import "leaflet.markercluster";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { addTiles, hatIcon, limitToWorld } from "./leaflet-setup";
import { deviceLocale, format } from "../LocalTime";
import { thumbUrl } from "@/lib/images";
import { placeLabel } from "@/lib/place";
import type { MapSighting } from "@/app/api/map/route";

export default function SightingsMap() {
  const t = useTranslations("map");
  const locale = useLocale();
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!el.current) return;
    const map = L.map(el.current, {
      center: [25, 10],
      zoom: 2,
      zoomControl: false,
    });
    L.control.zoom({ position: "topright" }).addTo(map);
    addTiles(map);
    limitToWorld(map);
    mapRef.current = map;

    // Zoom to the visitor's area only if they have already granted location access.
    navigator.permissions
      ?.query({ name: "geolocation" as PermissionName })
      .then((p) => {
        if (p.state === "granted") locate(map);
      })
      .catch(() => undefined);

    const clusters = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 50,
      iconCreateFunction: (cluster) => {
        const n = cluster.getChildCount();
        const size = n < 10 ? 40 : n < 100 ? 48 : 56;
        return L.divIcon({
          html: `<div><span>${n}</span></div>`,
          className: "hat-cluster",
          iconSize: [size, size],
        });
      },
    });
    map.addLayer(clusters);

    let cancelled = false;
    fetch("/api/map")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((rows: MapSighting[]) => {
        if (cancelled) return;
        const markers = rows.map((s) =>
          L.marker([s.lat, s.lng], { icon: hatIcon, title: s.place_name ?? "" }).bindPopup(
            () => popupContent(s),
            { maxWidth: 240, minWidth: 220 },
          ),
        );
        clusters.addLayers(markers);
        setCount(rows.length);
        setStatus("ready");
      })
      .catch(() => !cancelled && setStatus("error"));

    function popupContent(s: MapSighting) {
      const root = document.createElement("div");
      root.className = "flex flex-col gap-1.5";
      const img = document.createElement("img");
      img.src = thumbUrl(s.image_url);
      img.alt = t("photoAlt");
      img.loading = "lazy";
      img.className = "aspect-square w-full rounded-xl border-2 border-[#1d3557] object-cover";
      const meta = document.createElement("div");
      meta.className = "text-xs font-semibold opacity-70";
      meta.textContent = [format(s.sighted_at, deviceLocale(locale), false), placeLabel(s, locale)]
        .filter(Boolean)
        .join(" · ");
      const by = document.createElement("div");
      by.className = "text-sm font-bold";
      by.textContent = t("by", { name: s.display_name ?? t("anonymous") });
      root.append(img, meta);
      if (s.description) {
        const desc = document.createElement("p");
        desc.className = "!m-0 text-sm";
        desc.textContent = s.description;
        root.append(desc);
      }
      const link = document.createElement("a");
      link.href = `/s/${s.id}`;
      link.className = "font-bold !text-[#b8202d] underline";
      link.textContent = t("viewDetails");
      root.append(by, link);
      return root;
    }

    return () => {
      cancelled = true;
      map.remove();
      mapRef.current = null;
    };
  }, [locale, t]);

  return (
    <div className="relative h-full w-full">
      <div ref={el} className="h-full w-full" aria-label={t("label")} role="region" />
      <div className="pointer-events-none absolute top-3 left-3 z-[500] flex flex-col items-start gap-2">
        <span className="rounded-full border-2 border-ink bg-white px-3 py-1 text-sm font-bold shadow-chunky-sm">
          {status === "loading" ? t("loading") : status === "error" ? t("error") : t("count", { count })}
        </span>
        <button
          type="button"
          onClick={() => mapRef.current && locate(mapRef.current)}
          className="btn-secondary pointer-events-auto !px-3 !py-1 text-sm"
        >
          📍 {t("nearMe")}
        </button>
      </div>
    </div>
  );
}

function locate(map: L.Map) {
  navigator.geolocation?.getCurrentPosition(
    (pos) => map.flyTo([pos.coords.latitude, pos.coords.longitude], 10, { duration: 1.2 }),
    () => undefined,
    { enableHighAccuracy: false, timeout: 10_000, maximumAge: 600_000 },
  );
}
