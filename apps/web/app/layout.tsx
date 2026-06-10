import "../styles/global.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "🏆 Kickoff 2026 — FIFA World Cup Companion App",
  description: "Live match tickers, group standings, fixtures, schedules, team profiles and rich tournament statistics for the FIFA World Cup 2026.",
  keywords: ["FIFA World Cup 2026", "Kickoff 2026", "World Cup stats", "live football scores", "World Cup schedule"],
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://kickoff2026.vercel.app",
    title: "🏆 Kickoff 2026 — FIFA World Cup Companion App",
    description: "Follow the 2026 FIFA World Cup with live scores, standings, predictions, and detailed stats. Install as a PWA on iOS and Android!",
    siteName: "Kickoff 2026",
    images: [
      {
        url: "https://kickoff2026.vercel.app/assets/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kickoff 2026 World Cup Companion"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "🏆 Kickoff 2026 — FIFA World Cup Companion App",
    description: "Follow the 2026 FIFA World Cup with live scores, standings, predictions, and detailed stats.",
    images: ["https://kickoff2026.vercel.app/assets/og-image.png"]
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-brand-bg text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}

