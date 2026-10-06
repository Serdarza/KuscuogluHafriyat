import { emptyCompany, parseBook, type Book } from "@/lib/book";
import { defaultGithubSettings, type GithubSettings } from "@/lib/github-ledger";

export { companyIsEmpty, emptyCompany } from "@/lib/book";

export const LEDGER_KEY = "kh.ledger.v1";
export const COMPANY_KEY = "kh.company.v1";
export const BOOK_KEY = "kh.book.v1";
export const GITHUB_KEY = "kh.github.v1";

export function readCachedBook(): Book | null {
  const raw = localStorage.getItem(BOOK_KEY);
  if (raw) return parseBook(raw);
  const ledgerRaw = localStorage.getItem(LEDGER_KEY);
  if (!ledgerRaw) return null;
  const companyRaw = localStorage.getItem(COMPANY_KEY);
  const combined = companyRaw
    ? JSON.stringify({ version: 1, company: JSON.parse(companyRaw), ledger: JSON.parse(ledgerRaw) })
    : JSON.stringify({ version: 1, company: emptyCompany(), ledger: JSON.parse(ledgerRaw) });
  return parseBook(combined);
}

export function writeCachedBook(book: Book) {
  localStorage.setItem(BOOK_KEY, JSON.stringify(book));
}

export function readGithubSettings(): GithubSettings {
  const fallback = defaultGithubSettings();
  const raw = localStorage.getItem(GITHUB_KEY);
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as Partial<GithubSettings>;
    return {
      token: typeof parsed.token === "string" ? parsed.token : "",
      owner: typeof parsed.owner === "string" && parsed.owner.trim() ? parsed.owner.trim() : fallback.owner,
      repo: typeof parsed.repo === "string" && parsed.repo.trim() ? parsed.repo.trim() : fallback.repo,
      branch: typeof parsed.branch === "string" && parsed.branch.trim() ? parsed.branch.trim() : fallback.branch,
      path: typeof parsed.path === "string" && parsed.path.trim() ? parsed.path.trim() : fallback.path,
    };
  } catch {
    return fallback;
  }
}

export function writeGithubSettings(settings: GithubSettings) {
  const next = {
    token: settings.token.trim(),
    owner: settings.owner.trim() || defaultGithubSettings().owner,
    repo: settings.repo.trim() || defaultGithubSettings().repo,
    branch: settings.branch.trim() || defaultGithubSettings().branch,
    path: settings.path.trim() || defaultGithubSettings().path,
  };
  localStorage.setItem(GITHUB_KEY, JSON.stringify(next));
  return next;
}
