"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatTry } from "@/lib/format";

function TryTip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-ink px-3 py-2 text-xs text-paper shadow-lg">
      <p className="mb-1 font-semibold">{label}</p>
      {payload.map((item) => (
        <p key={item.name} style={{ color: item.color === "#3f2e24" ? "#f6f1e7" : "#e7c08a" }}>
          {item.name}: {formatTry(Number(item.value ?? 0))}
        </p>
      ))}
    </div>
  );
}

export function MonthlyChart({
  data,
}: {
  data: Array<{ label: string; gelir: number; gider: number }>;
}) {
  const empty = data.every((row) => row.gelir === 0 && row.gider === 0);
  if (empty) {
    return (
      <p className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Bu yıl için gelir veya gider yok. Grafik boş durmasın diye örnek kayıtlar ilk açılışta yüklenir.
      </p>
    );
  }
  return (
    <div className="h-64 w-full min-w-0 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 8 }}>
          <CartesianGrid stroke="#e4dccf" vertical={false} />
          <XAxis
            dataKey="label"
            interval={0}
            tick={{ fill: "#5e564c", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            angle={-40}
            textAnchor="end"
            height={46}
          />
          <YAxis
            tick={{ fill: "#5e564c", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={44}
            tickFormatter={(value: number) =>
              new Intl.NumberFormat("tr-TR", { notation: "compact", maximumFractionDigits: 1 }).format(value)
            }
          />
          <Tooltip content={<TryTip />} />
          <Legend />
          <Bar dataKey="gelir" name="Gelir" fill="#3f2e24" radius={[3, 3, 0, 0]} />
          <Bar dataKey="gider" name="Gider" fill="#c4843a" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function YearlyChart({
  data,
}: {
  data: Array<{ label: string; gelir: number; gider: number; net: number }>;
}) {
  if (data.length === 0) {
    return (
      <p className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Yıllık eğilim için defterde kayıt yok.
      </p>
    );
  }
  return (
    <div className="h-64 w-full min-w-0 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#e4dccf" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: "#5e564c", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fill: "#5e564c", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={44}
            tickFormatter={(value: number) =>
              new Intl.NumberFormat("tr-TR", { notation: "compact", maximumFractionDigits: 1 }).format(value)
            }
          />
          <Tooltip content={<TryTip />} />
          <Legend />
          <Line type="monotone" dataKey="gelir" name="Gelir" stroke="#3f2e24" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="gider" name="Gider" stroke="#c4843a" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="net" name="Net" stroke="#5f6b4a" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
