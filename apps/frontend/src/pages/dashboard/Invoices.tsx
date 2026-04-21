import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function Invoices() {
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    api.get('/invoices').then(res => setInvoices(res.data)).catch(() => toast.error('Erreur'));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">Factures</h1>
          <p className="text-gray-600">Gérez vos factures</p>
        </div>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nouvelle Facture
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Facture</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium">{invoice.invoiceNumber}</td>
                <td className="px-6 py-4 text-sm">{invoice.client?.name}</td>
                <td className="px-6 py-4 text-sm">{format(new Date(invoice.createdAt), 'dd/MM/yyyy')}</td>
                <td className="px-6 py-4 text-sm font-medium">{Number(invoice.total).toLocaleString()} Ar</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    {invoice.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
