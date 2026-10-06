import type { Metadata } from "next";
import { PageIntro, QuoteBand, SiteShell } from "@/components/site/shell";
import { fleet } from "@/lib/content";

export const metadata: Metadata = {
  title: "Filo",
  description: "Paletli ekskavatör, lastikli kepçe, loder ve damperli kamyon.",
};

export default function FleetPage() {
  return (
    <SiteShell>
      <PageIntro
        kicker="Filo"
        title="Kepçe, ekskavatör, loder, kamyon."
        lede="Plaka ve şasi numarası burada yok. Sınıf belli: ağır kazı, şehir içi kepçe, serme ve nakliye. İşe hangi sınıfın gireceği keşifte seçilir."
      />
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-14 sm:px-6">
        {fleet.map((machine, index) => (
          <article
            key={machine.name}
            className="grid gap-6 rounded-xl bg-card p-6 ring-1 ring-foreground/10 md:grid-cols-[180px_1fr] md:p-8"
          >
            <div>
              <p className="font-display text-6xl leading-none text-ochre">{String(index + 1).padStart(2, "0")}</p>
              <p className="mt-3 text-xs font-semibold tracking-[0.16em] text-clay uppercase">{machine.classLabel}</p>
            </div>
            <div>
              <h2 className="font-display text-5xl leading-none">{machine.name}</h2>
              <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{machine.role}</p>
              <ul className="mt-5 grid gap-2 sm:grid-cols-3">
                {machine.points.map((point) => (
                  <li key={point} className="border-t border-ochre pt-2 text-sm">
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>
      <QuoteBand />
    </SiteShell>
  );
}
