'use client';

import { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { useSettings } from '@/contexts/SettingsContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { FileText, Download, TrendingUp, TrendingDown, DollarSign, Package, Calendar, FileSpreadsheet, Loader2 } from 'lucide-react';

export default function RapportsPage() {
  const { products, entrees, sorties, isLoading } = useData();
  const { formatPrice } = useSettings();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Filter transactions by period
  const filterByPeriod = (date: string) => {
    const transactionDate = new Date(date);
    const now = new Date();

    switch (selectedPeriod) {
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return transactionDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return transactionDate >= monthAgo;
      case 'quarter':
        const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        return transactionDate >= quarterAgo;
      case 'year':
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        return transactionDate >= yearAgo;
      default:
        return true;
    }
  };

  const filteredEntrees = useMemo(() => entrees.filter(e => filterByPeriod(e.date)), [entrees, selectedPeriod]);
  const filteredSorties = useMemo(() => sorties.filter(s => filterByPeriod(s.date)), [sorties, selectedPeriod]);

  // Calculate statistics
  const rapportData = useMemo(() => ({
    entrees: {
      total: filteredEntrees.reduce((sum, e) => sum + e.quantite, 0),
      valeur: filteredEntrees.reduce((sum, e) => sum + (e.quantite * (e.prix_unitaire || 0)), 0),
      count: filteredEntrees.length,
    },
    sorties: {
      total: filteredSorties.reduce((sum, s) => sum + s.quantite, 0),
      valeur: filteredSorties.reduce((sum, s) => {
        const product = products.find(p => p.id === s.produit_id);
        return sum + (s.quantite * (product?.prix_unitaire || 0));
      }, 0),
      count: filteredSorties.length,
    },
    stock: {
      valeur_totale: products.reduce((sum, p) => sum + (p.quantite_totale * p.prix_unitaire), 0),
      produits_actifs: products.length,
      alertes: products.filter(p => p.quantite_totale <= 10).length,
    },
  }), [filteredEntrees, filteredSorties, products]);

  // Top products by usage
  const topProduitsArray = useMemo(() => {
    const topProduits = filteredSorties
      .reduce((acc: { [key: string]: { nom: string; quantite: number; valeur: number } }, s) => {
        const product = products.find(p => p.id === s.produit_id);
        if (!acc[s.produit_id]) {
          acc[s.produit_id] = { nom: s.produit_nom, quantite: 0, valeur: 0 };
        }
        acc[s.produit_id].quantite += s.quantite;
        acc[s.produit_id].valeur += s.quantite * (product?.prix_unitaire || 0);
        return acc;
      }, {});

    return Object.values(topProduits)
      .sort((a, b) => b.quantite - a.quantite)
      .slice(0, 5);
  }, [filteredSorties, products]);

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'week': return 'Cette semaine';
      case 'month': return 'Ce mois';
      case 'quarter': return 'Ce trimestre';
      case 'year': return 'Cette année';
      default: return 'Toutes les périodes';
    }
  };

  // Export to Excel (CSV format)
  const handleExportExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,";

    csvContent += "RAPPORT DE STOCK - LABY STOCK\n";
    csvContent += `Période: ${getPeriodLabel()}\n`;
    csvContent += `Date de génération: ${new Date().toLocaleDateString('fr-FR')}\n\n`;

    csvContent += "=== RÉSUMÉ ===\n";
    csvContent += `Entrées totales,${rapportData.entrees.total}\n`;
    csvContent += `Valeur entrées,${rapportData.entrees.valeur} FCFA\n`;
    csvContent += `Sorties totales,${rapportData.sorties.total}\n`;
    csvContent += `Valeur sorties,${rapportData.sorties.valeur} FCFA\n`;
    csvContent += `Valeur stock actuel,${rapportData.stock.valeur_totale} FCFA\n`;
    csvContent += `Produits actifs,${rapportData.stock.produits_actifs}\n\n`;

    csvContent += "=== LISTE DES PRODUITS ===\n";
    csvContent += "Nom,Catégorie,Quantité,Unité,Prix Unitaire,Valeur Totale,Fournisseur\n";
    products.forEach(p => {
      csvContent += `"${p.nom}","${p.categorie}",${p.quantite_totale},"${p.unite}",${p.prix_unitaire},${p.quantite_totale * p.prix_unitaire},"${p.fournisseur}"\n`;
    });

    csvContent += "\n=== ENTRÉES ===\n";
    csvContent += "Produit,Quantité,Date,Prix Unitaire\n";
    filteredEntrees.forEach(e => {
      csvContent += `"${e.produit_nom}",${e.quantite},"${new Date(e.date).toLocaleDateString('fr-FR')}",${e.prix_unitaire || 0}\n`;
    });

    csvContent += "\n=== SORTIES ===\n";
    csvContent += "Produit,Quantité,Date\n";
    filteredSorties.forEach(s => {
      csvContent += `"${s.produit_nom}",${s.quantite},"${new Date(s.date).toLocaleDateString('fr-FR')}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rapport-stock-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF (HTML print)
  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Rapport Stock - LABY STOCK</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
          h1 { color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }
          h2 { color: #1e40af; margin-top: 30px; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
          .stat-card { background: #f3f4f6; padding: 15px; border-radius: 8px; }
          .stat-value { font-size: 24px; font-weight: bold; color: #1e40af; }
          .stat-label { font-size: 14px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background: #1e40af; color: white; }
          tr:nth-child(even) { background: #f9fafb; }
          .text-green { color: #16a34a; }
          .text-red { color: #dc2626; }
          .text-amber { color: #d97706; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
          @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>LABY STOCK - Rapport de Stock</h1>
          <p>Période: ${getPeriodLabel()}</p>
          <p>Généré le: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
        </div>

        <h2>Résumé</h2>
        <div class="summary">
          <div class="stat-card">
            <div class="stat-label">Entrées Totales</div>
            <div class="stat-value text-green">+${rapportData.entrees.total}</div>
            <div class="stat-label">${formatPrice(rapportData.entrees.valeur)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Sorties Totales</div>
            <div class="stat-value text-red">-${rapportData.sorties.total}</div>
            <div class="stat-label">${formatPrice(rapportData.sorties.valeur)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Valeur Stock</div>
            <div class="stat-value text-amber">${formatPrice(rapportData.stock.valeur_totale)}</div>
            <div class="stat-label">${rapportData.stock.produits_actifs} produits</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Solde Net</div>
            <div class="stat-value">${formatPrice(rapportData.entrees.valeur - rapportData.sorties.valeur)}</div>
          </div>
        </div>

        <h2>Inventaire Actuel</h2>
        <table>
          <thead>
            <tr>
              <th>Produit</th>
              <th>Catégorie</th>
              <th>Quantité</th>
              <th>Prix Unit.</th>
              <th>Valeur</th>
            </tr>
          </thead>
          <tbody>
            ${products.map(p => `
              <tr>
                <td>${p.nom}</td>
                <td>${p.categorie}</td>
                <td>${p.quantite_totale} ${p.unite}</td>
                <td>${formatPrice(p.prix_unitaire)}</td>
                <td>${formatPrice(p.quantite_totale * p.prix_unitaire)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2>Top Produits Utilisés</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Produit</th>
              <th>Quantité Utilisée</th>
              <th>Valeur</th>
            </tr>
          </thead>
          <tbody>
            ${topProduitsArray.map((p, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${p.nom}</td>
                <td>${p.quantite}</td>
                <td>${formatPrice(p.valeur)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>© ${new Date().getFullYear()} LABY STOCK - Système de Gestion de Stock</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Rapports & Analytics</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Analyse des mouvements de stock</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleExportExcel}>
            <FileSpreadsheet size={20} />
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
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Période:</span>
          </div>
          <div className="flex flex-wrap gap-2">
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
                    ? 'bg-blue-800 text-white dark:bg-blue-700'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Entrées Totales</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">+{rapportData.entrees.total}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{rapportData.entrees.count} transactions</p>
            </div>
            <TrendingUp size={32} className="text-green-600 dark:text-green-400" />
          </div>
        </Card>

        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Sorties Totales</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">-{rapportData.sorties.total}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{rapportData.sorties.count} transactions</p>
            </div>
            <TrendingDown size={32} className="text-red-600 dark:text-red-400" />
          </div>
        </Card>

        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Valeur Stock</p>
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{formatPrice(rapportData.stock.valeur_totale)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{rapportData.stock.produits_actifs} produits</p>
            </div>
            <DollarSign size={32} className="text-amber-600 dark:text-amber-400" />
          </div>
        </Card>

        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Alertes Stock</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{rapportData.stock.alertes}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">produits faibles</p>
            </div>
            <Package size={32} className="text-blue-600 dark:text-blue-400" />
          </div>
        </Card>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Valeur des Mouvements */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Valeur des Mouvements</h3>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Entrées</span>
                <Badge variant="success">+{rapportData.entrees.count}</Badge>
              </div>
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">{formatPrice(rapportData.entrees.valeur)}</p>
            </div>

            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-200 dark:border-red-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sorties</span>
                <Badge variant="danger">-{rapportData.sorties.count}</Badge>
              </div>
              <p className="text-2xl font-bold text-red-700 dark:text-red-400">{formatPrice(rapportData.sorties.valeur)}</p>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Solde Net</span>
                <Badge variant="info">Δ</Badge>
              </div>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {formatPrice(rapportData.entrees.valeur - rapportData.sorties.valeur)}
              </p>
            </div>
          </div>
        </Card>

        {/* Top Produits Utilisés */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Top Produits Utilisés</h3>
          <div className="space-y-3">
            {topProduitsArray.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Package size={48} className="mx-auto mb-3 opacity-50" />
                <p>Aucune sortie dans cette période</p>
              </div>
            ) : (
              topProduitsArray.map((produit, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-800 dark:bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{produit.nom}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">-{produit.quantite} unités</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-amber-700 dark:text-amber-400">{formatPrice(produit.valeur)}</p>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Alertes et Recommandations */}
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Alertes & Recommandations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {products.filter(p => p.quantite_totale === 0).length > 0 && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-500">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-red-600 dark:text-red-400 font-bold text-sm">RUPTURE</span>
                  <Badge variant="danger">{products.filter(p => p.quantite_totale === 0).length} produit(s)</Badge>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">Produits en rupture de stock</p>
              </div>
            )}

            {products.filter(p => p.quantite_totale > 0 && p.quantite_totale <= 10).length > 0 && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border-l-4 border-amber-500">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-amber-600 dark:text-amber-400 font-bold text-sm">ATTENTION</span>
                  <Badge variant="warning">{products.filter(p => p.quantite_totale > 0 && p.quantite_totale <= 10).length} produit(s)</Badge>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">Stock faible, à réapprovisionner</p>
              </div>
            )}

            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-600 dark:text-green-400 font-bold text-sm">OK</span>
                <Badge variant="success">{products.filter(p => p.quantite_totale > 10).length} produit(s)</Badge>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">Stock normal</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Actions Rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleExportPDF}
            className="p-4 border-2 border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors text-left"
          >
            <FileText size={24} className="text-blue-800 dark:text-blue-400 mb-2" />
            <p className="font-semibold text-gray-900 dark:text-white">Rapport Complet PDF</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Générer et imprimer</p>
          </button>

          <button
            onClick={handleExportExcel}
            className="p-4 border-2 border-green-200 dark:border-green-800 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors text-left"
          >
            <FileSpreadsheet size={24} className="text-green-600 dark:text-green-400 mb-2" />
            <p className="font-semibold text-gray-900 dark:text-white">Export Excel/CSV</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Télécharger les données</p>
          </button>

          <button
            onClick={() => window.print()}
            className="p-4 border-2 border-amber-200 dark:border-amber-800 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors text-left"
          >
            <Download size={24} className="text-amber-600 dark:text-amber-400 mb-2" />
            <p className="font-semibold text-gray-900 dark:text-white">Imprimer Page</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Imprimer cette page</p>
          </button>
        </div>
      </Card>
    </div>
  );
}
