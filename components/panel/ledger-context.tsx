"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { emptyBook, emptyCompany, saveInvoiceInLedger, type Book } from "@/lib/book";
import { formatDateTime, newId } from "@/lib/format";
import { defaultGithubSettings, GithubError, readRemoteBook, writeRemoteBook, type GithubSettings } from "@/lib/github-ledger";
import { seedLedger } from "@/lib/seed";
import { readCachedBook, readGithubSettings, writeCachedBook, writeGithubSettings } from "@/lib/storage";
import type { CompanyProfile, Expense, Fuel, Income, Invoice, Ledger } from "@/lib/types";

type Status = "loading" | "ready" | "error";

export type SyncPhase = "loading" | "saving" | "saved" | "error" | "local";

export type SyncStatus = {
  phase: SyncPhase;
  detail: string;
  savedAt: string | null;
  dirty: boolean;
  hasToken: boolean;
};

type LedgerContextValue = {
  status: Status;
  error: string | null;
  sync: SyncStatus;
  ledger: Ledger;
  company: CompanyProfile;
  github: GithubSettings;
  addIncome: (row: Omit<Income, "id">) => void;
  updateIncome: (row: Income) => void;
  deleteIncome: (id: string) => void;
  addExpense: (row: Omit<Expense, "id">) => void;
  updateExpense: (row: Expense) => void;
  deleteExpense: (id: string) => void;
  addFuel: (row: Omit<Fuel, "id">) => void;
  updateFuel: (row: Fuel) => void;
  deleteFuel: (id: string) => void;
  saveInvoice: (row: Invoice, options: { postIncome: boolean }) => void;
  deleteInvoice: (id: string) => void;
  saveCompany: (company: CompanyProfile) => void;
  saveGithubSettings: (settings: GithubSettings) => void;
  pushToGithub: () => void;
  removeSamples: () => void;
  retry: () => void;
  openSample: () => void;
};

const LedgerContext = createContext<LedgerContextValue | null>(null);

const idleSync: SyncStatus = {
  phase: "loading",
  detail: "Defter okunuyor…",
  savedAt: null,
  dirty: false,
  hasToken: false,
};

