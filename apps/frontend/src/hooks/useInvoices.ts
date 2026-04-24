import { useState, useEffect, useCallback } from 'react';
import { invoiceService, Invoice, InvoiceFilters } from '../services/invoice.service';

// Mapping statut backend → label UI
export const STATUS_LABELS: Record<Invoice['status'], string> = {
  DRAFT:     'Brouillon',
  PENDING:   'En cours',
  PAID:      'Validé',
  OVERDUE:   'En retard',
  CANCELLED: 'Annulé',
};

export const STATUS_FILTERS = [
  { label: 'Tous',      value: 'all' },
  { label: 'Validé',    value: 'PAID' },
  { label: 'En cours',  value: 'PENDING' },
  { label: 'Brouillon', value: 'DRAFT' },
  { label: 'En retard', value: 'OVERDUE' },
];

// Génère initiales + couleur déterministe depuis le nom client
function getPartnerMeta(name: string) {
  const colors = [
    'bg-blue-600', 'bg-purple-600', 'bg-emerald-600',
    'bg-orange-500', 'bg-rose-600', 'bg-cyan-600',
  ];
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const color = colors[name.charCodeAt(0) % colors.length];
  return { initials, color };
}

export function useInvoices() {
  const [invoices, setInvoices]       = useState<Invoice[]>([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [pageSize, setPageSize]       = useState(10);
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange]     = useState<{ from?: string; to?: string }>({});

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: InvoiceFilters = {
        page:   currentPage,
        limit:  pageSize,
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        dateFrom: dateRange.from,
        dateTo:   dateRange.to,
      };
      const res = await invoiceService.getAll(filters);
      setInvoices(res.data ?? []);
      setTotalPages(res?.pagination?.totalPages ?? 1);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, search, statusFilter, dateRange]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  // Reset page quand filtre change
  useEffect(() => { setCurrentPage(1); }, [search, statusFilter, dateRange]);

  const handleDelete = async (id: string) => {
    try {
      await invoiceService.delete(id);
      await fetchInvoices();
    } catch {
      setError('Erreur lors de la suppression');
    }
  };

  const handleBulkDelete = async (items: Invoice[]) => {
    try {
      await invoiceService.deleteBulk(items.map((i) => i.id));
      await fetchInvoices();
    } catch {
      setError('Erreur lors de la suppression groupée');
    }
  };

  const handleExport = async (items: Invoice[]) => {
    try {
      const blob = await invoiceService.export(items.map((i) => i.id));
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `factures_${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Erreur lors de l'export");
    }
  };

  // Transforme les données backend pour le DataTable
  const tableData = invoices.map((inv) => ({
    ...inv,
    reference: inv.invoiceNumber,
    partner: {
      name: inv.client.name,
      ...getPartnerMeta(inv.client.name),
    },
    statusLabel: STATUS_LABELS[inv.status],
    createdAt: new Date(inv.createdAt).toLocaleDateString('fr-FR'),
    updatedAt: new Date(inv.updatedAt).toLocaleDateString('fr-FR'),
  }));

  return {
    tableData,
    loading,
    error,
    currentPage,
    totalPages,
    pageSize,
    setCurrentPage,
    setPageSize,
    setSearch,
    setStatusFilter,
    setDateRange,
    refresh: fetchInvoices,
    handleDelete,
    handleBulkDelete,
    handleExport,
  };
}