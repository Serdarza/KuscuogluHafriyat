"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BrandLogo, OwnerPhone, PhoneLink } from "@/components/site/brand-mark";
import { brand } from "@/lib/brand";
import { CompanyLines } from "@/components/site/company-card";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Ana sayfa" },
  { href: "/hizmetler", label: "Hizmetler" },
  { href: "/filo", label: "Filo" },
  { href: "/isler", label: "İşler" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/iletisim", label: "İletişim" },
];

function normalize(path: string) {
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path || "/";
}

function isActive(path: string, href: string) {
  const current = normalize(path);
  if (href === "/") return current === "/";
  return current === href || current.startsWith(`${href}/`);
}

export function Wordmark() {
  return <BrandLogo className="h-16 w-16 sm:h-20 sm:w-20" />;
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink text-paper">
      <div className="mx-auto flex min-h-20 max-w-6xl items-center justify-between gap-3 px-4 py-2 sm:px-6">
        <Link href="/" className="shrink-0" aria-label="Kuşçuoğlu Hafriyat ana sayfa">
          <Wordmark />
        </Link>
        <nav className="hidden items-center gap-5 md:flex" aria-label="Sayfalar">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm text-paper/80 transition-colors hover:text-paper",
                isActive(pathname, item.href) && "text-ochre",
              )}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="hidden text-sm font-semibold leading-tight lg:block">{brand.owner}</p>
            <PhoneLink className="text-sm font-semibold text-ochre" />
          </div>
          <Link
            href="/panel"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "hidden h-9 border-ochre/70 bg-transparent px-3 text-paper hover:bg-white/5 hover:text-paper md:inline-flex")}
          >
            Saha defteri
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className="inline-flex size-10 items-center justify-center rounded-lg border border-white/20 md:hidden"
              aria-label="Menüyü aç"
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="bg-paper text-ink">
              <SheetHeader>
                <SheetTitle className="sr-only">Menü</SheetTitle>
                <BrandLogo className="h-24 w-24" />
                <SheetDescription>
                  {brand.owner} · <PhoneLink className="font-semibold text-clay" />
                </SheetDescription>
              </SheetHeader>
              <nav className="grid gap-1 px-4" aria-label="Mobil sayfalar">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-lg px-3 py-3 text-base hover:bg-accent",
                      isActive(pathname, item.href) && "bg-accent font-semibold",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/panel"
                  onClick={() => setOpen(false)}
                  className="mt-2 rounded-lg bg-ink px-3 py-3 text-base text-paper"
                >
                  Saha defteri
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-ink text-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <BrandLogo className="h-28 w-28" />
          <p className="mt-4 max-w-xs text-sm leading-6 text-paper/75">
            Kazı, dolgu, yıkım ve moloz nakliyesi. Kepçe, ekskavatör, loder ve kamyon aynı programda.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-ochre uppercase">Sayfalar</p>
          <ul className="mt-3 grid gap-2 text-sm">
            {NAV.slice(1).map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-paper/80 hover:text-paper">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/panel" className="text-paper/80 hover:text-paper">
                Saha defteri
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="mt-0">
            <OwnerPhone />
          </div>
          <div className="mt-4">
            <CompanyLines />
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-paper/55 sm:px-6">
        Kuşçuoğlu Hafriyat · Kayıtlar ve teklif formları bu tarayıcıda kalır.
      </div>
    </footer>
  );
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}

export function PageIntro({
  kicker,
  title,
  lede,
}: {
  kicker: string;
  title: string;
  lede: string;
}) {
  return (
    <section className="hero-grid border-b border-white/10 text-paper">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-xs font-semibold tracking-[0.18em] text-ochre uppercase">{kicker}</p>
        <h1 className="mt-3 max-w-3xl font-display text-5xl leading-[0.95] tracking-tight sm:text-6xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-paper/80">{lede}</p>
      </div>
    </section>
  );
}

export function QuoteBand() {
  return (
    <section className="bg-ink text-paper">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-ochre uppercase">Teklif</p>
          <h2 className="mt-2 font-display text-4xl leading-none sm:text-5xl">
            Sahayı söyleyin, kapsamı yazalım.
          </h2>
          <p className="mt-3 max-w-xl text-paper/75">
            İş cinsi, yaklaşık ölçü ve yer yeter. Form sunucuya gitmez; talep bu tarayıcıda saklanır.
          </p>
        </div>
        <Link
          href="/iletisim"
          className={cn(buttonVariants({ size: "lg" }), "h-11 bg-ochre px-5 text-base text-ink hover:bg-ochre/90")}
        >
          Teklif iste
        </Link>
      </div>
    </section>
  );
}
