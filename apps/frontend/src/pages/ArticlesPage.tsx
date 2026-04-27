import { DataTable, Column, TableAction, BulkAction } from '../components/common/DataTable';
import { Trash2, Eye, Edit, AlertCircle, Package, Copy } from 'lucide-react';
import { useArticles, ACTIVE_FILTERS, STOCK_STATUS } from '../hooks/useArticles';
import { Article } from '../services/article.service';
import { useNavigate } from 'react-router-dom';

export default function ArticlesPage() {
  const navigate = useNavigate();
  const {
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
    refresh,
    handleDelete,
  } = useArticles();

  const columns: Column<Article>[] = [
    {
      key: 'code',
      header: 'CODE',
      width: '100px',
      render: (value) => (
        <span className="font-mono text-base font-semibold text-gray-700">{value}</span>
      ),
    },
    {
      key: 'name',
      header: 'ARTICLE',
      width: '260px',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          {row.image ? (
            <img src={row.image} className="w-8 h-8 rounded object-cover" />
          ) : (
            <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
              <Package className="w-4 h-4 text-gray-400" />
            </div>
          )}
          <div>
            <p className="font-medium text-base">{value}</p>
            {row.category && (
              <p className="text-xs text-gray-400">{row.category.name}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'currentStock',
      header: 'STOCK',
      width: '160px',
      render: (value, row) => {
        const status = STOCK_STATUS(row);
        const styles = {
          ok:  'text-green-700 bg-green-100',
          low: 'text-yellow-700 bg-yellow-100',
          out: 'text-red-700 bg-red-100',
        };
        
        // Messages de tooltip selon le statut
        const tooltips = {
          ok: 'Stock suffisant',
          low: 'Stock faible - Réapprovisionnement conseillé',
          out: 'Rupture de stock'
        };

        const labels = { ok: '✔', low: '⚠', out: '❌' };
        return (
          <div className="flex flex-row gap-0.5">
            <span className="text-base">
              {value} {row.unit ?? 'unité(s)'}
            </span>
            <span className={`cursor-pointer ms-1 text-xs px-2 py-0.5 rounded-full w-fit font-medium ${styles[status]}`}
              title={tooltips[status]}
              aria-label={tooltips[status]}
              >
              {labels[status]}
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
    // {
    //   key: 'supplier',
    //   header: 'FOURNISSEUR',
    //   width: '160px',
    //   render: (supplier) =>
    //     supplier ? (
    //       <span className="text-sm text-gray-600">{supplier.name}</span>
    //     ) : (
    //       <span className="text-xs text-gray-300 italic">—</span>
    //     ),
    // },
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
      render: (value) => new Date(value).toLocaleDateString('fr-FR'),
    },
  ];

  const rowActions: TableAction<Article>[] = [
    {
      label: 'Voir',
      icon: <Eye className="w-4 h-4" />,
      onClick: (article) => navigate(`/app/facturation/articles/${article.id}`),
    },
    {
      label: 'Modifier',
      icon: <Edit className="w-4 h-4" />,
      onClick: (article) => navigate(`/app/facturation/articles/${article.id}/edit`),
    },
    {
      label: 'Dupliquer',
      icon: <Copy className="w-4 h-4" />,
      onClick: (article) => navigate(`/app/facturation/articles/${article.id}/duplicate`),
    },
    {
      label: 'Supprimer',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (article) => handleDelete(article.id),
      variant: 'danger',
    },
  ];

  const bulkActions: BulkAction<Article>[] = [
    {
      label: 'Supprimer',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (items) => Promise.all(items.map((a) => handleDelete(a.id))),
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
        title="Articles"
        createButtonColor ="purple"
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

        searchPlaceholder="Code, nom, code-barre..."
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