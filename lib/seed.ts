import type { Expense, Fuel, Income, Invoice, Ledger } from "@/lib/types";
import { roundMoney } from "@/lib/format";

const jobs: Array<[Income["customerType"], string, string]> = [
  ["sirket", "Örnek — Parsel Kazı Ltd.", "Temel kazısı"],
  ["sahis", "Örnek şahıs — Yılmaz", "Kanal kazısı"],
  ["sirket", "Örnek — Dere Dolgu", "Dolgu"],
  ["sirket", "Örnek — Tepe Yıkım", "Yıkım"],
  ["sahis", "Örnek şahıs — Kaya", "Saha düzenleme"],
  ["sirket", "Örnek — Hat İnşaat", "Moloz nakliyesi"],
];

const machines = ["Paletli ekskavatör", "Lastikli kepçe", "Loder", "Kamyon"];

function monthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function seedLedger(): Ledger {
  const incomes: Income[] = [];
  const expenses: Expense[] = [];
  const fuels: Fuel[] = [];
  let n = 0;

  for (const year of [2025, 2026]) {
    const lastMonth = year === 2026 ? 10 : 12;
    for (let month = 1; month <= lastMonth; month += 1) {
      const ym = monthKey(year, month);
      const job = jobs[n % jobs.length];
      const day = ym === "2026-10" ? "03" : "11";
      const base = ym === "2026-10" ? 186000 : 72000 + (n % 7) * 14000;
      const payment: Income["paymentStatus"] =
        n % 6 === 0 ? "beklemede" : n % 5 === 0 ? "kismi" : "odendi";

      incomes.push({
        id: `ornek-gelir-${ym}`,
        date: `${ym}-${day}`,
        customerType: job[0],
        name: job[1],
        jobType: job[2],
        amount: base,
        vatRate: 20,
        paymentStatus: payment,
        sample: true,
      });

      if (n % 2 === 0 || ym === "2026-10") {
        const extra = jobs[(n + 2) % jobs.length];
        incomes.push({
          id: `ornek-gelir-${ym}-b`,
          date: `${ym}-${ym === "2026-10" ? "05" : "19"}`,
          customerType: extra[0],
          name: extra[1],
          jobType: extra[2],
          amount: roundMoney(base * 0.38),
          vatRate: 20,
          paymentStatus: ym === "2026-10" ? "beklemede" : "odendi",
          sample: true,
        });
      }

      const machine = machines[n % machines.length];
      const litres = 210 + (n % 6) * 28;
      const price = roundMoney(47.4 + (n % 5) * 0.45);
      fuels.push({
        id: `ornek-mazot-${ym}`,
        date: `${ym}-${ym === "2026-10" ? "02" : "08"}`,
        litres,
        pricePerLitre: price,
        machine,
        station: "Örnek istasyon",
        sample: true,
      });

      expenses.push({
        id: `ornek-gider-mazot-${ym}`,
        date: `${ym}-${ym === "2026-10" ? "02" : "08"}`,
        category: "mazot",
        amount: roundMoney(litres * price),
        machine,
        note: "Örnek — aynı ayın litre kaydı",
        sample: true,
      });

      expenses.push({
        id: `ornek-gider-iscilik-${ym}`,
        date: `${ym}-${ym === "2026-10" ? "04" : "15"}`,
        category: "iscilik",
        amount: 22000 + (n % 4) * 2500,
        machine: "Saha ekibi",
        note: "Örnek yevmiye",
        sample: true,
      });

      if (n % 3 === 0) {
        expenses.push({
          id: `ornek-gider-bakim-${ym}`,
          date: `${ym}-${ym === "2026-10" ? "06" : "16"}`,
          category: "bakim",
          amount: 8500 + (n % 3) * 1200,
          machine,
          note: "Örnek periyodik bakım",
          sample: true,
        });
      }

      if (n % 4 === 0) {
        expenses.push({
          id: `ornek-gider-parca-${ym}`,
          date: `${ym}-21`,
          category: "yedek-parca",
          amount: 6400,
          machine: "Paletli ekskavatör",
          note: "Örnek diş ve pim",
          sample: true,
        });
      }

      n += 1;
    }
  }

  const invoices: Invoice[] = [
    {
      id: "ornek-fatura-1",
      number: "KH-2026-10-03-01",
      date: "2026-10-03",
      jobStart: "2026-10-01",
      jobEnd: "2026-10-03",
      customerType: "sirket",
      unvan: "Örnek — Parsel Kazı Ltd.",
      adSoyad: "",
      tckn: "",
      address: "Örnek saha — adres yazılmadı",
      lines: [
        {
          id: "ornek-kalem-1",
          description: "Temel kazısı",
          quantity: 420,
          unit: "m³",
          unitPrice: 280,
        },
        {
          id: "ornek-kalem-2",
          description: "Moloz nakliyesi",
          quantity: 6,
          unit: "sefer",
          unitPrice: 4500,
        },
      ],
      vatRate: 20,
      paymentStatus: "beklemede",
      sample: true,
    },
  ];

  return { incomes, expenses, fuels, invoices };
}
