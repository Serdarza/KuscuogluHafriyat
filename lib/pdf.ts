import { jsPDF } from "jspdf";
import {
  formatDate,
  formatTry,
  invoiceGross,
  invoiceSubtotal,
  invoiceVatAmount,
  lineAmount,
} from "@/lib/format";
import type { CompanyProfile, Invoice } from "@/lib/types";

const ink = [28, 25, 23] as const;
const ochre = [196, 132, 58] as const;
const paper = [246, 241, 231] as const;
const muted = [94, 86, 76] as const;

let fontCache: { regular: string; bold: string } | null = null;

function bytesToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let index = 0; index < bytes.length; index += chunk) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunk));
  }
  return btoa(binary);
}

async function loadFonts() {
  if (fontCache) return fontCache;
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const [regularRes, boldRes] = await Promise.all([
    fetch(`${base}/fonts/NotoSans-Regular.ttf`),
    fetch(`${base}/fonts/NotoSans-Bold.ttf`),
  ]);
  if (!regularRes.ok || !boldRes.ok) {
    throw new Error("Fatura yazı tipi yüklenemedi.");
  }
  fontCache = {
    regular: bytesToBase64(await regularRes.arrayBuffer()),
    bold: bytesToBase64(await boldRes.arrayBuffer()),
  };
  return fontCache;
}

function orDash(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : "—";
}

