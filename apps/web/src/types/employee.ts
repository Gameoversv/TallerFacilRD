export type EmployeeRole = "OWNER" | "MANAGER" | "RECEPTIONIST" | "MECHANIC" | "CLIENT";

export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  role: EmployeeRole;
  position: string | null;
  hire_date: string | null;
  salary: number | null;
  active: boolean;
  created_at: string | null;
}

export interface EmployeeRequest {
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  role: EmployeeRole;
  position?: string;
  hireDate?: string;
  salary?: number;
}
