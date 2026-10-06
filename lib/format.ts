import type {
  CustomerType,
  ExpenseCategory,
  Invoice,
  InvoiceLine,
  PaymentStatus,
  PeriodFilter,
} from "@/lib/types";

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function withVat(amount: number, vatRate: number) {
  return roundMoney(amount * (1 + vatRate / 100));
}

export function formatTry(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number, digits = 2) {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatDate(iso: string) {
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return iso;
  return `${day}.${month}.${year}`;
}

function spokenParts(iso: string) {
  const [year, month, day] = iso.split("-");
  const monthIndex = Number(month) - 1;
  const dayNumber = Number(day);
  if (!year || monthIndex < 0 || monthIndex > 11 || !dayNumber) return null;
  return { year, monthIndex, day: dayNumber };
}

export function formatSpokenDate(iso: string) {
  const date = spokenParts(iso);
  if (!date) return iso;
  return `${date.day} ${MONTHS_LONG[date.monthIndex]} ${date.year}`;
}

/** Single day, or a range such as “3–5 Ekim 2026”. */
export function formatJobRange(start: string, end: string) {
  const from = spokenParts(start);
  const to = spokenParts(end || start);
  if (!from) return start;
  if (!to || start === end) return formatSpokenDate(start);
  if (from.year === to.year && from.monthIndex === to.monthIndex) {
    return `${from.day}–${to.day} ${MONTHS_LONG[from.monthIndex]} ${from.year}`;
  }
  if (from.year === to.year) {
    return `${from.day} ${MONTHS_LONG[from.monthIndex]}–${to.day} ${MONTHS_LONG[to.monthIndex]} ${from.year}`;
  }
  return `${formatSpokenDate(start)}–${formatSpokenDate(end)}`;
}

export function formatDateTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export const MONTHS_SHORT = [
  "Oca",
  "Şub",
  "Mar",
  "Nis",
  "May",
  "Haz",
  "Tem",
  "Ağu",
  "Eyl",
  "Eki",
  "Kas",
  "Ara",
];

export const MONTHS_LONG = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

export const PAYMENT_LABEL: Record<PaymentStatus, string> = {
  odendi: "Ödendi",
  beklemede: "Beklemede",
  kismi: "Kısmi",
};

export const CATEGORY_LABEL: Record<ExpenseCategory, string> = {
  mazot: "Mazot",
  bakim: "Bakım",
  iscilik: "İşçilik",
  "yedek-parca": "Yedek parça",
  diger: "Diğer",
};

export const CUSTOMER_LABEL: Record<CustomerType, string> = {
  sirket: "Şirket",
  sahis: "Şahıs",
};

export const JOB_TYPES = [
  "Hafriyat",
  "Temel kazısı",
  "Kanal kazısı",
  "Dolgu",
  "Yıkım",
  "Moloz nakliyesi",
  "Saha düzenleme",
  "Kepçe çalışması",
  "Diğer",
];

export const MACHINES = [
  "Paletli ekskavatör",
  "Lastikli kepçe",
  "Loder",
  "Kamyon",
  "Saha ekibi",
];

export const VAT_RATES = [0, 1, 10, 20];

export const UNITS = ["saat", "m³", "metre", "sefer", "gün", "adet"];

export function lineAmount(line: InvoiceLine) {
  return roundMoney(line.quantity * line.unitPrice);
}

export function invoiceSubtotal(invoice: Pick<Invoice, "lines">) {
  return roundMoney(invoice.lines.reduce((sum, line) => sum + lineAmount(line), 0));
}

export function invoiceVatAmount(invoice: Pick<Invoice, "lines" | "vatRate">) {
  return roundMoney((invoiceSubtotal(invoice) * invoice.vatRate) / 100);
}

export function invoiceGross(invoice: Pick<Invoice, "lines" | "vatRate">) {
  return roundMoney(invoiceSubtotal(invoice) + invoiceVatAmount(invoice));
}

export function todayIso(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function autoNumberPattern(date: string) {
  return new RegExp(`^KH-${date}-(\\d{2})$`);
}

export function isAutoInvoiceNumber(number: string, date: string) {
  return autoNumberPattern(date).test(number.trim());
}

export function formatInvoiceNumber(date: string, sequence: number) {
  return `KH-${date}-${String(sequence).padStart(2, "0")}`;
}

/** Next KH-YYYY-MM-DD-NN for this fatura tarihi. Ignores the invoice being edited. */
export function suggestInvoiceNumber(
  date: string,
  invoices: Pick<Invoice, "id" | "date" | "number">[],
  ignoreId = "",
) {
  const taken = new Set<number>();
  let count = 0;
  for (const invoice of invoices) {
    if (ignoreId && invoice.id === ignoreId) continue;
    const match = invoice.number.trim().match(autoNumberPattern(date));
    if (match) taken.add(Number(match[1]));
    if (invoice.date === date) count += 1;
  }
  const highest = taken.size > 0 ? Math.max(...taken) : 0;
  let next = Math.max(highest + 1, count + 1, 1);
  while (taken.has(next)) next += 1;
  return formatInvoiceNumber(date, next);
}

/**
 * Replace the number only when it is still the automatic number for the previous fatura tarihi.
 * A hand-typed number stays as written.
 */
export function invoiceNumberForDateChange(
  current: string,
  oldDate: string,
  newDate: string,
  invoices: Pick<Invoice, "id" | "date" | "number">[],
  ignoreId = "",
) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) return current;
  if (newDate === oldDate) return current;
  if (!isAutoInvoiceNumber(current, oldDate)) return current;
  return suggestInvoiceNumber(newDate, invoices, ignoreId);
}

export function currentMonthValue(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function defaultFilter(date = new Date()): PeriodFilter {
  return {
    mode: "month",
    month: currentMonthValue(date),
    year: String(date.getFullYear()),
    from: "",
    to: "",
  };
}

export function inPeriod(date: string, filter: PeriodFilter) {
  if (filter.mode === "all") return true;
  if (filter.mode === "month") return date.startsWith(filter.month);
  if (filter.mode === "year") return date.startsWith(filter.year);
  if (filter.from && date < filter.from) return false;
  if (filter.to && date > filter.to) return false;
  return true;
}

export function chartYear(filter: PeriodFilter) {
  if (filter.mode === "month" && filter.month.length >= 4) {
    return filter.month.slice(0, 4);
  }
  if (filter.mode === "year") return filter.year;
  if (filter.mode === "range" && filter.from.length >= 4) {
    return filter.from.slice(0, 4);
  }
  return String(new Date().getFullYear());
}

export function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function blank(value: string) {
  return value.trim().length > 0 ? value.trim() : "";
}
