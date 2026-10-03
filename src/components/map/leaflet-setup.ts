import L from "leaflet";

export const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const HAT_PIN = `
<svg viewBox="0 0 40 52" width="34" height="44" aria-hidden="true">
  <path d="M20 51 C12 40 3 31 3 19 A17 17 0 0 1 37 19 C37 31 28 40 20 51Z" fill="#1d3557"/>
  <circle cx="20" cy="19" r="14" fill="#fff8ec"/>
  <g transform="rotate(-8 20 20)">
    <path d="M13.5 26 L12.5 9 C17 7 23 7 27.5 9 L26.5 26Z" fill="#fff" stroke="#1d3557" stroke-width="1.6"/>
    <path d="M12.9 12.5 L27.1 12.5 L27.3 9 C23 7 17 7 12.7 9Z" fill="#e63946"/>
    <rect x="13.1" y="16" width="13.8" height="3.4" fill="#e63946"/>
    <rect x="13.4" y="22" width="13.2" height="3.4" fill="#e63946"/>
    <ellipse cx="20" cy="27" rx="11" ry="3" fill="#e63946" stroke="#1d3557" stroke-width="1.6"/>
  </g>
</svg>`;

export const hatIcon = L.divIcon({
  html: HAT_PIN,
  className: "hat-marker",
  iconSize: [34, 44],
  iconAnchor: [17, 44],
  popupAnchor: [0, -40],
});

export function addTiles(map: L.Map) {
  L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION, maxZoom: 19 }).addTo(map);
}
