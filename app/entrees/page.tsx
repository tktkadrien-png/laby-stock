'use client';

import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useSettings } from '@/contexts/SettingsContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { ArrowDownToLine, Plus, X } from 'lucide-react';

interface Entree {
  id: string;
  date_entree: string;
  produit: string;
  categorie: string;
  fournisseur: string;
  quantite: number;
  prix_unitaire: number;
  montant_total: number;
  user_name: string;
  commentaire?: string;
}

export default function EntreesPage() {
  const { categories, types } = useData();
  const { formatPrice } = useSettings();

  const defaultCategory = categories.length > 0 ? categories[0].nom : 'Réactif';
  const defaultType = types.length > 0 ? types[0].nom : 'Liquide';

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    produit: '',
    categorie: defaultCategory,
    type: defaultType,
    fournisseur: '',
    quantite: 0,
    prix_unitaire: 0,
    numero_lot: '',
    date_livraison: new Date().toISOString().split('T')[0],
    date_peremption: '',
    emplacement: '',
    commentaire: '',
  });

  // Mock data
  const mockEntrees: Entree[] = [
    {
      id: '1',
      date_entree: '2026-01-12 14:30',
      produit: 'Réactif PCR Kit',
      categorie: 'Réactif',
      fournisseur: 'BioLab Pro',
      quantite: 50,
      prix_unitaire: 45000,
      montant_total: 2250000,
      user_name: 'Administrateur',
      commentaire: 'Livraison conforme',
    },
    {
      id: '2',
      date_entree: '2026-01-11 10:15',
      produit: 'Tubes EDTA',
      categorie: 'Consommable',
      fournisseur: 'MedSupply',
      quantite: 1000,
      prix_unitaire: 50,
      montant_total: 50000,
      user_name: 'Gestionnaire',
    },
    {
      id: '3',
      date_entree: '2026-01-10 16:45',
      produit: 'Gants Nitrile M',
      categorie: 'Consommable',
      fournisseur: 'SafetyFirst',
      quantite: 300,
      prix_unitaire: 150,
      montant_total: 45000,
      user_name: 'Administrateur',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Nouvelle entrée:', formData);
    setShowForm(false);
    // Reset form
    setFormData({
      produit: '',
      categorie: 'Réactif',
      type: 'Liquide',
      fournisseur: '',
      quantite: 0,
      prix_unitaire: 0,
      numero_lot: '',
      date_livraison: new Date().toISOString().split('T')[0],
      date_peremption: '',
      emplacement: '',
      commentaire: '',
    });
  };

  const totalEntrees = mockEntrees.reduce((sum, e) => sum + e.quantite, 0);
  const valeurTotale = mockEntrees.reduce((sum, e) => sum + e.montant_total, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Entrées de Stock</h1>
          <p className="text-sm text-gray-600 mt-1">Enregistrement des réceptions</p>
        </div>
        <Button variant="primary" size="lg" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X size={20} /> : <Plus size={20} />}
          {showForm ? 'Annuler' : 'Nouvelle Entrée'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Entrées</p>
              <p className="text-2xl font-bold text-gray-900">{mockEntrees.length}</p>
            </div>
            <ArrowDownToLine size={32} className="text-green-600" />
          </div>
        </Card>
        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Quantité Totale</p>
              <p className="text-2xl font-bold text-green-600">{totalEntrees}</p>
            </div>
            <div className="text-green-600 text-2xl">📦</div>
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
            <h3 className="text-xl font-bold text-gray-900 mb-4">Nouvelle Entrée de Stock</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                label="Nom du produit"
                type="text"
                value={formData.produit}
                onChange={(e) => setFormData({ ...formData, produit: e.target.value })}
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
                  <option value="Réactif">Réactif</option>
                  <option value="Consommable">Consommable</option>
                  <option value="Équipement">Équipement</option>
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
                  <option value="Liquide">Liquide</option>
                  <option value="Poudre">Poudre</option>
                  <option value="Gel">Gel</option>
                  <option value="Plastique">Plastique</option>
                  <option value="Verre">Verre</option>
                  <option value="Latex">Latex</option>
                  <option value="Électronique">Électronique</option>
                  <option value="Mécanique">Mécanique</option>
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
                label="Date de livraison"
                type="date"
                value={formData.date_livraison}
                onChange={(e) => setFormData({ ...formData, date_livraison: e.target.value })}
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
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Commentaire</label>
                <textarea
                  value={formData.commentaire}
                  onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                  placeholder="Commentaires optionnels..."
                />
              </div>
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-amber-50 rounded-lg border-2 border-amber-200">
              <p className="text-sm text-gray-600">Montant total</p>
              <p className="text-2xl font-bold text-amber-700">
                {formatPrice(formData.quantite * formData.prix_unitaire)}
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Annuler
              </Button>
              <Button type="submit" variant="primary">
                Enregistrer l'Entrée
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Table */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Historique des Entrées</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Heure</TableHead>
              <TableHead>Produit</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Fournisseur</TableHead>
              <TableHead>Quantité</TableHead>
              <TableHead>Prix Unit.</TableHead>
              <TableHead>Montant Total</TableHead>
              <TableHead>Utilisateur</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockEntrees.map((entree) => (
              <TableRow key={entree.id}>
                <TableCell className="text-sm text-gray-600">{entree.date_entree}</TableCell>
                <TableCell className="font-semibold">{entree.produit}</TableCell>
                <TableCell>
                  <Badge variant="info">{entree.categorie}</Badge>
                </TableCell>
                <TableCell className="text-gray-600">{entree.fournisseur}</TableCell>
                <TableCell>
                  <span className="text-green-600 font-bold text-lg">+{entree.quantite}</span>
                </TableCell>
                <TableCell className="font-semibold text-amber-700">
                  {formatPrice(entree.prix_unitaire)}
                </TableCell>
                <TableCell className="font-bold text-amber-700">
                  {formatPrice(entree.montant_total)}
                </TableCell>
                <TableCell className="text-gray-600">{entree.user_name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
