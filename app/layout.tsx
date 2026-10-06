import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const source = Source_Sans_3({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-source",
  display: "swap",
});

const barlow = Barlow_Condensed({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  variable: "--font-barlow",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Kuşçuoğlu Hafriyat",
    template: "%s · Kuşçuoğlu Hafriyat",
  },
  description:
    "Temel ve kanal kazısı, dolgu, yıkım, moloz nakliyesi ve saha düzenleme. Kepçe, ekskavatör, loder ve kamyon aynı ekipte.",
  applicationName: "Kuşçuoğlu Hafriyat",
};

export const viewport: Viewport = {
  themeColor: "#1c1917",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${source.variable} ${barlow.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
