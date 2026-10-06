"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { MonthlyChart, YearlyChart } from "@/components/panel/charts";
import { useLedger } from "@/components/panel/ledger-context";
import {
  MONTHS_SHORT,
  PAYMENT_LABEL,
  chartYear,
  formatDate,
  formatNumber,
  formatTry,
  inPeriod,
  invoiceGross,
  todayIso,
  withVat,
} from "@/lib/format";
import type { PeriodFilter } from "@/lib/types";

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

export function Overview({
  filter,
  onOpen,
}: {
  filter: PeriodFilter;
  onOpen: (section: "gelir" | "faturalar") => void;
}) {
  const { ledger, removeSamples } = useLedger();
  const year = chartYear(filter);

  const stats = useMemo(() => {
    const incomes = ledger.incomes.filter((row) => inPeriod(row.date, filter));
    const expenses = ledger.expenses.filter((row) => inPeriod(row.date, filter));
    const fuels = ledger.fuels.filter((row) => inPeriod(row.date, filter));
    const gelirNet = sum(incomes.map((row) => row.amount));
    const gelir = sum(incomes.map((row) => withVat(row.amount, row.vatRate)));
    const gider = sum(expenses.map((row) => row.amount));
    const litres = sum(fuels.map((row) => row.litres));
    const bekleyen = sum(
      incomes
        .filter((row) => row.paymentStatus === "beklemede")
        .map((row) => withVat(row.amount, row.vatRate)),
    );
    return { gelir, gelirNet, gider, net: gelir - gider, litres, bekleyen, count: incomes.length + expenses.length };
  }, [filter, ledger]);

  const monthly = useMemo(
    () =>
      MONTHS_SHORT.map((label, index) => {
        const month = `${year}-${String(index + 1).padStart(2, "0")}`;
        const gelir = sum(
          ledger.incomes
            .filter((row) => row.date.startsWith(month))
            .map((row) => withVat(row.amount, row.vatRate)),
        );
        const gider = sum(
          ledger.expenses.filter((row) => row.date.startsWith(month)).map((row) => row.amount),
        );
        return { label, gelir, gider };
      }),
    [ledger, year],
  );

  const yearly = useMemo(() => {
    const years = new Set<string>();
    for (const row of [...ledger.incomes, ...ledger.expenses]) years.add(row.date.slice(0, 4));
    return [...years].sort().map((label) => {
      const gelir = sum(
        ledger.incomes
          .filter((row) => row.date.startsWith(label))
          .map((row) => withVat(row.amount, row.vatRate)),
      );
      const gider = sum(
        ledger.expenses.filter((row) => row.date.startsWith(label)).map((row) => row.amount),
      );
      return { label, gelir, gider, net: gelir - gider };
    });
  }, [ledger]);

  const today = todayIso();
  const unpaidInvoices = ledger.invoices
    .filter((row) => row.paymentStatus !== "odendi")
    .sort((a, b) => a.date.localeCompare(b.date));
  const overdueInvoices = unpaidInvoices.filter((row) => row.date < today);
  const unpaidIncome = ledger.incomes
    .filter((row) => row.paymentStatus !== "odendi")
    .sort((a, b) => a.date.localeCompare(b.date));
  const missingInvoice = ledger.incomes
    .filter((row) => !row.invoiceId)
    .sort((a, b) => a.date.localeCompare(b.date));

  const sampleCount =
    ledger.incomes.filter((row) => row.sample).length +
    ledger.expenses.filter((row) => row.sample).length +
    ledger.fuels.filter((row) => row.sample).length +
    ledger.invoices.filter((row) => row.sample).length;

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Gelir" value={formatTry(stats.gelir)} note={`KDV hariç ${formatTry(stats.gelirNet)}`} />
        <Kpi label="Gider" value={formatTry(stats.gider)} note="Mazot, bakım, işçilik ve diğer" />
        <Kpi label="Net" value={formatTry(stats.net)} note={`Bekleyen ${formatTry(stats.bekleyen)}`} />
        <Kpi label="Mazot" value={`${formatNumber(stats.litres, 0)} L`} note="Seçili dönem, litre" />
      </div>
      {stats.count === 0 ? (
        <p className="rounded-xl bg-card px-4 py-8 text-center text-sm text-muted-foreground ring-1 ring-foreground/10">
          Bu dönemde kayıt yok. Ayı, yılı veya aralığı değiştirin.
        </p>
      ) : null}
      <section className="rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
        <h2 className="text-lg font-semibold">Aylık gelir ve gider · {year}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Kartlar seçili dönemi toplar. Bu grafik seçili yılın on iki ayını gösterir.
        </p>
        <MonthlyChart data={monthly} />
      </section>
      <section className="rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
        <h2 className="text-lg font-semibold">Yıllık eğilim</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tüm defter. Filtre yılı daraltsa da eğilim yılların tamamına bakar.
        </p>
        <YearlyChart data={yearly} />
      </section>
      <section className="grid gap-3">
        <div>
          <h2 className="text-lg font-semibold">Hatırlatma</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ödenmemiş ve gecikmiş faturalar, bekleyen gelir ve faturası kesilmemiş işler. Liste tüm deftere bakar, seçili aya kilitli değildir.
          </p>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          <ReminderCard
            title="Ödenmemiş faturalar"
            empty="Ödenmemiş fatura yok."
            action="Faturalara git"
            onAction={() => onOpen("faturalar")}
            rows={unpaidInvoices.map((row) => ({
              id: row.id,
              title: row.customerType === "sirket" ? row.unvan || row.number : row.adSoyad || row.number,
              meta: `${row.number} · ${formatDate(row.date)} · ${PAYMENT_LABEL[row.paymentStatus]}${row.date < today ? " · Gecikti" : ""}${row.sample ? " · Örnek" : ""}`,
              amount: formatTry(invoiceGross(row)),
            }))}
          />
          <ReminderCard
            title="Gecikmiş faturalar"
            empty="Vadesi geçmiş ödenmemiş fatura yok."
            action="Faturalara git"
            onAction={() => onOpen("faturalar")}
            rows={overdueInvoices.map((row) => ({
              id: row.id,
              title: row.customerType === "sirket" ? row.unvan || row.number : row.adSoyad || row.number,
              meta: `${row.number} · ${formatDate(row.date)} · ${PAYMENT_LABEL[row.paymentStatus]}${row.sample ? " · Örnek" : ""}`,
              amount: formatTry(invoiceGross(row)),
            }))}
          />
          <ReminderCard
            title="Ödenmemiş gelir"
            empty="Bekleyen gelir yok."
            action="Gelire git"
            onAction={() => onOpen("gelir")}
            rows={unpaidIncome.map((row) => ({
              id: row.id,
              title: row.name,
              meta: `${formatDate(row.date)} · ${row.jobType} · ${PAYMENT_LABEL[row.paymentStatus]}${row.sample ? " · Örnek" : ""}`,
              amount: formatTry(withVat(row.amount, row.vatRate)),
            }))}
          />
          <ReminderCard
            title="Fatura vermeyen"
            empty="Faturaya bağlanmamış gelir yok."
            action="Gelire git"
            onAction={() => onOpen("gelir")}
            rows={missingInvoice.map((row) => ({
              id: row.id,
              title: row.name,
              meta: `${formatDate(row.date)} · ${row.jobType}${row.paymentStatus !== "odendi" ? " · Ödenmedi" : ""}${row.sample ? " · Örnek" : ""}`,
              amount: formatTry(withVat(row.amount, row.vatRate)),
            }))}
          />
        </div>
      </section>
      {sampleCount > 0 ? (
        <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-dashed border-clay/40 bg-card px-4 py-4 sm:flex-row sm:items-center">
          <p className="text-sm">
            Defterde <strong>{sampleCount}</strong> örnek kayıt var. Grafikler bunlar sayesinde dolu. Silebilir, tek tek düzeltebilirsiniz.
          </p>
          <Button type="button" variant="outline" onClick={removeSamples}>
            Örnek kayıtları sil
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function ReminderCard({
  title,
  empty,
  rows,
  action,
  onAction,
}: {
  title: string;
  empty: string;
  action: string;
  onAction: () => void;
  rows: Array<{ id: string; title: string; meta: string; amount: string }>;
}) {
  return (
    <article className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold">
          {title}
          <span className="ml-2 text-sm font-medium text-clay">{rows.length}</span>
        </h3>
        <Button type="button" variant="ghost" size="sm" onClick={onAction}>
          {action}
        </Button>
      </div>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-3 max-h-72 space-y-2 overflow-y-auto">
          {rows.map((row) => (
            <li key={row.id} className="border-t border-border pt-2 text-sm">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium">{row.title}</p>
                <p className="shrink-0 font-semibold">{row.amount}</p>
              </div>
              <p className="text-xs text-muted-foreground">{row.meta}</p>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function Kpi({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <p className="text-xs font-semibold tracking-[0.14em] text-clay uppercase">{label}</p>
      <p className="mt-2 font-display text-4xl leading-none">{value}</p>
      <p className="mt-2 text-xs text-muted-foreground">{note}</p>
    </article>
  );
}
