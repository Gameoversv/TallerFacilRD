export type ProductCategory = "ACEITES" | "FILTROS" | "SENSORES" | "BUJIAS" | "SUSPENSION" | "FRENOS";

export interface Product {
  id: string;
  internal_code: string;
  description: string;
  purchase_cost: number;
  sale_price: number;
  current_stock: number;
  min_stock: number;
  category: ProductCategory;
  low_stock: boolean;
  active: boolean;
  created_at: string;
}

export interface ProductsPage {
  data: Product[];
  meta: { total: number; page: number; limit: number };
}

export interface CreateProductRequest {
  internalCode: string;
  description: string;
  purchaseCost: number;
  salePrice: number;
  currentStock: number;
  minStock: number;
  category: ProductCategory;
}

export interface UpdateProductRequest {
  internalCode?: string;
  description?: string;
  purchaseCost?: number;
  salePrice?: number;
  currentStock?: number;
  minStock?: number;
  category?: ProductCategory;
}
