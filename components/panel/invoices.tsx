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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog, Field, FieldSelect, TextField } from "@/components/panel/fields";
import { useLedger } from "@/components/panel/ledger-context";
import {
  CUSTOMER_LABEL,
  UNITS,
  PAYMENT_LABEL,
  VAT_RATES,
  formatDate,
  formatJobRange,
  formatTry,
  todayIso,
  inPeriod,
  invoiceGross,
  invoiceSubtotal,
  invoiceVatAmount,
  lineAmount,
  newId,
} from "@/lib/format";
import { downloadInvoicePdf } from "@/lib/pdf";
import type { Invoice, InvoiceLine, PaymentStatus, PeriodFilter } from "@/lib/types";

function emptyLine(): InvoiceLine {
  return { id: newId(), description: "", quantity: 1, unit: "m³", unitPrice: 0 };
}

function blankInvoice(): Invoice {
  const today = todayIso();
  return {
    id: "",
    number: `KH-${today.slice(0, 4)}-${String(Date.now()).slice(-4)}`,
    date: today,
    jobStart: today,
    jobEnd: today,
    customerType: "sirket",
    unvan: "",
    adSoyad: "",
    tckn: "",
    address: "",
    lines: [emptyLine()],
    vatRate: 20,
    paymentStatus: "beklemede",
    sample: false,
  };
}

