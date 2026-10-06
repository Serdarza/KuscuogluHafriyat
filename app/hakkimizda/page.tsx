import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro, SiteShell } from "@/components/site/shell";
import { buttonVariants } from "@/components/ui/button";
import { steps } from "@/lib/content";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: "Kuşçuoğlu Hafriyat saha ekibi: keşif, metraj, makine programı ve teslim.",
};

export default function AboutPage() {
  return (
    <SiteShell>
      <PageIntro
        kicker="Hakkımızda"
        title="Saha ekibi, masa başı vaat değil."
        lede="Kuşçuoğlu Hafriyat kazı ile nakliyeyi ayırmaz. Kepçe girer, kamyon aynı gün çıkar, loder teslim kotunu toplar. Kuruluş yılı ya da sertifika sayısı uydurulmaz."
      />
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-4xl leading-none">Nasıl çalışılır</h2>
          <ol className="mt-6 grid gap-5">
            {steps.map((step) => (
              <li key={step.n} className="grid grid-cols-[auto_1fr] gap-4">
                <span className="font-display text-3xl text-ochre">{step.n}</span>
                <div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-xl bg-card p-6 ring-1 ring-foreground/10">
          <h2 className="text-xl font-semibold">Ne yazılmaz</h2>
          <ul className="mt-4 grid gap-3 text-sm leading-6 text-muted-foreground">
            <li>Telefon, adres, vergi dairesi ve VKN siz girene kadar boş kalır.</li>
            <li>Müşteri listesi ve sokak adresi referans diye konmaz.</li>
            <li>Paneldeki gelir, gider, mazot ve fatura bu tarayıcıda durur. Hesap açılmaz.</li>
            <li>İndirilen PDF hazırlanmış faturadır. GİB e-Fatura değildir.</li>
          </ul>
          <Link href="/iletisim#firma" className={cn(buttonVariants(), "mt-6 h-10 px-4")}>
            Firma kartını doldur
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
