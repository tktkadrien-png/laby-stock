'use client';

import { useState } from 'react';
import { useAlerts, Alert } from '@/contexts/AlertContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import {
  Bell,
  AlertTriangle,
  XCircle,
  AlertCircle,
  CheckCircle,
  Check,
  Trash2,
  RefreshCw,
  Filter,
  Package
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
  const { alerts, markAsRead, markAllAsRead, refreshAlerts } = useAlerts();
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'rupture' | 'stock_faible' | 'peremption' | 'perime'>('all');

  // Filtrer les alertes
  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'unread' && alert.lu) return false;
    if (filter === 'read' && !alert.lu) return false;
    if (typeFilter !== 'all' && alert.type !== typeFilter) return false;
    return true;
  });

  // Trier par date (les plus récentes en premier)
  const sortedAlerts = [...filteredAlerts].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'rupture':
      case 'perime':
        return <XCircle size={24} className="text-red-600" />;
      case 'stock_faible':
      case 'peremption':
        return <AlertTriangle size={24} className="text-amber-600" />;
      default:
        return <AlertCircle size={24} className="text-blue-600" />;
    }
  };

  const getAlertBadge = (type: string) => {
    switch (type) {
      case 'rupture':
        return <Badge variant="danger">Rupture de Stock</Badge>;
      case 'stock_faible':
        return <Badge variant="warning">Stock Faible</Badge>;
      case 'peremption':
        return <Badge variant="warning">Péremption Proche</Badge>;
      case 'perime':
        return <Badge variant="danger">Produit Périmé</Badge>;
      default:
        return <Badge variant="info">Information</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const unreadCount = alerts.filter(a => !a.lu).length;
  const dangerCount = alerts.filter(a => a.niveau === 'danger' && !a.lu).length;
  const warningCount = alerts.filter(a => a.niveau === 'warning' && !a.lu).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Bell className="text-blue-800 dark:text-blue-400" />
            Notifications & Alertes
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Gérez les alertes de votre stock
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={refreshAlerts}>
            <RefreshCw size={18} />
            Actualiser
          </Button>
          {unreadCount > 0 && (
            <Button variant="primary" onClick={markAllAsRead}>
              <CheckCircle size={18} />
              Tout marquer comme lu
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Bell className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{alerts.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Alertes</p>
            </div>
          </div>
        </Card>

        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <AlertCircle className="text-amber-600 dark:text-amber-400" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{unreadCount}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Non lues</p>
            </div>
          </div>
        </Card>

        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <XCircle className="text-red-600 dark:text-red-400" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{dangerCount}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Critiques</p>
            </div>
          </div>
        </Card>

        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <AlertTriangle className="text-yellow-600 dark:text-yellow-400" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{warningCount}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avertissements</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtrer:</span>
          </div>

          {/* Status filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-800 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-blue-800 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Non lues
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === 'read'
                  ? 'bg-blue-800 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Lues
            </button>
          </div>

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

          {/* Type filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                typeFilter === 'all'
                  ? 'bg-gray-800 dark:bg-gray-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Tous types
            </button>
            <button
              onClick={() => setTypeFilter('rupture')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                typeFilter === 'rupture'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50'
              }`}
            >
              Rupture
            </button>
            <button
              onClick={() => setTypeFilter('stock_faible')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                typeFilter === 'stock_faible'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50'
              }`}
            >
              Stock Faible
            </button>
            <button
              onClick={() => setTypeFilter('peremption')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                typeFilter === 'peremption'
                  ? 'bg-orange-600 text-white'
                  : 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/50'
              }`}
            >
              Péremption
            </button>
            <button
              onClick={() => setTypeFilter('perime')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                typeFilter === 'perime'
                  ? 'bg-red-800 text-white'
                  : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/70'
              }`}
            >
              Périmé
            </button>
          </div>
        </div>
      </Card>

      {/* Alerts List */}
      <Card>
        <div className="space-y-4">
          {sortedAlerts.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Aucune alerte
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {filter === 'unread'
                  ? 'Toutes les alertes ont été lues'
                  : filter === 'read'
                  ? 'Aucune alerte lue'
                  : 'Votre stock est en parfait état'}
              </p>
            </div>
          ) : (
            sortedAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                  !alert.lu
                    ? alert.niveau === 'danger'
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                      : alert.niveau === 'warning'
                      ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700'
                      : 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-75'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-semibold ${alert.lu ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                          {alert.titre}
                        </h4>
                        {!alert.lu && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full" />
                        )}
                      </div>
                      {getAlertBadge(alert.type)}
                    </div>
                    <p className={`text-sm mb-3 ${alert.lu ? 'text-gray-500 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                      {alert.message}
                    </p>
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(alert.created_at)}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push('/stock')}
                          className="flex items-center gap-1 text-xs font-medium text-blue-800 dark:text-blue-400 hover:underline"
                        >
                          <Package size={14} />
                          Voir le produit
                        </button>
                        {!alert.lu && (
                          <>
                            <span className="text-gray-300 dark:text-gray-600">|</span>
                            <button
                              onClick={() => markAsRead(alert.id)}
                              className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            >
                              <Check size={14} />
                              Marquer comme lu
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
