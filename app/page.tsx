import Link from "next/link";
import { ArrowRight, Construction, LandPlot, Pickaxe, Truck } from "lucide-react";
import { QuoteBand, SiteShell } from "@/components/site/shell";
import { buttonVariants } from "@/components/ui/button";
import { fleet, jobs, services, steps } from "@/lib/content";
import { cn } from "@/lib/utils";

const figures = [
  { value: "4", label: "makine sınıfı", note: "Ekskavatör, kepçe, loder, kamyon" },
  { value: "m³", label: "kazı ve dolgu", note: "Hacim sahada ölçülür" },
  { value: "sefer", label: "moloz nakliyesi", note: "Damperli kamyonla çıkar" },
  { value: "KDV", label: "teklifte ayrı", note: "Kalem kalem yazılır" },
];

export default function HomePage() {
  return (
    <SiteShell>
      <section className="hero-grid text-paper">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-ochre uppercase">
              Hafriyat · kazı · nakliye
            </p>
            <h1 className="mt-4 font-display text-6xl leading-[0.9] tracking-tight sm:text-7xl lg:text-8xl">
              Kazı bitsin,
              <span className="block text-ochre">saha düzgün kalsın.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-paper/80">
              Kuşçuoğlu Hafriyat; temel ve kanal kazısı, dolgu, yıkım, moloz nakliyesi ve saha düzenlemeyi aynı ekipte yürütür. Kepçe, ekskavatör, loder ve kamyon işi birlikte programlanır.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/iletisim" className={cn(buttonVariants({ size: "lg" }), "h-11 bg-ochre px-5 text-base text-ink hover:bg-ochre/90")}>
                Teklif iste
              </Link>
              <Link href="/filo" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 border-white/25 bg-transparent px-5 text-base text-paper hover:bg-white/5 hover:text-paper")}>
                Filoyu gör
              </Link>
            </div>
          </div>
          <ExcavatorArt />
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-white/10 sm:grid-cols-4">
            {["Temel çukuru", "Hendek", "Dolgu", "Yıkım"].map((item) => (
              <p key={item} className="bg-ink px-4 py-4 text-sm tracking-wide text-paper/80 sm:px-6">
                {item}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-clay uppercase">İşler</p>
            <h2 className="mt-2 font-display text-5xl leading-none">Sahada ne yapılır</h2>
          </div>
          <Link href="/hizmetler" className="hidden items-center gap-1 text-sm font-semibold text-clay sm:inline-flex">
            Tüm hizmetler <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.slice(0, 4).map((service) => (
            <article key={service.title} className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
              <h3 className="font-display text-3xl leading-none">{service.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{service.summary}</p>
              <p className="mt-4 text-xs font-semibold tracking-wide text-clay uppercase">{service.measure}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card paper-grid">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-clay uppercase">Filo</p>
            <h2 className="mt-2 font-display text-5xl leading-none">Dört sınıf, tek program</h2>
            <p className="mt-4 text-muted-foreground">
              Makine plakası yayımlanmaz. Sınıf belli: kazı, yükleme ve nakliye aynı gün konuşulur.
            </p>
            <Link href="/filo" className={cn(buttonVariants({ variant: "outline" }), "mt-6 h-10 px-4")}>
              Filo sayfası
            </Link>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {fleet.map((machine) => (
              <li key={machine.name} className="rounded-xl bg-background p-4 ring-1 ring-foreground/10">
                <p className="text-xs font-semibold tracking-wide text-clay uppercase">{machine.classLabel}</p>
                <h3 className="mt-1 text-lg font-semibold">{machine.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{machine.role}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <p className="text-xs font-semibold tracking-[0.18em] text-clay uppercase">Çerçeve</p>
        <h2 className="mt-2 font-display text-5xl leading-none">İşin ölçüsü</h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Rakamlar tamamlanmış proje iddiası değil. Teklifin hangi birimle kurulduğunu gösterir.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {figures.map((figure) => (
            <article key={figure.label} className="border-t-2 border-ochre pt-4">
              <p className="font-display text-5xl text-ink">{figure.value}</p>
              <h3 className="mt-2 font-semibold">{figure.label}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{figure.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#ebe4d6]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-clay uppercase">Saha</p>
              <h2 className="mt-2 font-display text-5xl leading-none">Alınan iş türleri</h2>
            </div>
            <Link href="/isler" className="text-sm font-semibold text-clay">
              Tümü
            </Link>
          </div>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Müşteri adı ve adres yayımlanmaz. Aşağıdakiler işin cinsini ve ölçüsünü anlatır.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {jobs.slice(0, 4).map((job) => (
              <article key={job.title} className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
                <p className="text-xs font-semibold tracking-wide text-clay uppercase">{job.kind}</p>
                <h3 className="mt-2 text-xl font-semibold">{job.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{job.summary}</p>
                <p className="mt-4 text-sm">
                  <span className="font-semibold">{job.measure}</span>
                  <span className="text-muted-foreground"> · {job.machines}</span>
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <h2 className="font-display text-5xl leading-none">Dört adım</h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <li key={step.n}>
              <p className="font-display text-4xl text-ochre">{step.n}</p>
              <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10 hidden gap-6 text-clay lg:flex" aria-hidden>
          <Construction className="size-5" />
          <Pickaxe className="size-5" />
          <Truck className="size-5" />
          <LandPlot className="size-5" />
        </div>
      </section>
      <QuoteBand />
    </SiteShell>
  );
}

function ExcavatorArt() {
  return (
    <svg viewBox="0 0 640 420" className="w-full" role="img" aria-label="Ekskavatör çizimi">
      <rect x="40" y="300" width="560" height="8" fill="#c4843a" />
      <path d="M70 308 L180 250 L250 308 Z" fill="#8c5a3c" opacity="0.85" />
      <rect x="150" y="248" width="210" height="52" rx="6" fill="#f6f1e7" />
      <rect x="168" y="232" width="78" height="40" rx="4" fill="#c4843a" />
      <rect x="184" y="240" width="46" height="18" fill="#1c1917" />
      <rect x="188" y="300" width="28" height="22" fill="#3f2e24" />
      <rect x="292" y="300" width="28" height="22" fill="#3f2e24" />
      <path d="M360 268 H470 L430 248 H390 Z" fill="#e7e0d4" />
      <path d="M430 248 L520 150 L548 168 L458 270 Z" fill="#f6f1e7" />
      <path d="M520 150 L575 190 L560 208 L500 172 Z" fill="#c4843a" />
      <path d="M560 208 L600 230 L575 248 L540 214 Z" fill="#3f2e24" />
      <circle cx="202" cy="322" r="16" fill="#1c1917" />
      <circle cx="306" cy="322" r="16" fill="#1c1917" />
      <text x="40" y="360" fill="#e7e0d4" fontSize="18" fontFamily="sans-serif">
        Paletli kazı · kamyon bekler
      </text>
    </svg>
  );
}
