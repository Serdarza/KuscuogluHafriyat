"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CompanyCard } from "@/components/site/company-card";
import { Wordmark } from "@/components/site/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExpenseDesk, FuelDesk, IncomeDesk } from "@/components/panel/records";
import { FieldSelect } from "@/components/panel/fields";
import { InvoiceDesk } from "@/components/panel/invoices";
import { LedgerProvider, useLedger } from "@/components/panel/ledger-context";
import { Overview } from "@/components/panel/overview";
import { MONTHS_LONG, defaultFilter, formatDateTime } from "@/lib/format";
import type { PeriodFilter, PeriodMode } from "@/lib/types";

const SECTIONS = [
  { id: "ozet", label: "Özet" },
  { id: "gelir", label: "Gelir" },
  { id: "gider", label: "Gider" },
  { id: "mazot", label: "Mazot" },
  { id: "faturalar", label: "Faturalar" },
  { id: "firma", label: "Firma kartı" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

export function PanelApp() {
  return (
    <LedgerProvider>
      <PanelScreen />
    </LedgerProvider>
  );
}

function PanelScreen() {
  const ledger = useLedger();
  const [section, setSection] = useState<SectionId>("ozet");
  const [filter, setFilter] = useState<PeriodFilter>(() => defaultFilter());

  const years = useMemo(() => {
    const found = new Set<string>([String(new Date().getFullYear()), filter.year]);
    for (const row of [...ledger.ledger.incomes, ...ledger.ledger.expenses, ...ledger.ledger.fuels]) {
      found.add(row.date.slice(0, 4));
    }
    return [...found].filter(Boolean).sort();
  }, [filter, ledger.ledger]);

  return (
    <div className="min-h-full bg-background">
      <header className="border-b border-white/10 bg-ink text-paper">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" aria-label="Siteye dön">
            <Wordmark />
          </Link>
          <div className="text-right">
            <p className="font-display text-2xl leading-none sm:text-3xl">Saha defteri</p>
            <p className="text-xs text-paper/70">Giriş yok · bu tarayıcı</p>
          </div>
        </div>
      </header>
      <div className="border-b border-ochre/40 bg-[#3f2e24] px-4 py-2 text-sm text-paper sm:px-6">
        Kayıtlar yalnızca bu tarayıcıda durur. Başka cihazda, gizli pencerede veya tarayıcı verisi silinince görünmez.
      </div>
      {!ledger.persistent && ledger.status === "ready" ? (
        <div className="bg-destructive px-4 py-2 text-sm text-white sm:px-6">
          {ledger.error || "Tarayıcı kaydı yazılamadı. Değişiklikler bu oturumda kalır."}
        </div>
      ) : null}

      <div className="mx-auto grid max-w-6xl gap-5 px-4 py-5 sm:px-6">
        {ledger.status === "loading" ? <PanelLoading /> : null}
        {ledger.status === "error" ? (
          <div className="rounded-xl bg-card p-6 ring-1 ring-foreground/10">
            <p className="text-xs font-semibold tracking-[0.16em] text-destructive uppercase">Defter açılamadı</p>
            <h1 className="mt-2 text-2xl font-semibold">Kayıt okunamadı</h1>
            <p className="mt-2 text-sm text-muted-foreground">{ledger.error}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" onClick={ledger.retry}>Tekrar dene</Button>
              <Button type="button" variant="outline" onClick={ledger.openMemoryCopy}>
                Örnek defteri aç
              </Button>
            </div>
          </div>
        ) : null}
        {ledger.status === "ready" ? (
          <>
            <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Defter bölümleri">
              {SECTIONS.map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  variant={section === item.id ? "default" : "outline"}
                  className="h-9 shrink-0 px-3"
                  aria-current={section === item.id ? "page" : undefined}
                  onClick={() => setSection(item.id)}
                >
                  {item.label}
                </Button>
              ))}
            </nav>
            <FilterBar filter={filter} years={years} onChange={setFilter} />
            {section === "ozet" ? <Overview filter={filter} /> : null}
            {section === "gelir" ? <IncomeDesk filter={filter} /> : null}
            {section === "gider" ? <ExpenseDesk filter={filter} /> : null}
            {section === "mazot" ? <FuelDesk filter={filter} /> : null}
            {section === "faturalar" ? <InvoiceDesk filter={filter} /> : null}
            {section === "firma" ? (
              <div className="grid gap-4">
                <CompanyCard />
                <section className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
                  <h2 className="text-lg font-semibold">Bu tarayıcıdaki teklif talepleri</h2>
                  {ledger.quotes.length === 0 ? (
                    <p className="mt-2 text-sm text-muted-foreground">Henüz talep yok. İletişim formundan gelenler burada durur.</p>
                  ) : (
                    <ul className="mt-3 grid gap-3">
                      {ledger.quotes.map((quote) => (
                        <li key={quote.id} className="border-t border-border pt-3 text-sm">
                          <p className="font-medium">{quote.name} · {quote.jobType}</p>
                          <p className="text-muted-foreground">
                            {quote.place} · {quote.phone || quote.email} · {formatDateTime(quote.createdAt)}
                          </p>
                          {quote.message ? <p className="mt-1">{quote.message}</p> : null}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}

function FilterBar({
  filter,
  years,
  onChange,
}: {
  filter: PeriodFilter;
  years: string[];
  onChange: (filter: PeriodFilter) => void;
}) {
  const rangeInvalid = filter.mode === "range" && filter.from && filter.to && filter.from > filter.to;
  return (
    <div className="grid gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:grid-cols-2 lg:grid-cols-4">
      <FieldSelect
        label="Dönem"
        value={filter.mode}
        onChange={(mode) => onChange({ ...filter, mode: mode as PeriodMode })}
        options={[
          { value: "month", label: "Ay" },
          { value: "year", label: "Yıl" },
          { value: "range", label: "Tarih aralığı" },
          { value: "all", label: "Tüm kayıtlar" },
        ]}
      />
      {filter.mode === "month" ? (
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Ay</span>
          <Input
            className="h-10"
            type="month"
            value={filter.month}
            onChange={(event) =>
              onChange({
                ...filter,
                month: event.target.value,
                year: event.target.value.slice(0, 4) || filter.year,
              })
            }
          />
        </label>
      ) : null}
      {filter.mode === "year" ? (
        <FieldSelect
          label="Yıl"
          value={filter.year}
          onChange={(year) => onChange({ ...filter, year })}
          options={years.map((year) => ({ value: year, label: year }))}
        />
      ) : null}
      {filter.mode === "range" ? (
        <>
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium">Başlangıç</span>
            <Input className="h-10" type="date" value={filter.from} onChange={(event) => onChange({ ...filter, from: event.target.value })} />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium">Bitiş</span>
            <Input className="h-10" type="date" value={filter.to} onChange={(event) => onChange({ ...filter, to: event.target.value })} />
          </label>
        </>
      ) : null}
      <div className="flex items-end">
        <Button type="button" variant="outline" className="h-10" onClick={() => onChange(defaultFilter())}>
          Bu aya dön
        </Button>
      </div>
      {rangeInvalid ? (
        <p className="text-sm text-destructive sm:col-span-2 lg:col-span-4">
          Başlangıç, bitişten sonra. Aralık boş sonuç verir.
        </p>
      ) : null}
      <p className="text-xs text-muted-foreground sm:col-span-2 lg:col-span-4">
        {filter.mode === "month"
          ? `${MONTHS_LONG[Number(filter.month.slice(5)) - 1] ?? ""} ${filter.month.slice(0, 4)} seçili.`
          : null}
      </p>
    </div>
  );
}

function PanelLoading() {
  return (
    <div className="grid gap-3" aria-busy="true" aria-live="polite">
      <p className="text-sm text-muted-foreground">Defter yükleniyor…</p>
      <div className="grid gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}
