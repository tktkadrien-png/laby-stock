'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { ArrowUpFromLine, Plus, X, AlertCircle } from 'lucide-react';

interface Sortie {
  id: string;
  date_sortie: string;
  produit: string;
  categorie: string;
  quantite: number;
  prix_unitaire: number;
  montant_total: number;
  motif: string;
  user_name: string;
}

export default function SortiesPage() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    produit_id: '',
    quantite: 0,
    motif: 'Utilisation',
    commentaire: '',
  });

  // Mock available products
  const availableProducts = [
    { id: '1', nom: 'Réactif PCR Kit', type: 'Liquide', stock_actuel: 45, prix_unitaire: 45000 },
    { id: '2', nom: 'Tubes EDTA', type: 'Plastique', stock_actuel: 850, prix_unitaire: 50 },
    { id: '3', nom: 'Gants Nitrile M', type: 'Latex', stock_actuel: 280, prix_unitaire: 150 },
    { id: '4', nom: 'Anticorps Anti-HBs', type: 'Liquide', stock_actuel: 12, prix_unitaire: 12500 },
    { id: '5', nom: 'Seringues 5ml', type: 'Plastique', stock_actuel: 500, prix_unitaire: 75 },
  ];

  // Mock data
  const mockSorties: Sortie[] = [
    {
      id: '1',
      date_sortie: '2026-01-12 15:45',
      produit: 'Tubes EDTA',
      categorie: 'Consommable',
      quantite: 25,
      prix_unitaire: 50,
      montant_total: 1250,
      motif: 'Utilisation',
      user_name: 'Administrateur',
    },
    {
      id: '2',
      date_sortie: '2026-01-11 11:20',
      produit: 'Gants Nitrile M',
      categorie: 'Consommable',
      quantite: 20,
      prix_unitaire: 150,
      montant_total: 3000,
      motif: 'Utilisation',
      user_name: 'Gestionnaire',
    },
    {
      id: '3',
      date_sortie: '2026-01-10 09:30',
      produit: 'Réactif PCR Kit',
      categorie: 'Réactif',
      quantite: 5,
      prix_unitaire: 45000,
      montant_total: 225000,
      motif: 'Utilisation',
      user_name: 'Administrateur',
    },
  ];

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(price) + ' FCFA';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedProduct = availableProducts.find(p => p.id === formData.produit_id);

    if (!selectedProduct) {
      alert('Veuillez sélectionner un produit');
      return;
    }

    if (formData.quantite > selectedProduct.stock_actuel) {
      alert('Stock insuffisant!');
      return;
    }

    if (formData.quantite <= 0) {
      alert('La quantité doit être supérieure à 0');
      return;
    }

    console.log('Nouvelle sortie:', formData);
    setShowForm(false);
    setFormData({
      produit_id: '',
      quantite: 0,
      motif: 'Utilisation',
      commentaire: '',
    });
  };

  const totalSorties = mockSorties.reduce((sum, s) => sum + s.quantite, 0);
  const valeurTotale = mockSorties.reduce((sum, s) => sum + s.montant_total, 0);

  const selectedProduct = availableProducts.find(p => p.id === formData.produit_id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sorties de Stock</h1>
          <p className="text-sm text-gray-600 mt-1">Enregistrement des utilisations</p>
        </div>
        <Button variant="primary" size="lg" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X size={20} /> : <Plus size={20} />}
          {showForm ? 'Annuler' : 'Nouvelle Sortie'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sorties</p>
              <p className="text-2xl font-bold text-gray-900">{mockSorties.length}</p>
            </div>
            <ArrowUpFromLine size={32} className="text-red-600" />
          </div>
        </Card>
        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Quantité Totale</p>
              <p className="text-2xl font-bold text-red-600">-{totalSorties}</p>
            </div>
            <div className="text-red-600 text-2xl">📤</div>
          </div>
        </Card>
        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Valeur Totale</p>
              <p className="text-xl font-bold text-amber-600">{formatPrice(valeurTotale)}</p>
            </div>
            <div className="text-amber-500 text-2xl">💰</div>
          </div>
        </Card>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <form onSubmit={handleSubmit}>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Nouvelle Sortie de Stock</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Produit <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.produit_id}
                  onChange={(e) => setFormData({ ...formData, produit_id: e.target.value, quantite: 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                  required
                >
                  <option value="">Sélectionner un produit</option>
                  {availableProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nom} ({p.type}) - Stock: {p.stock_actuel} ({formatPrice(p.prix_unitaire)}/u)
                    </option>
                  ))}
                </select>
              </div>

              {selectedProduct && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-gray-600 mb-1">Informations produit</p>
                  <p className="text-sm font-semibold text-blue-900">Type: {selectedProduct.type}</p>
                  <p className="text-sm text-gray-700">Stock: {selectedProduct.stock_actuel} unités</p>
                  <p className="text-sm text-gray-700">Prix: {formatPrice(selectedProduct.prix_unitaire)}/u</p>
                </div>
              )}

              <Input
                label="Quantité"
                type="number"
                value={formData.quantite}
                onChange={(e) => setFormData({ ...formData, quantite: parseInt(e.target.value) || 0 })}
                min="1"
                max={selectedProduct?.stock_actuel || 999999}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motif <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.motif}
                  onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                  required
                >
                  <option value="Utilisation">Utilisation</option>
                  <option value="Vente">Vente</option>
                  <option value="Perte">Perte</option>
                  <option value="Expiration">Expiration</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Commentaire</label>
                <input
                  type="text"
                  value={formData.commentaire}
                  onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                  placeholder="Commentaire optionnel..."
                />
              </div>
            </div>

            {/* Validation warnings */}
            {selectedProduct && formData.quantite > 0 && (
              <div className="mt-4">
                {formData.quantite > selectedProduct.stock_actuel ? (
                  <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-center gap-2">
                    <AlertCircle className="text-red-600" size={20} />
                    <p className="text-sm text-red-700 font-semibold">
                      Stock insuffisant! Disponible: {selectedProduct.stock_actuel}
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                    <p className="text-sm text-gray-700">
                      Nouveau stock après sortie: <span className="font-bold">{selectedProduct.stock_actuel - formData.quantite}</span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Summary */}
            {selectedProduct && formData.quantite > 0 && (
              <div className="mt-6 p-4 bg-red-50 rounded-lg border-2 border-red-200">
                <p className="text-sm text-gray-600">Valeur de la sortie</p>
                <p className="text-2xl font-bold text-red-700">
                  {formatPrice(formData.quantite * selectedProduct.prix_unitaire)}
                </p>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Annuler
              </Button>
              <Button
                type="submit"
                variant="danger"
                disabled={!selectedProduct || formData.quantite > (selectedProduct?.stock_actuel || 0) || formData.quantite <= 0}
              >
                Enregistrer la Sortie
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Table */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Historique des Sorties</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Heure</TableHead>
              <TableHead>Produit</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Quantité</TableHead>
              <TableHead>Prix Unit.</TableHead>
              <TableHead>Montant Total</TableHead>
              <TableHead>Motif</TableHead>
              <TableHead>Utilisateur</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockSorties.map((sortie) => (
              <TableRow key={sortie.id}>
                <TableCell className="text-sm text-gray-600">{sortie.date_sortie}</TableCell>
                <TableCell className="font-semibold">{sortie.produit}</TableCell>
                <TableCell>
                  <Badge variant="info">{sortie.categorie}</Badge>
                </TableCell>
                <TableCell>
                  <span className="text-red-600 font-bold text-lg">-{sortie.quantite}</span>
                </TableCell>
                <TableCell className="font-semibold text-amber-700">
                  {formatPrice(sortie.prix_unitaire)}
                </TableCell>
                <TableCell className="font-bold text-amber-700">
                  {formatPrice(sortie.montant_total)}
                </TableCell>
                <TableCell>
                  <Badge variant={sortie.motif === 'Utilisation' ? 'default' : 'warning'}>
                    {sortie.motif}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-600">{sortie.user_name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
