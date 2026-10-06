export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <div className="h-3 w-24 animate-pulse rounded bg-muted" />
      <div className="mt-4 h-12 w-2/3 animate-pulse rounded bg-muted" />
      <div className="mt-6 h-24 animate-pulse rounded bg-muted" />
      <p className="mt-6 text-sm text-muted-foreground">Sayfa yükleniyor…</p>
    </div>
  );
}
