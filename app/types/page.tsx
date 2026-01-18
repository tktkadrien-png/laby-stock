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
import { Tag, Plus, Edit, Trash2, Package } from 'lucide-react';

export default function TypesPage() {
  const { types, categories, addType, updateType, deleteType } = useData();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    code: '',
    categorie_associee: categories[0]?.nom || 'Toutes',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      updateType(editingId, formData);
      alert('✅ Type mis à jour avec succès!');
    } else {
      addType(formData);
      alert('✅ Type ajouté avec succès!');
    }

    resetForm();
  };

  const handleEdit = (type: any) => {
    setEditingId(type.id);
    setFormData({
      nom: type.nom,
      code: type.code,
      categorie_associee: type.categorie_associee,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string, nom: string) => {
    const products = getAllProducts();
    const typeProducts = products.filter(p => p.type === nom);

    if (typeProducts.length > 0) {
      alert(`⚠️ Impossible de supprimer ce type!\n\n${typeProducts.length} produit(s) utilisent encore ce type.`);
      return;
    }

    if (confirm(`⚠️ Supprimer le type "${nom}"?\n\nCette action est irréversible.`)) {
      deleteType(id);
      alert('✅ Type supprimé avec succès!');
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      nom: '',
      code: '',
      categorie_associee: categories[0]?.nom || 'Toutes',
    });
  };

  // Calculate product counts per type
  const getProductCount = (typeName: string) => {
    const products = getAllProducts();
    return products.filter(p => p.type === typeName).length;
  };

  const totalTypes = types.length;
  const totalProduits = getAllProducts().length;
  const averagePerType = totalTypes > 0 ? Math.round(totalProduits / totalTypes) : 0;

  // Group by category
  const typesByCategory = categories.map(cat => ({
    categorie: cat.nom,
    count: types.filter(t => t.categorie_associee === cat.nom).length,
    color: cat.couleur,
  }));

  const activeCategories = typesByCategory.filter(c => c.count > 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Types</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {totalTypes} type{totalTypes > 1 ? 's' : ''} · {totalProduits} produit{totalProduits > 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="primary" size="lg" onClick={() => setShowModal(true)}>
          <Plus size={20} />
          Nouveau Type
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Types</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalTypes}</p>
            </div>
            <Tag size={32} className="text-blue-600" />
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Catégories Actives</p>
              <p className="text-2xl font-bold text-green-600">{activeCategories}</p>
            </div>
            <div className="text-4xl">✓</div>
          </div>
        </Card>

        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Moyenne par Type</p>
              <p className="text-2xl font-bold text-amber-600">{averagePerType}</p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </Card>
      </div>

      {/* Types by Category */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Répartition par Catégorie</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {typesByCategory.map((item) => (
            <Card key={item.categorie} variant="bordered">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: item.color + '20' }}
                >
                  <Tag size={20} style={{ color: item.color }} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">{item.categorie}</h4>
                  <p className="text-xl font-bold text-blue-600">{item.count} type{item.count > 1 ? 's' : ''}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Types Table */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Liste des Types</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Produits</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {types.map((type) => {
                const productCount = getProductCount(type.nom);
                const category = categories.find(c => c.nom === type.categorie_associee);
                return (
                  <TableRow key={type.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                          <Tag size={16} className="text-blue-600" />
                        </div>
                        <span className="font-semibold dark:text-white">{type.nom}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="info">{type.code}</Badge>
                    </TableCell>
                    <TableCell>
                      {category ? (
                        <Badge
                          variant="default"
                          style={{
                            backgroundColor: category.couleur + '20',
                            color: category.couleur,
                          }}
                        >
                          {type.categorie_associee}
                        </Badge>
                      ) : (
                        <Badge variant="default">{type.categorie_associee}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-blue-600">{productCount}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(type)}
                          className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(type.id, type.nom)}
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
        title={editingId ? '✏️ Modifier le Type' : '➕ Nouveau Type'}
        size="md"
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Nom du type"
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              required
              placeholder="Ex: Liquide"
            />

            <Input
              label="Code"
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              required
              placeholder="Ex: LIQ"
              maxLength={10}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Catégorie associée <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.categorie_associee}
                onChange={(e) => setFormData({ ...formData, categorie_associee: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.nom}>{cat.nom}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Catégorie principale où ce type sera utilisé
              </p>
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
