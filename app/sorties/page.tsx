'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { ArrowUpFromLine, Plus, AlertCircle, Package, DollarSign, Calendar, Trash2, Eye, X } from 'lucide-react';
import {
  getAllProducts,
  getAllExits,
  createExit,
  deleteExit,
  type Product,
  type StockExit,
  initializeDatabase,
} from '@/lib/database/localStorage';

export default function SortiesPage() {
  const { formatPrice, formatDate } = useSettings();

  // State
  const [exits, setExits] = useState<StockExit[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingExit, setViewingExit] = useState<StockExit | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterMotif, setFilterMotif] = useState('all');

  const [formData, setFormData] = useState({
    produit_id: '',
    quantite: 0,
    cartons: 0,
    destination: '',
    date_sortie: new Date().toISOString().split('T')[0],
    motif: 'Utilisation',
    notes: '',
  });

  // Load data on mount
  useEffect(() => {
    initializeDatabase();
    loadData();
  }, []);

  const loadData = () => {
    const allExits = getAllExits();
    const allProducts = getAllProducts();

    setExits(allExits);
    setProducts(allProducts);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      produit_id: '',
      quantite: 0,
      cartons: 0,
      destination: '',
      date_sortie: new Date().toISOString().split('T')[0],
      motif: 'Utilisation',
      notes: '',
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedProduct = products.find(p => p.id === formData.produit_id);

    if (!selectedProduct) {
      alert('Veuillez sélectionner un produit');
      return;
    }

    // Check stock availability
    if (formData.quantite > selectedProduct.quantite_totale) {
      alert(`❌ Stock insuffisant!\n\nStock disponible: ${selectedProduct.quantite_totale}\nQuantité demandée: ${formData.quantite}`);
      return;
    }

    if (formData.quantite <= 0) {
      alert('❌ La quantité doit être supérieure à 0');
      return;
    }

    const valeur_totale = formData.quantite * selectedProduct.prix_unitaire;

    const exitData = {
      produit_id: formData.produit_id,
      produit_nom: selectedProduct.nom,
      quantite: formData.quantite,
      cartons: formData.cartons,
      valeur_unitaire: selectedProduct.prix_unitaire,
      valeur_totale,
      destination: formData.destination,
      date_sortie: formData.date_sortie,
      motif: formData.motif,
      notes: formData.notes,
      validated: true, // Auto-validate for now
    };

    const newExit = createExit(exitData);

    if (newExit) {
      loadData(); // Reload to get updated product quantities
      setShowAddModal(false);
      resetForm();
      alert('✅ Sortie enregistrée avec succès!\nLe stock du produit a été mis à jour automatiquement.');
    } else {
      alert('❌ Erreur: Stock insuffisant pour effectuer cette sortie!');
    }
  };

  // Handle delete
  const handleDelete = (id: string, productName: string) => {
    if (confirm(`⚠️ Supprimer cette sortie de "${productName}"?\n\nATTENTION: Cette action ne peut pas être annulée et n'ajustera PAS le stock du produit.`)) {
      const success = deleteExit(id);
      if (success) {
        loadData();
        alert('✅ Sortie supprimée avec succès!');
      }
    }
  };

  // View exit details
  const handleView = (exit: StockExit) => {
    setViewingExit(exit);
    setShowViewModal(true);
  };

  // Auto-fill data from product
  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setFormData({
        ...formData,
        produit_id: productId,
      });
    }
  };

  // Filter exits
  const getFilteredExits = () => {
    let filtered = exits;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(exit =>
        exit.produit_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exit.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exit.motif.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Motif filter
    if (filterMotif !== 'all') {
      filtered = filtered.filter(exit => exit.motif === filterMotif);
    }

    // Period filter
    if (filterPeriod !== 'all') {
      const now = new Date();
      const exitDate = (dateStr: string) => new Date(dateStr);

      filtered = filtered.filter(exit => {
        const date = exitDate(exit.date_sortie);
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (filterPeriod === 'today') return diffDays === 0;
        if (filterPeriod === 'week') return diffDays <= 7;
        if (filterPeriod === 'month') return diffDays <= 30;
        return true;
      });
    }

    return filtered.sort((a, b) => new Date(b.date_sortie).getTime() - new Date(a.date_sortie).getTime());
  };

  const filteredExits = getFilteredExits();

  // Calculate statistics
  const stats = {
    totalExits: filteredExits.length,
    totalQuantity: filteredExits.reduce((sum, e) => sum + e.quantite, 0),
    totalValue: filteredExits.reduce((sum, e) => sum + e.valeur_totale, 0),
    totalCartons: filteredExits.reduce((sum, e) => sum + e.cartons, 0),
    thisMonth: filteredExits.filter(e => {
      const exitDate = new Date(e.date_sortie);
      const now = new Date();
      return exitDate.getMonth() === now.getMonth() && exitDate.getFullYear() === now.getFullYear();
    }).length,
  };

  const selectedProduct = products.find(p => p.id === formData.produit_id);

  // Get motif badge variant
  const getMotifBadge = (motif: string) => {
    switch (motif) {
      case 'Utilisation': return <Badge variant="default">{motif}</Badge>;
      case 'Vente': return <Badge variant="success">{motif}</Badge>;
      case 'Perte': return <Badge variant="danger">{motif}</Badge>;
      case 'Expiration': return <Badge variant="warning">{motif}</Badge>;
      default: return <Badge variant="info">{motif}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sorties de Stock</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Enregistrement des utilisations et distributions</p>
        </div>
        <Button variant="danger" size="lg" onClick={() => setShowAddModal(true)}>
          <Plus size={20} />
          Nouvelle Sortie
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Sorties</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalExits}</p>
              <p className="text-xs text-red-600 mt-1">Ce mois: {stats.thisMonth}</p>
            </div>
            <ArrowUpFromLine size={32} className="text-red-600" />
          </div>
        </Card>

        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Quantité Totale</p>
              <p className="text-2xl font-bold text-red-600">-{stats.totalQuantity}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Pièces sorties</p>
            </div>
            <Package size={32} className="text-red-600" />
          </div>
        </Card>

        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Cartons</p>
              <p className="text-2xl font-bold text-orange-600">{stats.totalCartons}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Cartons sortis</p>
            </div>
            <div className="text-4xl">📤</div>
          </div>
        </Card>

        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Valeur Totale</p>
              <p className="text-xl font-bold text-amber-600">{formatPrice(stats.totalValue)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Coût des sorties</p>
            </div>
            <DollarSign size={32} className="text-amber-600" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Input
              type="text"
              placeholder="🔍 Rechercher par produit, destination..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              value={filterMotif}
              onChange={(e) => setFilterMotif(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
            >
              <option value="all">Tous les motifs</option>
              <option value="Utilisation">Utilisation</option>
              <option value="Vente">Vente</option>
              <option value="Perte">Perte</option>
              <option value="Expiration">Expiration</option>
              <option value="Autre">Autre</option>
            </select>
          </div>
          <div>
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
            >
              <option value="all">Toutes les périodes</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Exits Table */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Historique des Sorties ({filteredExits.length})
          </h3>
        </div>

        {filteredExits.length === 0 ? (
          <div className="text-center py-12">
            <ArrowUpFromLine size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Aucune sortie trouvée</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              {searchTerm ? 'Essayez de modifier vos critères de recherche' : 'Commencez par enregistrer une nouvelle sortie'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Motif</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Cartons</TableHead>
                  <TableHead>Valeur Unit.</TableHead>
                  <TableHead>Valeur Totale</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExits.map((exit) => (
                  <TableRow key={exit.id}>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        {formatDate(exit.date_sortie)}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold dark:text-white">{exit.produit_nom}</TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">{exit.destination || 'N/A'}</TableCell>
                    <TableCell>{getMotifBadge(exit.motif)}</TableCell>
                    <TableCell>
                      <span className="text-red-600 font-bold text-lg">-{exit.quantite}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-orange-600 font-semibold">{exit.cartons || 0}</span>
                    </TableCell>
                    <TableCell className="font-semibold text-amber-700">
                      {formatPrice(exit.valeur_unitaire)}
                    </TableCell>
                    <TableCell className="font-bold text-amber-700">
                      {formatPrice(exit.valeur_totale)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(exit)}
                          title="Voir les détails"
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(exit.id, exit.produit_nom)}
                          title="Supprimer"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Add Exit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="➖ Nouvelle Sortie de Stock"
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Selection */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Produit <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.produit_id}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                required
              >
                <option value="">-- Sélectionner un produit --</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.nom} - {product.code} (Stock: {product.quantite_totale})
                  </option>
                ))}
              </select>
            </div>

            {/* Product Info Display */}
            {selectedProduct && (
              <div className="md:col-span-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Informations du produit</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Stock actuel:</span>
                    <span className="ml-2 font-bold dark:text-white">{selectedProduct.quantite_totale} {selectedProduct.unite}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Prix unitaire:</span>
                    <span className="ml-2 font-bold text-amber-700">{formatPrice(selectedProduct.prix_unitaire)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Cartons:</span>
                    <span className="ml-2 font-bold dark:text-white">{selectedProduct.quantite_cartons}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Emplacement:</span>
                    <span className="ml-2 font-bold dark:text-white">{selectedProduct.emplacement}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quantity */}
            <Input
              label="Quantité (pièces)"
              type="number"
              value={formData.quantite}
              onChange={(e) => setFormData({ ...formData, quantite: parseInt(e.target.value) || 0 })}
              min="1"
              max={selectedProduct?.quantite_totale || 999999}
              required
            />

            {/* Cartons */}
            <Input
              label="Nombre de cartons"
              type="number"
              value={formData.cartons}
              onChange={(e) => setFormData({ ...formData, cartons: parseInt(e.target.value) || 0 })}
              min="0"
            />

            {/* Destination */}
            <Input
              label="Destination"
              type="text"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              placeholder="Ex: Service hématologie"
            />

            {/* Motif */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Motif <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.motif}
                onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                required
              >
                <option value="Utilisation">Utilisation</option>
                <option value="Vente">Vente</option>
                <option value="Perte">Perte</option>
                <option value="Expiration">Expiration</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            {/* Exit Date */}
            <Input
              label="Date de sortie"
              type="date"
              value={formData.date_sortie}
              onChange={(e) => setFormData({ ...formData, date_sortie: e.target.value })}
              required
            />

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes / Commentaires
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                placeholder="Commentaires optionnels sur cette sortie..."
              />
            </div>
          </div>

          {/* Stock Warning */}
          {selectedProduct && formData.quantite > 0 && (
            <div className="mt-4">
              {formData.quantite > selectedProduct.quantite_totale ? (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg flex items-start gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-sm text-red-700 dark:text-red-400 font-semibold">
                      ❌ Stock insuffisant!
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      Stock disponible: {selectedProduct.quantite_totale} • Quantité demandée: {formData.quantite}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-400">
                    ✅ Stock après sortie: <span className="font-bold">{selectedProduct.quantite_totale - formData.quantite}</span> {selectedProduct.unite}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Summary */}
          {selectedProduct && formData.quantite > 0 && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-200 dark:border-red-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Valeur de la sortie</p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-500">
                    {formatPrice(formData.quantite * selectedProduct.prix_unitaire)}
                  </p>
                </div>
                {formData.cartons > 0 && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cartons</p>
                    <p className="text-xl font-bold text-orange-600">{formData.cartons}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="danger"
              disabled={!selectedProduct || formData.quantite > (selectedProduct?.quantite_totale || 0) || formData.quantite <= 0}
            >
              ✅ Enregistrer la Sortie
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Exit Details Modal */}
      {viewingExit && (
        <Modal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setViewingExit(null);
          }}
          title="📋 Détails de la Sortie"
          size="md"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Date de sortie</p>
                <p className="font-semibold dark:text-white">{formatDate(viewingExit.date_sortie)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Motif</p>
                {getMotifBadge(viewingExit.motif)}
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Produit</p>
                <p className="font-semibold text-lg dark:text-white">{viewingExit.produit_nom}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Destination</p>
                <p className="font-semibold dark:text-white">{viewingExit.destination || 'Non spécifiée'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Quantité sortie</p>
                <p className="font-bold text-red-600 text-xl">-{viewingExit.quantite}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Cartons</p>
                <p className="font-semibold text-orange-600">{viewingExit.cartons || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Valeur unitaire</p>
                <p className="font-semibold text-amber-700">{formatPrice(viewingExit.valeur_unitaire)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Valeur totale</p>
                <p className="font-bold text-amber-700 text-2xl">{formatPrice(viewingExit.valeur_totale)}</p>
              </div>
              {viewingExit.notes && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Notes</p>
                  <p className="font-semibold dark:text-white italic">{viewingExit.notes}</p>
                </div>
              )}
              <div className="col-span-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Enregistré le</p>
                <p className="text-sm dark:text-white">{new Date(viewingExit.created_at).toLocaleString('fr-FR')}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              variant="ghost"
              onClick={() => {
                setShowViewModal(false);
                setViewingExit(null);
              }}
            >
              Fermer
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
