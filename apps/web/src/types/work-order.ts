export type WorkOrderStatus = "PENDIENTE" | "EN_PROGRESO" | "COMPLETADA" | "CANCELADA";
export type WorkOrderItemType = "LABOR" | "PARTS";

export interface WorkOrderItem {
  id: string;
  description: string;
  type: WorkOrderItemType;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface WorkOrder {
  id: string;
  reception_id: string;
  vehicle_label: string;
  customer_id: string;
  customer_name: string;
  status: WorkOrderStatus;
  diagnosis: string | null;
  assigned_to: string | null;
  estimated_cost: number | null;
  actual_cost: number | null;
  items: WorkOrderItem[];
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface WorkOrdersPage {
  data: WorkOrder[];
  meta: { total: number; page: number; limit: number };
}

export interface CreateWorkOrderRequest {
  receptionId: string;
  diagnosis?: string;
  assignedTo?: string;
  estimatedCost?: number;
}

export interface AddWorkOrderItemRequest {
  description: string;
  type: WorkOrderItemType;
  quantity: number;
  unitPrice: number;
}
