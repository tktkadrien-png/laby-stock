'use client';

import { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { useSettings } from '@/contexts/SettingsContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Package, Search, Plus, Eye, Edit, Trash2, Loader2 } from 'lucide-react';

export default function StockPage() {
  const {
    categories,
    types,
    suppliers,
    products,
    isLoading,
    addProduct,
    updateProduct,
    deleteProduct
  } = useData();
  const { formatPrice } = useSettings();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [viewingProduct, setViewingProduct] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultCategory = categories.length > 0 ? categories[0].nom : '';
  const defaultType = types.length > 0 ? types[0].nom : '';

  const [formData, setFormData] = useState({
    nom: '',
    reference: '',
    categorie: defaultCategory,
    type: defaultType,
    notes: '',
    prix_unitaire: 0,
    quantite_totale: 0,
    quantite_cartons: 0,
    unites_par_carton: 100,
    unites_libres: 0,
    unite: 'Unité',
    date_peremption: '',
    lot: '',
    emplacement: 'Magasin Principal',
    fournisseur: '',
  });

  const calculateDaysLeft = (datePeremption: string | undefined): number | null => {
    if (!datePeremption) return null;
    const today = new Date();
    const expiry = new Date(datePeremption);
    const diff = expiry.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getExpiryBadge = (daysLeft: number | null) => {
    if (daysLeft === null) return <Badge variant="default">Pas de date</Badge>;
    if (daysLeft < 0) return <Badge variant="danger">Périmé ({Math.abs(daysLeft)}j)</Badge>;
    if (daysLeft <= 14) return <Badge variant="danger">Critique ({daysLeft}j)</Badge>;
    if (daysLeft <= 30) return <Badge variant="warning">Attention ({daysLeft}j)</Badge>;
    return <Badge variant="success">OK ({daysLeft}j)</Badge>;
  };

  const getStockBadge = (product: any) => {
    if (product.quantite_totale === 0) return <Badge variant="danger">Rupture</Badge>;
    if (product.quantite_totale <= 10) return <Badge variant="warning">Stock faible</Badge>;
    return <Badge variant="success">Disponible</Badge>;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const productData = {
        nom: formData.nom,
        reference: formData.reference || `PRD-${Date.now().toString().slice(-6)}`,
        categorie: formData.categorie,
        type: formData.type,
        fournisseur: formData.fournisseur,
        quantite_totale: formData.quantite_totale,
        quantite_cartons: formData.quantite_cartons,
        unites_par_carton: formData.unites_par_carton,
        unites_libres: formData.unites_libres,
        prix_unitaire: formData.prix_unitaire,
        unite: formData.unite,
        emplacement: formData.emplacement,
        date_peremption: formData.date_peremption || undefined,
        lot: formData.lot,
        notes: formData.notes,
      };

      await addProduct(productData);
      setShowAddModal(false);
      resetForm();
      alert('Produit ajouté avec succès!');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Erreur lors de l\'ajout du produit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      nom: product.nom,
      reference: product.reference || '',
      categorie: product.categorie,
      type: product.type,
      notes: product.notes || '',
      prix_unitaire: product.prix_unitaire,
      quantite_totale: product.quantite_totale,
      quantite_cartons: product.quantite_cartons,
      unites_par_carton: product.unites_par_carton,
      unites_libres: product.unites_libres,
      unite: product.unite,
      date_peremption: product.date_peremption || '',
      lot: product.lot || '',
      emplacement: product.emplacement || '',
      fournisseur: product.fournisseur || '',
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSubmitting(true);

    try {
      await updateProduct(editingProduct.id, formData);
      setShowEditModal(false);
      setEditingProduct(null);
      resetForm();
      alert('Produit mis à jour avec succès!');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Erreur lors de la mise à jour du produit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.')) {
      try {
        await deleteProduct(id);
        alert('Produit supprimé avec succès!');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Erreur lors de la suppression du produit');
      }
    }
  };

  const handleView = (product: any) => {
    setViewingProduct(product);
    setShowViewModal(true);
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      reference: '',
      categorie: defaultCategory,
      type: defaultType,
      notes: '',
      prix_unitaire: 0,
      quantite_totale: 0,
      quantite_cartons: 0,
      unites_par_carton: 100,
      unites_libres: 0,
      unite: 'Unité',
      date_peremption: '',
      lot: '',
      emplacement: 'Magasin Principal',
      fournisseur: '',
    });
  };

  const filteredProducts = useMemo(() => {
    return products.filter(item => {
      const matchesSearch = item.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (item.reference?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (item.lot?.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || item.categorie === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const stats = useMemo(() => ({
    total: products.length,
    totalStock: products.reduce((sum, p) => sum + p.quantite_totale, 0),
    totalValue: products.reduce((sum, p) => sum + (p.quantite_totale * p.prix_unitaire), 0),
    lowStock: products.filter(p => p.quantite_totale <= 10 && p.quantite_totale > 0).length,
    outOfStock: products.filter(p => p.quantite_totale === 0).length,
    expiringSoon: products.filter(p => {
      const days = calculateDaysLeft(p.date_peremption);
      return days !== null && days <= 30 && days >= 0;
    }).length,
  }), [products]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600 dark:text-gray-400">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Inventaire Stock</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} •
            Valeur totale: {formatPrice(stats.totalValue)}
          </p>
        </div>
        <Button variant="primary" size="lg" onClick={() => setShowAddModal(true)}>
          <Plus size={20} />
          Ajouter Produit
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Rechercher par nom, code ou numéro de lot..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
            >
              <option value="all">Toutes catégories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.nom}>{cat.nom}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card variant="bordered">
          <div className="text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Produits</p>
            <p className="text-2xl font-bold text-blue-800 dark:text-blue-400">{stats.total}</p>
          </div>
        </Card>
        <Card variant="bordered">
          <div className="text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Unités en Stock</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalStock}</p>
          </div>
        </Card>
        <Card variant="bordered">
          <div className="text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Rupture</p>
            <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
          </div>
        </Card>
        <Card variant="bordered">
          <div className="text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Stock Faible</p>
            <p className="text-2xl font-bold text-orange-600">{stats.lowStock}</p>
          </div>
        </Card>
        <Card variant="bordered">
          <div className="text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Péremption</p>
            <p className="text-2xl font-bold text-amber-600">{stats.expiringSoon}</p>
          </div>
        </Card>
        <Card variant="bordered">
          <div className="text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Valeur</p>
            <p className="text-lg font-bold text-green-600">{formatPrice(stats.totalValue)}</p>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Prix Unit.</TableHead>
                <TableHead>Valeur Totale</TableHead>
                <TableHead>Péremption</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const daysLeft = calculateDaysLeft(product.date_peremption);

                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <span className="font-mono text-xs font-semibold text-gray-700 dark:text-gray-300">
                        {product.reference || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">{product.nom}</div>
                        {product.notes && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {product.notes}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="info">{product.categorie}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="text-xl font-bold text-blue-900 dark:text-blue-400">
                          {product.quantite_totale}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{product.unite}</div>
                        {product.quantite_cartons > 0 && (
                          <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                            {product.quantite_cartons} cartons
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStockBadge(product)}
                    </TableCell>
                    <TableCell className="font-semibold text-amber-700 dark:text-amber-500">
                      {formatPrice(product.prix_unitaire)}
                    </TableCell>
                    <TableCell className="font-bold text-green-700 dark:text-green-500">
                      {formatPrice(product.quantite_totale * product.prix_unitaire)}
                    </TableCell>
                    <TableCell>
                      {getExpiryBadge(daysLeft)}
                      {product.date_peremption && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(product.date_peremption).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleView(product)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors"
                          title="Voir détails"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded transition-colors"
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">Aucun produit trouvé</p>
            <Button variant="primary" onClick={() => setShowAddModal(true)}>
              <Plus size={16} />
              Ajouter votre premier produit
            </Button>
          </div>
        )}
      </Card>

      {/* Add/Edit Product Modal */}
      <Modal
        isOpen={showAddModal || showEditModal}
        onClose={() => {
          setShowAddModal(false);
          setShowEditModal(false);
          setEditingProduct(null);
          resetForm();
        }}
        title={editingProduct ? 'Modifier le Produit' : 'Ajouter un Nouveau Produit'}
        size="xl"
      >
        <form onSubmit={editingProduct ? handleUpdate : handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label="Nom du produit"
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              required
              placeholder="Ex: Réactif PCR Kit"
            />

            <Input
              label="Code produit"
              type="text"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value.toUpperCase() })}
              placeholder="Généré automatiquement"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Catégorie <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.categorie}
                onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                required
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.nom}>{cat.nom}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                required
              >
                <option value="">Sélectionner un type</option>
                {types.map((type) => (
                  <option key={type.id} value={type.nom}>{type.nom}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fournisseur
              </label>
              <select
                value={formData.fournisseur}
                onChange={(e) => setFormData({ ...formData, fournisseur: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
              >
                <option value="">Aucun</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.nom}>{supplier.nom}</option>
                ))}
              </select>
            </div>

            <Input
              label="Numéro de lot"
              type="text"
              value={formData.lot}
              onChange={(e) => setFormData({ ...formData, lot: e.target.value })}
              placeholder="Ex: LOT-2024-001"
            />

            <Input
              label="Quantité"
              type="number"
              value={formData.quantite_totale}
              onChange={(e) => setFormData({ ...formData, quantite_totale: parseInt(e.target.value) || 0 })}
              min="0"
              required
            />

            <Input
              label="Prix unitaire"
              type="number"
              value={formData.prix_unitaire}
              onChange={(e) => setFormData({ ...formData, prix_unitaire: parseFloat(e.target.value) || 0 })}
              min="0"
              step="0.01"
              required
            />

            <Input
              label="Date de péremption"
              type="date"
              value={formData.date_peremption}
              onChange={(e) => setFormData({ ...formData, date_peremption: e.target.value })}
            />

            <Input
              label="Emplacement"
              type="text"
              value={formData.emplacement}
              onChange={(e) => setFormData({ ...formData, emplacement: e.target.value })}
              placeholder="Ex: Frigo A2"
            />

            <Input
              label="Unité"
              type="text"
              value={formData.unite}
              onChange={(e) => setFormData({ ...formData, unite: e.target.value })}
              placeholder="Ex: Unité, ml, g"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
              placeholder="Description optionnelle du produit..."
            />
          </div>

          {/* Carton Options */}
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Gestion par cartons</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre de cartons"
                type="number"
                value={formData.quantite_cartons}
                onChange={(e) => setFormData({ ...formData, quantite_cartons: parseInt(e.target.value) || 0 })}
                min="0"
              />
              <Input
                label="Unités par carton"
                type="number"
                value={formData.unites_par_carton}
                onChange={(e) => setFormData({ ...formData, unites_par_carton: parseInt(e.target.value) || 100 })}
                min="1"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-amber-50 dark:from-blue-900 dark:to-amber-900 rounded-lg border-2 border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Valeur totale du stock</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-200">
                  {formatPrice(formData.quantite_totale * formData.prix_unitaire)}
                </p>
              </div>
              <Package size={48} className="text-blue-300 dark:text-blue-600" />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
                setEditingProduct(null);
                resetForm();
              }}
            >
              Annuler
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {editingProduct ? 'Mettre à jour' : 'Ajouter le Produit'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Product Modal */}
      {viewingProduct && (
        <Modal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setViewingProduct(null);
          }}
          title="Détails du Produit"
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Code</p>
                <p className="font-mono font-bold text-gray-900 dark:text-white">{viewingProduct.reference || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Nom</p>
                <p className="font-bold text-gray-900 dark:text-white">{viewingProduct.nom}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Catégorie</p>
                <p className="font-semibold text-gray-900 dark:text-white">{viewingProduct.categorie}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
                <p className="font-semibold text-gray-900 dark:text-white">{viewingProduct.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Stock Actuel</p>
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-400">
                  {viewingProduct.quantite_totale} {viewingProduct.unite}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Prix Unitaire</p>
                <p className="text-xl font-bold text-amber-700 dark:text-amber-500">
                  {formatPrice(viewingProduct.prix_unitaire)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Valeur Totale</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-500">
                  {formatPrice(viewingProduct.quantite_totale * viewingProduct.prix_unitaire)}
                </p>
              </div>
              {viewingProduct.date_peremption && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Date de Péremption</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {new Date(viewingProduct.date_peremption).toLocaleDateString('fr-FR')}
                  </p>
                  <div className="mt-1">
                    {getExpiryBadge(calculateDaysLeft(viewingProduct.date_peremption))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Lot</p>
                <p className="font-mono font-semibold text-gray-900 dark:text-white">{viewingProduct.lot || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Emplacement</p>
                <p className="font-semibold text-gray-900 dark:text-white">{viewingProduct.emplacement || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Statut</p>
                <div className="mt-1">{getStockBadge(viewingProduct)}</div>
              </div>
            </div>

            {viewingProduct.notes && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Notes</p>
                <p className="text-gray-900 dark:text-white">{viewingProduct.notes}</p>
              </div>
            )}

            {viewingProduct.quantite_cartons > 0 && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">Gestion par cartons</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Cartons:</span>
                    <span className="ml-2 font-bold">{viewingProduct.quantite_cartons}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Unités/carton:</span>
                    <span className="ml-2 font-bold">{viewingProduct.unites_par_carton}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="text-xs text-gray-500 dark:text-gray-400 border-t dark:border-gray-700 pt-3 mt-3">
              <p>Créé le: {viewingProduct.created_at ? new Date(viewingProduct.created_at).toLocaleString('fr-FR') : 'N/A'}</p>
              <p>Mis à jour: {viewingProduct.updated_at ? new Date(viewingProduct.updated_at).toLocaleString('fr-FR') : 'N/A'}</p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => {
              setShowViewModal(false);
              setViewingProduct(null);
            }}>
              Fermer
            </Button>
            <Button variant="primary" onClick={() => {
              setShowViewModal(false);
              handleEdit(viewingProduct);
            }}>
              <Edit size={16} />
              Modifier
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