export function LedgerProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [sync, setSync] = useState<SyncStatus>(idleSync);
  const [ledger, setLedger] = useState<Ledger>(emptyBook().ledger);
  const [company, setCompany] = useState<CompanyProfile>(emptyCompany());
  const [github, setGithub] = useState<GithubSettings>(defaultGithubSettings);

  const bookRef = useRef<Book>(emptyBook());
  const shaRef = useRef<string | null>(null);
  const settingsRef = useRef<GithubSettings>(defaultGithubSettings());
  const dirtyRef = useRef(false);
  const savedAtRef = useRef<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const pushLock = useRef(false);
  const pushAgain = useRef(false);

  const publish = useCallback((book: Book) => {
    bookRef.current = book;
    setLedger(book.ledger);
    setCompany(book.company);
  }, []);

  const cache = useCallback((book: Book) => {
    try {
      writeCachedBook(book);
    } catch {
      setError("Tarayıcı kaydı yazılamadı. Bu oturumdaki değişiklik bellekte.");
    }
  }, []);

  const markSync = useCallback((next: SyncStatus) => {
    savedAtRef.current = next.savedAt;
    setSync(next);
  }, []);

  const pushNow = useCallback(async () => {
    const settings = settingsRef.current;
    if (!settings.token.trim()) {
      markSync({
        phase: "local",
        detail: "Jeton yok. Defter bu tarayıcıda. GitHub’a kaydetmek için Firma kartına jeton yazın.",
        savedAt: savedAtRef.current,
        dirty: true,
        hasToken: false,
      });
      return;
    }
    if (pushLock.current) {
      pushAgain.current = true;
      return;
    }
    pushLock.current = true;
    markSync({
      phase: "saving",
      detail: "Kaydediliyor…",
      savedAt: savedAtRef.current,
      dirty: true,
      hasToken: true,
    });
    try {
      let sha = shaRef.current;
      if (!sha) {
        const remote = await readRemoteBook(settings);
        sha = remote.kind === "missing" ? null : remote.sha;
        shaRef.current = sha;
      }
      for (;;) {
        pushAgain.current = false;
        const snapshot = bookRef.current;
        const nextSha = await writeRemoteBook(settings, snapshot, shaRef.current, "Saha defteri güncellendi");
        shaRef.current = nextSha;
        sha = nextSha;
        const savedAt = new Date().toISOString();
        if (bookRef.current === snapshot && !pushAgain.current) {
          dirtyRef.current = false;
          markSync({
            phase: "saved",
            detail: `Son kayıt ${formatDateTime(savedAt)}`,
            savedAt,
            dirty: false,
            hasToken: true,
          });
          break;
        }
      }
    } catch (cause) {
      const detail = cause instanceof GithubError ? cause.message : "GitHub’a yazılamadı.";
      markSync({
        phase: "error",
        detail: `${detail} Değişiklik bu tarayıcıda duruyor.`,
        savedAt: savedAtRef.current,
        dirty: true,
        hasToken: true,
      });
    } finally {
      pushLock.current = false;
      if (pushAgain.current) {
        pushAgain.current = false;
        void pushNow();
      }
    }
  }, [markSync]);

  const schedulePush = useCallback(() => {
    const hasToken = Boolean(settingsRef.current.token.trim());
    if (!hasToken) {
      markSync({
        phase: "local",
        detail: "Henüz GitHub’a yazılmadı. Kayıt bu tarayıcıda.",
        savedAt: savedAtRef.current,
        dirty: true,
        hasToken: false,
      });
      return;
    }
    markSync({
      phase: "saving",
      detail: "Kaydediliyor…",
      savedAt: savedAtRef.current,
      dirty: true,
      hasToken: true,
    });
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      void pushNow();
    }, 600);
  }, [markSync, pushNow]);

  const change = useCallback(
    (mutate: (book: Book) => Book) => {
      const next = mutate(bookRef.current);
      dirtyRef.current = true;
      publish(next);
      cache(next);
      schedulePush();
    },
    [cache, publish, schedulePush],
  );

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    const settings = readGithubSettings();
    settingsRef.current = settings;
    setGithub(settings);
    markSync({
      phase: "loading",
      detail: "Defter GitHub’dan okunuyor…",
      savedAt: null,
      dirty: false,
      hasToken: Boolean(settings.token.trim()),
    });

    let cached: Book | null = null;
    let cacheError: string | null = null;
    try {
      cached = readCachedBook();
    } catch (cause) {
      cacheError = cause instanceof Error ? cause.message : "Tarayıcıdaki defter okunamadı.";
    }

    const adoptLocal = (book: Book, detail: string, phase: SyncPhase) => {
      dirtyRef.current = true;
      publish(book);
      cache(book);
      markSync({
        phase,
        detail,
        savedAt: null,
        dirty: true,
        hasToken: Boolean(settings.token.trim()),
      });
      setStatus("ready");
    };

    try {
      const remote = await readRemoteBook(settings);
      if (remote.kind === "invalid") {
        if (cached) {
          shaRef.current = remote.sha;
          adoptLocal(
            cached,
            `${remote.message} Tarayıcı kopyası açık. Kaydetmek uzak dosyanın üzerine yazar.`,
            "error",
          );
          return;
        }
        setStatus("error");
        setError(`${remote.message} Uzak dosyanın üzerine örnek yazılmadı.`);
        return;
      }
      if (remote.kind === "ok") {
        shaRef.current = remote.sha;
        dirtyRef.current = false;
        publish(remote.book);
        cache(remote.book);
        markSync({
          phase: "saved",
          detail: settings.token.trim()
            ? "GitHub’dan okundu."
            : "GitHub’dan okundu. Yazmak için jeton gerekir.",
          savedAt: null,
          dirty: false,
          hasToken: Boolean(settings.token.trim()),
        });
        setStatus("ready");
        return;
      }

      shaRef.current = remote.kind === "empty" ? remote.sha : null;
      if (cached && (cached.ledger.incomes.length || cached.ledger.expenses.length || cached.ledger.fuels.length || cached.ledger.invoices.length || Object.values(cached.company).some((value) => value.trim()))) {
        adoptLocal(cached, "Uzak defter boş. Bu tarayıcıdaki kayıt duruyor ve henüz eşitlenmedi.", "local");
        return;
      }
      const seeded: Book = { version: 1, company: emptyCompany(), ledger: seedLedger() };
      adoptLocal(
        seeded,
        "Örnek defter yüklendi. GitHub dosyası yoktu veya boştu; jetonla kaydedince yazılır. Gerçek kayıtların üzerine yazılmaz.",
        "local",
      );
    } catch (cause) {
      const reason = cause instanceof GithubError ? cause.message : "GitHub okunamadı.";
      if (cached) {
        adoptLocal(cached, `${reason} Tarayıcı kopyası açık, henüz eşitlenmedi.`, "error");
        return;
      }
      if (cacheError) {
        setStatus("error");
        setError(`${reason} ${cacheError}`);
        return;
      }
      const seeded: Book = { version: 1, company: emptyCompany(), ledger: seedLedger() };
      adoptLocal(seeded, `${reason} Örnek defter bu tarayıcıda. Henüz GitHub’a yazılmadı.`, "error");
    }
  }, [cache, markSync, publish]);

  useEffect(() => {
    // Read after mount so the server shell and the first client paint match.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [load]);

  const value = useMemo<LedgerContextValue>(() => {
    const withLedger = (book: Book, next: Ledger): Book => ({ ...book, ledger: next });
    return {
      status,
      error,
      sync,
      ledger,
      company,
      github,
      addIncome: (row) =>
        change((book) => withLedger(book, { ...book.ledger, incomes: [{ ...row, id: newId() }, ...book.ledger.incomes] })),
      updateIncome: (row) =>
        change((book) =>
          withLedger(book, {
            ...book.ledger,
            incomes: book.ledger.incomes.map((item) => (item.id === row.id ? row : item)),
          }),
        ),
      deleteIncome: (id) =>
        change((book) => withLedger(book, { ...book.ledger, incomes: book.ledger.incomes.filter((item) => item.id !== id) })),
      addExpense: (row) =>
        change((book) => withLedger(book, { ...book.ledger, expenses: [{ ...row, id: newId() }, ...book.ledger.expenses] })),
      updateExpense: (row) =>
        change((book) =>
          withLedger(book, {
            ...book.ledger,
            expenses: book.ledger.expenses.map((item) => (item.id === row.id ? row : item)),
          }),
        ),
      deleteExpense: (id) =>
        change((book) =>
          withLedger(book, { ...book.ledger, expenses: book.ledger.expenses.filter((item) => item.id !== id) }),
        ),
      addFuel: (row) =>
        change((book) => withLedger(book, { ...book.ledger, fuels: [{ ...row, id: newId() }, ...book.ledger.fuels] })),
      updateFuel: (row) =>
        change((book) =>
          withLedger(book, {
            ...book.ledger,
            fuels: book.ledger.fuels.map((item) => (item.id === row.id ? row : item)),
          }),
        ),
      deleteFuel: (id) =>
        change((book) => withLedger(book, { ...book.ledger, fuels: book.ledger.fuels.filter((item) => item.id !== id) })),
      saveInvoice: (row, options) =>
        change((book) => withLedger(book, saveInvoiceInLedger(book.ledger, row, options.postIncome))),
      deleteInvoice: (id) =>
        change((book) =>
          withLedger(book, { ...book.ledger, invoices: book.ledger.invoices.filter((item) => item.id !== id) }),
        ),
      saveCompany: (next) => change((book) => ({ ...book, company: next })),
      saveGithubSettings: (next) => {
        try {
          const stored = writeGithubSettings(next);
          settingsRef.current = stored;
          setGithub(stored);
          markSync({
            ...sync,
            hasToken: Boolean(stored.token.trim()),
            detail: stored.token.trim()
              ? dirtyRef.current
                ? "Jeton bu tarayıcıda. GitHub’a kaydet ile defteri yazın."
                : sync.detail
              : "Jeton silindi. Yeni kayıtlar eşitlenmez.",
            phase: stored.token.trim() ? (dirtyRef.current ? "local" : sync.phase) : "local",
            dirty: dirtyRef.current,
          });
        } catch {
          setError("Jeton bu tarayıcıya yazılamadı.");
        }
      },
      pushToGithub: () => {
        if (timerRef.current) window.clearTimeout(timerRef.current);
        void pushNow();
      },
      removeSamples: () =>
        change((book) =>
          withLedger(book, {
            incomes: book.ledger.incomes.filter((item) => !item.sample),
            expenses: book.ledger.expenses.filter((item) => !item.sample),
            fuels: book.ledger.fuels.filter((item) => !item.sample),
            invoices: book.ledger.invoices.filter((item) => !item.sample),
          }),
        ),
      retry: () => {
        void load();
      },
      openSample: () => {
        const seeded: Book = { version: 1, company: emptyCompany(), ledger: seedLedger() };
        dirtyRef.current = true;
        publish(seeded);
        cache(seeded);
        setStatus("ready");
        setError(null);
        markSync({
          phase: "local",
          detail: "Örnek defter bu tarayıcıda. GitHub’a kendiliğinden yazılmadı.",
          savedAt: savedAtRef.current,
          dirty: true,
          hasToken: Boolean(settingsRef.current.token.trim()),
        });
      },
    };
  }, [cache, change, company, error, github, ledger, load, markSync, publish, pushNow, status, sync]);

  return <LedgerContext.Provider value={value}>{children}</LedgerContext.Provider>;
}

export function useLedger() {
  const context = useContext(LedgerContext);
  if (!context) throw new Error("Defter sağlayıcısı yok.");
  return context;
}
