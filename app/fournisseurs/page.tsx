'use client';

import { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { useSettings } from '@/contexts/SettingsContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Users, Plus, Edit, Trash2, Phone, Mail, MapPin, Package, Eye, Loader2 } from 'lucide-react';
import { WORLD_COUNTRIES } from '@/lib/data/countries';

export default function FournisseursPage() {
  const { formatPrice, formatDate } = useSettings();
  const { suppliers, entrees, isLoading, addSupplier, updateSupplier, deleteSupplier } = useData();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [viewingSupplier, setViewingSupplier] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nom: '', contact: '', email: '', telephone: '', adresse: '', ville: '', pays: 'Cameroun',
  });

  const resetForm = () => {
    setFormData({ nom: '', contact: '', email: '', telephone: '', adresse: '', ville: '', pays: 'Cameroun' });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addSupplier(formData);
      setShowAddModal(false);
      resetForm();
      alert('Fournisseur ajouté avec succès!');
    } catch (error) {
      alert('Erreur lors de l\'ajout du fournisseur');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier) return;
    setIsSubmitting(true);
    try {
      await updateSupplier(editingSupplier.id, formData);
      setShowEditModal(false);
      setEditingSupplier(null);
      resetForm();
      alert('Fournisseur mis à jour avec succès!');
    } catch (error) {
      alert('Erreur lors de la mise à jour du fournisseur');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (supplier: any) => {
    setEditingSupplier(supplier);
    setFormData({ nom: supplier.nom, contact: supplier.contact, email: supplier.email, telephone: supplier.telephone, adresse: supplier.adresse, ville: supplier.ville, pays: supplier.pays });
    setShowEditModal(true);
  };

  const handleDelete = async (id: string, nom: string) => {
    if (confirm(`Supprimer le fournisseur "${nom}"?`)) {
      try {
        await deleteSupplier(id);
        alert('Fournisseur supprimé avec succès!');
      } catch (error) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const getSupplierStats = (supplierName: string) => {
    const supplierEntries = entrees.filter(entry => entry.fournisseur === supplierName);
    return {
      totalOrders: supplierEntries.length,
      totalValue: supplierEntries.reduce((sum, entry) => sum + (entry.quantite * (entry.prix_unitaire || 0)), 0),
    };
  };

  const filteredSuppliers = useMemo(() => {
    if (!searchTerm) return suppliers;
    return suppliers.filter(s => s.nom.toLowerCase().includes(searchTerm.toLowerCase()) || s.contact.toLowerCase().includes(searchTerm.toLowerCase()) || s.ville.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [suppliers, searchTerm]);

  const stats = useMemo(() => ({
    total: suppliers.length,
    totalEntries: entrees.filter(e => e.fournisseur).length,
    totalValue: entrees.reduce((sum, e) => sum + (e.quantite * (e.prix_unitaire || 0)), 0),
  }), [suppliers, entrees]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Fournisseurs</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{suppliers.length} fournisseur{suppliers.length > 1 ? 's' : ''}</p>
        </div>
        <Button variant="primary" size="lg" onClick={() => setShowAddModal(true)}>
          <Plus size={20} /> Ajouter Fournisseur
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-600 dark:text-gray-400">Total Fournisseurs</p><p className="text-2xl font-bold dark:text-white">{stats.total}</p></div>
            <Users size={32} className="text-blue-600" />
          </div>
        </Card>
        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-600 dark:text-gray-400">Commandes Totales</p><p className="text-2xl font-bold text-green-600">{stats.totalEntries}</p></div>
            <Package size={32} className="text-green-600" />
          </div>
        </Card>
        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-600 dark:text-gray-400">Valeur Totale</p><p className="text-xl font-bold text-amber-600">{formatPrice(stats.totalValue)}</p></div>
            <div className="text-4xl">💰</div>
          </div>
        </Card>
      </div>

      <Card>
        <Input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </Card>

      <Card>
        <h3 className="text-lg font-bold dark:text-white mb-4">Liste des Fournisseurs ({filteredSuppliers.length})</h3>
        {filteredSuppliers.length === 0 ? (
          <div className="text-center py-12"><Users size={48} className="mx-auto text-gray-400 mb-4" /><p className="text-gray-600 dark:text-gray-400">Aucun fournisseur trouvé</p></div>
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
                  <TableHead>Valeur</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map((supplier) => {
                  const supplierStats = getSupplierStats(supplier.nom);
                  return (
                    <TableRow key={supplier.id}>
                      <TableCell>
                        <div><p className="font-semibold dark:text-white">{supplier.nom}</p><div className="flex items-center gap-1 text-xs text-gray-500"><Mail size={12} />{supplier.email}</div></div>
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">{supplier.contact}</TableCell>
                      <TableCell><div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400"><Phone size={14} />{supplier.telephone}</div></TableCell>
                      <TableCell><div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400"><MapPin size={14} />{supplier.ville}, {supplier.pays}</div></TableCell>
                      <TableCell><span className="text-green-600 font-bold">{supplierStats.totalOrders}</span></TableCell>
                      <TableCell className="font-bold text-amber-700">{formatPrice(supplierStats.totalValue)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => { setViewingSupplier(supplier); setShowViewModal(true); }}><Eye size={16} /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(supplier)}><Edit size={16} className="text-blue-600" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(supplier.id, supplier.nom)}><Trash2 size={16} className="text-red-600" /></Button>
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

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); resetForm(); }} title="Ajouter un Fournisseur" size="lg">
        <form onSubmit={handleAdd}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nom" type="text" value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} required />
            <Input label="Contact" type="text" value={formData.contact} onChange={(e) => setFormData({ ...formData, contact: e.target.value })} required />
            <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            <Input label="Téléphone" type="tel" value={formData.telephone} onChange={(e) => setFormData({ ...formData, telephone: e.target.value })} required />
            <div className="md:col-span-2"><Input label="Adresse" type="text" value={formData.adresse} onChange={(e) => setFormData({ ...formData, adresse: e.target.value })} required /></div>
            <Input label="Ville" type="text" value={formData.ville} onChange={(e) => setFormData({ ...formData, ville: e.target.value })} required />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pays *</label>
              <select value={formData.pays} onChange={(e) => setFormData({ ...formData, pays: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg">
                {WORLD_COUNTRIES.map((country) => (<option key={country} value={country}>{country}</option>))}
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => { setShowAddModal(false); resetForm(); }}>Annuler</Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>Ajouter</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      {editingSupplier && (
        <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditingSupplier(null); resetForm(); }} title="Modifier le Fournisseur" size="lg">
          <form onSubmit={handleUpdate}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Nom" type="text" value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} required />
              <Input label="Contact" type="text" value={formData.contact} onChange={(e) => setFormData({ ...formData, contact: e.target.value })} required />
              <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
              <Input label="Téléphone" type="tel" value={formData.telephone} onChange={(e) => setFormData({ ...formData, telephone: e.target.value })} required />
              <div className="md:col-span-2"><Input label="Adresse" type="text" value={formData.adresse} onChange={(e) => setFormData({ ...formData, adresse: e.target.value })} required /></div>
              <Input label="Ville" type="text" value={formData.ville} onChange={(e) => setFormData({ ...formData, ville: e.target.value })} required />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pays *</label>
                <select value={formData.pays} onChange={(e) => setFormData({ ...formData, pays: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg">
                  {WORLD_COUNTRIES.map((country) => (<option key={country} value={country}>{country}</option>))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => { setShowEditModal(false); setEditingSupplier(null); resetForm(); }}>Annuler</Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>Mettre à jour</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* View Modal */}
      {viewingSupplier && (
        <Modal isOpen={showViewModal} onClose={() => { setShowViewModal(false); setViewingSupplier(null); }} title="Détails du Fournisseur" size="md">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><p className="text-sm text-gray-600 dark:text-gray-400">Nom</p><p className="font-bold text-lg dark:text-white">{viewingSupplier.nom}</p></div>
            <div><p className="text-sm text-gray-600 dark:text-gray-400">Contact</p><p className="font-semibold dark:text-white">{viewingSupplier.contact}</p></div>
            <div><p className="text-sm text-gray-600 dark:text-gray-400">Email</p><p className="font-semibold dark:text-white">{viewingSupplier.email}</p></div>
            <div><p className="text-sm text-gray-600 dark:text-gray-400">Téléphone</p><p className="font-semibold dark:text-white">{viewingSupplier.telephone}</p></div>
            <div><p className="text-sm text-gray-600 dark:text-gray-400">Ville</p><p className="font-semibold dark:text-white">{viewingSupplier.ville}</p></div>
            <div className="col-span-2"><p className="text-sm text-gray-600 dark:text-gray-400">Adresse</p><p className="font-semibold dark:text-white">{viewingSupplier.adresse}, {viewingSupplier.pays}</p></div>
            {(() => {
              const s = getSupplierStats(viewingSupplier.nom);
              return (<><div><p className="text-sm text-gray-600 dark:text-gray-400">Commandes</p><p className="font-bold text-green-600 text-xl">{s.totalOrders}</p></div><div><p className="text-sm text-gray-600 dark:text-gray-400">Valeur</p><p className="font-bold text-amber-700 text-xl">{formatPrice(s.totalValue)}</p></div></>);
            })()}
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => { setShowViewModal(false); setViewingSupplier(null); }}>Fermer</Button>
            <Button variant="primary" onClick={() => { setShowViewModal(false); handleEdit(viewingSupplier); }}><Edit size={16} /> Modifier</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
