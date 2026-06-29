export type ChecklistSeverity = "OK" | "LEVE" | "GRAVE" | "NA";

export interface ReceptionChecklist {
  exterior?: {
    scratches?: ChecklistSeverity;
    dents?: ChecklistSeverity;
    lights?: ChecklistSeverity;
  };
  interior?: {
    radio?: ChecklistSeverity;
    screen?: ChecklistSeverity;
    mats?: ChecklistSeverity;
  };
  mechanical?: {
    oil_level?: ChecklistSeverity;
    coolant?: ChecklistSeverity;
    battery?: ChecklistSeverity;
  };
}

export interface Reception {
  id: string;
  vehicle_id: string;
  vehicle_label: string;
  customer_id: string;
  customer_name: string;
  entry_km: number;
  reported_problem: string;
  checklist: ReceptionChecklist;
  photos: string[];
  notes?: string;
  signature_data?: string;
  signed_at?: string;
  created_at: string;
}
