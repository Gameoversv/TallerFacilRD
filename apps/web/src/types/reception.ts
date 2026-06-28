export interface ReceptionChecklist {
  exterior?: {
    scratches?: boolean;
    dents?: boolean;
    lights?: boolean;
  };
  interior?: {
    radio?: boolean;
    screen?: boolean;
    mats?: boolean;
  };
  mechanical?: {
    oil_level?: boolean;
    coolant?: boolean;
    battery?: boolean;
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
