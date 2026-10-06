import type { Metadata } from "next";
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
        title="Önce kart, sonra teklif."
        lede="Firma telefonu ve adresi boş başlar. Siz yazmadan sitede numara görünmez. Teklif formu da sunucuya gitmez; talep bu tarayıcıda saklanır."
      />
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-14 sm:px-6 lg:grid-cols-2">
        <CompanyCard />
        <QuoteForm />
      </section>
    </SiteShell>
  );
}