export function InvoiceDesk({ filter }: { filter: PeriodFilter }) {
  const { ledger, company, saveInvoice, deleteInvoice } = useLedger();
  const rows = ledger.invoices
    .filter((row) => inPeriod(row.date, filter))
    .sort((a, b) => b.date.localeCompare(a.date));
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [open, setOpen] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfBusy, setPdfBusy] = useState<string | null>(null);
  const [postIncome, setPostIncome] = useState(false);

  const openEditor = (invoice: Invoice) => {
    setEditing(invoice);
    setError(null);
    setPostIncome(false);
    setOpen(true);
  };

  const save = () => {
    if (!editing) return;
    if (!editing.date) return setError("Fatura tarihi gerekli.");
    if (!editing.jobStart) return setError("İş başlangıç gerekli.");
    if (!editing.jobEnd) return setError("İş bitiş gerekli.");
    if (editing.jobEnd < editing.jobStart) return setError("İş bitiş, iş başlangıçtan önce olamaz. Aynı gün olabilir.");
    if (!editing.number.trim()) return setError("Fatura numarası yazın.");
    if (editing.customerType === "sirket" && editing.unvan.trim().length < 2) {
      return setError("Şirket ünvanı yazın.");
    }
    if (editing.customerType === "sahis" && editing.adSoyad.trim().length < 2) {
      return setError("Ad soyad yazın.");
    }
    if (editing.tckn.trim() && !/^\d{11}$/.test(editing.tckn.trim())) {
      return setError("TCKN 11 hane olmalı. Boş bırakılırsa PDF’te çizgi çıkar.");
    }
    const lines = editing.lines.filter((line) => line.description.trim());
    if (lines.length === 0) return setError("En az bir kalem yazın.");
    if (lines.some((line) => !(line.quantity > 0))) return setError("Miktar sıfırdan büyük olmalı.");
    const row: Invoice = {
      ...editing,
      number: editing.number.trim(),
      unvan: editing.unvan.trim(),
      adSoyad: editing.adSoyad.trim(),
      tckn: editing.tckn.trim(),
      address: editing.address.trim(),
      lines,
      sample: false,
    };
    saveInvoice(row, { postIncome });
    setOpen(false);
  };

  const download = async (invoice: Invoice) => {
    setPdfBusy(invoice.id || "yeni");
    setPdfError(null);
    try {
      await downloadInvoicePdf(invoice, company);
    } catch (cause) {
      setPdfError(cause instanceof Error ? cause.message : "PDF oluşturulamadı.");
    } finally {
      setPdfBusy(null);
    }
  };

  return (
    <section className="grid gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold">Faturalar</h2>
          <p className="text-sm text-muted-foreground">
            Şirket ya da şahıs için hazırlanmış fatura PDF’i. GİB e-Fatura değildir. Liste fatura tarihine göre süzülür; iş tarihi ayrıdır.
          </p>
        </div>
        <Button type="button" className="h-10 px-4" onClick={() => openEditor(blankInvoice())}>
          Fatura hazırla
        </Button>
      </div>
      {pdfError ? <p className="text-sm text-destructive">{pdfError}</p> : null}
      {rows.length === 0 ? (
        <p className="rounded-xl bg-card px-4 py-10 text-center text-sm text-muted-foreground ring-1 ring-foreground/10">
          Bu dönemde fatura yok.
        </p>
      ) : (
        <ul className="grid gap-3">
          {rows.map((invoice) => (
            <li key={invoice.id} className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold tracking-[0.14em] text-clay uppercase">
                    {invoice.number} {invoice.sample ? "· Örnek" : ""}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold">
                    {invoice.customerType === "sirket" ? invoice.unvan || "Ünvan yok" : invoice.adSoyad || "Ad yok"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Fatura tarihi {formatDate(invoice.date)} · İş tarihi {formatJobRange(invoice.jobStart, invoice.jobEnd)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {CUSTOMER_LABEL[invoice.customerType]} · KDV %{invoice.vatRate} · {PAYMENT_LABEL[invoice.paymentStatus]}
                  </p>
                </div>
                <p className="font-display text-4xl leading-none">{formatTry(invoiceGross(invoice))}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" size="sm" onClick={() => download(invoice)} disabled={pdfBusy === invoice.id}>
                  {pdfBusy === invoice.id ? "PDF hazırlanıyor…" : "PDF indir"}
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => openEditor(invoice)}>
                  Düzenle
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setRemoveId(invoice.id)}>
                  Sil
                </Button>
                {invoice.sample ? <Badge variant="outline">Örnek</Badge> : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Fatura</DialogTitle>
            <DialogDescription>
              Hazırlanmış fatura. e-Fatura değildir. Düzenleyen bilgisi firma kartından gelir.
            </DialogDescription>
          </DialogHeader>
          {editing ? (
            <div className="grid gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField label="Fatura no" value={editing.number} onChange={(number) => setEditing({ ...editing, number })} />
                <TextField
                  label="Fatura tarihi"
                  type="date"
                  value={editing.date}
                  onChange={(date) => setEditing({ ...editing, date })}
                  hint="Varsayılan bugün. İş bitişine bağlanmaz."
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField
                  label="İş başlangıç"
                  type="date"
                  value={editing.jobStart}
                  onChange={(jobStart) => setEditing({ ...editing, jobStart })}
                  hint="İşin ilk günü."
                />
                <TextField
                  label="İş bitiş"
                  type="date"
                  value={editing.jobEnd}
                  onChange={(jobEnd) => setEditing({ ...editing, jobEnd })}
                  hint="Aynı gün olabilir. Birkaç günü de kapsar."
                />
              </div>
              <FieldSelect
                  label="Müşteri tipi"
                  value={editing.customerType}
                  onChange={(customerType) =>
                    setEditing({ ...editing, customerType: customerType as Invoice["customerType"] })
                  }
                  options={[
                    { value: "sirket", label: "Şirket" },
                    { value: "sahis", label: "Şahıs" },
                  ]}
                />
              {editing.customerType === "sirket" ? (
                <TextField label="Ünvan" value={editing.unvan} onChange={(unvan) => setEditing({ ...editing, unvan })} />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField label="Ad soyad" value={editing.adSoyad} onChange={(adSoyad) => setEditing({ ...editing, adSoyad })} />
                  <TextField label="TCKN" value={editing.tckn} onChange={(tckn) => setEditing({ ...editing, tckn })} hint="11 hane. Boş kalabilir." inputMode="numeric" />
                </div>
              )}
              <TextField label="Adres" value={editing.address} onChange={(address) => setEditing({ ...editing, address })} />
              <div className="grid gap-3 sm:grid-cols-2">
                <FieldSelect
                  label="KDV"
                  value={String(editing.vatRate)}
                  onChange={(vatRate) => setEditing({ ...editing, vatRate: Number(vatRate) })}
                  options={VAT_RATES.map((rate) => ({ value: String(rate), label: `%${rate}` }))}
                />
                <FieldSelect
                  label="Ödeme"
                  value={editing.paymentStatus}
                  onChange={(paymentStatus) =>
                    setEditing({ ...editing, paymentStatus: paymentStatus as PaymentStatus })
                  }
                  options={(Object.keys(PAYMENT_LABEL) as PaymentStatus[]).map((status) => ({
                    value: status,
                    label: PAYMENT_LABEL[status],
                  }))}
                />
              </div>
              <div className="grid gap-3">
                <p className="text-sm font-medium">Kalemler</p>
                {editing.lines.map((line) => {
                  const patch = (next: Partial<typeof line>) =>
                    setEditing({
                      ...editing,
                      lines: editing.lines.map((item) => (item.id === line.id ? { ...item, ...next } : item)),
                    });
                  return (
                    <div key={line.id} className="grid gap-3 rounded-lg bg-muted/60 p-3 sm:grid-cols-2 lg:grid-cols-6">
                      <div className="grid gap-1.5 sm:col-span-2 lg:col-span-2">
                        <Label htmlFor={`kalem-aciklama-${line.id}`}>Açıklama</Label>
                        <Input
                          id={`kalem-aciklama-${line.id}`}
                          className="h-10"
                          value={line.description}
                          onChange={(event) => patch({ description: event.target.value })}
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor={`kalem-miktar-${line.id}`}>Miktar</Label>
                        <Input
                          id={`kalem-miktar-${line.id}`}
                          className="h-10"
                          type="number"
                          inputMode="decimal"
                          value={String(line.quantity)}
                          onChange={(event) => patch({ quantity: Number(event.target.value) })}
                        />
                      </div>
                      <FieldSelect
                        label="Birim"
                        value={line.unit}
                        onChange={(unit) => patch({ unit })}
                        options={(UNITS.includes(line.unit) ? UNITS : [line.unit, ...UNITS]).map((unit) => ({
                          value: unit,
                          label: unit,
                        }))}
                      />
                      <div className="grid gap-1.5">
                        <Label htmlFor={`kalem-fiyat-${line.id}`}>Birim fiyat (₺)</Label>
                        <Input
                          id={`kalem-fiyat-${line.id}`}
                          className="h-10"
                          type="number"
                          inputMode="decimal"
                          value={String(line.unitPrice)}
                          onChange={(event) => patch({ unitPrice: Number(event.target.value) })}
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <p className="text-sm font-medium" id={`kalem-toplam-${line.id}`}>Satır toplam</p>
                        <p
                          className="flex h-10 items-center font-semibold"
                          aria-labelledby={`kalem-toplam-${line.id}`}
                        >
                          {formatTry(lineAmount(line))}
                        </p>
                      </div>
                      <div className="flex items-end sm:col-span-2 lg:col-span-6">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() =>
                            setEditing({
                              ...editing,
                              lines: editing.lines.filter((item) => item.id !== line.id),
                            })
                          }
                        >
                          Satırı sil
                        </Button>
                      </div>
                    </div>
                  );
                })}
                <Button type="button" variant="outline" onClick={() => setEditing({ ...editing, lines: [...editing.lines, emptyLine()] })}>
                  Kalem ekle
                </Button>
              </div>
              <div className="rounded-lg bg-ink px-4 py-3 text-paper">
                <p className="text-xs tracking-[0.14em] text-ochre uppercase">Önizleme · e-Fatura değil</p>
                <p className="mt-2 text-sm">Ara toplam {formatTry(invoiceSubtotal(editing))}</p>
                <p className="text-sm">KDV {formatTry(invoiceVatAmount(editing))}</p>
                <p className="font-display text-3xl">{formatTry(invoiceGross(editing))}</p>
                <ul className="mt-2 text-xs text-paper/70">
                  {editing.lines.map((line) => (
                    <li key={line.id}>
                      {line.description || "Kalem"} · {line.quantity} {line.unit} · {formatTry(lineAmount(line))}
                    </li>
                  ))}
                </ul>
              </div>
              <Field label="Gelire de işle">
                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={postIncome}
                    onChange={(event) => setPostIncome(event.target.checked)}
                  />
                  <span>
                    Fatura önce listeye yazılır. İşaretlerseniz KDV hariç tutar, bu faturanın numarasıyla gelir defterine bekleyen olarak eklenir. Aynı fatura için ikinci gelir satırı açılmaz.
                  </span>
                </label>
              </Field>
            </div>
          ) : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => editing && download({ ...editing, id: editing.id || "taslak" })}>
              PDF indir
            </Button>
            <Button type="button" onClick={save}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={removeId !== null}
        title="Fatura silinsin mi?"
        body="Belge listeden kalkar. Gelire işlenmiş satır varsa o ayrı durur."
        onCancel={() => setRemoveId(null)}
        onConfirm={() => {
          if (removeId) deleteInvoice(removeId);
          setRemoveId(null);
        }}
      />
    </section>
  );
}
