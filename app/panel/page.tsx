import type { Metadata } from "next";
import { PanelApp } from "@/components/panel/panel-app";

export const metadata: Metadata = {
  title: "Saha defteri",
  description: "Gelir, gider, mazot ve hazırlanmış fatura. Defter GitHub deposuna yazılır.",
};

export default function PanelPage() {
  return <PanelApp />;
}
