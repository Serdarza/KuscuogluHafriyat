"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { JOB_TYPES, formatDateTime, newId } from "@/lib/format";
import { readQuotes, writeQuotes } from "@/lib/storage";
import type { QuoteRequest } from "@/lib/types";

const empty = {
  name: "",
  phone: "",
  email: "",
  jobType: "Temel kazısı",
  place: "",
  message: "",
};

export function QuoteForm() {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<QuoteRequest | null>(null);
  const [quotes, setQuotes] = useState<QuoteRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuotes(readQuotes());
    } catch {
      setError("Kayıtlı talepler okunamadı.");
      setQuotes([]);
    }
  }, []);

  const set = (key: keyof typeof empty, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (form.name.trim().length < 2) nextErrors.name = "Ad yazın.";
    if (form.phone.trim().length < 5 && form.email.trim().length < 5) {
      nextErrors.phone = "Telefon ya da e-posta yeter.";
    }
    if (form.place.trim().length < 2) nextErrors.place = "İlçe veya saha tarifi yazın.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const quote: QuoteRequest = {
      id: newId(),
      createdAt: new Date().toISOString(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      jobType: form.jobType,
      place: form.place.trim(),
      message: form.message.trim(),
    };

    try {
      const current = readQuotes();
      const next = [quote, ...current];
      writeQuotes(next);
      setQuotes(next);
      setDone(quote);
      setForm(empty);
      setError(null);
    } catch {
      setError("Talep kaydedilemedi. Tarayıcı depolaması kapalı olabilir.");
    }
  };

  return (
    <div className="grid gap-6">
      {done ? (
        <div className="rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
          <p className="text-xs font-semibold tracking-[0.16em] text-clay uppercase">Kaydedildi</p>
          <h2 className="mt-2 text-2xl font-semibold">Talep bu tarayıcıda duruyor</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {done.name} için {done.jobType} talebi sunucuya gitmedi. Firmayı aramak için iletişim bilgisi firma kartında dolu olmalıdır. Bu cihazdaki kayıt, başka bir telefonda görünmez.
          </p>
          <Button type="button" className="mt-4 h-10 px-4" variant="outline" onClick={() => setDone(null)}>
            Yeni talep
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6" noValidate>
          <p className="text-xs font-semibold tracking-[0.16em] text-clay uppercase">Teklif</p>
          <h2 className="mt-2 text-2xl font-semibold">İşin çerçevesini bırakın</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Form bir sunucuya bağlanmaz. Gönder dediğinizde talep yalnızca bu tarayıcıya yazılır.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="teklif-ad">Ad soyad</Label>
              <Input id="teklif-ad" className="mt-1.5 h-10" value={form.name} onChange={(event) => set("name", event.target.value)} />
              {errors.name ? <p className="mt-1 text-xs text-destructive">{errors.name}</p> : null}
            </div>
            <div>
              <Label htmlFor="teklif-tel">Telefon</Label>
              <Input id="teklif-tel" className="mt-1.5 h-10" value={form.phone} onChange={(event) => set("phone", event.target.value)} />
              {errors.phone ? <p className="mt-1 text-xs text-destructive">{errors.phone}</p> : null}
            </div>
            <div>
              <Label htmlFor="teklif-eposta">E-posta</Label>
              <Input id="teklif-eposta" type="email" className="mt-1.5 h-10" value={form.email} onChange={(event) => set("email", event.target.value)} />
            </div>
            <div>
              <Label>İş cinsi</Label>
              <Select
                value={form.jobType}
                items={JOB_TYPES.map((job) => ({ value: job, label: job }))}
                onValueChange={(value) => {
                  if (typeof value === "string") set("jobType", value);
                }}
              >
                <SelectTrigger className="mt-1.5 h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map((job) => (
                    <SelectItem key={job} value={job}>
                      {job}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="teklif-yer">İlçe veya saha tarifi</Label>
              <Input id="teklif-yer" className="mt-1.5 h-10" value={form.place} onChange={(event) => set("place", event.target.value)} />
              {errors.place ? <p className="mt-1 text-xs text-destructive">{errors.place}</p> : null}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="teklif-not">Not</Label>
              <Textarea id="teklif-not" className="mt-1.5" value={form.message} onChange={(event) => set("message", event.target.value)} placeholder="Yaklaşık m³, kat adedi, erişim" />
            </div>
          </div>
          {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="mt-5 h-11 px-5">
            Talebi bu tarayıcıya kaydet
          </Button>
        </form>
      )}

      <section className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
        <h3 className="font-semibold">Bu tarayıcıdaki talepler</h3>
        {quotes === null ? (
          <p className="mt-2 text-sm text-muted-foreground">Yükleniyor…</p>
        ) : quotes.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Henüz kayıtlı talep yok.</p>
        ) : (
          <ul className="mt-3 grid gap-3">
            {quotes.map((quote) => (
              <li key={quote.id} className="border-t border-border pt-3 text-sm">
                <p className="font-medium">
                  {quote.name} · {quote.jobType}
                </p>
                <p className="text-muted-foreground">
                  {quote.place} · {formatDateTime(quote.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
