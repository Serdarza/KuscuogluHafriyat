"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLedger } from "@/components/panel/ledger-context";
import { DEFAULT_GITHUB, type GithubSettings } from "@/lib/github-ledger";

export function GithubSettingsCard() {
  const { github, sync, saveGithubSettings, pushToGithub } = useLedger();
  const [draft, setDraft] = useState<GithubSettings>(github);
  const [notice, setNotice] = useState<string | null>(null);

  const update = (key: keyof GithubSettings, value: string) => {
    setDraft({ ...draft, [key]: value });
    setNotice(null);
  };

  return (
    <section className="rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
      <p className="text-xs font-semibold tracking-[0.16em] text-clay uppercase">Ayarlar</p>
      <h2 className="mt-2 text-2xl font-semibold">GitHub’a kaydet</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Defter {DEFAULT_GITHUB.owner}/{DEFAULT_GITHUB.repo} içinde {DEFAULT_GITHUB.path} dosyasına yazılır. Jeton yalnızca bu tarayıcıda durur, depoya konmaz.
      </p>
      <p className="mt-3 text-sm">
        <span className="font-medium">Durum: </span>
        {sync.detail}
      </p>
      <div className="mt-5 grid gap-4">
        <div>
          <Label htmlFor="github-token">Kişisel erişim jetonu</Label>
          <Input
            id="github-token"
            className="mt-1.5 h-10"
            type="password"
            autoComplete="off"
            spellCheck={false}
            placeholder="github_pat_…"
            value={draft.token}
            onChange={(event) => update("token", event.target.value)}
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Yalnızca bu depo, Contents okuma ve yazma. contents:write.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="github-owner">Depo sahibi</Label>
            <Input id="github-owner" className="mt-1.5 h-10" value={draft.owner} onChange={(event) => update("owner", event.target.value)} />
          </div>
          <div>
            <Label htmlFor="github-repo">Depo adı</Label>
            <Input id="github-repo" className="mt-1.5 h-10" value={draft.repo} onChange={(event) => update("repo", event.target.value)} />
          </div>
          <div>
            <Label htmlFor="github-branch">Dal</Label>
            <Input id="github-branch" className="mt-1.5 h-10" value={draft.branch} onChange={(event) => update("branch", event.target.value)} />
          </div>
          <div>
            <Label htmlFor="github-path">Dosya</Label>
            <Input id="github-path" className="mt-1.5 h-10" value={draft.path} onChange={(event) => update("path", event.target.value)} />
          </div>
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button
          type="button"
          variant="outline"
          className="h-10"
          onClick={() => {
            saveGithubSettings(draft);
            setNotice("Jeton bu tarayıcıya yazıldı.");
          }}
        >
          Jetonu bu tarayıcıya kaydet
        </Button>
        <Button type="button" className="h-10" onClick={pushToGithub} disabled={sync.phase === "saving"}>
          {sync.phase === "saving" ? "Kaydediliyor…" : "GitHub’a kaydet"}
        </Button>
      </div>
      {notice ? <p className="mt-3 text-sm text-clay">{notice}</p> : null}
    </section>
  );
}
