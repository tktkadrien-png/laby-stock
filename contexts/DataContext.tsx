'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Category {
  id: string;
  nom: string;
  code: string;
  couleur: string;
}

interface Type {
  id: string;
  nom: string;
  code: string;
  categorie_associee: string;
}

interface DataContextType {
  categories: Category[];
  types: Type[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  addType: (type: Omit<Type, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  updateType: (id: string, type: Partial<Type>) => void;
  deleteCategory: (id: string) => void;
  deleteType: (id: string) => void;
}

const defaultCategories: Category[] = [
  { id: '1', nom: 'Réactifs', code: 'REACT', couleur: '#EF4444' },
  { id: '2', nom: 'Consommables', code: 'CONS', couleur: '#10B981' },
  { id: '3', nom: 'Équipements', code: 'EQUIP', couleur: '#3B82F6' },
  { id: '4', nom: 'Kits de Diagnostic', code: 'KIT', couleur: '#F59E0B' },
];

const defaultTypes: Type[] = [
  { id: '1', nom: 'Liquide', code: 'LIQ', categorie_associee: 'Réactifs' },
  { id: '2', nom: 'Poudre', code: 'POW', categorie_associee: 'Réactifs' },
  { id: '3', nom: 'Gel', code: 'GEL', categorie_associee: 'Réactifs' },
  { id: '4', nom: 'Plastique', code: 'PLAST', categorie_associee: 'Consommables' },
  { id: '5', nom: 'Verre', code: 'VERR', categorie_associee: 'Consommables' },
  { id: '6', nom: 'Latex', code: 'LAT', categorie_associee: 'Consommables' },
  { id: '7', nom: 'Électronique', code: 'ELEC', categorie_associee: 'Équipements' },
  { id: '8', nom: 'Mécanique', code: 'MECA', categorie_associee: 'Équipements' },
];

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [types, setTypes] = useState<Type[]>(defaultTypes);

  useEffect(() => {
    // Load from localStorage
    const savedCategories = localStorage.getItem('labystockpro-categories');
    const savedTypes = localStorage.getItem('labystockpro-types');

    if (savedCategories) {
      try {
        setCategories(JSON.parse(savedCategories));
      } catch (e) {
        console.error('Error loading categories:', e);
      }
    }

    if (savedTypes) {
      try {
        setTypes(JSON.parse(savedTypes));
      } catch (e) {
        console.error('Error loading types:', e);
      }
    }
  }, []);

  const saveCategories = (newCategories: Category[]) => {
    setCategories(newCategories);
    localStorage.setItem('labystockpro-categories', JSON.stringify(newCategories));
  };

  const saveTypes = (newTypes: Type[]) => {
    setTypes(newTypes);
    localStorage.setItem('labystockpro-types', JSON.stringify(newTypes));
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
    };
    saveCategories([...categories, newCategory]);
  };

  const addType = (type: Omit<Type, 'id'>) => {
    const newType: Type = {
      ...type,
      id: Date.now().toString(),
    };
    saveTypes([...types, newType]);
  };

  const updateCategory = (id: string, category: Partial<Category>) => {
    saveCategories(categories.map(c => c.id === id ? { ...c, ...category } : c));
  };

  const updateType = (id: string, type: Partial<Type>) => {
    saveTypes(types.map(t => t.id === id ? { ...t, ...type } : t));
  };

  const deleteCategory = (id: string) => {
    saveCategories(categories.filter(c => c.id !== id));
  };

  const deleteType = (id: string) => {
    saveTypes(types.filter(t => t.id !== id));
  };

  return (
    <DataContext.Provider
      value={{
        categories,
        types,
        addCategory,
        addType,
        updateCategory,
        updateType,
        deleteCategory,
        deleteType,
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
