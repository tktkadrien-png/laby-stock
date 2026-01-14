'use client';

import StatCard from '@/components/dashboard/StatCard';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import {
  Package,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowDownToLine,
  ArrowUpFromLine,
} from 'lucide-react';

export default function DashboardPage() {
  // Mock data - will be replaced with real Supabase data
  const stats = {
    totalStock: {
      value: '1,248',
      unit: 'produits',
      trend: { value: '+12% ce mois', isPositive: true },
    },
    stockValue: {
      value: '45,280 FCFA',
      trend: { value: '+8% ce mois', isPositive: true },
    },
    lowStock: {
      value: '18',
      unit: 'produits',
    },
    expiringThisMonth: {
      value: '7',
      unit: 'produits',
    },
  };

  const recentEntries = [
    { id: 1, name: 'Réactif Hématologie', quantity: 50, date: '2026-01-12', user: 'Admin' },
    { id: 2, name: 'Tubes EDTA', quantity: 200, date: '2026-01-11', user: 'Admin' },
    { id: 3, name: 'Gants Latex', quantity: 500, date: '2026-01-10', user: 'Gestionnaire' },
  ];

  const recentExits = [
    { id: 1, name: 'Tubes EDTA', quantity: 25, date: '2026-01-12', motif: 'Utilisation' },
    { id: 2, name: 'Gants Latex', quantity: 50, date: '2026-01-11', motif: 'Utilisation' },
    { id: 3, name: 'Alcool 70%', quantity: 10, date: '2026-01-11', motif: 'Utilisation' },
  ];

  const alerts = [
    { id: 1, type: 'warning', message: 'Réactif Chimie expire dans 15 jours' },
    { id: 2, type: 'danger', message: '5 produits en rupture de stock' },
    { id: 3, type: 'warning', message: '13 produits sous le seuil minimal' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Stock Total"
          value={stats.totalStock.value}
          icon={Package}
          trend={stats.totalStock.trend}
          iconColor="blue"
        />
        <StatCard
          title="Valeur du Stock"
          value={stats.stockValue.value}
          icon={TrendingUp}
          trend={stats.stockValue.trend}
          iconColor="amber"
        />
        <StatCard
          title="Stock Faible"
          value={stats.lowStock.value}
          icon={AlertTriangle}
          iconColor="red"
        />
        <StatCard
          title="Péremption Proche"
          value={stats.expiringThisMonth.value}
          icon={Clock}
          iconColor="amber"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Entries */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ArrowDownToLine size={20} className="text-green-600" />
              Entrées Récentes
            </h3>
            <Badge variant="info">{recentEntries.length}</Badge>
          </div>
          <div className="space-y-3">
            {recentEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">{entry.name}</p>
                  <p className="text-sm text-gray-600">
                    +{entry.quantity} unités • {entry.user}
                  </p>
                </div>
                <span className="text-xs text-gray-500">{entry.date}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Exits */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ArrowUpFromLine size={20} className="text-red-600" />
              Sorties Récentes
            </h3>
            <Badge variant="warning">{recentExits.length}</Badge>
          </div>
          <div className="space-y-3">
            {recentExits.map((exit) => (
              <div
                key={exit.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">{exit.name}</p>
                  <p className="text-sm text-gray-600">
                    -{exit.quantity} unités • {exit.motif}
                  </p>
                </div>
                <span className="text-xs text-gray-500">{exit.date}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Alerts */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle size={20} className="text-amber-600" />
            Alertes
          </h3>
          <Badge variant="danger">{alerts.length}</Badge>
        </div>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                alert.type === 'danger' ? 'bg-red-50' : 'bg-amber-50'
              }`}
            >
              <AlertTriangle
                size={20}
                className={alert.type === 'danger' ? 'text-red-600' : 'text-amber-600'}
              />
              <p className="text-sm font-medium text-gray-900">{alert.message}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
