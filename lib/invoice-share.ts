import { brand } from "@/lib/brand";
import { formatJobRange, formatSpokenDate, formatTry, invoiceGross } from "@/lib/format";
import { invoicePdfBlob, invoicePdfFileName } from "@/lib/pdf";
import type { CompanyProfile, Invoice } from "@/lib/types";

export function invoiceCustomerName(invoice: Invoice) {
  const name = invoice.customerType === "sirket" ? invoice.unvan : invoice.adSoyad;
  return name.trim() || "—";
}

export function invoiceShareText(invoice: Invoice) {
  return [
    `Kuşçuoğlu Hafriyat — Fatura ${invoice.number.trim() || "—"}`,
    `Müşteri: ${invoiceCustomerName(invoice)}`,
    `İş: ${formatJobRange(invoice.jobStart, invoice.jobEnd)}`,
    `Fatura tarihi: ${formatSpokenDate(invoice.date)}`,
    `Tutar: ${formatTry(invoiceGross(invoice))} (KDV dahil)`,
    `Tel: ${brand.phoneDisplay}`,
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

export function whatsAppHref(invoice: Invoice) {
  const text = encodeURIComponent(invoiceShareText(invoice));
  const digits = whatsAppDigits(invoice.phone);
  return digits ? `https://wa.me/${digits}?text=${text}` : `https://wa.me/?text=${text}`;
}

export type ShareResult = "shared" | "copied" | "cancelled" | "unavailable";

export async function shareInvoice(invoice: Invoice, company: CompanyProfile): Promise<ShareResult> {
  const text = invoiceShareText(invoice);
  const title = `Fatura ${invoice.number.trim() || "Kuşçuoğlu Hafriyat"}`;
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
    return (await copyText(text)) ? "copied" : "unavailable";
  }

  const payload: ShareData = { title, text };
  try {
    const blob = await invoicePdfBlob(invoice, company);
    const file = new File([blob], invoicePdfFileName(invoice), { type: "application/pdf" });
    if (typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
      payload.files = [file];
    }
  } catch {
    // Text share still works when the PDF cannot be built.
  }

  try {
    await navigator.share(payload);
    return "shared";
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === "AbortError") return "cancelled";
    return (await copyText(text)) ? "copied" : "unavailable";
  }
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
