'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Users, Plus, Edit, Trash2, Phone, Mail, MapPin, Package } from 'lucide-react';

interface Fournisseur {
  id: string;
  nom: string;
  contact: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  pays: string;
  produits_fournis: number;
  total_commandes: number;
  valeur_totale: number;
  statut: 'Actif' | 'Inactif';
  date_creation: string;
}

export default function FournisseursPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    contact: '',
    email: '',
    telephone: '',
    adresse: '',
    ville: '',
    pays: 'Sénégal',
    statut: 'Actif' as 'Actif' | 'Inactif',
  });

  // Mock data
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([
    {
      id: '1',
      nom: 'BioLab Pro',
      contact: 'Dr. Amadou Diallo',
      email: 'contact@biolabpro.sn',
      telephone: '+221 77 123 45 67',
      adresse: 'Zone Industrielle de Dakar',
      ville: 'Dakar',
      pays: 'Sénégal',
      produits_fournis: 15,
      total_commandes: 28,
      valeur_totale: 4500000,
      statut: 'Actif',
      date_creation: '2023-01-15',
    },
    {
      id: '2',
      nom: 'MedSupply',
      contact: 'Fatou Sow',
      email: 'info@medsupply.com',
      telephone: '+221 78 987 65 43',
      adresse: 'Avenue Cheikh Anta Diop',
      ville: 'Dakar',
      pays: 'Sénégal',
      produits_fournis: 22,
      total_commandes: 45,
      valeur_totale: 3200000,
      statut: 'Actif',
      date_creation: '2022-06-20',
    },
    {
      id: '3',
      nom: 'SafetyFirst',
      contact: 'Mamadou Ba',
      email: 'sales@safetyfirst.sn',
      telephone: '+221 76 555 88 99',
      adresse: 'Rue 10, Almadies',
      ville: 'Dakar',
      pays: 'Sénégal',
      produits_fournis: 8,
      total_commandes: 12,
      valeur_totale: 850000,
      statut: 'Actif',
      date_creation: '2023-09-10',
    },
    {
      id: '4',
      nom: 'EuroMed Supplies',
      contact: 'Jean Martin',
      email: 'contact@euromed.fr',
      telephone: '+33 1 45 67 89 01',
      adresse: '15 Rue de la République',
      ville: 'Paris',
      pays: 'France',
      produits_fournis: 30,
      total_commandes: 8,
      valeur_totale: 1200000,
      statut: 'Inactif',
      date_creation: '2021-03-05',
    },
  ]);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(price) + ' FCFA';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      // Update existing
      setFournisseurs(fournisseurs.map(f =>
        f.id === editingId
          ? { ...f, ...formData }
          : f
      ));
    } else {
      // Add new
      const newFournisseur: Fournisseur = {
        id: Date.now().toString(),
        ...formData,
        produits_fournis: 0,
        total_commandes: 0,
        valeur_totale: 0,
        date_creation: new Date().toISOString().split('T')[0],
      };
      setFournisseurs([...fournisseurs, newFournisseur]);
    }

    resetForm();
  };

  const handleEdit = (fournisseur: Fournisseur) => {
    setEditingId(fournisseur.id);
    setFormData({
      nom: fournisseur.nom,
      contact: fournisseur.contact,
      email: fournisseur.email,
      telephone: fournisseur.telephone,
      adresse: fournisseur.adresse,
      ville: fournisseur.ville,
      pays: fournisseur.pays,
      statut: fournisseur.statut,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      setFournisseurs(fournisseurs.filter(f => f.id !== id));
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      nom: '',
      contact: '',
      email: '',
      telephone: '',
      adresse: '',
      ville: '',
      pays: 'Sénégal',
      statut: 'Actif',
    });
  };

  const totalFournisseurs = fournisseurs.length;
  const fournisseursActifs = fournisseurs.filter(f => f.statut === 'Actif').length;
  const totalValeur = fournisseurs.reduce((sum, f) => sum + f.valeur_totale, 0);
  const totalProduits = fournisseurs.reduce((sum, f) => sum + f.produits_fournis, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion Fournisseurs</h1>
          <p className="text-sm text-gray-600 mt-1">{totalFournisseurs} fournisseurs enregistrés</p>
        </div>
        <Button variant="primary" size="lg" onClick={() => setShowModal(true)}>
          <Plus size={20} />
          Ajouter Fournisseur
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Fournisseurs</p>
              <p className="text-2xl font-bold text-gray-900">{totalFournisseurs}</p>
            </div>
            <Users size={32} className="text-blue-800" />
          </div>
        </Card>

        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Fournisseurs Actifs</p>
              <p className="text-2xl font-bold text-green-600">{fournisseursActifs}</p>
            </div>
            <div className="text-green-600 text-2xl">✓</div>
          </div>
        </Card>

        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Valeur Totale</p>
              <p className="text-xl font-bold text-amber-600">{formatPrice(totalValeur)}</p>
            </div>
            <div className="text-amber-500 text-2xl">💰</div>
          </div>
        </Card>

        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Produits Fournis</p>
              <p className="text-2xl font-bold text-blue-800">{totalProduits}</p>
            </div>
            <Package size={32} className="text-blue-800" />
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Liste des Fournisseurs</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fournisseur</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Produits</TableHead>
              <TableHead>Commandes</TableHead>
              <TableHead>Valeur Totale</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fournisseurs.map((fournisseur) => (
              <TableRow key={fournisseur.id}>
                <TableCell>
                  <div>
                    <p className="font-semibold text-gray-900">{fournisseur.nom}</p>
                    <p className="text-xs text-gray-500">{fournisseur.email}</p>
                  </div>
                </TableCell>
                <TableCell className="text-gray-600">{fournisseur.contact}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Phone size={14} className="text-gray-400" />
                    <span>{fournisseur.telephone}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin size={14} className="text-gray-400" />
                    <span>{fournisseur.ville}, {fournisseur.pays}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-blue-800 font-bold">{fournisseur.produits_fournis}</span>
                </TableCell>
                <TableCell>
                  <span className="text-gray-700 font-semibold">{fournisseur.total_commandes}</span>
                </TableCell>
                <TableCell className="font-bold text-amber-700">
                  {formatPrice(fournisseur.valeur_totale)}
                </TableCell>
                <TableCell>
                  <Badge variant={fournisseur.statut === 'Actif' ? 'success' : 'default'}>
                    {fournisseur.statut}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(fournisseur)}
                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(fournisseur.id)}
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
        title={editingId ? 'Modifier le Fournisseur' : 'Ajouter un Nouveau Fournisseur'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nom du fournisseur"
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              required
            />

            <Input
              label="Personne de contact"
              type="text"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              required
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />

            <Input
              label="Téléphone"
              type="tel"
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              required
              placeholder="+221 77 123 45 67"
            />

            <div className="md:col-span-2">
              <Input
                label="Adresse"
                type="text"
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                required
              />
            </div>

            <Input
              label="Ville"
              type="text"
              value={formData.ville}
              onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
              required
            />

            <Input
              label="Pays"
              type="text"
              value={formData.pays}
              onChange={(e) => setFormData({ ...formData, pays: e.target.value })}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.statut}
                onChange={(e) => setFormData({ ...formData, statut: e.target.value as 'Actif' | 'Inactif' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                required
              >
                <option value="Actif">Actif</option>
                <option value="Inactif">Inactif</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={resetForm}>
              Annuler
            </Button>
            <Button type="submit" variant="primary">
              {editingId ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
