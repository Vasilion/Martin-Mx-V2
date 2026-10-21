import type { MetadataRoute } from "next";
import { park } from "@/lib/park/facts";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: park.name,
    short_name: park.shortName,
    description: "Two motocross tracks in Martin, Michigan.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0b0b",
    theme_color: "#0b0b0b",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
