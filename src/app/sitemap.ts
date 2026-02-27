import type { MetadataRoute } from "next";

const baseUrl = "https://www.martinmxpark.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "/",
    "/track-info",
    "/register",
    "/schedule",
    "/gallery",
    "/sponsors",
    "/hiring",
    "/daily-signup",
    "/contact",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
