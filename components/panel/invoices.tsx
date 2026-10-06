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
import { ConfirmDialog, Field, FieldSelect, TextField } from "@/components/panel/fields";
import { useLedger } from "@/components/panel/ledger-context";
import {
  CUSTOMER_LABEL,
  UNITS,
  VAT_RATES,
  formatDate,
  formatTry,
  inPeriod,
  invoiceGross,
  invoiceSubtotal,
  invoiceVatAmount,
  lineAmount,
  newId,
} from "@/lib/format";
import { downloadInvoicePdf } from "@/lib/pdf";
import type { Invoice, InvoiceLine, PeriodFilter } from "@/lib/types";

function emptyLine(): InvoiceLine {
  return { id: newId(), description: "", quantity: 1, unit: "m³", unitPrice: 0 };
}

function blankInvoice(filter: PeriodFilter): Invoice {
  const year = filter.mode === "month" ? filter.month.slice(0, 4) : filter.year;
  return {
    id: "",
    number: `KH-${year}-${String(Date.now()).slice(-4)}`,
    date: filter.mode === "month" ? `${filter.month}-01` : new Date().toISOString().slice(0, 10),
    customerType: "sirket",
    unvan: "",
    vergiDairesi: "",
    vkn: "",
    adSoyad: "",
    tckn: "",
    address: "",
    lines: [emptyLine()],
    vatRate: 20,
    sample: false,
  };
}

export function InvoiceDesk({ filter }: { filter: PeriodFilter }) {
  const { ledger, company, addInvoice, updateInvoice, deleteInvoice, addIncome } = useLedger();
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
    if (!editing.date) return setError("Tarih gerekli.");
    if (!editing.number.trim()) return setError("Fatura numarası yazın.");
    if (editing.customerType === "sirket" && editing.unvan.trim().length < 2) {
      return setError("Şirket ünvanı yazın.");
    }
    if (editing.customerType === "sahis" && editing.adSoyad.trim().length < 2) {
      return setError("Ad soyad yazın.");
    }
    if (editing.vkn.trim() && !/^\d{10}$/.test(editing.vkn.trim())) {
      return setError("VKN 10 hane olmalı. Boş bırakılırsa PDF’te çizgi çıkar.");
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
      vergiDairesi: editing.vergiDairesi.trim(),
      vkn: editing.vkn.trim(),
      adSoyad: editing.adSoyad.trim(),
      tckn: editing.tckn.trim(),
      address: editing.address.trim(),
      lines,
      sample: false,
    };
    if (editing.id) updateInvoice(row);
    else addInvoice(row);
    if (postIncome) {
      addIncome({
        date: row.date,
        customerType: row.customerType,
        name: row.customerType === "sirket" ? row.unvan : row.adSoyad,
        jobType: row.lines[0]?.description || "Fatura",
        amount: invoiceSubtotal(row),
        vatRate: row.vatRate,
        paymentStatus: "beklemede",
        sample: false,
      });
    }
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
            Şirket ya da şahıs için hazırlanmış fatura PDF’i. GİB e-Fatura değildir. Vergi numarası uydurulmaz; boşsa belgede çizgi durur.
          </p>
        </div>
        <Button type="button" className="h-10 px-4" onClick={() => openEditor(blankInvoice(filter))}>
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
                    {formatDate(invoice.date)} · {CUSTOMER_LABEL[invoice.customerType]} · KDV %{invoice.vatRate}
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
              <div className="grid gap-3 sm:grid-cols-3">
                <TextField label="Fatura no" value={editing.number} onChange={(number) => setEditing({ ...editing, number })} />
                <TextField label="Tarih" type="date" value={editing.date} onChange={(date) => setEditing({ ...editing, date })} />
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
              </div>
              {editing.customerType === "sirket" ? (
                <div className="grid gap-3 sm:grid-cols-3">
                  <TextField label="Ünvan" value={editing.unvan} onChange={(unvan) => setEditing({ ...editing, unvan })} />
                  <TextField label="Vergi dairesi" value={editing.vergiDairesi} onChange={(vergiDairesi) => setEditing({ ...editing, vergiDairesi })} />
                  <TextField label="VKN" value={editing.vkn} onChange={(vkn) => setEditing({ ...editing, vkn })} hint="10 hane. Boş kalabilir." inputMode="numeric" />
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField label="Ad soyad" value={editing.adSoyad} onChange={(adSoyad) => setEditing({ ...editing, adSoyad })} />
                  <TextField label="TCKN" value={editing.tckn} onChange={(tckn) => setEditing({ ...editing, tckn })} hint="11 hane. Boş kalabilir." inputMode="numeric" />
                </div>
              )}
              <TextField label="Adres" value={editing.address} onChange={(address) => setEditing({ ...editing, address })} />
              <FieldSelect
                label="KDV"
                value={String(editing.vatRate)}
                onChange={(vatRate) => setEditing({ ...editing, vatRate: Number(vatRate) })}
                options={VAT_RATES.map((rate) => ({ value: String(rate), label: `%${rate}` }))}
              />
              <div className="grid gap-2">
                <p className="text-sm font-medium">Kalemler</p>
                {editing.lines.map((line) => (
                  <div key={line.id} className="grid gap-2 rounded-lg bg-muted/60 p-2 sm:grid-cols-12">
                    <Input
                      className="h-10 sm:col-span-5"
                      value={line.description}
                      placeholder="Açıklama"
                      onChange={(event) =>
                        setEditing({
                          ...editing,
                          lines: editing.lines.map((item) =>
                            item.id === line.id ? { ...item, description: event.target.value } : item,
                          ),
                        })
                      }
                    />
                    <Input
                      className="h-10 sm:col-span-2"
                      type="number"
                      value={String(line.quantity)}
                      onChange={(event) =>
                        setEditing({
                          ...editing,
                          lines: editing.lines.map((item) =>
                            item.id === line.id ? { ...item, quantity: Number(event.target.value) } : item,
                          ),
                        })
                      }
                    />
                    <div className="sm:col-span-2">
                      <FieldSelect
                        label="Birim"
                        value={line.unit}
                        onChange={(unit) =>
                          setEditing({
                            ...editing,
                            lines: editing.lines.map((item) => (item.id === line.id ? { ...item, unit } : item)),
                          })
                        }
                        options={(UNITS.includes(line.unit) ? UNITS : [line.unit, ...UNITS]).map((unit) => ({
                          value: unit,
                          label: unit,
                        }))}
                      />
                    </div>
                    <Input
                      className="h-10 sm:col-span-2"
                      type="number"
                      value={String(line.unitPrice)}
                      onChange={(event) =>
                        setEditing({
                          ...editing,
                          lines: editing.lines.map((item) =>
                            item.id === line.id ? { ...item, unitPrice: Number(event.target.value) } : item,
                          ),
                        })
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      className="sm:col-span-1"
                      onClick={() =>
                        setEditing({
                          ...editing,
                          lines: editing.lines.filter((item) => item.id !== line.id),
                        })
                      }
                    >
                      Sil
                    </Button>
                  </div>
                ))}
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
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={postIncome}
                    onChange={(event) => setPostIncome(event.target.checked)}
                  />
                  Kaydedince KDV hariç tutarı gelir defterine bekleyen olarak yaz
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
