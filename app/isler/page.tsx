import type { Metadata } from "next";
import { PageIntro, QuoteBand, SiteShell } from "@/components/site/shell";
import { jobs } from "@/lib/content";

export const metadata: Metadata = {
  title: "İşler",
  description: "Temel, kanal, dolgu, yıkım ve saha düzenleme iş türleri.",
};

export default function JobsPage() {
  return (
    <SiteShell>
      <PageIntro
        kicker="İşler"
        title="Referans diye uydurma adres yok."
        lede="Müşteri ünvanı ve sokak yayımlanmaz. Aşağıdaki kartlar firmanın yürüttüğü iş cinsini, ölçüyü ve makineyi gösterir."
      />
      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-14 sm:px-6 lg:grid-cols-2">
        {jobs.map((job) => (
          <article key={job.title} className="flex flex-col rounded-xl bg-card p-6 ring-1 ring-foreground/10">
            <p className="text-xs font-semibold tracking-[0.16em] text-clay uppercase">{job.kind}</p>
            <h2 className="mt-2 font-display text-4xl leading-none">{job.title}</h2>
            <p className="mt-4 flex-1 text-sm leading-6 text-muted-foreground">{job.summary}</p>
            <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Ölçü</dt>
                <dd className="font-semibold">{job.measure}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Makine</dt>
                <dd className="font-semibold">{job.machines}</dd>
              </div>
            </dl>
          </article>
        ))}
      </section>
      <QuoteBand />
    </SiteShell>
  );
}
