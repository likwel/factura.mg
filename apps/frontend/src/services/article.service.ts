import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface Article {
  id: string;
  code: string;
  name: string;
  description?: string;
  purchasePrice: number;
  sellingPrice: number;
  stockMin: number;
  stockMax?: number;
  currentStock: number;
  unit?: string;
  barcode?: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: { id: string; name: string } | null;
  supplier?: { id: string; name: string; code: string } | null;
}

export interface ArticlesResponse {
  data: Article[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ArticleFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  supplierId?: string;
  isActive?: boolean;
  lowStock?: boolean;
}

export const articleService = {
  getAll: async (filters: ArticleFilters = {}): Promise<ArticlesResponse> => {
    const params = new URLSearchParams();
    if (filters.page)       params.set('page',       String(filters.page));
    if (filters.limit)      params.set('limit',      String(filters.limit));
    if (filters.search)     params.set('search',     filters.search);
    if (filters.categoryId) params.set('categoryId', filters.categoryId);
    if (filters.supplierId) params.set('supplierId', filters.supplierId);
    if (filters.isActive !== undefined) params.set('isActive', String(filters.isActive));
    if (filters.lowStock)   params.set('lowStock',   'true');

    const { data } = await api.get<ArticlesResponse>(`/articles?${params}`);
    return data;
  },

  getById: async (id: string): Promise<Article> => {
    const { data } = await api.get<Article>(`/articles/${id}`);
    return data;
  },

  create: async (payload: Partial<Article>): Promise<Article> => {
    const { data } = await api.post<Article>('/articles', payload);
    return data;
  },

  update: async (id: string, payload: Partial<Article>): Promise<Article> => {
    const { data } = await api.put<Article>(`/articles/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await api.delete(`/articles/${id}`);
    return data;
  },

  getStats: async (): Promise<{
    total: number;
    active: number;
    inactive: number;
    lowStock: number;
    outOfStock: number;
    totalUnits: number;
    totalPurchaseValue: string;
    totalSellingValue: string;
    potentialMargin: string;
  }> => {
    const { data } = await api.get('/articles/stats/summary');
    return data;
  },
};