import type { Metadata } from "next";
import { PanelApp } from "@/components/panel/panel-app";

export const metadata: Metadata = {
  title: "Saha defteri",
  description:
    "Kuşçuoğlu Hafriyat saha defteri. Gelir, gider, mazot, grafikler ve hazırlanmış fatura. Sahip Bedir Berk Kuşçu.",
};

export default function HomePage() {
  return <PanelApp />;
}
