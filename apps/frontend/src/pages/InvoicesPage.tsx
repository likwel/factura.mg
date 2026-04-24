import { DataTable, Column, TableAction, BulkAction } from '../components/common/DataTable';
import { Trash2, Download, Eye, Edit, Send, AlertCircle, Loader2 } from 'lucide-react';
import { useInvoices, STATUS_FILTERS, STATUS_LABELS } from '../hooks/useInvoices';
import { Invoice } from '../services/invoice.service';
import { useNavigate } from 'react-router-dom';

// Type étendu pour le DataTable (inclut les champs transformés)
type InvoiceRow = Invoice & {
  reference: string;
  statusLabel: string;
  partner: { name: string; initials: string; color: string };
};

const STATUS_STYLES: Record<Invoice['status'], string> = {
  PAID:      'bg-green-100 text-green-700',
  PENDING:   'bg-yellow-100 text-yellow-700',
  DRAFT:     'bg-gray-100 text-gray-600',
  OVERDUE:   'bg-red-100 text-red-700',
  CANCELLED: 'bg-red-50 text-red-400 line-through',
};

export default function InvoicesPage() {
  const navigate = useNavigate();
  const {
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
    refresh,
    handleDelete,
    handleBulkDelete,
    handleExport,
  } = useInvoices();

  const columns: Column<InvoiceRow>[] = [
    {
      key: 'reference',
      header: 'RÉFÉRENCE',
      width: '150px',
      render: (value) => (
        <span className="font-semibold text-blue-600">{value}</span>
      ),
    },
    {
      key: 'partner',
      header: 'PARTENAIRE',
      width: '200px',
      render: (partner: InvoiceRow['partner']) => (
        <div className="flex items-center gap-2">
          <div className={`${partner.color} w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm`}>
            {partner.initials}
          </div>
          <span className="font-medium">{partner.name}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'STATUT',
      width: '150px',
      render: (status: Invoice['status']) => (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_STYLES[status]}`}>
          {STATUS_LABELS[status]}
        </span>
      ),
    },
    {
      key: 'total',
      header: 'TOTAL',
      width: '180px',
      render: (value: number) => (
        <span className="font-semibold">
          {Number(value).toLocaleString('fr-FR')} Ar
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'CRÉÉ LE',
      width: '150px',
    },
    {
      key: 'updatedAt',
      header: 'MODIFIÉ LE',
      width: '150px',
    },
  ];

  const rowActions: TableAction<InvoiceRow>[] = [
    {
      label: 'Voir',
      icon: <Eye className="w-4 h-4" />,
      onClick: (invoice) => navigate(`/invoices/${invoice.id}`),
    },
    {
      label: 'Modifier',
      icon: <Edit className="w-4 h-4" />,
      onClick: (invoice) => navigate(`/invoices/${invoice.id}/edit`),
    },
    {
      label: 'Envoyer',
      icon: <Send className="w-4 h-4" />,
      onClick: (invoice) => console.log('Envoyer:', invoice.id),
      // Désactivé si déjà payé ou annulé
    },
    {
      label: 'Supprimer',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (invoice) => handleDelete(invoice.id),
      variant: 'danger',
    },
  ];

  const bulkActions: BulkAction<InvoiceRow>[] = [
    {
      label: 'Exporter',
      icon: <Download className="w-4 h-4" />,
      onClick: handleExport,
    },
    {
      label: 'Supprimer',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: handleBulkDelete,
      variant: 'danger',
    },
  ];

  return (
    <div className="h-screen">
      {/* Bandeau d'erreur non bloquant */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 text-sm border-b border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <DataTable
        title="Factures"
        description="Gérez vos factures simplement"
        createLabel="Créer facture"
        onCreateClick={() => navigate('/invoices/new')}
        onRefresh={refresh}

        data={tableData as InvoiceRow[]}
        columns={columns}
        loading={loading}

        selectable
        bulkActions={bulkActions}
        rowActions={rowActions}

        searchPlaceholder="Référence, client..."
        onSearch={setSearch}

        showDateFilter
        onDateFilter={(dates) => setDateRange({ from: dates?.start ? dates.start.toISOString() : undefined,
  to: dates?.end ? dates.end.toISOString() : undefined, })}

        filters={STATUS_FILTERS}
        onFilterChange={(f) => setStatusFilter(f)}

        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}