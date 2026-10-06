"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="mx-auto max-w-lg px-4 py-24">
      <p className="text-xs font-semibold tracking-[0.16em] text-clay uppercase">Hata</p>
      <h1 className="mt-2 font-display text-5xl">Sayfa açılamadı</h1>
      <p className="mt-3 text-sm text-muted-foreground">{error.message || "Beklenmeyen bir sorun oluştu."}</p>
      <Button type="button" className="mt-6 h-10 px-4" onClick={reset}>
        Tekrar dene
      </Button>
    </section>
  );
}
