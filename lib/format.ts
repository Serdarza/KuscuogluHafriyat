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

export const UNITS = ["m³", "metre", "sefer", "saat", "gün", "adet"];

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
