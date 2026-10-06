"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { newId } from "@/lib/format";
import { seedLedger } from "@/lib/seed";
import {
  COMPANY_EVENT,
  QUOTES_EVENT,
  emptyCompany,
  readCompany,
  readLedger,
  readQuotes,
  writeCompany,
  writeLedger,
} from "@/lib/storage";
import type {
  CompanyProfile,
  Expense,
  Fuel,
  Income,
  Invoice,
  Ledger,
  QuoteRequest,
} from "@/lib/types";

type Status = "loading" | "ready" | "error";

type LedgerContextValue = {
  status: Status;
  error: string | null;
  persistent: boolean;
  ledger: Ledger;
  company: CompanyProfile;
  quotes: QuoteRequest[];
  addIncome: (row: Omit<Income, "id">) => void;
  updateIncome: (row: Income) => void;
  deleteIncome: (id: string) => void;
  addExpense: (row: Omit<Expense, "id">) => void;
  updateExpense: (row: Expense) => void;
  deleteExpense: (id: string) => void;
  addFuel: (row: Omit<Fuel, "id">) => void;
  updateFuel: (row: Fuel) => void;
  deleteFuel: (id: string) => void;
  addInvoice: (row: Omit<Invoice, "id">) => void;
  updateInvoice: (row: Invoice) => void;
  deleteInvoice: (id: string) => void;
  removeSamples: () => void;
  retry: () => void;
  openMemoryCopy: () => void;
};

const LedgerContext = createContext<LedgerContextValue | null>(null);

const emptyLedger = (): Ledger => ({
  incomes: [],
  expenses: [],
  fuels: [],
  invoices: [],
});

export function LedgerProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [persistent, setPersistent] = useState(true);
  const [ledger, setLedger] = useState<Ledger>(emptyLedger);
  const [company, setCompany] = useState<CompanyProfile>(emptyCompany);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);

  const load = useCallback(() => {
    try {
      setLedger(readLedger());
      try {
        setCompany(readCompany());
      } catch {
        setCompany(emptyCompany());
      }
      try {
        setQuotes(readQuotes());
      } catch {
        setQuotes([]);
      }
      setPersistent(true);
      setError(null);
      setStatus("ready");
    } catch (cause) {
      setStatus("error");
      setPersistent(false);
      setError(cause instanceof Error ? cause.message : "Defter okunamadı.");
    }
  }, []);

  useEffect(() => {
    // Read after mount so the server shell and the first client paint match.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  useEffect(() => {
    const syncCompany = () => {
      try {
        setCompany(readCompany());
      } catch {
        setError("Firma kartı okunamadı.");
      }
    };
    const syncQuotes = () => {
      try {
        setQuotes(readQuotes());
      } catch {
        setQuotes([]);
      }
    };
    window.addEventListener(COMPANY_EVENT, syncCompany);
    window.addEventListener(QUOTES_EVENT, syncQuotes);
    return () => {
      window.removeEventListener(COMPANY_EVENT, syncCompany);
      window.removeEventListener(QUOTES_EVENT, syncQuotes);
    };
  }, []);

  const commit = useCallback((next: Ledger) => {
    setLedger(next);
    try {
      writeLedger(next);
      setPersistent(true);
    } catch {
      setPersistent(false);
      setError("Değişiklik bu oturumda duruyor. Tarayıcı kaydı yazılamadı.");
    }
  }, []);

  const value = useMemo<LedgerContextValue>(() => {
    return {
      status,
      error,
      persistent,
      ledger,
      company,
      quotes,
      addIncome: (row) => commit({ ...ledger, incomes: [{ ...row, id: newId() }, ...ledger.incomes] }),
      updateIncome: (row) =>
        commit({
          ...ledger,
          incomes: ledger.incomes.map((item) => (item.id === row.id ? row : item)),
        }),
      deleteIncome: (id) =>
        commit({ ...ledger, incomes: ledger.incomes.filter((item) => item.id !== id) }),
      addExpense: (row) => commit({ ...ledger, expenses: [{ ...row, id: newId() }, ...ledger.expenses] }),
      updateExpense: (row) =>
        commit({
          ...ledger,
          expenses: ledger.expenses.map((item) => (item.id === row.id ? row : item)),
        }),
      deleteExpense: (id) =>
        commit({ ...ledger, expenses: ledger.expenses.filter((item) => item.id !== id) }),
      addFuel: (row) => commit({ ...ledger, fuels: [{ ...row, id: newId() }, ...ledger.fuels] }),
      updateFuel: (row) =>
        commit({
          ...ledger,
          fuels: ledger.fuels.map((item) => (item.id === row.id ? row : item)),
        }),
      deleteFuel: (id) =>
        commit({ ...ledger, fuels: ledger.fuels.filter((item) => item.id !== id) }),
      addInvoice: (row) => commit({ ...ledger, invoices: [{ ...row, id: newId() }, ...ledger.invoices] }),
      updateInvoice: (row) =>
        commit({
          ...ledger,
          invoices: ledger.invoices.map((item) => (item.id === row.id ? row : item)),
        }),
      deleteInvoice: (id) =>
        commit({ ...ledger, invoices: ledger.invoices.filter((item) => item.id !== id) }),
      removeSamples: () =>
        commit({
          incomes: ledger.incomes.filter((item) => !item.sample),
          expenses: ledger.expenses.filter((item) => !item.sample),
          fuels: ledger.fuels.filter((item) => !item.sample),
          invoices: ledger.invoices.filter((item) => !item.sample),
        }),
      retry: load,
      openMemoryCopy: () => {
        setLedger(seedLedger());
        setCompany(emptyCompany());
        setStatus("ready");
        setPersistent(false);
        setError("Örnek defter bellekte açıldı. Tarayıcı kaydı yazılamadı.");
        try {
          writeLedger(seedLedger());
          writeCompany(emptyCompany());
          setPersistent(true);
          setError(null);
        } catch {
          setPersistent(false);
        }
      },
    };
  }, [commit, company, error, ledger, load, persistent, quotes, status]);

  return <LedgerContext.Provider value={value}>{children}</LedgerContext.Provider>;
}

export function useLedger() {
  const context = useContext(LedgerContext);
  if (!context) throw new Error("Defter sağlayıcısı yok.");
  return context;
}
