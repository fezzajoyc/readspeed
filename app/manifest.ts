import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Readspeed — reading & typing speed tools",
    short_name: "Readspeed",
    description:
      "Free reading-time estimates, a 60-second WPM typing test and book progress tracking — all running locally in your browser. Nothing is uploaded.",
    start_url: "/en",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
