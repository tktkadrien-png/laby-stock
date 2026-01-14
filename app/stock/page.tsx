'use client';

import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useSettings } from '@/contexts/SettingsContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Package, Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';

interface StockItem {
  id: string;
  nom: string;
  categorie: string;
  fournisseur: string;
  numero_lot: string;
  date_peremption: string;
  stock_actuel: number;
  prix_unitaire: number;
  est_en_carton: boolean;
  cartons_actuels?: number;
  unites_libres?: number;
}

export default function StockPage() {
  const { categories, types } = useData();
  const { formatPrice } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const defaultCategory = categories.length > 0 ? categories[0].nom : 'Réactif';
  const defaultType = types.length > 0 ? types[0].nom : 'Liquide';

  const [formData, setFormData] = useState({
    nom: '',
    categorie: defaultCategory,
    type: defaultType,
    fournisseur: '',
    numero_lot: '',
    quantite: 0,
    prix_unitaire: 0,
    date_reception: new Date().toISOString().split('T')[0],
    date_peremption: '',
    emplacement: '',
    est_en_carton: false,
    unite_par_carton: 100,
    commentaire: '',
  });

  // Mock data
  const mockStock: StockItem[] = [
    {
      id: '1',
      nom: 'Réactif PCR Kit',
      categorie: 'Réactif',
      fournisseur: 'BioLab Pro',
      numero_lot: 'LOT-2024-001',
      date_peremption: '2026-06-15',
      stock_actuel: 45,
      prix_unitaire: 45000,
      est_en_carton: false,
    },
    {
      id: '2',
      nom: 'Tubes EDTA',
      categorie: 'Consommable',
      fournisseur: 'MedSupply',
      numero_lot: 'LOT-2024-128',
      date_peremption: '2027-12-31',
      stock_actuel: 850,
      prix_unitaire: 50,
      est_en_carton: true,
      cartons_actuels: 8,
      unites_libres: 50,
    },
    {
      id: '3',
      nom: 'Gants Nitrile M',
      categorie: 'Consommable',
      fournisseur: 'SafetyFirst',
      numero_lot: 'LOT-2024-445',
      date_peremption: '2026-03-20',
      stock_actuel: 280,
      prix_unitaire: 150,
      est_en_carton: true,
      cartons_actuels: 2,
      unites_libres: 80,
    },
    {
      id: '4',
      nom: 'Anticorps Anti-HBs',
      categorie: 'Réactif',
      fournisseur: 'BioLab Pro',
      numero_lot: 'LOT-2024-055',
      date_peremption: '2026-01-25',
      stock_actuel: 12,
      prix_unitaire: 12500,
      est_en_carton: false,
    },
    {
      id: '5',
      nom: 'Seringues 5ml',
      categorie: 'Consommable',
      fournisseur: 'MedSupply',
      numero_lot: 'LOT-2024-892',
      date_peremption: '2028-08-10',
      stock_actuel: 500,
      prix_unitaire: 75,
      est_en_carton: true,
      cartons_actuels: 5,
      unites_libres: 0,
    },
  ];

  const calculateDaysLeft = (datePeremption: string): number => {
    const today = new Date();
    const expiry = new Date(datePeremption);
    const diff = expiry.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getExpiryBadge = (daysLeft: number) => {
    if (daysLeft <= 14) return <Badge variant="danger">Critique ({daysLeft}j)</Badge>;
    if (daysLeft <= 30) return <Badge variant="warning">Attention ({daysLeft}j)</Badge>;
    return <Badge variant="success">OK ({daysLeft}j)</Badge>;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Nouveau produit:', formData);
    setShowAddModal(false);
    // Reset form
    setFormData({
      nom: '',
      categorie: defaultCategory,
      type: defaultType,
      fournisseur: '',
      numero_lot: '',
      quantite: 0,
      prix_unitaire: 0,
      date_reception: new Date().toISOString().split('T')[0],
      date_peremption: '',
      emplacement: '',
      est_en_carton: false,
      unite_par_carton: 100,
      commentaire: '',
    });
  };

  const filteredStock = mockStock.filter(item => {
    const matchesSearch = item.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.numero_lot.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.categorie === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventaire Stock</h1>
          <p className="text-sm text-gray-600 mt-1">{filteredStock.length} produits</p>
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
                placeholder="Rechercher par nom ou numéro de lot..."
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
            >
              <option value="all">Toutes catégories</option>
              <option value="Réactif">Réactif</option>
              <option value="Consommable">Consommable</option>
              <option value="Équipement">Équipement</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Produits</p>
              <p className="text-2xl font-bold text-gray-900">{mockStock.length}</p>
            </div>
            <Package size={32} className="text-blue-800" />
          </div>
        </Card>
        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Stock Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockStock.reduce((sum, item) => sum + item.stock_actuel, 0)}
              </p>
            </div>
            <div className="text-green-600 text-2xl">📦</div>
          </div>
        </Card>
        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Valeur Totale</p>
              <p className="text-xl font-bold text-amber-600">
                {formatPrice(mockStock.reduce((sum, item) => sum + (item.stock_actuel * item.prix_unitaire), 0))}
              </p>
            </div>
            <div className="text-amber-500 text-2xl">💰</div>
          </div>
        </Card>
        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Alertes</p>
              <p className="text-2xl font-bold text-red-600">
                {mockStock.filter(item => calculateDaysLeft(item.date_peremption) <= 30).length}
              </p>
            </div>
            <div className="text-red-500 text-2xl">⚠️</div>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produit</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Fournisseur</TableHead>
              <TableHead>N° Lot</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Cartons/Unités</TableHead>
              <TableHead>Prix Unit.</TableHead>
              <TableHead>Valeur</TableHead>
              <TableHead>Péremption</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStock.map((item) => {
              const daysLeft = calculateDaysLeft(item.date_peremption);
              return (
                <TableRow key={item.id}>
                  <TableCell className="font-semibold">{item.nom}</TableCell>
                  <TableCell>
                    <Badge variant="info">{item.categorie}</Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">{item.fournisseur}</TableCell>
                  <TableCell className="font-mono text-sm">{item.numero_lot}</TableCell>
                  <TableCell>
                    <span className="text-lg font-bold text-blue-900">{item.stock_actuel}</span>
                  </TableCell>
                  <TableCell>
                    {item.est_en_carton ? (
                      <div className="text-xs">
                        <div className="font-semibold">📦 {item.cartons_actuels} cartons</div>
                        <div className="text-gray-500">+ {item.unites_libres} libres</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold text-amber-700">
                    {formatPrice(item.prix_unitaire)}
                  </TableCell>
                  <TableCell className="font-bold text-amber-700">
                    {formatPrice(item.stock_actuel * item.prix_unitaire)}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-600">{item.date_peremption}</div>
                      {getExpiryBadge(daysLeft)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                        <Eye size={16} />
                      </button>
                      <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                        <Edit size={16} />
                      </button>
                      <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {filteredStock.length === 0 && (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Aucun produit trouvé</p>
          </div>
        )}
      </Card>

      {/* Add Product Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Ajouter un Nouveau Produit"
        size="xl"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label="Nom du produit"
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.categorie}
                onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.nom}>{cat.nom}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                required
              >
                {types.map((type) => (
                  <option key={type.id} value={type.nom}>{type.nom}</option>
                ))}
              </select>
            </div>

            <Input
              label="Fournisseur"
              type="text"
              value={formData.fournisseur}
              onChange={(e) => setFormData({ ...formData, fournisseur: e.target.value })}
              required
            />

            <Input
              label="Numéro de lot"
              type="text"
              value={formData.numero_lot}
              onChange={(e) => setFormData({ ...formData, numero_lot: e.target.value })}
              required
            />

            <Input
              label="Quantité"
              type="number"
              value={formData.quantite}
              onChange={(e) => setFormData({ ...formData, quantite: parseInt(e.target.value) || 0 })}
              min="1"
              required
            />

            <Input
              label="Prix unitaire (FCFA)"
              type="number"
              value={formData.prix_unitaire}
              onChange={(e) => setFormData({ ...formData, prix_unitaire: parseInt(e.target.value) || 0 })}
              min="0"
              required
            />

            <Input
              label="Date de réception"
              type="date"
              value={formData.date_reception}
              onChange={(e) => setFormData({ ...formData, date_reception: e.target.value })}
              required
            />

            <Input
              label="Date de péremption"
              type="date"
              value={formData.date_peremption}
              onChange={(e) => setFormData({ ...formData, date_peremption: e.target.value })}
              required
            />

            <Input
              label="Emplacement"
              type="text"
              value={formData.emplacement}
              onChange={(e) => setFormData({ ...formData, emplacement: e.target.value })}
              placeholder="Ex: Frigo A2"
            />
          </div>

          {/* Carton Options */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                id="est_en_carton"
                checked={formData.est_en_carton}
                onChange={(e) => setFormData({ ...formData, est_en_carton: e.target.checked })}
                className="w-4 h-4 text-blue-800 border-gray-300 rounded focus:ring-blue-800"
              />
              <label htmlFor="est_en_carton" className="text-sm font-medium text-gray-700">
                Produit conditionné en cartons
              </label>
            </div>

            {formData.est_en_carton && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Unités par carton"
                  type="number"
                  value={formData.unite_par_carton}
                  onChange={(e) => setFormData({ ...formData, unite_par_carton: parseInt(e.target.value) || 100 })}
                  min="1"
                />
                <div className="flex items-end">
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">Total:</span> {formData.quantite} unités = {Math.floor(formData.quantite / formData.unite_par_carton)} cartons + {formData.quantite % formData.unite_par_carton} libres
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Commentaire */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Commentaire</label>
            <textarea
              value={formData.commentaire}
              onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
              placeholder="Commentaires optionnels..."
            />
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-amber-50 rounded-lg border-2 border-amber-200">
            <p className="text-sm text-gray-600">Valeur totale du stock</p>
            <p className="text-2xl font-bold text-amber-700">
              {formatPrice(formData.quantite * formData.prix_unitaire)}
            </p>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="primary">
              Ajouter le Produit
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
