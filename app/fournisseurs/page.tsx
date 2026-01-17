'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Users, Plus, Edit, Trash2, Phone, Mail, MapPin, Package, Eye } from 'lucide-react';
import {
  getAllSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getAllEntries,
  type Supplier,
  initializeDatabase,
} from '@/lib/database/localStorage';

export default function FournisseursPage() {
  const { formatPrice, formatDate } = useSettings();

  // State
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    nom: '',
    contact: '',
    email: '',
    telephone: '',
    adresse: '',
    ville: '',
    pays: 'Cameroun',
  });

  // Load data on mount
  useEffect(() => {
    initializeDatabase();
    loadData();
  }, []);

  const loadData = () => {
    const allSuppliers = getAllSuppliers();
    setSuppliers(allSuppliers);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      nom: '',
      contact: '',
      email: '',
      telephone: '',
      adresse: '',
      ville: '',
      pays: 'Cameroun',
    });
  };

  // Handle add submission
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();

    const newSupplier = createSupplier(formData);
    if (newSupplier) {
      loadData();
      setShowAddModal(false);
      resetForm();
      alert('✅ Fournisseur ajouté avec succès!');
    }
  };

  // Handle update submission
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingSupplier) return;

    const updated = updateSupplier(editingSupplier.id, formData);
    if (updated) {
      loadData();
      setShowEditModal(false);
      setEditingSupplier(null);
      resetForm();
      alert('✅ Fournisseur mis à jour avec succès!');
    }
  };

  // Handle edit click
  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      nom: supplier.nom,
      contact: supplier.contact,
      email: supplier.email,
      telephone: supplier.telephone,
      adresse: supplier.adresse,
      ville: supplier.ville,
      pays: supplier.pays,
    });
    setShowEditModal(true);
  };

  // Handle delete
  const handleDelete = (id: string, nom: string) => {
    if (confirm(`⚠️ Supprimer le fournisseur "${nom}"?\n\nCette action est irréversible.`)) {
      const success = deleteSupplier(id);
      if (success) {
        loadData();
        alert('✅ Fournisseur supprimé avec succès!');
      }
    }
  };

  // Handle view
  const handleView = (supplier: Supplier) => {
    setViewingSupplier(supplier);
    setShowViewModal(true);
  };

  // Calculate supplier statistics
  const getSupplierStats = (supplierId: string) => {
    const allEntries = getAllEntries();
    const supplierEntries = allEntries.filter(entry => entry.fournisseur_id === supplierId);

    const totalOrders = supplierEntries.length;
    const totalValue = supplierEntries.reduce((sum, entry) => sum + entry.valeur_totale, 0);

    return { totalOrders, totalValue };
  };

  // Filter suppliers
  const getFilteredSuppliers = () => {
    if (!searchTerm) return suppliers;

    return suppliers.filter(supplier =>
      supplier.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.ville.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredSuppliers = getFilteredSuppliers();

  // Calculate global statistics
  const stats = {
    total: suppliers.length,
    totalEntries: getAllEntries().filter(e => e.fournisseur_id).length,
    totalValue: getAllEntries()
      .filter(e => e.fournisseur_id)
      .reduce((sum, e) => sum + e.valeur_totale, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Fournisseurs</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {suppliers.length} fournisseur{suppliers.length > 1 ? 's' : ''} enregistré{suppliers.length > 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="primary" size="lg" onClick={() => setShowAddModal(true)}>
          <Plus size={20} />
          Ajouter Fournisseur
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Fournisseurs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <Users size={32} className="text-blue-600" />
          </div>
        </Card>

        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Commandes Totales</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalEntries}</p>
            </div>
            <Package size={32} className="text-green-600" />
          </div>
        </Card>

        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Valeur Totale</p>
              <p className="text-xl font-bold text-amber-600">{formatPrice(stats.totalValue)}</p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <Input
          type="text"
          placeholder="🔍 Rechercher par nom, contact, ville ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Card>

      {/* Suppliers Table */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Liste des Fournisseurs ({filteredSuppliers.length})
        </h3>

        {filteredSuppliers.length === 0 ? (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Aucun fournisseur trouvé</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              {searchTerm ? 'Essayez de modifier vos critères de recherche' : 'Commencez par ajouter un fournisseur'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fournisseur</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>Commandes</TableHead>
                  <TableHead>Valeur Totale</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map((supplier) => {
                  const supplierStats = getSupplierStats(supplier.id);
                  return (
                    <TableRow key={supplier.id}>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{supplier.nom}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <Mail size={12} />
                            {supplier.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">{supplier.contact}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <Phone size={14} />
                          {supplier.telephone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <MapPin size={14} />
                          {supplier.ville}, {supplier.pays}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-green-600 font-bold">{supplierStats.totalOrders}</span>
                      </TableCell>
                      <TableCell className="font-bold text-amber-700">
                        {formatPrice(supplierStats.totalValue)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(supplier.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(supplier)}
                            title="Voir les détails"
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(supplier)}
                            title="Modifier"
                          >
                            <Edit size={16} className="text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(supplier.id, supplier.nom)}
                            title="Supprimer"
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Add Supplier Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="➕ Ajouter un Nouveau Fournisseur"
        size="large"
      >
        <form onSubmit={handleAdd}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nom du fournisseur"
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              required
              placeholder="Ex: BioLab Supplies"
            />

            <Input
              label="Personne de contact"
              type="text"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              required
              placeholder="Ex: Dr. Jean Dupont"
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="contact@fournisseur.com"
            />

            <Input
              label="Téléphone"
              type="tel"
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              required
              placeholder="+237 6XX XX XX XX"
            />

            <div className="md:col-span-2">
              <Input
                label="Adresse"
                type="text"
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                required
                placeholder="Ex: Avenue de la Liberté, Quartier..."
              />
            </div>

            <Input
              label="Ville"
              type="text"
              value={formData.ville}
              onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
              required
              placeholder="Ex: Yaoundé"
            />

            <Input
              label="Pays"
              type="text"
              value={formData.pays}
              onChange={(e) => setFormData({ ...formData, pays: e.target.value })}
              required
              placeholder="Ex: Cameroun"
            />
          </div>

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
              ✅ Ajouter le Fournisseur
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Supplier Modal */}
      {editingSupplier && (
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingSupplier(null);
            resetForm();
          }}
          title="✏️ Modifier le Fournisseur"
          size="large"
        >
          <form onSubmit={handleUpdate}>
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
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingSupplier(null);
                  resetForm();
                }}
              >
                Annuler
              </Button>
              <Button type="submit" variant="primary">
                ✅ Mettre à Jour
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* View Supplier Details Modal */}
      {viewingSupplier && (
        <Modal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setViewingSupplier(null);
          }}
          title="📋 Détails du Fournisseur"
          size="medium"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Nom du fournisseur</p>
                <p className="font-bold text-lg text-gray-900 dark:text-white">{viewingSupplier.nom}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Contact</p>
                <p className="font-semibold dark:text-white">{viewingSupplier.contact}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                <div className="flex items-center gap-1">
                  <Mail size={14} className="text-gray-500" />
                  <p className="font-semibold dark:text-white">{viewingSupplier.email}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Téléphone</p>
                <div className="flex items-center gap-1">
                  <Phone size={14} className="text-gray-500" />
                  <p className="font-semibold dark:text-white">{viewingSupplier.telephone}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ville</p>
                <div className="flex items-center gap-1">
                  <MapPin size={14} className="text-gray-500" />
                  <p className="font-semibold dark:text-white">{viewingSupplier.ville}</p>
                </div>
              </div>

              <div className="col-span-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Adresse complète</p>
                <p className="font-semibold dark:text-white">{viewingSupplier.adresse}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {viewingSupplier.ville}, {viewingSupplier.pays}
                </p>
              </div>

              {(() => {
                const supplierStats = getSupplierStats(viewingSupplier.id);
                return (
                  <>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total commandes</p>
                      <p className="font-bold text-green-600 text-xl">{supplierStats.totalOrders}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Valeur totale</p>
                      <p className="font-bold text-amber-700 text-xl">{formatPrice(supplierStats.totalValue)}</p>
                    </div>
                  </>
                );
              })()}

              <div className="col-span-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Date d'ajout</p>
                <p className="text-sm dark:text-white">{new Date(viewingSupplier.created_at).toLocaleString('fr-FR')}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setShowViewModal(false);
                setViewingSupplier(null);
              }}
            >
              Fermer
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setShowViewModal(false);
                handleEdit(viewingSupplier);
              }}
            >
              <Edit size={16} />
              Modifier
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
