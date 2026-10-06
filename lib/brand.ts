export const brand = {
  owner: "Bedir Berk Kuşçu",
  phoneDisplay: "0553 108 48 54",
  phoneTel: "+905531084854",
  logoSrc: "/brand/kuscuoglu-logo.jpg",
} as const;

export function brandAsset(path: string) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${path}`;
}
