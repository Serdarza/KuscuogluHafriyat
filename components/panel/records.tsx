"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog, FieldSelect, TextField } from "@/components/panel/fields";
import { useLedger } from "@/components/panel/ledger-context";
import {
  CATEGORY_LABEL,
  CUSTOMER_LABEL,
  JOB_TYPES,
  MACHINES,
  PAYMENT_LABEL,
  VAT_RATES,
  formatDate,
  formatNumber,
  formatTry,
  inPeriod,
  roundMoney,
  withVat,
} from "@/lib/format";
import type {
  Expense,
  ExpenseCategory,
  Fuel,
  Income,
  PaymentStatus,
  PeriodFilter,
} from "@/lib/types";

function SampleBadge({ sample }: { sample: boolean }) {
  if (!sample) return null;
  return <Badge variant="outline">Örnek</Badge>;
}

function EmptyRow({ text }: { text: string }) {
  return (
    <p className="rounded-xl bg-card px-4 py-10 text-center text-sm text-muted-foreground ring-1 ring-foreground/10">
      {text}
    </p>
  );
}

export function IncomeDesk({ filter }: { filter: PeriodFilter }) {
  const { ledger, addIncome, updateIncome, deleteIncome } = useLedger();
  const rows = ledger.incomes
    .filter((row) => inPeriod(row.date, filter))
    .sort((a, b) => b.date.localeCompare(a.date));
  const [editing, setEditing] = useState<Income | null>(null);
  const [open, setOpen] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const blank = (): Income => ({
    id: "",
    date: filter.mode === "month" ? `${filter.month}-01` : new Date().toISOString().slice(0, 10),
    customerType: "sirket",
    name: "",
    jobType: "Temel kazısı",
    amount: 0,
    vatRate: 20,
    paymentStatus: "beklemede",
    sample: false,
  });

  const startNew = () => {
    setEditing(blank());
    setError(null);
    setOpen(true);
  };

  const save = () => {
    if (!editing) return;
    if (!editing.date) return setError("Tarih gerekli.");
    if (editing.name.trim().length < 2) return setError("Ünvan veya ad yazın.");
    if (!(editing.amount > 0)) return setError("Tutar sıfırdan büyük olmalı.");
    const row = { ...editing, name: editing.name.trim(), sample: false };
    if (editing.id) updateIncome(row);
    else addIncome(row);
    setOpen(false);
  };

  return (
    <section className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Gelir</h2>
          <p className="text-sm text-muted-foreground">Tutar KDV hariç girilir. Kartlarda KDV dahil toplanır.</p>
        </div>
        <Button type="button" className="h-10 px-4" onClick={startNew}>
          Gelir ekle
        </Button>
      </div>
      {rows.length === 0 ? <EmptyRow text="Bu dönemde gelir yok." /> : null}
      <div className="hidden overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 md:block">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs tracking-wide uppercase">
            <tr>
              <th className="px-3 py-2 font-medium">Tarih</th>
              <th className="px-3 py-2 font-medium">Müşteri</th>
              <th className="px-3 py-2 font-medium">İş</th>
              <th className="px-3 py-2 font-medium">Tutar</th>
              <th className="px-3 py-2 font-medium">Durum</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-border">
                <td className="px-3 py-3">{formatDate(row.date)}</td>
                <td className="px-3 py-3">
                  <span className="mr-2 text-muted-foreground">{CUSTOMER_LABEL[row.customerType]}</span>
                  {row.name} <SampleBadge sample={row.sample} />
                </td>
                <td className="px-3 py-3">{row.jobType}</td>
                <td className="px-3 py-3">
                  {formatTry(withVat(row.amount, row.vatRate))}
                  <span className="block text-xs text-muted-foreground">KDV %{row.vatRate}</span>
                </td>
                <td className="px-3 py-3">{PAYMENT_LABEL[row.paymentStatus]}</td>
                <td className="px-3 py-3 text-right">
                  <RowActions onEdit={() => { setEditing(row); setError(null); setOpen(true); }} onDelete={() => setRemoveId(row.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="grid gap-3 md:hidden">
        {rows.map((row) => (
          <li key={row.id} className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{row.name}</p>
                <p className="text-sm text-muted-foreground">{formatDate(row.date)} · {row.jobType}</p>
              </div>
              <SampleBadge sample={row.sample} />
            </div>
            <p className="mt-2 font-display text-3xl">{formatTry(withVat(row.amount, row.vatRate))}</p>
            <p className="text-xs text-muted-foreground">{PAYMENT_LABEL[row.paymentStatus]} · {CUSTOMER_LABEL[row.customerType]}</p>
            <div className="mt-3">
              <RowActions onEdit={() => { setEditing(row); setError(null); setOpen(true); }} onDelete={() => setRemoveId(row.id)} />
            </div>
          </li>
        ))}
      </ul>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Geliri düzelt" : "Gelir ekle"}</DialogTitle>
            <DialogDescription>
              {editing?.sample ? "Örnek kayıttır. Kaydedince örnek işareti kalkar." : "KDV hariç tutar yazın."}
            </DialogDescription>
          </DialogHeader>
          {editing ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label="Tarih" type="date" value={editing.date} onChange={(date) => setEditing({ ...editing, date })} />
              <FieldSelect
                label="Müşteri tipi"
                value={editing.customerType}
                onChange={(customerType) => setEditing({ ...editing, customerType: customerType as Income["customerType"] })}
                options={[
                  { value: "sirket", label: "Şirket" },
                  { value: "sahis", label: "Şahıs" },
                ]}
              />
              <div className="sm:col-span-2">
                <TextField
                  label={editing.customerType === "sirket" ? "Ünvan" : "Ad soyad"}
                  value={editing.name}
                  onChange={(name) => setEditing({ ...editing, name })}
                />
              </div>
              <FieldSelect
                label="İş cinsi"
                value={editing.jobType}
                onChange={(jobType) => setEditing({ ...editing, jobType })}
                options={JOB_TYPES.map((job) => ({ value: job, label: job }))}
              />
              <TextField
                label="Tutar (KDV hariç)"
                type="number"
                value={String(editing.amount)}
                onChange={(amount) => setEditing({ ...editing, amount: Number(amount) })}
              />
              <FieldSelect
                label="KDV"
                value={String(editing.vatRate)}
                onChange={(vatRate) => setEditing({ ...editing, vatRate: Number(vatRate) })}
                options={VAT_RATES.map((rate) => ({ value: String(rate), label: `%${rate}` }))}
              />
              <FieldSelect
                label="Ödeme"
                value={editing.paymentStatus}
                onChange={(paymentStatus) => setEditing({ ...editing, paymentStatus: paymentStatus as PaymentStatus })}
                options={(Object.keys(PAYMENT_LABEL) as PaymentStatus[]).map((key) => ({
                  value: key,
                  label: PAYMENT_LABEL[key],
                }))}
              />
            </div>
          ) : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Vazgeç</Button>
            <Button type="button" onClick={save}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={removeId !== null}
        title="Gelir silinsin mi?"
        body="Bu satır defterden kalkar. Örnek satır da geri gelmez."
        onCancel={() => setRemoveId(null)}
        onConfirm={() => {
          if (removeId) deleteIncome(removeId);
          setRemoveId(null);
        }}
      />
    </section>
  );
}

export function ExpenseDesk({ filter }: { filter: PeriodFilter }) {
  const { ledger, addExpense, updateExpense, deleteExpense } = useLedger();
  const rows = ledger.expenses
    .filter((row) => inPeriod(row.date, filter))
    .sort((a, b) => b.date.localeCompare(a.date));
  const [editing, setEditing] = useState<Expense | null>(null);
  const [open, setOpen] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startNew = () => {
    setEditing({
      id: "",
      date: filter.mode === "month" ? `${filter.month}-01` : new Date().toISOString().slice(0, 10),
      category: "mazot",
      amount: 0,
      machine: "Paletli ekskavatör",
      note: "",
      sample: false,
    });
    setError(null);
    setOpen(true);
  };

  const save = () => {
    if (!editing) return;
    if (!editing.date) return setError("Tarih gerekli.");
    if (!(editing.amount > 0)) return setError("Tutar sıfırdan büyük olmalı.");
    const row = { ...editing, note: editing.note.trim(), sample: false };
    if (editing.id) updateExpense(row);
    else addExpense(row);
    setOpen(false);
  };

  return (
    <section className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Gider</h2>
          <p className="text-sm text-muted-foreground">
            Mazot gideri buradan toplama girer. Litre hesabı mazot sayfasındadır. Aynı alımı iki yere yazarsanız gider iki kez sayılır.
          </p>
        </div>
        <Button type="button" className="h-10 shrink-0 px-4" onClick={startNew}>Gider ekle</Button>
      </div>
      {rows.length === 0 ? <EmptyRow text="Bu dönemde gider yok." /> : null}
      <div className="hidden overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 md:block">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs tracking-wide uppercase">
            <tr>
              <th className="px-3 py-2 font-medium">Tarih</th>
              <th className="px-3 py-2 font-medium">Kategori</th>
              <th className="px-3 py-2 font-medium">Makine</th>
              <th className="px-3 py-2 font-medium">Tutar</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-border">
                <td className="px-3 py-3">{formatDate(row.date)}</td>
                <td className="px-3 py-3">{CATEGORY_LABEL[row.category]} <SampleBadge sample={row.sample} /></td>
                <td className="px-3 py-3">{row.machine}</td>
                <td className="px-3 py-3">{formatTry(row.amount)}</td>
                <td className="px-3 py-3 text-right">
                  <RowActions onEdit={() => { setEditing(row); setError(null); setOpen(true); }} onDelete={() => setRemoveId(row.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="grid gap-3 md:hidden">
        {rows.map((row) => (
          <li key={row.id} className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
            <p className="font-semibold">{CATEGORY_LABEL[row.category]}</p>
            <p className="text-sm text-muted-foreground">{formatDate(row.date)} · {row.machine}</p>
            <p className="mt-2 font-display text-3xl">{formatTry(row.amount)}</p>
            <div className="mt-3"><RowActions onEdit={() => { setEditing(row); setOpen(true); }} onDelete={() => setRemoveId(row.id)} /></div>
          </li>
        ))}
      </ul>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Gideri düzelt" : "Gider ekle"}</DialogTitle>
            <DialogDescription>Kategori, tarih, tutar ve makine.</DialogDescription>
          </DialogHeader>
          {editing ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label="Tarih" type="date" value={editing.date} onChange={(date) => setEditing({ ...editing, date })} />
              <FieldSelect
                label="Kategori"
                value={editing.category}
                onChange={(category) => setEditing({ ...editing, category: category as ExpenseCategory })}
                options={(Object.keys(CATEGORY_LABEL) as ExpenseCategory[]).map((key) => ({
                  value: key,
                  label: CATEGORY_LABEL[key],
                }))}
              />
              <TextField label="Tutar" type="number" value={String(editing.amount)} onChange={(amount) => setEditing({ ...editing, amount: Number(amount) })} />
              <FieldSelect
                label="Makine"
                value={editing.machine}
                onChange={(machine) => setEditing({ ...editing, machine })}
                options={machineOptions(editing.machine)}
              />
              <div className="sm:col-span-2">
                <TextField label="Not" value={editing.note} onChange={(note) => setEditing({ ...editing, note })} />
              </div>
            </div>
          ) : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Vazgeç</Button>
            <Button type="button" onClick={save}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={removeId !== null}
        title="Gider silinsin mi?"
        body="Satır defterden kalkar."
        onCancel={() => setRemoveId(null)}
        onConfirm={() => {
          if (removeId) deleteExpense(removeId);
          setRemoveId(null);
        }}
      />
    </section>
  );
}

export function FuelDesk({ filter }: { filter: PeriodFilter }) {
  const { ledger, addFuel, updateFuel, deleteFuel } = useLedger();
  const rows = ledger.fuels
    .filter((row) => inPeriod(row.date, filter))
    .sort((a, b) => b.date.localeCompare(a.date));
  const [editing, setEditing] = useState<Fuel | null>(null);
  const [open, setOpen] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startNew = () => {
    setEditing({
      id: "",
      date: filter.mode === "month" ? `${filter.month}-01` : new Date().toISOString().slice(0, 10),
      litres: 0,
      pricePerLitre: 0,
      machine: "Paletli ekskavatör",
      station: "",
      sample: false,
    });
    setError(null);
    setOpen(true);
  };

  const save = () => {
    if (!editing) return;
    if (!editing.date) return setError("Tarih gerekli.");
    if (!(editing.litres > 0)) return setError("Litre sıfırdan büyük olmalı.");
    if (!(editing.pricePerLitre > 0)) return setError("Litre fiyatı yazın.");
    if (editing.station.trim().length < 2) return setError("İstasyon adı yazın.");
    const row = { ...editing, station: editing.station.trim(), sample: false };
    if (editing.id) updateFuel(row);
    else addFuel(row);
    setOpen(false);
  };

  const total = editing ? roundMoney(editing.litres * editing.pricePerLitre) : 0;

  return (
    <section className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Mazot</h2>
          <p className="text-sm text-muted-foreground">Litre, birim fiyat ve tutar. Tutar litreden hesaplanır. Gider tarafına ayrıca yazılmaz.</p>
        </div>
        <Button type="button" className="h-10 shrink-0 px-4" onClick={startNew}>Mazot ekle</Button>
      </div>
      {rows.length === 0 ? <EmptyRow text="Bu dönemde mazot kaydı yok." /> : null}
      <div className="hidden overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 md:block">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs tracking-wide uppercase">
            <tr>
              <th className="px-3 py-2 font-medium">Tarih</th>
              <th className="px-3 py-2 font-medium">Makine</th>
              <th className="px-3 py-2 font-medium">Litre</th>
              <th className="px-3 py-2 font-medium">Fiyat</th>
              <th className="px-3 py-2 font-medium">Tutar</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-border">
                <td className="px-3 py-3">{formatDate(row.date)} <SampleBadge sample={row.sample} /></td>
                <td className="px-3 py-3">{row.machine}<span className="block text-xs text-muted-foreground">{row.station}</span></td>
                <td className="px-3 py-3">{formatNumber(row.litres)} L</td>
                <td className="px-3 py-3">{formatTry(row.pricePerLitre)}</td>
                <td className="px-3 py-3">{formatTry(roundMoney(row.litres * row.pricePerLitre))}</td>
                <td className="px-3 py-3 text-right">
                  <RowActions onEdit={() => { setEditing(row); setError(null); setOpen(true); }} onDelete={() => setRemoveId(row.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="grid gap-3 md:hidden">
        {rows.map((row) => (
          <li key={row.id} className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
            <p className="font-semibold">{row.machine}</p>
            <p className="text-sm text-muted-foreground">{formatDate(row.date)} · {row.station}</p>
            <p className="mt-2 font-display text-3xl">{formatNumber(row.litres)} L</p>
            <p className="text-xs text-muted-foreground">{formatTry(row.pricePerLitre)} · toplam {formatTry(roundMoney(row.litres * row.pricePerLitre))}</p>
            <div className="mt-3"><RowActions onEdit={() => { setEditing(row); setOpen(true); }} onDelete={() => setRemoveId(row.id)} /></div>
          </li>
        ))}
      </ul>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Mazotu düzelt" : "Mazot ekle"}</DialogTitle>
            <DialogDescription>Toplam {formatTry(total)} olarak hesaplanır.</DialogDescription>
          </DialogHeader>
          {editing ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label="Tarih" type="date" value={editing.date} onChange={(date) => setEditing({ ...editing, date })} />
              <FieldSelect label="Makine" value={editing.machine} onChange={(machine) => setEditing({ ...editing, machine })} options={machineOptions(editing.machine)} />
              <TextField label="Litre" type="number" value={String(editing.litres)} onChange={(litres) => setEditing({ ...editing, litres: Number(litres) })} />
              <TextField label="Litre fiyatı" type="number" value={String(editing.pricePerLitre)} onChange={(pricePerLitre) => setEditing({ ...editing, pricePerLitre: Number(pricePerLitre) })} />
              <div className="sm:col-span-2">
                <TextField label="İstasyon" value={editing.station} onChange={(station) => setEditing({ ...editing, station })} />
              </div>
            </div>
          ) : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Vazgeç</Button>
            <Button type="button" onClick={save}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={removeId !== null}
        title="Mazot kaydı silinsin mi?"
        body="Litre satırı kalkar. Giderdeki mazot tutarı, ayrı yazıldıysa durur."
        onCancel={() => setRemoveId(null)}
        onConfirm={() => {
          if (removeId) deleteFuel(removeId);
          setRemoveId(null);
        }}
      />
    </section>
  );
}

function machineOptions(current: string) {
  const values = MACHINES.includes(current) ? MACHINES : [current, ...MACHINES];
  return values.map((value) => ({ value, label: value }));
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex justify-end gap-2">
      <Button type="button" variant="outline" size="sm" onClick={onEdit}>Düzelt</Button>
      <Button type="button" variant="ghost" size="sm" onClick={onDelete}>Sil</Button>
    </div>
  );
}
