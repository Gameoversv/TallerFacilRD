export type InvoiceStatus = "PENDIENTE" | "PAGADA" | "ANULADA";
export type InvoiceItemType = "MANO_OBRA" | "PIEZA";

export interface InvoiceItem {
  id: string;
  item_type: InvoiceItemType;
  description: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  work_order_id: string;
  vehicle_label: string;
  customer_name: string;
  issue_date: string;
  status: InvoiceStatus;
  apply_itbis: boolean;
  itbis_rate: number;
  subtotal: number;
  itbis_amount: number;
  total: number;
  paid_amount: number;
  remaining_balance: number;
  notes: string | null;
  items: InvoiceItem[];
  created_at: string;
}

export interface InvoicesPage {
  data: Invoice[];
  meta: { total: number; page: number; limit: number };
}

export interface InvoiceItemInput {
  itemType: InvoiceItemType;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateInvoiceRequest {
  workOrderId: string;
  issueDate: string;
  applyItbis: boolean;
  notes?: string;
  items: InvoiceItemInput[];
}
