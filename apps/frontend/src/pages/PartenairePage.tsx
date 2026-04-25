// apps/frontend/src/pages/modules/partenaires/PartenairePage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Eye, Edit, Trash2, FileDown, Users } from 'lucide-react';
import { DataTable, Column, TableAction, BulkAction } from '../components/common/DataTable';
import api from '../services/api';
import toast from 'react-hot-toast';

interface PartenairePageProps {
  type: 'client' | 'fournisseur';
}

interface Partenaire {
  id: string;
  code: string;
  name: string;
  email: string | null;
  phone: string;
  address: string;
  taxId: string;
  creditLimit: string;
  companyId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PartenairePage({ type }: PartenairePageProps) {
  const navigate = useNavigate();

  const [clients, setClients] = useState<Partenaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tous');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    loadClients();
  }, [type, currentPage, pageSize, search, activeFilter]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/partners/${type}s`, {
        params: {
          page: currentPage,
          limit: pageSize,
          search: search,
          status: activeFilter !== 'Tous' ? activeFilter : undefined
        }
      });
      
      // Gestion sécurisée des données retournées
      let data = [];
      if (response.data?.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      } else if (Array.isArray(response.data)) {
        data = response.data;
      }
      
      setClients(data);
      setTotalPages(response.data?.totalPages || Math.ceil(data.length / pageSize));
    } catch (error) {
      console.error('Erreur de chargement:', error);
      toast.error('Erreur de chargement des données');
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    loadClients();
  };

  // Définition des colonnes
  const columns: Column<Partenaire>[] = [
    {
      key: 'name',
      header: 'NOM',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-sm">
              {row.name?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{row.name || 'Sans nom'}</div>
            {row.code && (
              <div className="text-xs text-gray-500">Code: {row.code}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'address',
      header: 'ADRESSE',
      render: (value) => (
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span>{value || 'Non renseigné'}</span>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'E-MAIL',
      render: (value) => (
        <div className="flex items-center gap-2 text-gray-600">
          <Mail className="w-4 h-4 text-gray-400" />
          <span>{value || '-'}</span>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'TÉLÉPHONE',
      render: (value) => (
        <div className="flex items-center gap-2 text-gray-600">
          <Phone className="w-4 h-4 text-gray-400" />
          <span>{value || '-'}</span>
        </div>
      ),
    },
    {
      key: 'isActive',
      header: 'STATUT',
      render: (value) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            value
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {value ? 'Actif' : 'Inactif'}
        </span>
      ),
    },
  ];

  // Actions de ligne
  const rowActions: TableAction<Partenaire>[] = [
    {
      label: 'Voir',
      icon: <Eye className="w-4 h-4" />,
      onClick: (row) => {
        navigate(`/app/partenaires/${type}s/${row.id}`);
      },
    },
    {
      label: 'Modifier',
      icon: <Edit className="w-4 h-4" />,
      onClick: (row) => {
        navigate(`/app/partenaires/${type}s/${row.id}/edit`);
      },
    },
    {
      label: 'Supprimer',
      icon: <Trash2 className="w-4 h-4" />,
      variant: 'danger' as const,
      onClick: async (row) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${row.name} ?`)) {
          try {
            await api.delete(`/${type}s/${row.id}`);
            toast.success('Supprimé avec succès');
            refresh();
          } catch (error) {
            toast.error('Erreur lors de la suppression');
          }
        }
      },
    },
  ];

  // Actions groupées
  const bulkActions: BulkAction<Partenaire>[] = [
    {
      label: 'Exporter la sélection',
      icon: <FileDown className="w-4 h-4" />,
      onClick: (selectedRows) => {
        toast.success(`Export de ${selectedRows.length} ${type}(s)`);
      },
    },
    {
      label: 'Activer',
      icon: <Users className="w-4 h-4" />,
      onClick: async (selectedRows) => {
        try {
          const ids = selectedRows.map(row => row.id);
          await api.patch(`/${type}s/bulk-update`, {
            ids: ids,
            isActive: true
          });
          toast.success('Statut mis à jour');
          refresh();
        } catch (error) {
          toast.error('Erreur lors de la mise à jour');
        }
      },
    },
    {
      label: 'Désactiver',
      icon: <Users className="w-4 h-4" />,
      onClick: async (selectedRows) => {
        try {
          const ids = selectedRows.map(row => row.id);
          await api.patch(`/${type}s/bulk-update`, {
            ids: ids,
            isActive: false
          });
          toast.success('Statut mis à jour');
          refresh();
        } catch (error) {
          toast.error('Erreur lors de la mise à jour');
        }
      },
    },
    {
      label: 'Supprimer la sélection',
      icon: <Trash2 className="w-4 h-4" />,
      variant: 'danger' as const,
      onClick: async (selectedRows) => {
        if (window.confirm(`Supprimer ${selectedRows.length} ${type}(s) ?`)) {
          try {
            const ids = selectedRows.map(row => row.id);
            await api.delete(`/${type}s/bulk-delete`, {
              data: { ids: ids }
            });
            toast.success('Suppression réussie');
            refresh();
          } catch (error) {
            toast.error('Erreur lors de la suppression');
          }
        }
      },
    },
  ];

  // Filtres
  const ACTIVE_FILTERS = [
    { value: 'Tous', label: 'Tous' },
    { value: 'Actifs', label: 'Actifs' },
    { value: 'Inactifs', label: 'Inactifs' },
  ];

  return (
    <div className="space-y-6">
      <DataTable
        title={type === 'client' ? 'Clients' : 'Fournisseurs'}
        description={`Gérez vos ${type}s et leurs informations`}
        createLabel={`Nouveau ${type}`}
        createButtonColor="info2"
        onCreateClick={() => navigate(`/app/partenaires/new?type=${type}`)}
        onRefresh={refresh}

        data={clients}
        columns={columns}
        loading={loading}

        selectable
        bulkActions={bulkActions}
        rowActions={rowActions}

        searchPlaceholder={`Rechercher des ${type}s...`}
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