export async function downloadInvoicePdf(
  invoice: Invoice,
  company: CompanyProfile,
) {
  const fonts = await loadFonts();
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  pdf.addFileToVFS("NotoSans-Regular.ttf", fonts.regular);
  pdf.addFileToVFS("NotoSans-Bold.ttf", fonts.bold);
  pdf.addFont("NotoSans-Regular.ttf", "NotoSans", "normal", undefined, "Identity-H");
  pdf.addFont("NotoSans-Bold.ttf", "NotoSans", "bold", undefined, "Identity-H");

  const write = (
    value: string,
    x: number,
    y: number,
    options?: { bold?: boolean; size?: number; align?: "left" | "right" | "center"; color?: readonly [number, number, number] },
  ) => {
    const color = options?.color ?? ink;
    pdf.setTextColor(color[0], color[1], color[2]);
    pdf.setFont("NotoSans", options?.bold ? "bold" : "normal");
    pdf.setFontSize(options?.size ?? 10);
    pdf.text(value, x, y, { align: options?.align ?? "left" });
  };

  pdf.setFillColor(ink[0], ink[1], ink[2]);
  pdf.rect(0, 0, 210, 34, "F");
  pdf.setFillColor(ochre[0], ochre[1], ochre[2]);
  pdf.rect(0, 34, 210, 2.2, "F");

  write("KUŞÇUOĞLU HAFRİYAT", 14, 15, { bold: true, size: 18, color: paper });
  write("SAHA İŞLERİ", 14, 23, { size: 10, color: ochre });
  write("FATURA", 196, 14, { bold: true, size: 16, align: "right", color: paper });
  write(invoice.number || "Numarasız", 196, 21, {
    size: 10,
    align: "right",
    color: paper,
  });
  write(formatDate(invoice.date), 196, 27, {
    size: 10,
    align: "right",
    color: paper,
  });

  pdf.setFillColor(246, 236, 214);
  pdf.rect(14, 42, 182, 12, "F");
  write(
    "Hazırlanmış fatura PDF'idir. GİB e-Fatura belgesi değildir.",
    18,
    49.5,
    { bold: true, size: 10, color: ink },
  );

  write("DÜZENLEYEN", 14, 64, { bold: true, size: 9, color: ochre });
  write("MÜŞTERİ", 110, 64, { bold: true, size: 9, color: ochre });

  const issuer = [
    orDash(company.unvan),
    company.vergiDairesi.trim() ? `Vergi dairesi: ${company.vergiDairesi.trim()}` : "Vergi dairesi: —",
    company.vkn.trim() ? `VKN: ${company.vkn.trim()}` : "VKN: —",
    orDash([company.address, company.city].filter((part) => part.trim()).join(", ")),
    company.phone.trim() ? company.phone.trim() : "Telefon: —",
    company.email.trim() ? company.email.trim() : "E-posta: —",
  ];

  const customer =
    invoice.customerType === "sirket"
      ? [
          orDash(invoice.unvan),
          invoice.vergiDairesi.trim()
            ? `Vergi dairesi: ${invoice.vergiDairesi.trim()}`
            : "Vergi dairesi: —",
          invoice.vkn.trim() ? `VKN: ${invoice.vkn.trim()}` : "VKN: —",
          orDash(invoice.address),
          "Müşteri tipi: Şirket",
        ]
      : [
          orDash(invoice.adSoyad),
          invoice.tckn.trim() ? `TCKN: ${invoice.tckn.trim()}` : "TCKN: —",
          orDash(invoice.address),
          "Müşteri tipi: Şahıs",
        ];

  issuer.forEach((line, index) => {
    const wrapped = pdf.splitTextToSize(line, 84);
    write(wrapped[0] ?? "", 14, 71 + index * 6, { size: 10 });
  });
  customer.forEach((line, index) => {
    const wrapped = pdf.splitTextToSize(line, 84);
    write(wrapped[0] ?? "", 110, 71 + index * 6, { size: 10 });
  });

  let y = 112;
  pdf.setFillColor(ink[0], ink[1], ink[2]);
  pdf.rect(14, y, 182, 8, "F");
  write("Açıklama", 17, y + 5.4, { size: 9, color: paper, bold: true });
  write("Miktar", 122, y + 5.4, { size: 9, color: paper, bold: true, align: "right" });
  write("Birim", 136, y + 5.4, { size: 9, color: paper, bold: true });
  write("Birim fiyat", 168, y + 5.4, { size: 9, color: paper, bold: true, align: "right" });
  write("Tutar", 194, y + 5.4, { size: 9, color: paper, bold: true, align: "right" });
  y += 12;

  invoice.lines.forEach((line, index) => {
    if (y > 250) {
      pdf.addPage();
      y = 20;
    }
    if (index % 2 === 0) {
      pdf.setFillColor(247, 243, 235);
      pdf.rect(14, y - 4.5, 182, 8, "F");
    }
    const description = pdf.splitTextToSize(line.description || "—", 78);
    write(String(description[0] ?? "—"), 17, y, { size: 10 });
    write(String(line.quantity), 122, y, { size: 10, align: "right" });
    write(line.unit, 136, y, { size: 10 });
    write(formatTry(line.unitPrice), 168, y, { size: 10, align: "right" });
    write(formatTry(lineAmount(line)), 194, y, { size: 10, align: "right" });
    y += 8;
  });

  y += 6;
  const subtotal = invoiceSubtotal(invoice);
  const vat = invoiceVatAmount(invoice);
  const gross = invoiceGross(invoice);
  const totals: Array<[string, string, boolean]> = [
    ["Ara toplam", formatTry(subtotal), false],
    [`KDV %${invoice.vatRate}`, formatTry(vat), false],
    ["Genel toplam", formatTry(gross), true],
  ];

  totals.forEach(([label, value, strong]) => {
    write(label, 140, y, { size: strong ? 12 : 10, bold: strong });
    write(value, 194, y, { size: strong ? 12 : 10, bold: strong, align: "right" });
    y += strong ? 8 : 6;
  });

  write(
    "Bu çıktı tarayıcıda hazırlanmıştır. Resmî e-Fatura yerine geçmez. Vergi dairesi, VKN ve TCKN alanları siz doldurmadıysanız boş bırakılır.",
    14,
    282,
    { size: 8, color: muted },
  );

  const safeName = (invoice.number || "fatura").replace(/[\\/:*?"<>|]+/g, "-");
  pdf.save(`fatura-${safeName}.pdf`);
}
