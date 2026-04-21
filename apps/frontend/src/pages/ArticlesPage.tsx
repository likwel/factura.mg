// apps/frontend/src/pages/Invoices.tsx
import { DataTable, Column, TableAction, BulkAction } from '../components/common/DataTable';
import { Trash2, Download, Eye, Edit, Send } from 'lucide-react';

// Type pour les factures
interface Invoice {
  id: string;
  reference: string;
  partner: {
    name: string;
    initials: string;
    color: string;
  };
  status: 'Validé' | 'En cours' | 'Brouillon';
  total: number;
  createdAt: string;
  updatedAt: string;
}

// Données de démo
const mockInvoices: Invoice[] = [
  {
    id: '1',
    reference: 'FAC0005',
    partner: { name: 'MGBI', initials: 'M', color: 'bg-blue-600' },
    status: 'Validé',
    total: 1070000,
    createdAt: '20/01/2026',
    updatedAt: '20/01/2026',
  },
  {
    id: '2',
    reference: 'FAC0004',
    partner: { name: 'MGBI', initials: 'M', color: 'bg-blue-600' },
    status: 'En cours',
    total: 260000,
    createdAt: '23/10/2025',
    updatedAt: '23/10/2025',
  },
  {
    id: '3',
    reference: 'FAC0003',
    partner: { name: 'MGBI', initials: 'M', color: 'bg-blue-600' },
    status: 'En cours',
    total: 520000,
    createdAt: '23/10/2025',
    updatedAt: '23/10/2025',
  },
  {
    id: '4',
    reference: 'FAC0002',
    partner: { name: 'MGBI', initials: 'M', color: 'bg-blue-600' },
    status: 'Validé',
    total: 780000,
    createdAt: '23/10/2025',
    updatedAt: '23/10/2025',
  },
  {
    id: '5',
    reference: 'FAC0001',
    partner: { name: 'MGBI', initials: 'M', color: 'bg-blue-600' },
    status: 'En cours',
    total: 1040000,
    createdAt: '23/10/2025',
    updatedAt: '23/10/2025',
  },
];

export default function ArticlesPage() {
  // Définir les colonnes
  const columns: Column<Invoice>[] = [
    {
      key: 'reference',
      header: 'RÉFÉRENCE',
      width: '150px',
      render: (value) => (
        <span className={`font-semibold ${
          value.startsWith('FAC000') && (value.endsWith('5') || value.endsWith('2'))
            ? 'text-green-600' 
            : 'text-blue-600'
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: 'partner',
      header: 'PARTENAIRE',
      width: '200px',
      render: (partner: Invoice['partner']) => (
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
      render: (status: Invoice['status']) => {
        const statusConfig = {
          'Validé': 'bg-green-100 text-green-700',
          'En cours': 'bg-yellow-100 text-yellow-700',
          'Brouillon': 'bg-gray-100 text-gray-700',
        };
        return (
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[status]}`}>
            {status}
          </span>
        );
      },
    },
    {
      key: 'total',
      header: 'TOTAL',
      width: '180px',
      render: (value: number) => (
        <span className="font-semibold">
          {value.toLocaleString('fr-FR')} Ar
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

  // Actions par ligne
  const rowActions: TableAction<Invoice>[] = [
    {
      label: 'Voir',
      icon: <Eye className="w-4 h-4" />,
      onClick: (invoice) => console.log('Voir:', invoice),
    },
    {
      label: 'Modifier',
      icon: <Edit className="w-4 h-4" />,
      onClick: (invoice) => console.log('Modifier:', invoice),
    },
    {
      label: 'Envoyer',
      icon: <Send className="w-4 h-4" />,
      onClick: (invoice) => console.log('Envoyer:', invoice),
    },
    {
      label: 'Supprimer',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (invoice) => console.log('Supprimer:', invoice),
      variant: 'danger',
    },
  ];

  // Actions groupées
  const bulkActions: BulkAction<Invoice>[] = [
    {
      label: 'Exporter',
      icon: <Download className="w-4 h-4" />,
      onClick: (invoices) => console.log('Exporter:', invoices),
    },
    {
      label: 'Supprimer',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (invoices) => console.log('Supprimer:', invoices),
      variant: 'danger',
    },
  ];

  // Filtres
  const filters = [
    { label: 'Tous', value: 'all' },
    { label: 'Validé', value: 'validated' },
    { label: 'En cours', value: 'in_progress' },
    { label: 'Brouillon', value: 'draft' },
  ];

  return (
    <div className="h-screen">
      <DataTable
        title="Tous les articles"
        description="Gérer vos articles tous simplement"
        createLabel="Créer facture"
        onCreateClick={() => console.log('Créer une facture')}
        onRefresh={() => console.log('Actualiser')}
        
        data={mockInvoices}
        columns={columns}
        
        selectable
        bulkActions={bulkActions}
        rowActions={rowActions}
        
        searchPlaceholder="Rechercher un document"
        onSearch={(query) => console.log('Rechercher:', query)}
        
        showDateFilter
        onDateFilter={(dates) => console.log('Filtrer dates:', dates)}
        
        filters={filters}
        onFilterChange={(filter) => console.log('Filtre:', filter)}
        
        currentPage={1}
        totalPages={5}
        pageSize={10}
        onPageChange={(page) => console.log('Page:', page)}
        onPageSizeChange={(size) => console.log('Taille page:', size)}
      />
    </div>
  );
}