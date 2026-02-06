import type { Metadata } from "next";
import { Instrument_Serif, DM_Sans } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Anspruch123 - Ihr Recht. Online durchgesetzt.",
    template: "%s | Anspruch123",
  },
  description:
    "Rechtsprobleme? Prüfen Sie kostenlos Ihren Anspruch und setzen Sie Ihr Recht durch - ohne Anwaltstermin, ohne kompliziertes Juristendeutsch.",
  keywords: [
    "Rechtsportal",
    "Online Rechtsberatung",
    "Kündigung prüfen",
    "Mietrecht",
    "Arbeitsrecht",
    "Verbraucherrecht",
    "Bußgeld anfechten",
    "DSGVO",
    "Rechtsdurchsetzung",
  ],
  authors: [{ name: "Anspruch123" }],
  creator: "Anspruch123",
  publisher: "Anspruch123",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://anspruch123.de"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: "/",
    siteName: "Anspruch123",
    title: "Anspruch123 - Ihr Recht. Online durchgesetzt.",
    description:
      "Rechtsprobleme? Prüfen Sie kostenlos Ihren Anspruch und setzen Sie Ihr Recht durch - ohne Anwaltstermin, ohne kompliziertes Juristendeutsch.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Anspruch123 - Ihr Recht. Online durchgesetzt.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Anspruch123 - Ihr Recht. Online durchgesetzt.",
    description:
      "Rechtsprobleme? Prüfen Sie kostenlos Ihren Anspruch und setzen Sie Ihr Recht durch.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${instrumentSerif.variable} ${dmSans.variable}`}
    >
      <body className="min-h-screen bg-[var(--color-background)] font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
