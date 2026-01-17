// Système de base de données localStorage pour LABY STOCK
// Cette implémentation simule une vraie base de données SQL avec des relations

export interface Product {
  id: string;
  nom: string;
  code: string;
  categorie: string;
  type: string;
  description: string;
  prix_unitaire: number;
  quantite_totale: number;
  quantite_cartons: number;
  pieces_par_carton: number;
  unite: string;
  seuil_minimum: number;
  date_peremption: string | null;
  lot: string;
  emplacement: string;
  fournisseur_id: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface StockEntry {
  id: string;
  produit_id: string;
  produit_nom: string;
  quantite: number;
  cartons: number;
  prix_unitaire: number;
  valeur_totale: number;
  fournisseur_id: string | null;
  fournisseur_nom: string;
  date_entree: string;
  lot: string;
  date_peremption: string | null;
  notes: string;
  created_at: string;
}

export interface StockExit {
  id: string;
  produit_id: string;
  produit_nom: string;
  quantite: number;
  cartons: number;
  valeur_unitaire: number;
  valeur_totale: number;
  destination: string;
  date_sortie: string;
  motif: string;
  notes: string;
  validated: boolean;
  created_at: string;
}

export interface Supplier {
  id: string;
  nom: string;
  contact: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  pays: string;
  created_at: string;
  updated_at: string;
}

// Clés de stockage
const KEYS = {
  PRODUCTS: 'labystockpro-products',
  ENTRIES: 'labystockpro-entries',
  EXITS: 'labystockpro-exits',
  SUPPLIERS: 'labystockpro-suppliers',
  CATEGORIES: 'labystockpro-categories',
  TYPES: 'labystockpro-types',
  SETTINGS: 'labystockpro-settings',
  ALERTS: 'labystockpro-alerts',
};

// Fonctions utilitaires
const getFromStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const saveToStorage = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// ==================== PRODUITS ====================

export const getAllProducts = (): Product[] => {
  return getFromStorage<Product[]>(KEYS.PRODUCTS, []);
};

export const getProductById = (id: string): Product | null => {
  const products = getAllProducts();
  return products.find(p => p.id === id) || null;
};

export const createProduct = (data: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Product => {
  const products = getAllProducts();
  const newProduct: Product = {
    ...data,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  products.push(newProduct);
  saveToStorage(KEYS.PRODUCTS, products);
  return newProduct;
};

export const updateProduct = (id: string, data: Partial<Product>): Product | null => {
  const products = getAllProducts();
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return null;

  products[index] = {
    ...products[index],
    ...data,
    updated_at: new Date().toISOString(),
  };
  saveToStorage(KEYS.PRODUCTS, products);
  return products[index];
};

export const deleteProduct = (id: string): boolean => {
  const products = getAllProducts();
  const filtered = products.filter(p => p.id !== id);
  if (filtered.length === products.length) return false;
  saveToStorage(KEYS.PRODUCTS, filtered);
  return true;
};

// ==================== ENTRÉES ====================

export const getAllEntries = (): StockEntry[] => {
  return getFromStorage<StockEntry[]>(KEYS.ENTRIES, []);
};

export const createEntry = (data: Omit<StockEntry, 'id' | 'created_at'>): StockEntry => {
  const entries = getAllEntries();
  const newEntry: StockEntry = {
    ...data,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    created_at: new Date().toISOString(),
  };
  entries.unshift(newEntry);
  saveToStorage(KEYS.ENTRIES, entries);

  // Mettre à jour le stock du produit
  const product = getProductById(data.produit_id);
  if (product) {
    updateProduct(data.produit_id, {
      quantite_totale: product.quantite_totale + data.quantite,
      quantite_cartons: product.quantite_cartons + data.cartons,
      prix_unitaire: data.prix_unitaire,
      date_peremption: data.date_peremption || product.date_peremption,
      lot: data.lot || product.lot,
    });
  }

  return newEntry;
};

export const deleteEntry = (id: string): boolean => {
  const entries = getAllEntries();
  const entry = entries.find(e => e.id === id);
  if (!entry) return false;

  // Retirer la quantité du produit
  const product = getProductById(entry.produit_id);
  if (product) {
    updateProduct(entry.produit_id, {
      quantite_totale: Math.max(0, product.quantite_totale - entry.quantite),
      quantite_cartons: Math.max(0, product.quantite_cartons - entry.cartons),
    });
  }

  const filtered = entries.filter(e => e.id !== id);
  saveToStorage(KEYS.ENTRIES, filtered);
  return true;
};

// ==================== SORTIES ====================

export const getAllExits = (): StockExit[] => {
  return getFromStorage<StockExit[]>(KEYS.EXITS, []);
};

export const createExit = (data: Omit<StockExit, 'id' | 'created_at'>): StockExit | null => {
  const product = getProductById(data.produit_id);
  if (!product || product.quantite_totale < data.quantite) {
    return null; // Stock insuffisant
  }

  const exits = getAllExits();
  const newExit: StockExit = {
    ...data,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    created_at: new Date().toISOString(),
  };
  exits.unshift(newExit);
  saveToStorage(KEYS.EXITS, exits);

  // Mettre à jour le stock du produit
  updateProduct(data.produit_id, {
    quantite_totale: product.quantite_totale - data.quantite,
    quantite_cartons: product.quantite_cartons - data.cartons,
  });

  return newExit;
};

export const deleteExit = (id: string): boolean => {
  const exits = getAllExits();
  const exit = exits.find(e => e.id === id);
  if (!exit) return false;

  // Remettre la quantité au produit
  const product = getProductById(exit.produit_id);
  if (product) {
    updateProduct(exit.produit_id, {
      quantite_totale: product.quantite_totale + exit.quantite,
      quantite_cartons: product.quantite_cartons + exit.cartons,
    });
  }

  const filtered = exits.filter(e => e.id !== id);
  saveToStorage(KEYS.EXITS, filtered);
  return true;
};

export const validateExit = (id: string): boolean => {
  const exits = getAllExits();
  const index = exits.findIndex(e => e.id === id);
  if (index === -1) return false;

  exits[index].validated = true;
  saveToStorage(KEYS.EXITS, exits);
  return true;
};

// ==================== FOURNISSEURS ====================

export const getAllSuppliers = (): Supplier[] => {
  return getFromStorage<Supplier[]>(KEYS.SUPPLIERS, []);
};

export const getSupplierById = (id: string): Supplier | null => {
  const suppliers = getAllSuppliers();
  return suppliers.find(s => s.id === id) || null;
};

export const createSupplier = (data: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>): Supplier => {
  const suppliers = getAllSuppliers();
  const newSupplier: Supplier = {
    ...data,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  suppliers.push(newSupplier);
  saveToStorage(KEYS.SUPPLIERS, suppliers);
  return newSupplier;
};

export const updateSupplier = (id: string, data: Partial<Supplier>): Supplier | null => {
  const suppliers = getAllSuppliers();
  const index = suppliers.findIndex(s => s.id === id);
  if (index === -1) return null;

  suppliers[index] = {
    ...suppliers[index],
    ...data,
    updated_at: new Date().toISOString(),
  };
  saveToStorage(KEYS.SUPPLIERS, suppliers);
  return suppliers[index];
};

export const deleteSupplier = (id: string): boolean => {
  const suppliers = getAllSuppliers();
  const filtered = suppliers.filter(s => s.id !== id);
  if (filtered.length === suppliers.length) return false;
  saveToStorage(KEYS.SUPPLIERS, filtered);
  return true;
};

// ==================== STATISTIQUES ====================

export const getStatistics = () => {
  const products = getAllProducts();
  const entries = getAllEntries();
  const exits = getAllExits();

  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.quantite_totale, 0);
  const totalValue = products.reduce((sum, p) => sum + (p.quantite_totale * p.prix_unitaire), 0);

  const lowStockProducts = products.filter(p => p.quantite_totale <= p.seuil_minimum && p.quantite_totale > 0).length;
  const outOfStockProducts = products.filter(p => p.quantite_totale === 0).length;

  // Alertes de péremption (30 jours)
  const today = new Date();
  const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expiringProducts = products.filter(p => {
    if (!p.date_peremption) return false;
    const expDate = new Date(p.date_peremption);
    return expDate <= in30Days && expDate >= today;
  }).length;

  const expiredProducts = products.filter(p => {
    if (!p.date_peremption) return false;
    return new Date(p.date_peremption) < today;
  }).length;

  // Mouvements du mois
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const entriesThisMonth = entries.filter(e => new Date(e.date_entree) >= firstDayOfMonth);
  const exitsThisMonth = exits.filter(e => new Date(e.date_sortie) >= firstDayOfMonth);

  const totalEntriesValue = entriesThisMonth.reduce((sum, e) => sum + e.valeur_totale, 0);
  const totalExitsValue = exitsThisMonth.reduce((sum, e) => sum + e.valeur_totale, 0);

  return {
    totalProducts,
    totalStock,
    totalValue,
    lowStockProducts,
    outOfStockProducts,
    expiringProducts,
    expiredProducts,
    entriesThisMonth: entriesThisMonth.length,
    exitsThisMonth: exitsThisMonth.length,
    totalEntriesValue,
    totalExitsValue,
    alertsCount: lowStockProducts + outOfStockProducts + expiringProducts + expiredProducts,
  };
};

// ==================== INITIALISATION ====================

export const initializeDatabase = () => {
  // Vérifier si déjà initialisé
  const products = getAllProducts();
  if (products.length > 0) return;

  // Créer des données de démonstration
  const demoSuppliers: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>[] = [
    {
      nom: 'Bio-Lab Supply',
      contact: 'Jean Dupont',
      email: 'contact@biolab.cm',
      telephone: '+237 699 123 456',
      adresse: 'Boulevard de la Liberté',
      ville: 'Douala',
      pays: 'Cameroun',
    },
    {
      nom: 'Scientific Solutions',
      contact: 'Marie Kamga',
      email: 'info@scisolutions.cm',
      telephone: '+237 677 234 567',
      adresse: 'Avenue Kennedy',
      ville: 'Yaoundé',
      pays: 'Cameroun',
    },
  ];

  demoSuppliers.forEach(s => createSupplier(s));

  console.log('✅ Base de données initialisée avec des données de démonstration');
};
