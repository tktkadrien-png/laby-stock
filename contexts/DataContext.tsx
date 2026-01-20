'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  Category,
  Type,
  Supplier,
  Product,
  Entree,
  Sortie,
  Alert,
  categoriesApi,
  typesApi,
  suppliersApi,
  productsApi,
  entreesApi,
  sortiesApi,
  alertsApi,
  generateAlerts
} from '@/lib/supabase/client';

interface DataContextType {
  // Data
  categories: Category[];
  types: Type[];
  suppliers: Supplier[];
  products: Product[];
  entrees: Entree[];
  sorties: Sortie[];
  alerts: Alert[];

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Categories
  addCategory: (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Types
  addType: (type: Omit<Type, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateType: (id: string, type: Partial<Type>) => Promise<void>;
  deleteType: (id: string) => Promise<void>;

  // Suppliers
  addSupplier: (supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;

  // Products
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // Entrees
  addEntree: (entree: Omit<Entree, 'id' | 'created_at'>) => Promise<void>;
  deleteEntree: (id: string) => Promise<void>;

  // Sorties
  addSortie: (sortie: Omit<Sortie, 'id' | 'created_at'>) => Promise<void>;
  deleteSortie: (id: string) => Promise<void>;

  // Alerts
  markAlertAsRead: (id: string) => Promise<void>;
  markAllAlertsAsRead: () => Promise<void>;
  refreshAlerts: () => Promise<void>;

  // Refresh data
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [types, setTypes] = useState<Type[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [entrees, setEntrees] = useState<Entree[]>([]);
  const [sorties, setSorties] = useState<Sortie[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all data from Supabase
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [
        categoriesData,
        typesData,
        suppliersData,
        productsData,
        entreesData,
        sortiesData,
        alertsData
      ] = await Promise.all([
        categoriesApi.getAll(),
        typesApi.getAll(),
        suppliersApi.getAll(),
        productsApi.getAll(),
        entreesApi.getAll(),
        sortiesApi.getAll(),
        alertsApi.getAll()
      ]);

      setCategories(categoriesData);
      setTypes(typesData);
      setSuppliers(suppliersData);
      setProducts(productsData);
      setEntrees(entreesData);
      setSorties(sortiesData);
      setAlerts(alertsData);
    } catch (err) {
      console.error('Error loading data from Supabase:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Categories
  const addCategory = async (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newCategory = await categoriesApi.create(category);
      setCategories(prev => [...prev, newCategory]);
    } catch (err) {
      console.error('Error adding category:', err);
      throw err;
    }
  };

  const updateCategory = async (id: string, category: Partial<Category>) => {
    try {
      const updated = await categoriesApi.update(id, category);
      setCategories(prev => prev.map(c => c.id === id ? updated : c));
    } catch (err) {
      console.error('Error updating category:', err);
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await categoriesApi.delete(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error deleting category:', err);
      throw err;
    }
  };

  // Types
  const addType = async (type: Omit<Type, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newType = await typesApi.create(type);
      setTypes(prev => [...prev, newType]);
    } catch (err) {
      console.error('Error adding type:', err);
      throw err;
    }
  };

  const updateType = async (id: string, type: Partial<Type>) => {
    try {
      const updated = await typesApi.update(id, type);
      setTypes(prev => prev.map(t => t.id === id ? updated : t));
    } catch (err) {
      console.error('Error updating type:', err);
      throw err;
    }
  };

  const deleteType = async (id: string) => {
    try {
      await typesApi.delete(id);
      setTypes(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Error deleting type:', err);
      throw err;
    }
  };

  // Suppliers
  const addSupplier = async (supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newSupplier = await suppliersApi.create(supplier);
      setSuppliers(prev => [...prev, newSupplier]);
    } catch (err) {
      console.error('Error adding supplier:', err);
      throw err;
    }
  };

  const updateSupplier = async (id: string, supplier: Partial<Supplier>) => {
    try {
      const updated = await suppliersApi.update(id, supplier);
      setSuppliers(prev => prev.map(s => s.id === id ? updated : s));
    } catch (err) {
      console.error('Error updating supplier:', err);
      throw err;
    }
  };

  const deleteSupplier = async (id: string) => {
    try {
      await suppliersApi.delete(id);
      setSuppliers(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Error deleting supplier:', err);
      throw err;
    }
  };

  // Products
  const addProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newProduct = await productsApi.create(product);
      setProducts(prev => [newProduct, ...prev]);
      // Regenerate alerts after adding a product
      await refreshAlerts();
    } catch (err) {
      console.error('Error adding product:', err);
      throw err;
    }
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    try {
      const updated = await productsApi.update(id, product);
      setProducts(prev => prev.map(p => p.id === id ? updated : p));
      // Regenerate alerts after updating a product
      await refreshAlerts();
    } catch (err) {
      console.error('Error updating product:', err);
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await productsApi.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      // Delete associated alerts
      await alertsApi.deleteByProductId(id);
      setAlerts(prev => prev.filter(a => a.produit_id !== id));
    } catch (err) {
      console.error('Error deleting product:', err);
      throw err;
    }
  };

  // Entrees
  const addEntree = async (entree: Omit<Entree, 'id' | 'created_at'>) => {
    try {
      const newEntree = await entreesApi.create(entree);
      setEntrees(prev => [newEntree, ...prev]);

      // Update product quantity
      const product = products.find(p => p.id === entree.produit_id);
      if (product) {
        await updateProduct(entree.produit_id, {
          quantite_totale: product.quantite_totale + entree.quantite,
          ...(entree.date_peremption && { date_peremption: entree.date_peremption }),
          ...(entree.numero_lot && { lot: entree.numero_lot })
        });
      }
    } catch (err) {
      console.error('Error adding entree:', err);
      throw err;
    }
  };

  const deleteEntree = async (id: string) => {
    try {
      await entreesApi.delete(id);
      setEntrees(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error('Error deleting entree:', err);
      throw err;
    }
  };

  // Sorties
  const addSortie = async (sortie: Omit<Sortie, 'id' | 'created_at'>) => {
    try {
      const newSortie = await sortiesApi.create(sortie);
      setSorties(prev => [newSortie, ...prev]);

      // Update product quantity
      const product = products.find(p => p.id === sortie.produit_id);
      if (product) {
        const newQuantity = Math.max(0, product.quantite_totale - sortie.quantite);
        await updateProduct(sortie.produit_id, {
          quantite_totale: newQuantity
        });
      }
    } catch (err) {
      console.error('Error adding sortie:', err);
      throw err;
    }
  };

  const deleteSortie = async (id: string) => {
    try {
      await sortiesApi.delete(id);
      setSorties(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Error deleting sortie:', err);
      throw err;
    }
  };

  // Alerts
  const markAlertAsRead = async (id: string) => {
    try {
      await alertsApi.markAsRead(id);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, lu: true } : a));
    } catch (err) {
      console.error('Error marking alert as read:', err);
      throw err;
    }
  };

  const markAllAlertsAsRead = async () => {
    try {
      await alertsApi.markAllAsRead();
      setAlerts(prev => prev.map(a => ({ ...a, lu: true })));
    } catch (err) {
      console.error('Error marking all alerts as read:', err);
      throw err;
    }
  };

  const refreshAlerts = async () => {
    try {
      const newAlerts = await generateAlerts();
      setAlerts(newAlerts);
    } catch (err) {
      console.error('Error refreshing alerts:', err);
    }
  };

  const refreshData = async () => {
    await loadData();
  };

  return (
    <DataContext.Provider
      value={{
        categories,
        types,
        suppliers,
        products,
        entrees,
        sorties,
        alerts,
        isLoading,
        error,
        addCategory,
        updateCategory,
        deleteCategory,
        addType,
        updateType,
        deleteType,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        addProduct,
        updateProduct,
        deleteProduct,
        addEntree,
        deleteEntree,
        addSortie,
        deleteSortie,
        markAlertAsRead,
        markAllAlertsAsRead,
        refreshAlerts,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
