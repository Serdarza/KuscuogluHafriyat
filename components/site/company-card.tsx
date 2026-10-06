"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLedger } from "@/components/panel/ledger-context";
import { brand } from "@/lib/brand";
import type { CompanyProfile } from "@/lib/types";

export function CompanyCard() {
  const { company, saveCompany } = useLedger();
  return <CompanyForm initial={company} onSave={saveCompany} />;
}

function CompanyForm({
  initial,
  onSave,
}: {
  initial: CompanyProfile;
  onSave: (company: CompanyProfile) => void;
}) {
  const [draft, setDraft] = useState(initial);
  const [notice, setNotice] = useState<string | null>(null);

  const update = (key: keyof CompanyProfile, value: string) => {
    setDraft({ ...draft, [key]: value });
    setNotice(null);
  };

  return (
    <section id="firma" className="rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
      <p className="text-xs font-semibold tracking-[0.16em] text-clay uppercase">Firma kartı</p>
      <h2 className="mt-2 text-2xl font-semibold">Adres kartı</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Sahip {brand.owner} ve telefon {brand.phoneDisplay} fatura başlığında sabit. Ünvan, adres ve e-posta yazarsanız düzenleyen bölümüne geçer.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Ünvan" value={draft.unvan} onChange={(value) => update("unvan", value)} />
        <Field label="Telefon" value={draft.phone} onChange={(value) => update("phone", value)} />
        <Field label="E-posta" value={draft.email} onChange={(value) => update("email", value)} type="email" />
        <Field label="İl / ilçe" value={draft.city} onChange={(value) => update("city", value)} />
        <div className="sm:col-span-2">
          <Label htmlFor="firma-adres">Adres</Label>
          <Textarea
            id="firma-adres"
            className="mt-1.5"
            value={draft.address}
            onChange={(event) => update("address", event.target.value)}
          />
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button
          type="button"
          className="h-10 px-4"
          onClick={() => {
            onSave(draft);
            setNotice("Firma kartı deftere yazıldı.");
          }}
        >
          Kartı kaydet
        </Button>
        {notice ? <p className="text-sm text-clay">{notice}</p> : null}
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div>
      <Label htmlFor={`firma-${id}`}>{label}</Label>
      <Input
        id={`firma-${id}`}
        className="mt-1.5 h-10"
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
