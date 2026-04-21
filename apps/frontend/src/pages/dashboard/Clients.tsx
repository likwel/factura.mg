import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function Clients() {
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    api.get('/clients').then(res => setClients(res.data)).catch(() => toast.error('Erreur'));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-gray-600">Gérez votre base clients</p>
        </div>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nouveau Client
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Téléphone</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium">{client.code}</td>
                <td className="px-6 py-4 text-sm">{client.name}</td>
                <td className="px-6 py-4 text-sm">{client.email || '-'}</td>
                <td className="px-6 py-4 text-sm">{client.phone || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
