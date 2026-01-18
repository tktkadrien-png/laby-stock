'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { ArrowDownToLine, Plus, X, Package, DollarSign, Calendar, Trash2, Eye } from 'lucide-react';
import {
  getAllProducts,
  getAllSuppliers,
  getAllEntries,
  createEntry,
  deleteEntry,
  type Product,
  type Supplier,
  type StockEntry,
  initializeDatabase,
} from '@/lib/database/localStorage';

export default function EntreesPage() {
  const { formatPrice, formatDate } = useSettings();

  // State
  const [entries, setEntries] = useState<StockEntry[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingEntry, setViewingEntry] = useState<StockEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all'); // all, today, week, month

  const [formData, setFormData] = useState({
    produit_id: '',
    quantite: 0,
    cartons: 0,
    prix_unitaire: 0,
    fournisseur_id: '',
    date_entree: new Date().toISOString().split('T')[0],
    lot: '',
    date_peremption: '',
    notes: '',
  });

  // Load data on mount
  useEffect(() => {
    initializeDatabase();
    loadData();
  }, []);

  const loadData = () => {
    const allEntries = getAllEntries();
    const allProducts = getAllProducts();
    const allSuppliers = getAllSuppliers();

    setEntries(allEntries);
    setProducts(allProducts);
    setSuppliers(allSuppliers);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      produit_id: '',
      quantite: 0,
      cartons: 0,
      prix_unitaire: 0,
      fournisseur_id: '',
      date_entree: new Date().toISOString().split('T')[0],
      lot: '',
      date_peremption: '',
      notes: '',
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedProduct = products.find(p => p.id === formData.produit_id);
    const selectedSupplier = suppliers.find(s => s.id === formData.fournisseur_id);

    if (!selectedProduct) {
      alert('Veuillez sélectionner un produit');
      return;
    }

    const valeur_totale = formData.quantite * formData.prix_unitaire;

    const entryData = {
      produit_id: formData.produit_id,
      produit_nom: selectedProduct.nom,
      quantite: formData.quantite,
      cartons: formData.cartons,
      prix_unitaire: formData.prix_unitaire,
      valeur_totale,
      fournisseur_id: formData.fournisseur_id || null,
      fournisseur_nom: selectedSupplier?.nom || 'Non spécifié',
      date_entree: formData.date_entree,
      lot: formData.lot,
      date_peremption: formData.date_peremption || null,
      notes: formData.notes,
    };

    const newEntry = createEntry(entryData);

    if (newEntry) {
      loadData(); // Reload to get updated product quantities
      setShowAddModal(false);
      resetForm();
      alert('✅ Entrée enregistrée avec succès!\nLe stock du produit a été mis à jour automatiquement.');
    }
  };

  // Handle delete
  const handleDelete = (id: string, productName: string) => {
    if (confirm(`⚠️ Supprimer cette entrée de "${productName}"?\n\nATTENTION: Cette action ne peut pas être annulée et n'ajustera PAS le stock du produit.`)) {
      const success = deleteEntry(id);
      if (success) {
        loadData();
        alert('✅ Entrée supprimée avec succès!');
      }
    }
  };

  // View entry details
  const handleView = (entry: StockEntry) => {
    setViewingEntry(entry);
    setShowViewModal(true);
  };

  // Auto-fill price from product
  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setFormData({
        ...formData,
        produit_id: productId,
        prix_unitaire: product.prix_unitaire,
        lot: product.lot,
      });
    }
  };

  // Filter entries
  const getFilteredEntries = () => {
    let filtered = entries;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.produit_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.fournisseur_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.lot.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Period filter
    if (filterPeriod !== 'all') {
      const now = new Date();
      const entryDate = (dateStr: string) => new Date(dateStr);

      filtered = filtered.filter(entry => {
        const date = entryDate(entry.date_entree);
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (filterPeriod === 'today') return diffDays === 0;
        if (filterPeriod === 'week') return diffDays <= 7;
        if (filterPeriod === 'month') return diffDays <= 30;
        return true;
      });
    }

    return filtered.sort((a, b) => new Date(b.date_entree).getTime() - new Date(a.date_entree).getTime());
  };

  const filteredEntries = getFilteredEntries();

  // Calculate statistics
  const stats = {
    totalEntries: filteredEntries.length,
    totalQuantity: filteredEntries.reduce((sum, e) => sum + e.quantite, 0),
    totalValue: filteredEntries.reduce((sum, e) => sum + e.valeur_totale, 0),
    totalCartons: filteredEntries.reduce((sum, e) => sum + e.cartons, 0),
    thisMonth: filteredEntries.filter(e => {
      const entryDate = new Date(e.date_entree);
      const now = new Date();
      return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
    }).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Entrées de Stock</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Enregistrement des réceptions et approvisionnements</p>
        </div>
        <Button variant="primary" size="lg" onClick={() => setShowAddModal(true)}>
          <Plus size={20} />
          Nouvelle Entrée
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Entrées</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalEntries}</p>
              <p className="text-xs text-green-600 mt-1">Ce mois: {stats.thisMonth}</p>
            </div>
            <ArrowDownToLine size={32} className="text-green-600" />
          </div>
        </Card>

        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Quantité Totale</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalQuantity}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Pièces ajoutées</p>
            </div>
            <Package size={32} className="text-green-600" />
          </div>
        </Card>

        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Cartons</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalCartons}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Cartons reçus</p>
            </div>
            <div className="text-4xl">📦</div>
          </div>
        </Card>

        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Valeur Totale</p>
              <p className="text-xl font-bold text-amber-600">{formatPrice(stats.totalValue)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Investissement</p>
            </div>
            <DollarSign size={32} className="text-amber-600" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="🔍 Rechercher par produit, fournisseur ou lot..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="sm:w-48">
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

      {/* Entries Table */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Historique des Entrées ({filteredEntries.length})
          </h3>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <ArrowDownToLine size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Aucune entrée trouvée</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              {searchTerm ? 'Essayez de modifier vos critères de recherche' : 'Commencez par enregistrer une nouvelle entrée'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead>Lot</TableHead>
                  <TableHead>Fournisseur</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Cartons</TableHead>
                  <TableHead>Prix Unit.</TableHead>
                  <TableHead>Valeur Totale</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        {formatDate(entry.date_entree)}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold dark:text-white">{entry.produit_nom}</TableCell>
                    <TableCell>
                      <Badge variant="info">{entry.lot || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">{entry.fournisseur_nom}</TableCell>
                    <TableCell>
                      <span className="text-green-600 font-bold text-lg">+{entry.quantite}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-blue-600 font-semibold">{entry.cartons || 0}</span>
                    </TableCell>
                    <TableCell className="font-semibold text-amber-700">
                      {formatPrice(entry.prix_unitaire)}
                    </TableCell>
                    <TableCell className="font-bold text-amber-700">
                      {formatPrice(entry.valeur_totale)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(entry)}
                          title="Voir les détails"
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(entry.id, entry.produit_nom)}
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

      {/* Add Entry Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="➕ Nouvelle Entrée de Stock"
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
                    {product.nom} - {product.code} (Stock actuel: {product.quantite_totale})
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <Input
              label="Quantité (pièces)"
              type="number"
              value={formData.quantite}
              onChange={(e) => setFormData({ ...formData, quantite: parseInt(e.target.value) || 0 })}
              min="1"
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

            {/* Unit Price */}
            <Input
              label="Prix unitaire"
              type="number"
              value={formData.prix_unitaire}
              onChange={(e) => setFormData({ ...formData, prix_unitaire: parseFloat(e.target.value) || 0 })}
              min="0"
              step="0.01"
              required
            />

            {/* Supplier */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fournisseur
              </label>
              <select
                value={formData.fournisseur_id}
                onChange={(e) => setFormData({ ...formData, fournisseur_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
              >
                <option value="">-- Non spécifié --</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* Entry Date */}
            <Input
              label="Date d'entrée"
              type="date"
              value={formData.date_entree}
              onChange={(e) => setFormData({ ...formData, date_entree: e.target.value })}
              required
            />

            {/* Lot Number */}
            <Input
              label="Numéro de lot"
              type="text"
              value={formData.lot}
              onChange={(e) => setFormData({ ...formData, lot: e.target.value })}
              placeholder="Ex: LOT-2026-001"
            />

            {/* Expiration Date */}
            <Input
              label="Date de péremption"
              type="date"
              value={formData.date_peremption}
              onChange={(e) => setFormData({ ...formData, date_peremption: e.target.value })}
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
                placeholder="Commentaires optionnels sur cette entrée..."
              />
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border-2 border-amber-200 dark:border-amber-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Valeur totale de l'entrée</p>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-500">
                  {formatPrice(formData.quantite * formData.prix_unitaire)}
                </p>
              </div>
              {formData.cartons > 0 && (
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Cartons</p>
                  <p className="text-xl font-bold text-blue-600">{formData.cartons}</p>
                </div>
              )}
            </div>
          </div>

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
            <Button type="submit" variant="primary">
              ✅ Enregistrer l'Entrée
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Entry Details Modal */}
      {viewingEntry && (
        <Modal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setViewingEntry(null);
          }}
          title="📋 Détails de l'Entrée"
          size="md"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Date d'entrée</p>
                <p className="font-semibold dark:text-white">{formatDate(viewingEntry.date_entree)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Numéro de lot</p>
                <p className="font-semibold dark:text-white">{viewingEntry.lot || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Produit</p>
                <p className="font-semibold text-lg dark:text-white">{viewingEntry.produit_nom}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Fournisseur</p>
                <p className="font-semibold dark:text-white">{viewingEntry.fournisseur_nom}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Quantité ajoutée</p>
                <p className="font-bold text-green-600 text-xl">+{viewingEntry.quantite}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Cartons</p>
                <p className="font-semibold text-blue-600">{viewingEntry.cartons || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Prix unitaire</p>
                <p className="font-semibold text-amber-700">{formatPrice(viewingEntry.prix_unitaire)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Date de péremption</p>
                <p className="font-semibold dark:text-white">
                  {viewingEntry.date_peremption ? formatDate(viewingEntry.date_peremption) : 'Non spécifiée'}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Valeur totale</p>
                <p className="font-bold text-amber-700 text-2xl">{formatPrice(viewingEntry.valeur_totale)}</p>
              </div>
              {viewingEntry.notes && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Notes</p>
                  <p className="font-semibold dark:text-white italic">{viewingEntry.notes}</p>
                </div>
              )}
              <div className="col-span-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Enregistré le</p>
                <p className="text-sm dark:text-white">{new Date(viewingEntry.created_at).toLocaleString('fr-FR')}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              variant="ghost"
              onClick={() => {
                setShowViewModal(false);
                setViewingEntry(null);
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
