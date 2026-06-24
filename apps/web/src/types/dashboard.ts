export interface DashboardSummary {
  vehiculos_en_taller: number;
  vehiculos_listos: number;
  ordenes_abiertas: number;
  ordenes_completadas_hoy: number;
  total_clientes: number;
  total_vehiculos: number;
}

export interface ActivityEvent {
  type: string;
  description: string;
  entity_id: string;
  occurred_at: string;
}

export interface AlertItem {
  type: string;
  description: string;
  entity_id: string;
  days_open: number;
}
