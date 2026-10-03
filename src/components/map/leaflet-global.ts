// leaflet.markercluster expects a global `L`; this module must be imported first.
import L from "leaflet";

if (typeof window !== "undefined") {
  (window as unknown as { L: typeof L }).L = L;
}

export default L;
