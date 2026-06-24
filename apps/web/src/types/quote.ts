export type QuoteStatus = "PENDIENTE" | "APROBADA" | "RECHAZADA";
export type QuoteItemType = "MANO_OBRA" | "PIEZA";

export interface QuoteItem {
  id: string;
  item_type: QuoteItemType;
  description: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Quote {
  id: string;
  work_order_id: string;
  status: QuoteStatus;
  apply_itbis: boolean;
  itbis_rate: number;
  subtotal: number;
  itbis_amount: number;
  total: number;
  notes: string | null;
  items: QuoteItem[];
  created_at: string;
  updated_at: string;
}

export interface QuoteItemInput {
  itemType: QuoteItemType;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateQuoteRequest {
  workOrderId: string;
  applyItbis: boolean;
  notes?: string;
  items: QuoteItemInput[];
}
