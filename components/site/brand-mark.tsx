import Image from "next/image";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function BrandLogo({ className }: { className?: string }) {
  return (
    <Image
      src={brand.logoSrc}
      alt="Kuşçuoğlu, Hafriyat ve Oto Kurtarıcı"
      width={225}
      height={225}
      className={cn("h-16 w-16 object-contain", className)}
    />
  );
}

export function PhoneLink({ className }: { className?: string }) {
  return (
    <a href={`tel:${brand.phoneTel}`} className={className}>
      {brand.phoneDisplay}
    </a>
  );
}

export function OwnerPhone({
  tone = "dark",
  className,
}: {
  tone?: "dark" | "light";
  className?: string;
}) {
  const muted = tone === "dark" ? "text-paper/70" : "text-muted-foreground";
  const strong = tone === "dark" ? "text-paper" : "text-foreground";
  return (
    <div className={className}>
      <p className={`text-xs font-semibold tracking-[0.14em] uppercase ${muted}`}>Sahip</p>
      <p className={`mt-1 font-semibold ${strong}`}>{brand.owner}</p>
      <PhoneLink
        className={cn(
          "mt-1 inline-block text-sm font-semibold underline-offset-4 hover:underline",
          tone === "light" ? "text-clay" : "text-ochre",
        )}
      />
    </div>
  );
}
