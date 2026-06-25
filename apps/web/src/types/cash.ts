export type TransactionType = "INGRESO" | "EGRESO";

export interface CashTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string | null;
  transaction_date: string;
  created_at: string | null;
}

export interface CashBalance {
  from: string;
  to: string;
  total_ingresos: number;
  total_egresos: number;
  balance: number;
}

export interface CreateCashTransactionRequest {
  type: TransactionType;
  amount: number;
  description: string;
  category?: string;
  transactionDate: string;
}
