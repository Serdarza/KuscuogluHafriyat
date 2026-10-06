export type CustomerType = "sirket" | "sahis";

export type PaymentStatus = "odendi" | "beklemede" | "kismi";

export type ExpenseCategory =
  | "mazot"
  | "bakim"
  | "iscilik"
  | "yedek-parca"
  | "diger";

export type Income = {
  id: string;
  date: string;
  customerType: CustomerType;
  name: string;
  jobType: string;
  amount: number;
  vatRate: number;
  paymentStatus: PaymentStatus;
  /** Set when this row was posted from a fatura. */
  invoiceId?: string;
  sample: boolean;
};

export type Expense = {
  id: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  machine: string;
  note: string;
  sample: boolean;
};

export type Fuel = {
  id: string;
  date: string;
  litres: number;
  pricePerLitre: number;
  machine: string;
  station: string;
  sample: boolean;
};

export type InvoiceLine = {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
};

export type Invoice = {
  id: string;
  number: string;
  /** Fatura tarihi. Overdue and period filters use this, not the job dates. */
  date: string;
  /** İş başlangıç. Inclusive. */
  jobStart: string;
  /** İş bitiş. Inclusive; may equal jobStart. */
  jobEnd: string;
  customerType: CustomerType;
  unvan: string;
  adSoyad: string;
  tckn: string;
  address: string;
  lines: InvoiceLine[];
  vatRate: number;
  paymentStatus: PaymentStatus;
  sample: boolean;
};

export type CompanyProfile = {
  phone: string;
  email: string;
  address: string;
  city: string;
  unvan: string;
};

export type QuoteRequest = {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  email: string;
  jobType: string;
  place: string;
  message: string;
};

export type Ledger = {
  incomes: Income[];
  expenses: Expense[];
  fuels: Fuel[];
  invoices: Invoice[];
};

export type PeriodMode = "month" | "year" | "range" | "all";

export type PeriodFilter = {
  mode: PeriodMode;
  month: string;
  year: string;
  from: string;
  to: string;
};
