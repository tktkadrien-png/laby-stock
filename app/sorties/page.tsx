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
import { ArrowUpFromLine, Plus, AlertCircle, Package, Calendar, Trash2, Eye, Loader2 } from 'lucide-react';

export default function SortiesPage() {
  const { formatPrice, formatDate } = useSettings();
  const {
    products,
    sorties,
    isLoading,
    addSortie,
    deleteSortie
  } = useData();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingExit, setViewingExit] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterMotif, setFilterMotif] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    produit_id: '',
    quantite: 0,
    destinataire: '',
    date: new Date().toISOString().split('T')[0],
    motif: 'Utilisation',
    notes: '',
  });

  const resetForm = () => {
    setFormData({
      produit_id: '',
      quantite: 0,
      destinataire: '',
      date: new Date().toISOString().split('T')[0],
      motif: 'Utilisation',
      notes: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const selectedProduct = products.find(p => p.id === formData.produit_id);

      if (!selectedProduct) {
        alert('Veuillez sélectionner un produit');
        return;
      }

      if (formData.quantite > selectedProduct.quantite_totale) {
        alert(`Stock insuffisant!\n\nStock disponible: ${selectedProduct.quantite_totale}\nQuantité demandée: ${formData.quantite}`);
        return;
      }

      if (formData.quantite <= 0) {
        alert('La quantité doit être supérieure à 0');
        return;
      }

      const sortieData = {
        produit_id: formData.produit_id,
        produit_nom: selectedProduct.nom,
        quantite: formData.quantite,
        destinataire: formData.destinataire,
        date: formData.date,
        motif: formData.motif,
        notes: formData.notes,
      };

      await addSortie(sortieData);
      setShowAddModal(false);
      resetForm();
      alert('Sortie enregistrée avec succès! Le stock du produit a été mis à jour.');
    } catch (error) {
      console.error('Error adding exit:', error);
      alert('Erreur lors de l\'enregistrement de la sortie');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, productName: string) => {
    if (confirm(`Supprimer cette sortie de "${productName}"?\n\nATTENTION: Cette action ne peut pas être annulée.`)) {
      try {
        await deleteSortie(id);
        alert('Sortie supprimée avec succès!');
      } catch (error) {
        console.error('Error deleting exit:', error);
        alert('Erreur lors de la suppression de la sortie');
      }
    }
  };

  const handleView = (exit: any) => {
    setViewingExit(exit);
    setShowViewModal(true);
  };

  const filteredExits = useMemo(() => {
    let filtered = [...sorties];

    if (searchTerm) {
      filtered = filtered.filter(exit =>
        exit.produit_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exit.destinataire?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (exit.motif?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterMotif !== 'all') {
      filtered = filtered.filter(exit => exit.motif === filterMotif);
    }

    if (filterPeriod !== 'all') {
      const now = new Date();
      filtered = filtered.filter(exit => {
        const date = new Date(exit.date);
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (filterPeriod === 'today') return diffDays <= 1;
        if (filterPeriod === 'week') return diffDays <= 7;
        if (filterPeriod === 'month') return diffDays <= 30;
        return true;
      });
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sorties, searchTerm, filterPeriod, filterMotif]);

  const stats = useMemo(() => {
    const now = new Date();
    return {
      totalExits: filteredExits.length,
      totalQuantity: filteredExits.reduce((sum, e) => sum + e.quantite, 0),
      thisMonth: filteredExits.filter(e => {
        const exitDate = new Date(e.date);
        return exitDate.getMonth() === now.getMonth() && exitDate.getFullYear() === now.getFullYear();
      }).length,
    };
  }, [filteredExits]);

  const selectedProduct = products.find(p => p.id === formData.produit_id);

  const getMotifBadge = (motif: string) => {
    switch (motif) {
      case 'Utilisation': return <Badge variant="default">{motif}</Badge>;
      case 'Vente': return <Badge variant="success">{motif}</Badge>;
      case 'Perte': return <Badge variant="danger">{motif}</Badge>;
      case 'Expiration': return <Badge variant="warning">{motif}</Badge>;
      default: return <Badge variant="info">{motif}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600 dark:text-gray-400">Chargement des sorties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sorties de Stock</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Enregistrement des utilisations et distributions</p>
        </div>
        <Button variant="danger" size="lg" onClick={() => setShowAddModal(true)}>
          <Plus size={20} />
          Nouvelle Sortie
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Sorties</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalExits}</p>
              <p className="text-xs text-red-600 mt-1">Ce mois: {stats.thisMonth}</p>
            </div>
            <ArrowUpFromLine size={32} className="text-red-600" />
          </div>
        </Card>

        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Quantité Totale</p>
              <p className="text-2xl font-bold text-red-600">-{stats.totalQuantity}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Pièces sorties</p>
            </div>
            <Package size={32} className="text-red-600" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            type="text"
            placeholder="Rechercher par produit, destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={filterMotif}
            onChange={(e) => setFilterMotif(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
          >
            <option value="all">Tous les motifs</option>
            <option value="Utilisation">Utilisation</option>
            <option value="Vente">Vente</option>
            <option value="Perte">Perte</option>
            <option value="Expiration">Expiration</option>
            <option value="Autre">Autre</option>
          </select>
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
          >
            <option value="all">Toutes les périodes</option>
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
          </select>
        </div>
      </Card>

      {/* Exits Table */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Historique des Sorties ({filteredExits.length})
        </h3>

        {filteredExits.length === 0 ? (
          <div className="text-center py-12">
            <ArrowUpFromLine size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Aucune sortie trouvée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead>Destinataire</TableHead>
                  <TableHead>Motif</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExits.map((exit) => (
                  <TableRow key={exit.id}>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        {formatDate(exit.date)}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold dark:text-white">{exit.produit_nom}</TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">{exit.destinataire || 'N/A'}</TableCell>
                    <TableCell>{getMotifBadge(exit.motif || 'Autre')}</TableCell>
                    <TableCell>
                      <span className="text-red-600 font-bold text-lg">-{exit.quantite}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleView(exit)}>
                          <Eye size={16} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(exit.id, exit.produit_nom)}>
                          <Trash2 size={16} className="text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Add Exit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); resetForm(); }}
        title="Nouvelle Sortie de Stock"
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Produit <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.produit_id}
                onChange={(e) => setFormData({ ...formData, produit_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg"
                required
              >
                <option value="">-- Sélectionner un produit --</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.nom} (Stock: {product.quantite_totale})
                  </option>
                ))}
              </select>
            </div>

            {selectedProduct && (
              <div className="md:col-span-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm"><span className="text-gray-600 dark:text-gray-400">Stock actuel:</span> <span className="font-bold">{selectedProduct.quantite_totale} {selectedProduct.unite}</span></p>
              </div>
            )}

            <Input label="Quantité" type="number" value={formData.quantite} onChange={(e) => setFormData({ ...formData, quantite: parseInt(e.target.value) || 0 })} min="1" required />
            <Input label="Destinataire" type="text" value={formData.destinataire} onChange={(e) => setFormData({ ...formData, destinataire: e.target.value })} placeholder="Ex: Service hématologie" />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Motif *</label>
              <select value={formData.motif} onChange={(e) => setFormData({ ...formData, motif: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg" required>
                <option value="Utilisation">Utilisation</option>
                <option value="Vente">Vente</option>
                <option value="Perte">Perte</option>
                <option value="Expiration">Expiration</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <Input label="Date de sortie" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
              <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg" />
            </div>
          </div>

          {selectedProduct && formData.quantite > selectedProduct.quantite_totale && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg flex items-center gap-3">
              <AlertCircle className="text-red-600" size={20} />
              <p className="text-sm text-red-700 dark:text-red-400">Stock insuffisant!</p>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => { setShowAddModal(false); resetForm(); }}>Annuler</Button>
            <Button type="submit" variant="danger" isLoading={isSubmitting} disabled={!selectedProduct || formData.quantite > (selectedProduct?.quantite_totale || 0) || formData.quantite <= 0}>
              Enregistrer la Sortie
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Exit Modal */}
      {viewingExit && (
        <Modal isOpen={showViewModal} onClose={() => { setShowViewModal(false); setViewingExit(null); }} title="Détails de la Sortie" size="md">
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-sm text-gray-600 dark:text-gray-400">Date</p><p className="font-semibold dark:text-white">{formatDate(viewingExit.date)}</p></div>
            <div><p className="text-sm text-gray-600 dark:text-gray-400">Motif</p>{getMotifBadge(viewingExit.motif || 'Autre')}</div>
            <div className="col-span-2"><p className="text-sm text-gray-600 dark:text-gray-400">Produit</p><p className="font-semibold text-lg dark:text-white">{viewingExit.produit_nom}</p></div>
            <div><p className="text-sm text-gray-600 dark:text-gray-400">Destinataire</p><p className="font-semibold dark:text-white">{viewingExit.destinataire || 'N/A'}</p></div>
            <div><p className="text-sm text-gray-600 dark:text-gray-400">Quantité</p><p className="font-bold text-red-600 text-xl">-{viewingExit.quantite}</p></div>
            {viewingExit.notes && <div className="col-span-2"><p className="text-sm text-gray-600 dark:text-gray-400">Notes</p><p className="dark:text-white">{viewingExit.notes}</p></div>}
          </div>
          <div className="mt-6 flex justify-end">
            <Button variant="ghost" onClick={() => { setShowViewModal(false); setViewingExit(null); }}>Fermer</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
