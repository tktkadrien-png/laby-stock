'use client';

import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { getAllProducts } from '@/lib/database/localStorage';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Layers, Plus, Edit, Trash2, Package } from 'lucide-react';

export default function CategoriesPage() {
  const { categories, addCategory, updateCategory, deleteCategory } = useData();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    code: '',
    couleur: '#1E40AF',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      updateCategory(editingId, formData);
      alert('✅ Catégorie mise à jour avec succès!');
    } else {
      addCategory(formData);
      alert('✅ Catégorie ajoutée avec succès!');
    }

    resetForm();
  };

  const handleEdit = (category: any) => {
    setEditingId(category.id);
    setFormData({
      nom: category.nom,
      code: category.code,
      couleur: category.couleur,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string, nom: string) => {
    const products = getAllProducts();
    const categoryProducts = products.filter(p => p.categorie === nom);

    if (categoryProducts.length > 0) {
      alert(`⚠️ Impossible de supprimer cette catégorie!\n\n${categoryProducts.length} produit(s) utilisent encore cette catégorie.`);
      return;
    }

    if (confirm(`⚠️ Supprimer la catégorie "${nom}"?\n\nCette action est irréversible.`)) {
      deleteCategory(id);
      alert('✅ Catégorie supprimée avec succès!');
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      nom: '',
      code: '',
      couleur: '#1E40AF',
    });
  };

  // Calculate product counts per category
  const getProductCount = (categoryName: string) => {
    const products = getAllProducts();
    return products.filter(p => p.categorie === categoryName).length;
  };

  const totalCategories = categories.length;
  const totalProduits = getAllProducts().length;
  const averagePerCategory = totalCategories > 0 ? Math.round(totalProduits / totalCategories) : 0;

  const couleurs = [
    { value: '#EF4444', nom: 'Rouge' },
    { value: '#F59E0B', nom: 'Ambre' },
    { value: '#10B981', nom: 'Vert' },
    { value: '#3B82F6', nom: 'Bleu' },
    { value: '#8B5CF6', nom: 'Violet' },
    { value: '#EC4899', nom: 'Rose' },
    { value: '#1E40AF', nom: 'Bleu Foncé' },
    { value: '#059669', nom: 'Vert Foncé' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Catégories</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {totalCategories} catégorie{totalCategories > 1 ? 's' : ''} · {totalProduits} produit{totalProduits > 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="primary" size="lg" onClick={() => setShowModal(true)}>
          <Plus size={20} />
          Nouvelle Catégorie
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Catégories</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCategories}</p>
            </div>
            <Layers size={32} className="text-blue-600" />
          </div>
        </Card>

        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Produits Associés</p>
              <p className="text-2xl font-bold text-blue-600">{totalProduits}</p>
            </div>
            <Package size={32} className="text-blue-600" />
          </div>
        </Card>

        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Moyenne par Catégorie</p>
              <p className="text-2xl font-bold text-amber-600">{averagePerCategory}</p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </Card>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => {
          const productCount = getProductCount(category.nom);
          return (
            <Card key={category.id} variant="bordered">
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: category.couleur + '20' }}
                >
                  <Layers size={24} style={{ color: category.couleur }} />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    title="Modifier"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id, category.nom)}
                    className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{category.nom}</h3>

              <div className="flex items-center justify-between">
                <Badge
                  variant="default"
                  style={{
                    backgroundColor: category.couleur + '20',
                    color: category.couleur,
                    borderColor: category.couleur,
                  }}
                >
                  {category.code}
                </Badge>
                <div className="text-sm">
                  <span className="font-bold text-blue-600">{productCount}</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-1">produit{productCount > 1 ? 's' : ''}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Table View */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Liste Détaillée</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Catégorie</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Couleur</TableHead>
                <TableHead>Produits</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => {
                const productCount = getProductCount(category.nom);
                return (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded flex items-center justify-center"
                          style={{ backgroundColor: category.couleur + '20' }}
                        >
                          <Layers size={16} style={{ color: category.couleur }} />
                        </div>
                        <span className="font-semibold dark:text-white">{category.nom}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="default"
                        style={{
                          backgroundColor: category.couleur + '20',
                          color: category.couleur,
                        }}
                      >
                        {category.code}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border-2 border-gray-300 dark:border-gray-600"
                          style={{ backgroundColor: category.couleur }}
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400">{category.couleur}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-blue-600">{productCount}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id, category.nom)}
                          className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
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
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={resetForm}
        title={editingId ? '✏️ Modifier la Catégorie' : '➕ Nouvelle Catégorie'}
        size="md"
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Nom de la catégorie"
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              required
              placeholder="Ex: Réactifs"
            />

            <Input
              label="Code"
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              required
              placeholder="Ex: REACT"
              maxLength={10}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Couleur
              </label>
              <div className="grid grid-cols-4 gap-2">
                {couleurs.map((couleur) => (
                  <button
                    key={couleur.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, couleur: couleur.value })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.couleur === couleur.value
                        ? 'border-blue-800 ring-2 ring-blue-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div
                      className="w-full h-8 rounded"
                      style={{ backgroundColor: couleur.value }}
                    />
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-center">{couleur.nom}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={resetForm}>
              Annuler
            </Button>
            <Button type="submit" variant="primary">
              {editingId ? '✅ Mettre à jour' : '✅ Créer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
