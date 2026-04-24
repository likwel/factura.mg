import { useState, useEffect, useCallback } from 'react';
import { articleService, Article, ArticleFilters } from '../services/article.service';

export const STOCK_STATUS = (article: Article) => {
  if (article.currentStock === 0)               return 'out';
  if (article.currentStock <= article.stockMin) return 'low';
  return 'ok';
};

export const ACTIVE_FILTERS = [
  { label: 'Tous',       value: 'all' },
  { label: 'Actifs',     value: 'active' },
  { label: 'Inactifs',   value: 'inactive' },
  { label: 'Stock bas',  value: 'lowStock' },
  { label: 'Rupture',    value: 'outOfStock' },
];

export function useArticles() {
  const [articles, setArticles]           = useState<Article[]>([]);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [currentPage, setCurrentPage]     = useState(1);
  const [totalPages, setTotalPages]       = useState(1);
  const [pageSize, setPageSize]           = useState(10);
  const [search, setSearch]               = useState('');
  const [activeFilter, setActiveFilter]   = useState('all');
  const [categoryId, setCategoryId]       = useState<string | undefined>();
  const [supplierId, setSupplierId]       = useState<string | undefined>();

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: ArticleFilters = {
        page:       currentPage,
        limit:      pageSize,
        search:     search || undefined,
        categoryId,
        supplierId,
        isActive:   activeFilter === 'active'   ? true
                  : activeFilter === 'inactive' ? false
                  : undefined,
        lowStock:   activeFilter === 'lowStock'   ? true
                  : activeFilter === 'outOfStock' ? true
                  : undefined,
      };
      const res = await articleService.getAll(filters);
      setArticles(res.data);
      setTotalPages(res.pagination.totalPages);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, search, activeFilter, categoryId, supplierId]);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);
  useEffect(() => { setCurrentPage(1); }, [search, activeFilter, categoryId, supplierId]);

  const handleDelete = async (id: string) => {
    try {
      await articleService.delete(id);
      await fetchArticles();
    } catch {
      setError('Erreur lors de la suppression');
    }
  };

  return {
    articles,
    loading,
    error,
    currentPage,
    totalPages,
    pageSize,
    setCurrentPage,
    setPageSize,
    setSearch,
    setActiveFilter,
    setCategoryId,
    setSupplierId,
    refresh: fetchArticles,
    handleDelete,
  };
}