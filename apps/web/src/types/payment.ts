export type PaymentMethod = "EFECTIVO" | "TRANSFERENCIA" | "TARJETA" | "CHEQUE";

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethod;
  notes: string | null;
  created_at: string;
}

export interface CreatePaymentRequest {
  invoiceId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}
