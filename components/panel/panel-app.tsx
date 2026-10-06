"use client";

import { useMemo, useState } from "react";
import { Building2, FileText, Fuel, LayoutDashboard, Receipt, Wallet } from "lucide-react";
import { BrandLogo, PhoneLink } from "@/components/site/brand-mark";
import { CompanyCard } from "@/components/site/company-card";
import { brand } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GithubSettingsCard } from "@/components/panel/github-settings";
import { ExpenseDesk, FuelDesk, IncomeDesk } from "@/components/panel/records";
import { FieldSelect } from "@/components/panel/fields";
import { InvoiceDesk } from "@/components/panel/invoices";
import { LedgerProvider, useLedger } from "@/components/panel/ledger-context";
import { Overview } from "@/components/panel/overview";
import { MONTHS_LONG, defaultFilter } from "@/lib/format";
import type { PeriodFilter, PeriodMode } from "@/lib/types";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "ozet", label: "Özet", icon: LayoutDashboard },
  { id: "gelir", label: "Gelir", icon: Wallet },
  { id: "gider", label: "Gider", icon: Receipt },
  { id: "mazot", label: "Mazot", icon: Fuel },
  { id: "faturalar", label: "Fatura", icon: FileText },
  { id: "firma", label: "Firma", icon: Building2 },
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
    for (const row of [...ledger.ledger.incomes, ...ledger.ledger.expenses, ...ledger.ledger.fuels, ...ledger.ledger.invoices]) {
      found.add(row.date.slice(0, 4));
    }
    return [...found].filter(Boolean).sort();
  }, [filter, ledger.ledger]);

  const syncTone =
    ledger.sync.phase === "error"
      ? "bg-destructive text-white"
      : ledger.sync.phase === "local"
        ? "bg-[#3f2e24] text-paper"
        : "bg-ink text-paper";

  return (
    <div className="min-h-full bg-background pb-24">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-ink text-paper">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-3 py-2 sm:px-6">
          <button type="button" className="shrink-0" onClick={() => setSection("ozet")} aria-label="Özete dön">
            <BrandLogo className="h-12 w-12 sm:h-16 sm:w-16" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="font-display text-2xl leading-none sm:text-3xl">Saha defteri</p>
            <p className="truncate text-xs text-paper/70">{brand.owner}</p>
          </div>
          <PhoneLink className="shrink-0 text-sm font-semibold text-ochre" />
        </div>
      </header>
      <div className={cn("px-3 py-2 text-sm sm:px-6", syncTone)}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2">
          <p>{ledger.sync.detail}</p>
          {!ledger.sync.hasToken && ledger.status === "ready" ? (
            <Button
              type="button"
              variant="outline"
              className="h-8 border-white/30 bg-transparent px-3 text-inherit hover:bg-white/10 hover:text-inherit"
              onClick={() => setSection("firma")}
            >
              Bağla
            </Button>
          ) : null}
          {ledger.sync.phase === "error" && ledger.sync.hasToken ? (
            <Button
              type="button"
              variant="outline"
              className="h-8 border-white/30 bg-transparent px-3 text-inherit hover:bg-white/10 hover:text-inherit"
              onClick={ledger.pushToGithub}
            >
              Şimdi kaydet
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-5 px-3 py-5 sm:px-6">
        {ledger.status === "loading" ? <PanelLoading /> : null}
        {ledger.status === "error" ? (
          <div className="rounded-xl bg-card p-6 ring-1 ring-foreground/10">
            <p className="text-xs font-semibold tracking-[0.16em] text-destructive uppercase">Defter açılamadı</p>
            <h1 className="mt-2 text-2xl font-semibold">Kayıt okunamadı</h1>
            <p className="mt-2 text-sm text-muted-foreground">{ledger.error}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" onClick={ledger.retry}>Tekrar dene</Button>
              <Button type="button" variant="outline" onClick={ledger.openSample}>
                Örnek defteri aç
              </Button>
            </div>
          </div>
        ) : null}
        {ledger.status === "ready" ? (
          <>
            <FilterBar filter={filter} years={years} onChange={setFilter} />
            {section === "ozet" ? <Overview filter={filter} onOpen={setSection} /> : null}
            {section === "gelir" ? <IncomeDesk filter={filter} /> : null}
            {section === "gider" ? <ExpenseDesk filter={filter} /> : null}
            {section === "mazot" ? <FuelDesk filter={filter} /> : null}
            {section === "faturalar" ? <InvoiceDesk filter={filter} /> : null}
            {section === "firma" ? (
              <div className="grid gap-4">
                <CompanyCard />
                <GithubSettingsCard />
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink pb-[env(safe-area-inset-bottom)] text-paper"
        aria-label="Defter bölümleri"
      >
        <div className="mx-auto grid max-w-lg grid-cols-6">
          {SECTIONS.map((item) => {
            const Icon = item.icon;
            const active = section === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] font-medium",
                  active ? "text-ochre" : "text-paper/70",
                )}
                aria-current={active ? "page" : undefined}
                onClick={() => setSection(item.id)}
              >
                <Icon className="size-5" aria-hidden />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>
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
    <div className="grid gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
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
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium">Başlangıç</span>
            <Input className="h-10" type="date" value={filter.from} onChange={(event) => onChange({ ...filter, from: event.target.value })} />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium">Bitiş</span>
            <Input className="h-10" type="date" value={filter.to} onChange={(event) => onChange({ ...filter, to: event.target.value })} />
          </label>
        </div>
      ) : null}
      <div>
        <Button type="button" variant="outline" className="h-10" onClick={() => onChange(defaultFilter())}>
          Bu aya dön
        </Button>
      </div>
      {rangeInvalid ? (
        <p className="text-sm text-destructive">Başlangıç, bitişten sonra. Aralık boş sonuç verir.</p>
      ) : null}
      <p className="text-xs text-muted-foreground">
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
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}
