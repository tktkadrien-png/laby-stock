'use client';

import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
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
    description: '',
    code: '',
    categorie_associee: 'Toutes',
  });

  const categoriesWithAll = ['Toutes', ...categories.map(c => c.nom)];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      updateType(editingId, formData);
    } else {
      addType(formData);
    }

    resetForm();
  };

  const handleEdit = (type: any) => {
    setEditingId(type.id);
    setFormData({
      nom: type.nom,
      description: type.description || '',
      code: type.code,
      categorie_associee: type.categorie_associee,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce type ?')) {
      deleteType(id);
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      nom: '',
      description: '',
      code: '',
      categorie_associee: 'Toutes',
    });
  };

  const totalTypes = types.length;
  const totalProduits = 0; // TODO: Calculate from products when integrated

  // Group by category
  const typesByCategory = categories.map(cat => ({
    categorie: cat.nom,
    count: types.filter(t => t.categorie_associee === cat.nom).length,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Types</h1>
          <p className="text-sm text-gray-600 mt-1">{totalTypes} types · {totalProduits} produits</p>
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
              <p className="text-sm text-gray-600">Total Types</p>
              <p className="text-2xl font-bold text-gray-900">{totalTypes}</p>
            </div>
            <Tag size={32} className="text-blue-800" />
          </div>
        </Card>

        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Produits Associés</p>
              <p className="text-2xl font-bold text-blue-800">{totalProduits}</p>
            </div>
            <Package size={32} className="text-blue-800" />
          </div>
        </Card>

        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Catégories Actives</p>
              <p className="text-2xl font-bold text-green-600">{typesByCategory.filter(c => c.count > 0).length}</p>
            </div>
            <div className="text-green-600 text-2xl">✓</div>
          </div>
        </Card>

        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Moyenne par Type</p>
              <p className="text-2xl font-bold text-amber-600">
                {Math.round(totalProduits / totalTypes)}
              </p>
            </div>
            <div className="text-amber-500 text-2xl">📊</div>
          </div>
        </Card>
      </div>

      {/* Types by Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {typesByCategory.map((item) => (
          <Card key={item.categorie}>
            <h4 className="text-sm font-medium text-gray-600 mb-1">{item.categorie}</h4>
            <p className="text-2xl font-bold text-blue-800">{item.count} types</p>
          </Card>
        ))}
      </div>

      {/* Types Table */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Liste des Types</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Produits</TableHead>
              <TableHead>Date Création</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {types.map((type) => (
              <TableRow key={type.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
                      <Tag size={16} className="text-blue-800" />
                    </div>
                    <span className="font-semibold">{type.nom}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="info">{type.code}</Badge>
                </TableCell>
                <TableCell className="text-gray-600 max-w-xs truncate">
                  {type.description}
                </TableCell>
                <TableCell>
                  <Badge variant="default">{type.categorie_associee}</Badge>
                </TableCell>
                <TableCell>
                  <span className="font-bold text-blue-800">0</span>
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {new Date(type.created_at).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(type)}
                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(type.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={resetForm}
        title={editingId ? 'Modifier le Type' : 'Nouveau Type'}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie associée <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.categorie_associee}
                onChange={(e) => setFormData({ ...formData, categorie_associee: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                required
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Catégorie principale où ce type sera utilisé
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                placeholder="Description du type..."
                required
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={resetForm}>
              Annuler
            </Button>
            <Button type="submit" variant="primary">
              {editingId ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
