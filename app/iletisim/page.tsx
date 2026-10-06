import type { Metadata } from "next";
import { BrandLogo, OwnerPhone } from "@/components/site/brand-mark";
import { CompanyCard } from "@/components/site/company-card";
import { QuoteForm } from "@/components/site/quote-form";
import { PageIntro, SiteShell } from "@/components/site/shell";

export const metadata: Metadata = {
  title: "İletişim",
  description: "Kuşçuoğlu Hafriyat teklif formu ve firma kartı. Kayıtlar bu tarayıcıda kalır.",
};

export default function ContactPage() {
  return (
    <SiteShell>
      <PageIntro
        kicker="İletişim"
        title="Arayın ya da kapsamı yazın."
        lede="Teklif formu sunucuya gitmez; talep bu tarayıcıda saklanır. Ulaşmak için aşağıdaki numarayı kullanın."
      />
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-14 sm:px-6 lg:grid-cols-2">
        <div className="grid gap-6">
          <div className="flex items-center gap-5 rounded-xl bg-card p-5 ring-1 ring-foreground/10">
            <BrandLogo className="h-24 w-24 shrink-0" />
            <OwnerPhone tone="light" />
          </div>
          <CompanyCard />
        </div>
        <QuoteForm />
      </section>
    </SiteShell>
  );
}
