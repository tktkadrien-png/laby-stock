'use client';

import { useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { useSettings } from '@/contexts/SettingsContext';
import StatCard from '@/components/dashboard/StatCard';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import {
  Package,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowDownToLine,
  ArrowUpFromLine,
  XCircle,
  DollarSign,
  BarChart3,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { formatPrice, formatDate } = useSettings();
  const { products, entrees, sorties, isLoading, refreshData } = useData();

  const stats = useMemo(() => {
    const today = new Date();
    const seuilStockFaible = 10;
    const joursAvantPeremption = 30;

    // Calculate product stats
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + p.quantite_totale, 0);
    const totalValue = products.reduce((sum, p) => sum + (p.quantite_totale * p.prix_unitaire), 0);
    const lowStockProducts = products.filter(p => p.quantite_totale > 0 && p.quantite_totale <= seuilStockFaible).length;
    const outOfStockProducts = products.filter(p => p.quantite_totale === 0).length;

    // Calculate expiring products
    const expiringProducts = products.filter(p => {
      if (!p.date_peremption) return false;
      const expDate = new Date(p.date_peremption);
      const daysRemaining = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysRemaining >= 0 && daysRemaining <= joursAvantPeremption;
    }).length;

    const expiredProducts = products.filter(p => {
      if (!p.date_peremption) return false;
      const expDate = new Date(p.date_peremption);
      return expDate.getTime() < today.getTime();
    }).length;

    // Calculate this month's entries and exits
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();

    const entriesThisMonth = entrees.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;

    const exitsThisMonth = sorties.filter(s => {
      const d = new Date(s.date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;

    const totalEntriesValue = entrees.reduce((sum, e) => sum + (e.quantite * (e.prix_unitaire || 0)), 0);
    const totalExitsValue = sorties.reduce((sum, s) => {
      const product = products.find(p => p.id === s.produit_id);
      return sum + (s.quantite * (product?.prix_unitaire || 0));
    }, 0);

    return {
      totalProducts,
      totalStock,
      totalValue,
      lowStockProducts,
      outOfStockProducts,
      expiringProducts,
      expiredProducts,
      entriesThisMonth,
      exitsThisMonth,
      totalEntriesValue,
      totalExitsValue,
    };
  }, [products, entrees, sorties]);

  const recentEntries = useMemo(() => {
    return [...entrees]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [entrees]);

  const recentExits = useMemo(() => {
    return [...sorties]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [sorties]);

  const stockTrendValue = stats.entriesThisMonth - stats.exitsThisMonth;
  const stockTrendPercent = stats.totalStock > 0 ? Math.round((stockTrendValue / stats.totalStock) * 100) : 0;
  const valueTrendValue = stats.totalEntriesValue - stats.totalExitsValue;
  const valueTrendPercent = stats.totalValue > 0 ? Math.round((valueTrendValue / stats.totalValue) * 100) : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600 dark:text-gray-400">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tableau de Bord</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Vue d'ensemble de votre inventaire en temps réel</p>
        </div>
        <Button variant="ghost" onClick={refreshData}>
          <BarChart3 size={20} /> Actualiser
        </Button>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Stock Total" value={stats.totalStock.toString()} icon={Package} trend={{ value: `${stockTrendPercent >= 0 ? '+' : ''}${stockTrendPercent}% ce mois`, isPositive: stockTrendValue >= 0 }} iconColor="blue" />
        <StatCard title="Valeur du Stock" value={formatPrice(stats.totalValue)} icon={DollarSign} trend={{ value: `${valueTrendPercent >= 0 ? '+' : ''}${valueTrendPercent}% ce mois`, isPositive: valueTrendValue >= 0 }} iconColor="amber" />
        <StatCard title="Stock Faible" value={stats.lowStockProducts.toString()} icon={AlertTriangle} iconColor="amber" />
        <StatCard title="Péremption Proche" value={stats.expiringProducts.toString()} icon={Clock} iconColor="amber" />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-600 dark:text-gray-400">Produits Totaux</p><p className="text-2xl font-bold dark:text-white">{stats.totalProducts}</p></div>
            <Package size={32} className="text-blue-600" />
          </div>
        </Card>
        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-600 dark:text-gray-400">Rupture de Stock</p><p className="text-2xl font-bold text-red-600">{stats.outOfStockProducts}</p></div>
            <XCircle size={32} className="text-red-600" />
          </div>
        </Card>
        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-600 dark:text-gray-400">Entrées ce mois</p><p className="text-2xl font-bold text-green-600">{stats.entriesThisMonth}</p></div>
            <ArrowDownToLine size={32} className="text-green-600" />
          </div>
        </Card>
        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-600 dark:text-gray-400">Sorties ce mois</p><p className="text-2xl font-bold text-red-600">{stats.exitsThisMonth}</p></div>
            <ArrowUpFromLine size={32} className="text-red-600" />
          </div>
        </Card>
      </div>

      {/* Alerts Section */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <AlertTriangle size={20} className="text-amber-600" /> Alertes Actives
          </h3>
          <Badge variant="danger">{stats.outOfStockProducts + stats.lowStockProducts + stats.expiringProducts + stats.expiredProducts}</Badge>
        </div>
        <div className="space-y-3">
          {stats.outOfStockProducts > 0 && (
            <Link href="/stock">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer border-l-4 border-red-600">
                <XCircle size={20} className="text-red-600" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-900 dark:text-red-300">Rupture de stock</p>
                  <p className="text-xs text-red-700 dark:text-red-400 mt-1">{stats.outOfStockProducts} produit{stats.outOfStockProducts > 1 ? 's' : ''}</p>
                </div>
                <Badge variant="danger">{stats.outOfStockProducts}</Badge>
              </div>
            </Link>
          )}
          {stats.lowStockProducts > 0 && (
            <Link href="/stock">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors cursor-pointer border-l-4 border-amber-600">
                <AlertTriangle size={20} className="text-amber-600" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">Stock faible</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">{stats.lowStockProducts} produit{stats.lowStockProducts > 1 ? 's' : ''}</p>
                </div>
                <Badge variant="warning">{stats.lowStockProducts}</Badge>
              </div>
            </Link>
          )}
          {stats.expiringProducts > 0 && (
            <Link href="/stock">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors cursor-pointer border-l-4 border-orange-600">
                <Clock size={20} className="text-orange-600" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-orange-900 dark:text-orange-300">Péremption proche</p>
                  <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">{stats.expiringProducts} produit{stats.expiringProducts > 1 ? 's' : ''}</p>
                </div>
                <Badge variant="warning">{stats.expiringProducts}</Badge>
              </div>
            </Link>
          )}
          {stats.expiredProducts > 0 && (
            <Link href="/stock">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer border-l-4 border-red-600">
                <XCircle size={20} className="text-red-600" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-900 dark:text-red-300">Produits périmés</p>
                  <p className="text-xs text-red-700 dark:text-red-400 mt-1">{stats.expiredProducts} produit{stats.expiredProducts > 1 ? 's' : ''}</p>
                </div>
                <Badge variant="danger">{stats.expiredProducts}</Badge>
              </div>
            </Link>
          )}
          {stats.outOfStockProducts === 0 && stats.lowStockProducts === 0 && stats.expiringProducts === 0 && stats.expiredProducts === 0 && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border-l-4 border-green-600">
              <Package size={20} className="text-green-600" />
              <p className="text-sm font-medium text-green-900 dark:text-green-300">Aucune alerte active. Tout est en ordre!</p>
            </div>
          )}
        </div>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <ArrowDownToLine size={20} className="text-green-600" /> Entrées Récentes
            </h3>
            <Link href="/entrees"><Button variant="ghost" size="sm">Voir tout</Button></Link>
          </div>
          {recentEntries.length === 0 ? (
            <div className="text-center py-8">
              <ArrowDownToLine size={48} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600 dark:text-gray-400 text-sm">Aucune entrée récente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{entry.produit_nom}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-green-600 font-semibold">+{entry.quantite}</span> unités
                      {entry.fournisseur && ` • ${entry.fournisseur}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(entry.date)}</span>
                    <p className="text-xs text-amber-700 font-semibold">{formatPrice(entry.quantite * (entry.prix_unitaire || 0))}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <ArrowUpFromLine size={20} className="text-red-600" /> Sorties Récentes
            </h3>
            <Link href="/sorties"><Button variant="ghost" size="sm">Voir tout</Button></Link>
          </div>
          {recentExits.length === 0 ? (
            <div className="text-center py-8">
              <ArrowUpFromLine size={48} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600 dark:text-gray-400 text-sm">Aucune sortie récente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentExits.map((exit) => (
                <div key={exit.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{exit.produit_nom}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-red-600 font-semibold">-{exit.quantite}</span> unités • {exit.motif || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(exit.date)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Monthly Summary */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-blue-600" /> Résumé du Mois
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-600">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Entrées</p>
              <ArrowDownToLine size={20} className="text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-700 dark:text-green-500">{stats.entriesThisMonth}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Valeur: {formatPrice(stats.totalEntriesValue)}</p>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-600">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Sorties</p>
              <ArrowUpFromLine size={20} className="text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-700 dark:text-red-500">{stats.exitsThisMonth}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Valeur: {formatPrice(stats.totalExitsValue)}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
