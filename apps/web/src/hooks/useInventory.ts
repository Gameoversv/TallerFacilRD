import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type {
  Product,
  ProductCategory,
  ProductsPage,
  CreateProductRequest,
  UpdateProductRequest,
} from "@/types/product";

export function useInventory(category?: ProductCategory | null, lowStock = false, page = 0, size = 20) {
  return useQuery<ProductsPage>({
    queryKey: ["inventory", category, lowStock, page, size],
    queryFn: async () => {
      const res = await api.get("/api/inventory", {
        params: {
          category: category ?? undefined,
          low_stock: lowStock || undefined,
          page,
          size,
        },
      });
      return res.data;
    },
  });
}

export function useLowStockProducts() {
  return useQuery<{ data: Product[] }>({
    queryKey: ["inventory", "low-stock"],
    queryFn: async () => {
      const res = await api.get("/api/inventory/low-stock");
      return res.data;
    },
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductRequest) =>
      api.post("/api/inventory", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory"] }),
  });
}

export function useUpdateProduct(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProductRequest) =>
      api.put(`/api/inventory/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory"] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/inventory/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory"] }),
  });
}
