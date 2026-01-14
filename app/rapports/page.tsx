'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { FileText, Download, TrendingUp, TrendingDown, DollarSign, Package } from 'lucide-react';

export default function RapportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(price) + ' FCFA';
  };

  // Mock data for reports
  const rapportData = {
    entrees: {
      total: 1350,
      valeur: 2345000,
      count: 3,
    },
    sorties: {
      total: 50,
      valeur: 229250,
      count: 3,
    },
    stock: {
      valeur_totale: 3890750,
      produits_actifs: 5,
      alertes: 1,
    },
  };

  const topProduits = [
    { nom: 'Tubes EDTA', quantite_utilisee: 25, valeur: 1250 },
    { nom: 'Gants Nitrile M', quantite_utilisee: 20, valeur: 3000 },
    { nom: 'Réactif PCR Kit', quantite_utilisee: 5, valeur: 225000 },
  ];

  const fournisseurs = [
    { nom: 'BioLab Pro', produits: 2, valeur: 2475000 },
    { nom: 'MedSupply', produits: 2, valeur: 87500 },
    { nom: 'SafetyFirst', produits: 1, valeur: 42000 },
  ];

  const handleExportPDF = () => {
    alert('Export PDF en cours de développement...');
  };

  const handleExportExcel = () => {
    alert('Export Excel en cours de développement...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rapports & Analytics</h1>
          <p className="text-sm text-gray-600 mt-1">Analyse des mouvements de stock</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleExportExcel}>
            <Download size={20} />
            Export Excel
          </Button>
          <Button variant="primary" onClick={handleExportPDF}>
            <Download size={20} />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Period selector */}
      <Card>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Période:</span>
          <div className="flex gap-2">
            {[
              { value: 'week', label: 'Cette semaine' },
              { value: 'month', label: 'Ce mois' },
              { value: 'quarter', label: 'Ce trimestre' },
              { value: 'year', label: 'Cette année' },
            ].map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === period.value
                    ? 'bg-blue-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Entrées Totales</p>
              <p className="text-2xl font-bold text-green-600">+{rapportData.entrees.total}</p>
              <p className="text-xs text-gray-500 mt-1">{rapportData.entrees.count} transactions</p>
            </div>
            <TrendingUp size={32} className="text-green-600" />
          </div>
        </Card>

        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sorties Totales</p>
              <p className="text-2xl font-bold text-red-600">-{rapportData.sorties.total}</p>
              <p className="text-xs text-gray-500 mt-1">{rapportData.sorties.count} transactions</p>
            </div>
            <TrendingDown size={32} className="text-red-600" />
          </div>
        </Card>

        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Valeur Stock</p>
              <p className="text-xl font-bold text-amber-600">{formatPrice(rapportData.stock.valeur_totale)}</p>
              <p className="text-xs text-gray-500 mt-1">{rapportData.stock.produits_actifs} produits</p>
            </div>
            <DollarSign size={32} className="text-amber-600" />
          </div>
        </Card>

        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Taux de Rotation</p>
              <p className="text-2xl font-bold text-blue-600">3.7%</p>
              <p className="text-xs text-gray-500 mt-1">Ce mois</p>
            </div>
            <Package size={32} className="text-blue-600" />
          </div>
        </Card>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Valeur des Mouvements */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Valeur des Mouvements</h3>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Entrées</span>
                <Badge variant="success">+{rapportData.entrees.count}</Badge>
              </div>
              <p className="text-2xl font-bold text-green-700">{formatPrice(rapportData.entrees.valeur)}</p>
            </div>

            <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Sorties</span>
                <Badge variant="danger">-{rapportData.sorties.count}</Badge>
              </div>
              <p className="text-2xl font-bold text-red-700">{formatPrice(rapportData.sorties.valeur)}</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Solde Net</span>
                <Badge variant="info">Δ</Badge>
              </div>
              <p className="text-2xl font-bold text-blue-700">
                {formatPrice(rapportData.entrees.valeur - rapportData.sorties.valeur)}
              </p>
            </div>
          </div>
        </Card>

        {/* Top Produits Utilisés */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Produits Utilisés</h3>
          <div className="space-y-3">
            {topProduits.map((produit, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-800 text-white flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{produit.nom}</p>
                    <p className="text-xs text-gray-500">-{produit.quantite_utilisee} unités</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-amber-700">{formatPrice(produit.valeur)}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Analyse par Fournisseur */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Analyse par Fournisseur</h3>
          <div className="space-y-3">
            {fournisseurs.map((fournisseur, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-900">{fournisseur.nom}</p>
                  <Badge variant="info">{fournisseur.produits} produits</Badge>
                </div>
                <p className="text-lg font-bold text-amber-700">{formatPrice(fournisseur.valeur)}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Alertes et Recommandations */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Alertes & Recommandations</h3>
          <div className="space-y-3">
            <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-red-600 font-bold text-sm">URGENT</span>
                <Badge variant="danger">1 produit</Badge>
              </div>
              <p className="text-sm text-gray-700">Anticorps Anti-HBs expire dans 12 jours</p>
            </div>

            <div className="p-3 bg-amber-50 rounded-lg border-l-4 border-amber-500">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-amber-600 font-bold text-sm">ATTENTION</span>
                <Badge variant="warning">Rotation faible</Badge>
              </div>
              <p className="text-sm text-gray-700">Certains produits ont un faible taux de rotation</p>
            </div>

            <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-green-600 font-bold text-sm">OK</span>
                <Badge variant="success">Stock sain</Badge>
              </div>
              <p className="text-sm text-gray-700">Le stock global est en bon état</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Actions Rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-left">
            <FileText size={24} className="text-blue-800 mb-2" />
            <p className="font-semibold text-gray-900">Rapport d'Inventaire</p>
            <p className="text-xs text-gray-600 mt-1">Générer rapport complet</p>
          </button>

          <button className="p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors text-left">
            <TrendingUp size={24} className="text-green-600 mb-2" />
            <p className="font-semibold text-gray-900">Rapport d'Entrées</p>
            <p className="text-xs text-gray-600 mt-1">Historique des réceptions</p>
          </button>

          <button className="p-4 border-2 border-red-200 rounded-lg hover:bg-red-50 transition-colors text-left">
            <TrendingDown size={24} className="text-red-600 mb-2" />
            <p className="font-semibold text-gray-900">Rapport de Sorties</p>
            <p className="text-xs text-gray-600 mt-1">Historique des utilisations</p>
          </button>
        </div>
      </Card>
    </div>
  );
}
