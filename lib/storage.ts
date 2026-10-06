import { seedLedger } from "@/lib/seed";
import type { CompanyProfile, Ledger, QuoteRequest } from "@/lib/types";

export const LEDGER_KEY = "kh.ledger.v1";
export const COMPANY_KEY = "kh.company.v1";
export const QUOTES_KEY = "kh.quotes.v1";
export const COMPANY_EVENT = "kh-company";
export const QUOTES_EVENT = "kh-quotes";

export function emptyCompany(): CompanyProfile {
  return {
    phone: "",
    email: "",
    address: "",
    city: "",
    unvan: "",
    vergiDairesi: "",
    vkn: "",
  };
}

export function companyIsEmpty(company: CompanyProfile) {
  return Object.values(company).every((value) => value.trim() === "");
}

function isLedger(value: unknown): value is Ledger {
  if (!value || typeof value !== "object") return false;
  const row = value as Ledger;
  return (
    Array.isArray(row.incomes) &&
    Array.isArray(row.expenses) &&
    Array.isArray(row.fuels) &&
    Array.isArray(row.invoices)
  );
}

export function readLedger(): Ledger {
  const raw = localStorage.getItem(LEDGER_KEY);
  if (!raw) {
    const seeded = seedLedger();
    localStorage.setItem(LEDGER_KEY, JSON.stringify(seeded));
    return seeded;
  }
  const parsed: unknown = JSON.parse(raw);
  if (!isLedger(parsed)) {
    throw new Error("Defter biçimi tanınmadı.");
  }
  return parsed;
}

export function writeLedger(ledger: Ledger) {
  localStorage.setItem(LEDGER_KEY, JSON.stringify(ledger));
}

export function readCompany(): CompanyProfile {
  const raw = localStorage.getItem(COMPANY_KEY);
  if (!raw) return emptyCompany();
  const parsed = JSON.parse(raw) as Partial<CompanyProfile>;
  return { ...emptyCompany(), ...parsed };
}

export function writeCompany(company: CompanyProfile) {
  localStorage.setItem(COMPANY_KEY, JSON.stringify(company));
  window.dispatchEvent(new Event(COMPANY_EVENT));
}

export function readQuotes(): QuoteRequest[] {
  const raw = localStorage.getItem(QUOTES_KEY);
  if (!raw) return [];
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) return [];
  return parsed as QuoteRequest[];
}

export function writeQuotes(quotes: QuoteRequest[]) {
  localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
  window.dispatchEvent(new Event(QUOTES_EVENT));
}
