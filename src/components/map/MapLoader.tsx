"use client";

import dynamic from "next/dynamic";

export const SightingsMapLoader = dynamic(() => import("./SightingsMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-sky/40" />,
});

export const MiniMapLoader = dynamic(() => import("./MiniMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-sky/40" />,
});
