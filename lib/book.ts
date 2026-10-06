import { invoiceSubtotal, newId } from "@/lib/format";
import type {
  CompanyProfile,
  CustomerType,
  Expense,
  ExpenseCategory,
  Fuel,
  Income,
  Invoice,
  InvoiceLine,
  Ledger,
  PaymentStatus,
} from "@/lib/types";

export function emptyCompany(): CompanyProfile {
  return {
    phone: "",
    email: "",
    address: "",
    city: "",
    unvan: "",
  };
}

export function companyIsEmpty(company: CompanyProfile) {
  return Object.values(company).every((value) => value.trim() === "");
}

export type Book = {
  version: 1;
  company: CompanyProfile;
  ledger: Ledger;
};

const PAYMENTS: PaymentStatus[] = ["odendi", "beklemede", "kismi"];
const CUSTOMERS: CustomerType[] = ["sirket", "sahis"];
const CATEGORIES: ExpenseCategory[] = ["mazot", "bakim", "iscilik", "yedek-parca", "diger"];

export function emptyLedger(): Ledger {
  return { incomes: [], expenses: [], fuels: [], invoices: [] };
}

export function emptyBook(): Book {
  return { version: 1, company: emptyCompany(), ledger: emptyLedger() };
}

export function isBookEmpty(book: Book) {
  const { ledger, company } = book;
  const companyBlank = Object.values(company).every((value) => value.trim() === "");
  return (
    companyBlank &&
    ledger.incomes.length === 0 &&
    ledger.expenses.length === 0 &&
    ledger.fuels.length === 0 &&
    ledger.invoices.length === 0
  );
}

function payment(value: unknown): PaymentStatus {
  return PAYMENTS.includes(value as PaymentStatus) ? (value as PaymentStatus) : "beklemede";
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function num(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function flag(value: unknown) {
  return value === true;
}

function customer(value: unknown): CustomerType {
  return CUSTOMERS.includes(value as CustomerType) ? (value as CustomerType) : "sirket";
}

function normalizeIncome(value: unknown): Income | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Partial<Income>;
  if (typeof row.id !== "string" || typeof row.date !== "string") return null;
  return {
    id: row.id,
    date: row.date,
    customerType: customer(row.customerType),
    name: text(row.name),
    jobType: text(row.jobType),
    amount: num(row.amount),
    vatRate: num(row.vatRate),
    paymentStatus: payment(row.paymentStatus),
    invoiceId: typeof row.invoiceId === "string" && row.invoiceId ? row.invoiceId : undefined,
    sample: flag(row.sample),
  };
}

function normalizeExpense(value: unknown): Expense | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Partial<Expense>;
  if (typeof row.id !== "string" || typeof row.date !== "string") return null;
  const category = CATEGORIES.includes(row.category as ExpenseCategory)
    ? (row.category as ExpenseCategory)
    : "diger";
  return {
    id: row.id,
    date: row.date,
    category,
    amount: num(row.amount),
    machine: text(row.machine),
    note: text(row.note),
    sample: flag(row.sample),
  };
}

function normalizeFuel(value: unknown): Fuel | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Partial<Fuel>;
  if (typeof row.id !== "string" || typeof row.date !== "string") return null;
  return {
    id: row.id,
    date: row.date,
    litres: num(row.litres),
    pricePerLitre: num(row.pricePerLitre),
    machine: text(row.machine),
    station: text(row.station),
    sample: flag(row.sample),
  };
}

function normalizeLine(value: unknown): InvoiceLine | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Partial<InvoiceLine>;
  if (typeof row.id !== "string") return null;
  return {
    id: row.id,
    description: text(row.description),
    quantity: num(row.quantity),
    unit: text(row.unit) || "adet",
    unitPrice: num(row.unitPrice),
  };
}

function normalizeInvoice(value: unknown): Invoice | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Partial<Invoice>;
  if (typeof row.id !== "string" || typeof row.date !== "string") return null;
  const lines = Array.isArray(row.lines) ? row.lines.map(normalizeLine).filter((line) => line !== null) : [];
  const jobStart = text(row.jobStart) || row.date;
  const jobEnd = text(row.jobEnd) || jobStart;
  return {
    id: row.id,
    number: text(row.number),
    date: row.date,
    jobStart,
    jobEnd,
    customerType: customer(row.customerType),
    unvan: text(row.unvan),
    adSoyad: text(row.adSoyad),
    tckn: text(row.tckn),
    address: text(row.address),
    phone: text(row.phone) || undefined,
    lines,
    vatRate: num(row.vatRate),
    paymentStatus: payment(row.paymentStatus),
    sample: flag(row.sample),
  };
}

function normalizeLedger(value: unknown): Ledger | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Partial<Ledger>;
  if (!Array.isArray(row.incomes) || !Array.isArray(row.expenses) || !Array.isArray(row.fuels) || !Array.isArray(row.invoices)) {
    return null;
  }
  return {
    incomes: row.incomes.map(normalizeIncome).filter((item) => item !== null),
    expenses: row.expenses.map(normalizeExpense).filter((item) => item !== null),
    fuels: row.fuels.map(normalizeFuel).filter((item) => item !== null),
    invoices: row.invoices.map(normalizeInvoice).filter((item) => item !== null),
  };
}

function normalizeCompany(value: unknown): CompanyProfile {
  const row = value && typeof value === "object" ? (value as Partial<CompanyProfile>) : {};
  return {
    phone: text(row.phone),
    email: text(row.email),
    address: text(row.address),
    city: text(row.city),
    unvan: text(row.unvan),
  };
}

export function parseBook(raw: string): Book {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Defter dosyası JSON değil.");
  }
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Defter dosyası boş.");
  }
  const record = parsed as { version?: unknown; company?: unknown; ledger?: unknown };
  const ledger = normalizeLedger("ledger" in record ? record.ledger : record);
  if (!ledger) throw new Error("Defter biçimi tanınmadı.");
  return {
    version: 1,
    company: normalizeCompany(record.company),
    ledger,
  };
}

export function serializeBook(book: Book) {
  return `${JSON.stringify({ version: 1, company: book.company, ledger: book.ledger }, null, 2)}\n`;
}

/**
 * Writes the invoice into the list first. The income row is optional and
 * only added when one is not already linked to this invoice id.
 */
export function saveInvoiceInLedger(ledger: Ledger, row: Invoice, postIncome: boolean, createId: () => string = newId): Ledger {
  const id = row.id.trim() ? row.id : createId();
  const invoice: Invoice = {
    ...row,
    id,
    paymentStatus: row.paymentStatus || "beklemede",
    sample: false,
  };
  const exists = ledger.invoices.some((item) => item.id === id);
  const invoices = exists
    ? ledger.invoices.map((item) => (item.id === id ? invoice : item))
    : [invoice, ...ledger.invoices];

  let incomes = ledger.incomes;
  if (postIncome && !incomes.some((item) => item.invoiceId === id)) {
    const name = invoice.customerType === "sirket" ? invoice.unvan : invoice.adSoyad;
    incomes = [
      {
        id: createId(),
        invoiceId: id,
        date: invoice.date,
        customerType: invoice.customerType,
        name,
        jobType: invoice.lines[0]?.description || "Fatura",
        amount: invoiceSubtotal(invoice),
        vatRate: invoice.vatRate,
        paymentStatus: "beklemede",
        sample: false,
      },
      ...incomes,
    ];
  }

  return { ...ledger, invoices, incomes };
}
