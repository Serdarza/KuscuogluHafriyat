"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLedger } from "@/components/panel/ledger-context";
import { DEFAULT_GITHUB, type GithubSettings } from "@/lib/github-ledger";

const TOKEN_URL = "https://github.com/settings/personal-access-tokens/new";

export function GithubSettingsCard() {
  const { github, sync, saveGithubSettings } = useLedger();
  const [draft, setDraft] = useState<GithubSettings>(github);
  const [notice, setNotice] = useState<string | null>(null);

  const connect = () => {
    const token = draft.token.trim();
    if (!token) {
      setNotice("Jetonu yapıştır.");
      return;
    }
    setNotice(null);
    saveGithubSettings({ ...DEFAULT_GITHUB, ...draft, token });
  };

  return (
    <section id="github-ayar" className="rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
      <p className="text-xs font-semibold tracking-[0.16em] text-clay uppercase">Ayarlar</p>
      <h2 className="mt-2 text-2xl font-semibold">Bir kez bağla</h2>
      <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
        <li>
          <a href={TOKEN_URL} className="font-medium text-clay underline" target="_blank" rel="noreferrer">
            Jeton oluştur
          </a>
          . Yalnızca KuscuogluHafriyat. İzin: Contents, Read and write.
        </li>
        <li>Jetonu buraya yapıştır.</li>
        <li>Bağla ve kaydet. Sonra her değişiklik kendiliğinden yazılır.</li>
      </ol>
      <div className="mt-5">
        <Label htmlFor="github-token">Jeton</Label>
        <Input
          id="github-token"
          className="mt-1.5 h-10"
          type="password"
          autoComplete="off"
          spellCheck={false}
          placeholder="github_pat_…"
          value={draft.token}
          onChange={(event) => {
            setDraft({ ...draft, token: event.target.value });
            setNotice(null);
          }}
        />
      </div>
      <Button type="button" className="mt-4 h-10" onClick={connect} disabled={sync.phase === "saving"}>
        {sync.phase === "saving" ? "Kaydediliyor…" : "Bağla ve kaydet"}
      </Button>
      {notice ? <p className="mt-3 text-sm text-destructive">{notice}</p> : null}
      <details className="mt-5 text-sm">
        <summary className="cursor-pointer text-muted-foreground">Gelişmiş</summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="github-owner">Depo sahibi</Label>
            <Input id="github-owner" className="mt-1.5 h-10" value={draft.owner} onChange={(event) => setDraft({ ...draft, owner: event.target.value })} />
          </div>
          <div>
            <Label htmlFor="github-repo">Depo</Label>
            <Input id="github-repo" className="mt-1.5 h-10" value={draft.repo} onChange={(event) => setDraft({ ...draft, repo: event.target.value })} />
          </div>
          <div>
            <Label htmlFor="github-branch">Dal</Label>
            <Input id="github-branch" className="mt-1.5 h-10" value={draft.branch} onChange={(event) => setDraft({ ...draft, branch: event.target.value })} />
          </div>
          <div>
            <Label htmlFor="github-path">Dosya</Label>
            <Input id="github-path" className="mt-1.5 h-10" value={draft.path} onChange={(event) => setDraft({ ...draft, path: event.target.value })} />
          </div>
        </div>
      </details>
    </section>
  );
}
