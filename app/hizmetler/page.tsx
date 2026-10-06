import type { Metadata } from "next";
import { PageIntro, QuoteBand, SiteShell } from "@/components/site/shell";
import { services } from "@/lib/content";

export const metadata: Metadata = {
  title: "Hizmetler",
  description: "Hafriyat, kepçe, kazı, dolgu, yıkım, moloz nakliyesi, temel ve kanal kazısı, saha düzenleme.",
};

export default function ServicesPage() {
  return (
    <SiteShell>
      <PageIntro
        kicker="Hizmetler"
        title="Kazıdan teslim kotuna."
        lede="Her iş aynı listededir: ne kazılacak, ne doldurulacak, moloz nereye gidecek, hangi makine girecek. KDV satırı tekliften düşmez."
      />
      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-14 sm:px-6 md:grid-cols-2">
        {services.map((service, index) => (
          <article key={service.title} className="rounded-xl bg-card p-6 ring-1 ring-foreground/10">
            <p className="font-display text-4xl text-ochre">{String(index + 1).padStart(2, "0")}</p>
            <h2 className="mt-2 text-2xl font-semibold">{service.title}</h2>
            <p className="mt-2 text-sm font-medium text-clay">{service.summary}</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{service.body}</p>
            <p className="mt-4 text-xs font-semibold tracking-[0.14em] uppercase">Ölçü: {service.measure}</p>
          </article>
        ))}
      </section>
      <QuoteBand />
    </SiteShell>
  );
}
