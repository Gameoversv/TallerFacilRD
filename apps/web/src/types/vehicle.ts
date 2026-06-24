export type Transmission = "MANUAL" | "AUTOMATIC" | "CVT";

export interface VehicleModifications {
  turbo: boolean | null;
  suspension: string | null;
  tune: string | null;
  injectors: string | null;
  fuel_type: string | null;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  engine: string | null;
  vin: string | null;
  license_plate: string | null;
  color: string | null;
  mileage: number | null;
  transmission: Transmission | null;
  modifications: VehicleModifications | null;
  customer_id: string;
  customer_name: string;
  active: boolean;
  created_at: string;
}

export interface CreateVehicleRequest {
  brand: string;
  model: string;
  year: number;
  engine?: string;
  vin?: string;
  licensePlate?: string;
  color?: string;
  mileage?: number;
  transmission?: Transmission;
  modifications?: {
    turbo?: boolean;
    suspension?: string;
    tune?: string;
    injectors?: string;
    fuelType?: string;
  };
  customerId: string;
}

export interface VehiclesPage {
  data: Vehicle[];
  meta: { total: number; page: number; limit: number };
}
