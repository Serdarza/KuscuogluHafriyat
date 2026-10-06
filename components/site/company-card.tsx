"use client";

import Link from "next/link";
import { useEffect, useState, type InputHTMLAttributes } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  COMPANY_EVENT,
  companyIsEmpty,
  emptyCompany,
  readCompany,
  writeCompany,
} from "@/lib/storage";
import type { CompanyProfile } from "@/lib/types";

function useCompany() {
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = () => {
      try {
        setCompany(readCompany());
        setError(null);
      } catch {
        setError("Firma kartı bu tarayıcıda okunamadı.");
        setCompany(emptyCompany());
      }
    };
    load();
    window.addEventListener(COMPANY_EVENT, load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener(COMPANY_EVENT, load);
      window.removeEventListener("storage", load);
    };
  }, []);

  return { company, setCompany, error, setError };
}

export function CompanyLines({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const { company, error } = useCompany();
  const muted = tone === "dark" ? "text-paper/70" : "text-muted-foreground";
  const strong = tone === "dark" ? "text-paper" : "text-foreground";

  if (!company) {
    return <p className={`text-sm ${muted}`}>İletişim bilgisi yükleniyor…</p>;
  }

  if (error) {
    return <p className="text-sm text-ochre">{error}</p>;
  }

  if (companyIsEmpty(company)) {
    return (
      <div className={`text-sm leading-6 ${muted}`}>
        <p>Telefon, e-posta ve adres henüz yazılmadı.</p>
        <p className="mt-2">Bu alanlar boş başlar. Numara uydurulmaz; firma kartından siz girersiniz.</p>
        <Link href="/iletisim#firma" className={`mt-3 inline-block underline ${strong}`}>
          Firma kartını doldur
        </Link>
      </div>
    );
  }

  return (
    <div className={`grid gap-1 text-sm ${strong}`}>
      {company.unvan ? <p className="font-semibold">{company.unvan}</p> : null}
      {company.phone ? <p>{company.phone}</p> : null}
      {company.email ? <p>{company.email}</p> : null}
      {company.address || company.city ? (
        <p>{[company.address, company.city].filter(Boolean).join(", ")}</p>
      ) : null}
    </div>
  );
}

export function CompanyCard() {
  const { company, error } = useCompany();

  if (!company) {
    return (
      <div className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
        <p className="text-sm text-muted-foreground">Firma kartı yükleniyor…</p>
      </div>
    );
  }

  return <CompanyForm initial={company} readError={error} />;
}

function CompanyForm({
  initial,
  readError,
}: {
  initial: CompanyProfile;
  readError: string | null;
}) {
  const [draft, setDraft] = useState(initial);
  const [notice, setNotice] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const update = (key: keyof CompanyProfile, value: string) => {
    setDraft({ ...draft, [key]: value });
    setNotice(null);
  };

  const save = () => {
    try {
      writeCompany(draft);
      setSaveError(null);
      setNotice("Firma kartı bu tarayıcıya yazıldı.");
    } catch {
      setSaveError("Kayıt yazılamadı. Tarayıcı depolaması kapalı olabilir.");
    }
  };

  return (
    <section id="firma" className="rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
      <p className="text-xs font-semibold tracking-[0.16em] text-clay uppercase">Firma kartı</p>
      <h2 className="mt-2 text-2xl font-semibold">İletişim bilgisi sizde durur</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Telefon, adres, vergi dairesi ve VKN boş başlar. Buraya yazdığınız değer sitede ve fatura PDF’inde görünür. Başka bir numara konulmaz.
      </p>
      {readError ? <p className="mt-3 text-sm text-destructive">{readError}</p> : null}
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
        <Field
          label="Vergi dairesi"
          value={draft.vergiDairesi}
          onChange={(value) => update("vergiDairesi", value)}
        />
        <Field label="VKN" value={draft.vkn} onChange={(value) => update("vkn", value)} inputMode="numeric" />
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button type="button" className="h-10 px-4" onClick={save}>
          Kartı kaydet
        </Button>
        {notice ? <p className="text-sm text-clay">{notice}</p> : null}
        {saveError ? <p className="text-sm text-destructive">{saveError}</p> : null}
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
