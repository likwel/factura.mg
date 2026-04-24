import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

// Instance axios avec token auto-injecté
const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface InvoicePartner {
  name: string;
  initials: string;
  color: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  client: {
    id: string;
    name: string;
    code: string;
  };
  status: 'DRAFT' | 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  dueDate: string | null;
  paidDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvoicesResponse {
  data: Invoice[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface InvoiceFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const invoiceService = {
  getAll: async (filters: InvoiceFilters = {}): Promise<InvoicesResponse> => {
    const params = new URLSearchParams();
    if (filters.page)     params.set('page',     String(filters.page));
    if (filters.limit)    params.set('limit',    String(filters.limit));
    if (filters.search)   params.set('search',   filters.search);
    if (filters.status)   params.set('status',   filters.status);
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo)   params.set('dateTo',   filters.dateTo);

    const { data } = await api.get<InvoicesResponse>(`/invoices?${params}`);
    return data;
  },

  getById: async (id: string): Promise<Invoice> => {
    const { data } = await api.get<Invoice>(`/invoices/${id}`);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/invoices/${id}`);
  },

  deleteBulk: async (ids: string[]): Promise<void> => {
    await api.post('/invoices/bulk-delete', { ids });
  },

  export: async (ids: string[]): Promise<Blob> => {
    const { data } = await api.post('/invoices/export', { ids }, { responseType: 'blob' });
    return data;
  },
};