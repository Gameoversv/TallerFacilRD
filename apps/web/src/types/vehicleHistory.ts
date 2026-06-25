export interface VehicleHistoryItem {
  type: string;
  description: string;
  quantity: number;
  unit_price: number;
}

export interface VehicleHistoryInvoice {
  id: string;
  invoice_number: string;
  issue_date: string;
  status: string;
  total: number;
}

export interface VehicleHistoryWorkOrder {
  id: string;
  status: string;
  items: VehicleHistoryItem[];
  invoices: VehicleHistoryInvoice[];
}

export interface VehicleHistoryVisit {
  reception_id: string;
  reception_date: string | null;
  complaint: string;
  work_order: VehicleHistoryWorkOrder | null;
}

export interface VehicleHistory {
  vehicle_id: string;
  license_plate: string | null;
  brand: string;
  model: string;
  year: number;
  vin: string | null;
  customer_name: string;
  total_visits: number;
  visits: VehicleHistoryVisit[];
}
