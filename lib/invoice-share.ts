import { brand } from "@/lib/brand";
import { formatTry, invoiceGross } from "@/lib/format";
import { invoicePdfBlob, invoicePdfFileName } from "@/lib/pdf";
import type { CompanyProfile, Invoice } from "@/lib/types";

export function invoiceCustomerName(invoice: Invoice) {
  const name = invoice.customerType === "sirket" ? invoice.unvan : invoice.adSoyad;
  return name.trim() || "—";
}

/** Short caption sent with the PDF on the share sheet. */
export function invoiceShareSummary(invoice: Invoice) {
  const number = invoice.number.trim() || "—";
  return [
    `Kuşçuoğlu Hafriyat — Fatura ${number}`,
    `Müşteri: ${invoiceCustomerName(invoice)}`,
    `Tutar: ${formatTry(invoiceGross(invoice))} (KDV dahil)`,
    `Tel: ${brand.phoneDisplay}`,
  ].join("\n");
}

/** wa.me text when the PDF was saved locally and must be attached by hand. */
export function invoiceDownloadedText(invoice: Invoice) {
  const number = invoice.number.trim() || "—";
  return [
    "Fatura PDF’i indirildi. WhatsApp’ta bu sohbete ekleyin.",
    `Fatura no: ${number}`,
    `Müşteri: ${invoiceCustomerName(invoice)}`,
    `Tutar: ${formatTry(invoiceGross(invoice))} (KDV dahil)`,
  ].join("\n");
}

/** Digits for wa.me. Empty when the phone is missing or not usable. */
export function whatsAppDigits(phone: string | undefined) {
  let digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = `90${digits.slice(1)}`;
  else if (digits.length === 10) digits = `90${digits}`;
  if (digits.length < 11 || digits.length > 15) return "";
  return digits;
}

export function whatsAppHref(invoice: Invoice, text = invoiceDownloadedText(invoice)) {
  const encoded = encodeURIComponent(text);
  const digits = whatsAppDigits(invoice.phone);
  return digits ? `https://wa.me/${digits}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
}

export type WhatsAppShareResult =
  | { status: "shared" }
  | { status: "cancelled" }
  | { status: "downloaded"; href: string; opened: boolean }
  | { status: "failed"; message: string };

function canSharePdf(file: File) {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") return false;
  if (typeof navigator.canShare !== "function") return false;
  try {
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function openWhatsApp(href: string) {
  const opened = window.open(href, "_blank", "noopener,noreferrer");
  return opened !== null;
}

export async function shareInvoiceOnWhatsApp(
  invoice: Invoice,
  company: CompanyProfile,
): Promise<WhatsAppShareResult> {
  let file: File;
  try {
    const blob = await invoicePdfBlob(invoice, company);
    file = new File([blob], invoicePdfFileName(invoice), { type: "application/pdf" });
  } catch (cause) {
    return { status: "failed", message: cause instanceof Error ? cause.message : "PDF oluşturulamadı." };
  }

  if (canSharePdf(file)) {
    try {
      await navigator.share({ files: [file], text: invoiceShareSummary(invoice) });
      return { status: "shared" };
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === "AbortError") return { status: "cancelled" };
    }
  }

  saveBlob(file, file.name);
  const href = whatsAppHref(invoice);
  return { status: "downloaded", href, opened: openWhatsApp(href) };
}
