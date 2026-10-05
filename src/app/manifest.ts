import type { MetadataRoute } from "next";

// Makes the site installable as an app ("Add to Home Screen").
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HatSpotted",
    short_name: "HatSpotted",
    description: "Community sightings of the striped hat – a fan project",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fff8ec",
    theme_color: "#e63946",
    categories: ["entertainment", "social", "photo"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [{ name: "Hat spotted!", url: "/new", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] }],
  };
}
