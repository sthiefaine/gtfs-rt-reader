import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { Navigation } from "@/components/ui/Navigation";
import { RefreshFooterWrapper } from "@/components/layout/RefreshFooterWrapper";

export const metadata: Metadata = {
  title: {
    default: "Lecteur GTFS-RT hors ligne",
    template: "%s | Lecteur GTFS-RT"
  },
  description:
    "Visualiser des flux GTFS-RT via URL ou import, même hors connexion. Application PWA fonctionnant hors ligne avec parsing Protobuf.",
  keywords: ["GTFS-RT", "transit", "transport", "temps réel", "protobuf", "PWA", "offline"],
  authors: [{ name: "GTFS-RT Reader" }],
  creator: "GTFS-RT Reader",
  publisher: "GTFS-RT Reader",
  manifest: "/manifest.webmanifest",
  themeColor: "#0f172a",
  colorScheme: "dark",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true
  },
  icons: [
    { rel: "icon", url: "/icon.svg", type: "image/svg+xml" },
    { rel: "apple-touch-icon", url: "/icon.svg" }
  ],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    title: "Lecteur GTFS-RT hors ligne",
    description: "Visualiser des flux GTFS-RT via URL ou import, même hors connexion.",
    siteName: "Lecteur GTFS-RT"
  },
  twitter: {
    card: "summary",
    title: "Lecteur GTFS-RT hors ligne",
    description: "Visualiser des flux GTFS-RT via URL ou import, même hors connexion."
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  category: "transport",
  classification: "public"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="antialiased bg-slate-950 text-white">
        <Navigation />
        <div className="pb-16">{children}</div>
        <RefreshFooterWrapper />
      </body>
    </html>
  );
}

