import { isBookEmpty, parseBook, serializeBook, type Book } from "@/lib/book";

export const DEFAULT_GITHUB = {
  owner: "Serdarza",
  repo: "KuscuogluHafriyat",
  branch: "main",
  path: "data/ledger.json",
} as const;

export type GithubSettings = {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  path: string;
};

export function defaultGithubSettings(): GithubSettings {
  return { token: "", ...DEFAULT_GITHUB };
}

export type RemoteRead =
  | { kind: "missing" }
  | { kind: "empty"; sha: string | null }
  | { kind: "ok"; book: Book; sha: string | null; empty: boolean }
  | { kind: "invalid"; message: string; sha: string | null };

export class GithubError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function trimSettings(settings: GithubSettings): GithubSettings {
  return {
    token: settings.token.trim(),
    owner: settings.owner.trim() || DEFAULT_GITHUB.owner,
    repo: settings.repo.trim() || DEFAULT_GITHUB.repo,
    branch: settings.branch.trim() || DEFAULT_GITHUB.branch,
    path: settings.path.trim() || DEFAULT_GITHUB.path,
  };
}

function contentsUrl(settings: GithubSettings) {
  const path = settings.path
    .split("/")
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join("/");
  return `https://api.github.com/repos/${encodeURIComponent(settings.owner)}/${encodeURIComponent(settings.repo)}/contents/${path}`;
}

function apiUrl(settings: GithubSettings) {
  return `${contentsUrl(settings)}?ref=${encodeURIComponent(settings.branch)}`;
}

function rawUrl(settings: GithubSettings) {
  const path = settings.path
    .split("/")
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join("/");
  return `https://raw.githubusercontent.com/${encodeURIComponent(settings.owner)}/${encodeURIComponent(settings.repo)}/${encodeURIComponent(settings.branch)}/${path}`;
}

function apiHeaders(token: string, json = false) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (json) headers["Content-Type"] = "application/json";
  return headers;
}

export function encodeUtf8Base64(text: string) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  const chunk = 0x8000;
  for (let index = 0; index < bytes.length; index += chunk) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunk));
  }
  return btoa(binary);
}

export function decodeUtf8Base64(content: string) {
  const binary = atob(content.replace(/\s/g, ""));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function timeoutSignal(ms: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, done: () => clearTimeout(timer) };
}

function describeStatus(status: number) {
  if (status === 401 || status === 403) {
    return "Jeton reddedildi. Bu depoya contents:write yetkisi olan ince ayarlı bir jeton kullanın.";
  }
  if (status === 404) return "Depo veya dosya bulunamadı.";
  if (status === 409 || status === 422) return "Dosya başka bir kayıtla çakıştı. Yeniden deneyin.";
  return `GitHub yanıtı ${status}.`;
}

async function readResponse(response: Response) {
  if (response.ok) return;
  let extra = "";
  try {
    const body = (await response.json()) as { message?: string };
    if (body.message) extra = ` ${body.message}`;
  } catch {
    extra = "";
  }
  throw new GithubError(`${describeStatus(response.status)}${extra}`, response.status);
}

function interpretText(text: string, sha: string | null): RemoteRead {
  if (!text.trim()) return { kind: "empty", sha };
  try {
    const book = parseBook(text);
    if (isBookEmpty(book)) return { kind: "empty", sha };
    return { kind: "ok", book, sha, empty: false };
  } catch (cause) {
    return {
      kind: "invalid",
      message: cause instanceof Error ? cause.message : "Defter okunamadı.",
      sha,
    };
  }
}

async function readViaApi(settings: GithubSettings): Promise<RemoteRead> {
  const timer = timeoutSignal(12000);
  try {
    const response = await fetch(apiUrl(settings), {
      headers: apiHeaders(settings.token),
      cache: "no-store",
      signal: timer.signal,
    });
    if (response.status === 404) return { kind: "missing" };
    await readResponse(response);
    const body = (await response.json()) as { content?: string; sha?: string; encoding?: string };
    if (body.encoding && body.encoding !== "base64") {
      return { kind: "invalid", message: "GitHub dosya kodlaması tanınmadı.", sha: body.sha ?? null };
    }
    const text = body.content ? decodeUtf8Base64(body.content) : "";
    return interpretText(text, body.sha ?? null);
  } catch (cause) {
    if (cause instanceof GithubError) throw cause;
    if (cause instanceof DOMException && cause.name === "AbortError") {
      throw new GithubError("GitHub yanıt vermedi.", 0);
    }
    throw new GithubError("GitHub’a ulaşılamadı. Bağlantı yok olabilir.", 0);
  } finally {
    timer.done();
  }
}

async function readViaRaw(settings: GithubSettings): Promise<RemoteRead> {
  const timer = timeoutSignal(12000);
  try {
    const response = await fetch(rawUrl(settings), { cache: "no-store", signal: timer.signal });
    if (response.status === 404) return { kind: "missing" };
    if (!response.ok) throw new GithubError(describeStatus(response.status), response.status);
    return interpretText(await response.text(), null);
  } catch (cause) {
    if (cause instanceof GithubError) throw cause;
    if (cause instanceof DOMException && cause.name === "AbortError") {
      throw new GithubError("GitHub yanıt vermedi.", 0);
    }
    throw new GithubError("GitHub’a ulaşılamadı. Bağlantı yok olabilir.", 0);
  } finally {
    timer.done();
  }
}

export async function readRemoteBook(settings: GithubSettings): Promise<RemoteRead> {
  const next = trimSettings(settings);
  if (next.token) return readViaApi(next);
  return readViaRaw(next);
}

export async function writeRemoteBook(settings: GithubSettings, book: Book, sha: string | null, message: string) {
  const next = trimSettings(settings);
  if (!next.token) {
    throw new GithubError("GitHub jetonu yok. Kayıt yalnızca bu tarayıcıda.", 0);
  }
  const payload = {
    message,
    content: encodeUtf8Base64(serializeBook(book)),
    branch: next.branch,
    ...(sha ? { sha } : {}),
  };
  const send = async (body: typeof payload) => {
    const timer = timeoutSignal(20000);
    try {
      const response = await fetch(contentsUrl(next), {
        method: "PUT",
        headers: apiHeaders(next.token, true),
        body: JSON.stringify(body),
        signal: timer.signal,
      });
      if (!response.ok) {
        await readResponse(response);
      }
      const saved = (await response.json()) as { content?: { sha?: string } };
      const nextSha = saved.content?.sha;
      if (!nextSha) throw new GithubError("GitHub kayıt onayını döndürmedi.", response.status);
      return nextSha;
    } finally {
      timer.done();
    }
  };

  try {
    return await send(payload);
  } catch (cause) {
    if (!(cause instanceof GithubError) || (cause.status !== 409 && cause.status !== 422)) throw cause;
    const current = await readViaApi(next);
    const latestSha = current.kind === "missing" ? null : current.sha;
    const retry = {
      message,
      content: payload.content,
      branch: next.branch,
      ...(latestSha ? { sha: latestSha } : {}),
    };
    return send(retry);
  }
}
