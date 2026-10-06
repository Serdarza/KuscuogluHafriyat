import { jsPDF } from "jspdf";
import {
  formatJobRange,
  formatSpokenDate,
  formatTry,
  invoiceGross,
  invoiceSubtotal,
  invoiceVatAmount,
  lineAmount,
} from "@/lib/format";
import { brand, brandAsset } from "@/lib/brand";
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
  const logoRes = await fetch(brandAsset(brand.logoSrc));
  if (!logoRes.ok) throw new Error("Logo yüklenemedi.");
  const logo = `data:image/jpeg;base64,${bytesToBase64(await logoRes.arrayBuffer())}`;
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
  pdf.rect(0, 0, 210, 42, "F");
  pdf.setFillColor(ochre[0], ochre[1], ochre[2]);
  pdf.rect(0, 42, 210, 2.2, "F");
  pdf.addImage(logo, "JPEG", 8, 6, 30, 30);

  write(brand.owner, 44, 18, { bold: true, size: 13, color: paper });
  write(brand.phoneDisplay, 44, 26, { size: 12, color: ochre });
  write("FATURA", 196, 18, { bold: true, size: 16, align: "right", color: paper });
  write(invoice.number || "Numarasız", 196, 26, {
    size: 11,
    align: "right",
    color: paper,
  });

  write("İş tarihi", 14, 54, { bold: true, size: 9, color: ochre });
  const jobLabel = formatJobRange(invoice.jobStart, invoice.jobEnd);
  const jobLines = pdf.splitTextToSize(jobLabel, 182);
  write(String(jobLines[0] ?? ""), 14, 60, { bold: true, size: 12 });
  write("Fatura tarihi", 14, 70, { bold: true, size: 9, color: ochre });
  write(formatSpokenDate(invoice.date), 14, 76, { bold: true, size: 12 });

  write("DÜZENLEYEN", 14, 88, { bold: true, size: 9, color: ochre });
  write("MÜŞTERİ", 110, 88, { bold: true, size: 9, color: ochre });

  const issuer = [
    orDash(company.unvan),
    `Yetkili: ${brand.owner}`,
    orDash([company.address, company.city].filter((part) => part.trim()).join(", ")),
    `Telefon: ${company.phone.trim() || brand.phoneDisplay}`,
    company.email.trim() ? company.email.trim() : "E-posta: —",
  ];

  const customer =
    invoice.customerType === "sirket"
      ? [orDash(invoice.unvan), orDash(invoice.address), "Müşteri tipi: Şirket"]
      : [
          orDash(invoice.adSoyad),
          invoice.tckn.trim() ? `TCKN: ${invoice.tckn.trim()}` : "TCKN: —",
          orDash(invoice.address),
          "Müşteri tipi: Şahıs",
        ];

  issuer.forEach((line, index) => {
    const wrapped = pdf.splitTextToSize(line, 84);
    write(wrapped[0] ?? "", 14, 95 + index * 5.5, { size: 9 });
  });
  customer.forEach((line, index) => {
    const wrapped = pdf.splitTextToSize(line, 84);
    write(wrapped[0] ?? "", 110, 95 + index * 5.5, { size: 9 });
  });

  let y = 130;
  pdf.setFillColor(ink[0], ink[1], ink[2]);
  pdf.rect(14, y, 182, 8, "F");
  write("Açıklama", 17, y + 5.4, { size: 9, color: paper, bold: true });
  write("Miktar", 122, y + 5.4, { size: 9, color: paper, bold: true, align: "right" });
  write("Birim", 136, y + 5.4, { size: 9, color: paper, bold: true });
  write("Birim fiyat", 168, y + 5.4, { size: 9, color: paper, bold: true, align: "right" });
  write("Tutar", 194, y + 5.4, { size: 9, color: paper, bold: true, align: "right" });
  y += 12;

  invoice.lines.forEach((line, index) => {
    if (y > 248) {
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

  write("Hazırlanmış fatura PDF'idir. GİB e-Fatura belgesi değildir.", 14, 290, {
    size: 8,
    color: muted,
  });

  const safeName = (invoice.number || "fatura").replace(/[\\/:*?"<>|]+/g, "-");
  pdf.save(`fatura-${safeName}.pdf`);
}
