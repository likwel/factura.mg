import { DataTable, Column, TableAction, BulkAction } from '../components/common/DataTable';
import { Trash2, Eye, Edit, AlertCircle, Package, Copy } from 'lucide-react';
import { useArticles, ACTIVE_FILTERS, STOCK_STATUS } from '../hooks/useArticles';
import { Article } from '../services/article.service';
import { useNavigate } from 'react-router-dom';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STOCK_STYLES = {
  ok:  { badge: 'text-green-700 bg-green-100', label: '✔', tooltip: 'Stock suffisant' },
  low: { badge: 'text-yellow-700 bg-yellow-100', label: '⚠', tooltip: 'Stock faible — Réapprovisionnement conseillé' },
  out: { badge: 'text-red-700 bg-red-100', label: '❌', tooltip: 'Rupture de stock' },
} as const;

const articlePath = (id: string) => `/app/facturation/articles/${id}`;

// ─── Composant ────────────────────────────────────────────────────────────────

export default function ArticlesPage() {
  const navigate = useNavigate();
  const {
    articles, loading, error,
    currentPage, totalPages, pageSize,
    setCurrentPage, setPageSize,
    setSearch, setActiveFilter,
    refresh, handleDelete,
  } = useArticles();

  // ── Colonnes ───────────────────────────────────────────────────────────────
  const columns: Column<Article>[] = [
    {
      key: 'code',
      header: 'CODE',
      width: '100px',
      render: (value, row) => (
        <button
          type="button"
          onClick={() => navigate(articlePath(row.id))}
          className="font-mono text-base font-semibold text-blue-600 hover:text-blue-800 hover:underline underline-offset-2 transition-colors text-left"
          title={`Voir l'article ${value}`}
        >
          {value as string}
        </button>
      ),
    },
    {
      key: 'name',
      header: 'ARTICLE',
      width: '260px',
      render: (value, row) => (
        <button
          type="button"
          onClick={() => navigate(articlePath(row.id))}
          className="flex items-center gap-2 group text-left w-full"
          title={`Voir l'article ${value}`}
        >
          {row.image ? (
            <img
              src={row.image}
              alt={row.name}
              className="w-8 h-8 rounded object-cover shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center shrink-0">
              <Package className="w-4 h-4 text-gray-400" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-medium text-base text-gray-900 group-hover:text-blue-600 group-hover:underline underline-offset-2 transition-colors truncate">
              {value as string}
            </p>
            {row.category && (
              <p className="text-xs text-gray-400 truncate">{row.category.name}</p>
            )}
          </div>
        </button>
      ),
    },
    {
      key: 'currentStock',
      header: 'STOCK',
      width: '160px',
      render: (value, row) => {
        const status = STOCK_STATUS(row);
        const { badge, label, tooltip } = STOCK_STYLES[status];
        return (
          <div className="flex items-center gap-1">
            <span className="text-base">
              {value as number} {row.unit ?? 'unité(s)'}
            </span>
            <span
              className={`ms-1 text-xs px-2 py-0.5 rounded-full font-medium ${badge}`}
              title={tooltip}
              aria-label={tooltip}
            >
              {label}
            </span>
          </div>
        );
      },
    },
    {
      key: 'purchasePrice',
      header: "PRIX D'ACHAT",
      width: '140px',
      render: (value) => (
        <span className="text-base">{Number(value).toLocaleString('fr-FR')} Ar</span>
      ),
    },
    {
      key: 'sellingPrice',
      header: 'PRIX DE VENTE',
      width: '150px',
      render: (value) => (
        <span className="font-semibold text-base">{Number(value).toLocaleString('fr-FR')} Ar</span>
      ),
    },
    {
      key: 'isActive',
      header: 'STATUT',
      width: '100px',
      render: (value) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
        }`}>
          {value ? 'Actif' : 'Inactif'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'CRÉÉ LE',
      width: '100px',
      render: (value) => new Date(value as string).toLocaleDateString('fr-FR'),
    },
  ];

  // ── Actions de ligne ───────────────────────────────────────────────────────
  const rowActions: TableAction<Article>[] = [
    {
      label: 'Voir',
      icon: <Eye className="w-4 h-4" />,
      onClick: (a) => navigate(articlePath(a.id)),
    },
    {
      label: 'Modifier',
      icon: <Edit className="w-4 h-4" />,
      onClick: (a) => navigate(`${articlePath(a.id)}/edit`),
    },
    {
      label: 'Dupliquer',
      icon: <Copy className="w-4 h-4" />,
      onClick: (a) => navigate(`${articlePath(a.id)}/duplicate`),
    },
    {
      label: 'Supprimer',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (a) => handleDelete(a.id),
      variant: 'danger',
    },
  ];

  // ── Actions groupées ───────────────────────────────────────────────────────
  const bulkActions: BulkAction<Article>[] = [
    {
      label: 'Supprimer',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (items) => Promise.all(items.map((a) => handleDelete(a.id))),
      variant: 'danger',
    },
  ];

  // ── Rendu ──────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col gap-2">
      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 text-sm border border-red-200 rounded-lg"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <DataTable
        title="Articles"
        createButtonColor="createColor"
        description="Gérez votre catalogue d'articles"
        createLabel="Nouvel article"
        onCreateClick={() => navigate('/app/facturation/articles/new')}
        onRefresh={refresh}

        data={articles}
        columns={columns}
        loading={loading}

        selectable
        bulkActions={bulkActions}
        rowActions={rowActions}

        searchPlaceholder="Code, nom, code-barre…"
        onSearch={setSearch}

        filters={ACTIVE_FILTERS}
        onFilterChange={setActiveFilter}

        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}