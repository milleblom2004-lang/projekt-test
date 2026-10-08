"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { addTiles, hatIcon, limitToWorld } from "./leaflet-setup";

export interface LatLng {
  latitude: number;
  longitude: number;
}

interface SearchResult extends LatLng {
  label: string;
}

/**
 * Choose a location by tapping the map, searching for an address or using
 * the device position. The marker is draggable for fine-tuning.
 */
export default function LocationPicker({
  value,
  onChange,
}: {
  value: LatLng | null;
  onChange: (v: LatLng) => void;
}) {
  const t = useTranslations("location");
  const locale = useLocale();
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [busy, setBusy] = useState<"search" | "locate" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!el.current) return;
    const map = L.map(el.current, {
      center: value ? [value.latitude, value.longitude] : [25, 10],
      zoom: value ? 15 : 2,
    });
    addTiles(map);
    limitToWorld(map);
    map.on("click", (e: L.LeafletMouseEvent) => {
      const ll = e.latlng.wrap();
      onChangeRef.current({ latitude: ll.lat, longitude: ll.lng });
    });
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the marker in sync with the value.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !value) return;
    const ll: L.LatLngExpression = [value.latitude, value.longitude];
    if (!markerRef.current) {
      const marker = L.marker(ll, { icon: hatIcon, draggable: true, autoPan: true }).addTo(map);
      marker.on("dragend", () => {
        const p = marker.getLatLng().wrap();
        onChangeRef.current({ latitude: p.lat, longitude: p.lng });
      });
      markerRef.current = marker;
    } else {
      markerRef.current.setLatLng(ll);
    }
  }, [value]);

  function moveTo(v: LatLng, zoom = 16) {
    onChange(v);
    mapRef.current?.flyTo([v.latitude, v.longitude], zoom, { duration: 0.8 });
  }

  async function search(e: React.FormEvent | React.MouseEvent) {
    e.preventDefault();
    if (query.trim().length < 2) return;
    setBusy("search");
    setMessage(null);
    try {
      const res = await fetch(`/api/geocode?lang=${locale}&q=${encodeURIComponent(query.trim())}`);
      const data = res.ok ? ((await res.json()) as SearchResult[]) : [];
      if (!res.ok) setMessage(res.status === 429 ? t("tooManySearches") : t("searchError"));
      else if (data.length === 0) setMessage(t("noResults"));
      setResults(data);
      if (data.length === 1) {
        moveTo(data[0]);
        setResults(null);
      }
    } catch {
      setMessage(t("searchError"));
    } finally {
      setBusy(null);
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setMessage(t("locateError"));
      return;
    }
    setBusy("locate");
    setMessage(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBusy(null);
        moveTo({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }, 17);
      },
      () => {
        setBusy(null);
        setMessage(t("locateError"));
      },
      { enableHighAccuracy: true, timeout: 15_000 },
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Not a <form>: this sits inside the sighting form. */}
      <div className="flex gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") search(e as unknown as React.FormEvent);
          }}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchPlaceholder")}
          className="input !py-2"
          enterKeyHint="search"
        />
        <button type="button" onClick={search} disabled={busy !== null} className="btn-secondary shrink-0 !px-4">
          {busy === "search" ? "…" : t("search")}
        </button>
      </div>
      {results && results.length > 1 ? (
        <ul className="card divide-y-2 divide-ink/10 overflow-hidden !shadow-none">
          {results.map((r) => (
            <li key={`${r.latitude},${r.longitude}`}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-sun"
                onClick={() => {
                  moveTo(r);
                  setResults(null);
                }}
              >
                {r.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <button type="button" onClick={useMyLocation} disabled={busy !== null} className="btn-secondary self-start !py-2">
        📍 {busy === "locate" ? t("locating") : t("useMyLocation")}
      </button>
      {message ? <p className="text-sm font-semibold text-hat-dark">{message}</p> : null}
      <div
        ref={el}
        className="h-72 w-full overflow-hidden rounded-3xl border-2 border-ink sm:h-96"
        role="application"
        aria-label={t("mapLabel")}
      />
      <p className="text-sm text-ink/70">{value ? t("dragHint") : t("tapHint")}</p>
    </div>
  );
}
