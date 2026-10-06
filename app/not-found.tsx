import Link from "next/link";
import { SiteShell } from "@/components/site/shell";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="font-display text-7xl text-ochre">404</p>
        <h1 className="mt-4 text-3xl font-semibold">Bu sayfa yok</h1>
        <p className="mt-3 text-muted-foreground">Aradığınız adres sitede durmuyor.</p>
        <Link href="/" className={cn(buttonVariants(), "mt-6 h-10 px-4")}>
          Ana sayfa
        </Link>
      </section>
    </SiteShell>
  );
}
