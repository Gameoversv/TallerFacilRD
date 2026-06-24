export interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
}

export interface PurchaseItem {
  id: string;
  product_id: string;
  product_code: string;
  product_description: string;
  quantity: number;
  unit_cost: number;
  subtotal: number;
}

export interface Purchase {
  id: string;
  supplier_id: string;
  supplier_name: string;
  purchase_date: string;
  total: number;
  notes: string | null;
  items: PurchaseItem[];
  created_at: string;
}

export interface PurchasesPage {
  data: Purchase[];
  meta: { total: number; page: number; limit: number };
}

export interface CreateSupplierRequest {
  name: string;
  phone?: string;
  email?: string;
}

export interface PurchaseItemInput {
  productId: string;
  quantity: number;
  unitCost: number;
}

export interface CreatePurchaseRequest {
  supplierId: string;
  purchaseDate: string;
  notes?: string;
  items: PurchaseItemInput[];
}
