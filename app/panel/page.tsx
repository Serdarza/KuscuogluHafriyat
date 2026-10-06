import type { Metadata } from "next";
import { PanelApp } from "@/components/panel/panel-app";

export const metadata: Metadata = {
  title: "Saha defteri",
  description: "Gelir, gider, mazot ve hazırlanmış fatura. Kayıtlar bu tarayıcıda kalır.",
};

export default function PanelPage() {
  return <PanelApp />;
}
