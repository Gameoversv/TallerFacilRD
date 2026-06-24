export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  document_id: string | null;
  active: boolean;
  created_at: string;
}

export interface CreateCustomerRequest {
  firstName: string;
  lastName: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  documentId?: string;
}

export interface CustomersPage {
  data: Customer[];
  meta: { total: number; page: number; limit: number };
}
