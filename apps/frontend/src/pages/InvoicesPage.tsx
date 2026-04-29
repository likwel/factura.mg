import { DataTable, Column, TableAction, BulkAction } from '../components/common/DataTable';
import { Trash2, Download, Eye, Edit, Send, AlertCircle } from 'lucide-react';
import { useInvoices, STATUS_FILTERS, STATUS_LABELS } from '../hooks/useInvoices';
import { Invoice } from '../services/invoice.service';
import { useNavigate } from 'react-router-dom';

type InvoiceRow = Invoice & {
  reference: string;
  statusLabel: string;
  partner: { name: string; initials: string; color: string };
};

// ─── Statuts complets alignés sur le schéma Prisma ────────────
const STATUS_STYLES: Record<string, { cls: string; label: string; dot: string }> = {
  DRAFT:     { cls: 'bg-gray-100     text-gray-600   border-gray-200',   label: 'Brouillon',  dot: 'bg-gray-400'   },
  PENDING:   { cls: 'bg-amber-50     text-amber-700  border-amber-200',  label: 'En attente', dot: 'bg-amber-500'  },
  VALIDATED: { cls: 'bg-blue-50      text-blue-700   border-blue-200',   label: 'Validé',     dot: 'bg-blue-500'   },
  SENT:      { cls: 'bg-indigo-50    text-indigo-700 border-indigo-200', label: 'Envoyé',     dot: 'bg-indigo-500' },
  PARTIAL:   { cls: 'bg-orange-50    text-orange-700 border-orange-200', label: 'Partiel',    dot: 'bg-orange-500' },
  COMPLETED: { cls: 'bg-green-50     text-green-700  border-green-200',  label: 'Terminé',    dot: 'bg-green-500'  },
  PAID:      { cls: 'bg-emerald-50   text-emerald-700 border-emerald-200', label: 'Payée',    dot: 'bg-emerald-500'},
  OVERDUE:   { cls: 'bg-red-100      text-red-700    border-red-200',    label: 'En retard',  dot: 'bg-red-500'    },
  CANCELLED: { cls: 'bg-red-50       text-red-400    border-red-100',    label: 'Annulée',    dot: 'bg-red-300'    },
  EXPIRED:   { cls: 'bg-gray-100     text-gray-400   border-gray-100',   label: 'Expirée',    dot: 'bg-gray-300'   },
};

// Parse proprement une date quelle que soit sa forme
function fmtDate(value: unknown): string {
  if (!value) return '—';
  const d = new Date(value as string);
  if (isNaN(d.getTime())) return String(value); // déjà formatée côté hook
  return d.toLocaleDateString('fr-FR');
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? { cls: 'bg-gray-100 text-gray-500 border-gray-200', label: status, dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

export default function InvoicesPage() {
  const navigate = useNavigate();
  const {
    tableData, loading, error,
    currentPage, totalPages, pageSize,
    setCurrentPage, setPageSize, setSearch,
    setStatusFilter, setDateRange,
    refresh, handleDelete, handleBulkDelete, handleExport,
  } = useInvoices();

  const columns: Column<InvoiceRow>[] = [
    {
      key: 'reference',
      header: 'RÉFÉRENCE',
      width: '160px',
      render: (value, row) => (
        <button
          onClick={() => navigate(`/app/facturation/factures/${row.id}`)}
          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline underline-offset-2 transition-colors text-left"
        >
          {value}
        </button>
      ),
    },
    {
      key: 'partner',
      header: 'PARTENAIRE',
      width: '200px',
      render: (partner: InvoiceRow['partner']) => (
        <div className="flex items-center gap-2">
          <div className={`${partner.color} w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0`}>
            {partner.initials}
          </div>
          <span className="font-medium truncate">{partner.name}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'STATUT',
      width: '140px',
      render: (status: string) => <StatusBadge status={status} />,
    },
    {
      key: 'total',
      header: 'TOTAL',
      width: '160px',
      render: (value: number) => (
        <span className="font-semibold tabular-nums">
          {Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} Ar
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'CRÉÉ LE',
      width: '130px',
      render: (value: string) => <span className="text-gray-500 text-sm">{fmtDate(value)}</span>,
    },
    {
      key: 'updatedAt',
      header: 'MODIFIÉ LE',
      width: '130px',
      render: (value: string) => <span className="text-gray-500 text-sm">{fmtDate(value)}</span>,
    },
  ];

  const rowActions: TableAction<InvoiceRow>[] = [
    {
      label: 'Voir',
      icon: <Eye className="w-4 h-4" />,
      onClick: (row) => navigate(`/app/facturation/factures/${row.id}`),
    },
    {
      label: 'Modifier',
      icon: <Edit className="w-4 h-4" />,
      onClick: (row) => navigate(`/app/facturation/factures/${row.id}/edit`),
    },
    {
      label: 'Envoyer',
      icon: <Send className="w-4 h-4" />,
      onClick: (row) => console.log('Envoyer:', row.id),
    },
    {
      label: 'Supprimer',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (row) => handleDelete(row.id),
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
      {error && (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 text-sm border border-red-200 rounded-lg mb-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <DataTable
        title="Factures"
        description="Gérez vos factures simplement"
        createButtonColor="createColor"
        createLabel="Créer facture"
        onCreateClick={() => navigate('/app/facturation/factures/new')}
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
        onDateFilter={(dates) => setDateRange({
          from: dates?.start ? dates.start.toISOString() : undefined,
          to:   dates?.end   ? dates.end.toISOString()   : undefined,
        })}

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