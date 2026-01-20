import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// TYPES
// ============================================

export interface Category {
  id: string;
  nom: string;
  code: string;
  couleur: string;
  created_at?: string;
  updated_at?: string;
}

export interface Type {
  id: string;
  nom: string;
  code: string;
  categorie_associee: string;
  created_at?: string;
  updated_at?: string;
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
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  nom: string;
  reference?: string;
  categorie: string;
  type: string;
  fournisseur: string;
  quantite_totale: number;
  quantite_cartons: number;
  unites_par_carton: number;
  unites_libres: number;
  prix_unitaire: number;
  unite: string;
  emplacement?: string;
  date_reception?: string;
  date_peremption?: string;
  lot?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Entree {
  id: string;
  produit_id: string;
  produit_nom: string;
  quantite: number;
  prix_unitaire?: number;
  fournisseur?: string;
  numero_lot?: string;
  date_peremption?: string;
  notes?: string;
  date: string;
  created_at?: string;
}

export interface Sortie {
  id: string;
  produit_id: string;
  produit_nom: string;
  quantite: number;
  motif?: string;
  destinataire?: string;
  notes?: string;
  date: string;
  created_at?: string;
}

export interface Alert {
  id: string;
  type: 'stock_faible' | 'rupture' | 'peremption' | 'perime';
  produit_id: string;
  produit_nom: string;
  titre: string;
  message: string;
  niveau: 'info' | 'warning' | 'danger';
  lu: boolean;
  created_at?: string;
}

// ============================================
// CATEGORIES API
// ============================================
export const categoriesApi = {
  async getAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async create(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, category: Partial<Category>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update(category)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
  }
};

// ============================================
// TYPES API
// ============================================
export const typesApi = {
  async getAll(): Promise<Type[]> {
    const { data, error } = await supabase
      .from('types')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async create(type: Omit<Type, 'id' | 'created_at' | 'updated_at'>): Promise<Type> {
    const { data, error } = await supabase
      .from('types')
      .insert([type])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, type: Partial<Type>): Promise<Type> {
    const { data, error } = await supabase
      .from('types')
      .update(type)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('types').delete().eq('id', id);
    if (error) throw error;
  }
};

// ============================================
// SUPPLIERS API
// ============================================
export const suppliersApi = {
  async getAll(): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from('fournisseurs')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async create(supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>): Promise<Supplier> {
    const { data, error } = await supabase
      .from('fournisseurs')
      .insert([supplier])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, supplier: Partial<Supplier>): Promise<Supplier> {
    const { data, error } = await supabase
      .from('fournisseurs')
      .update(supplier)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('fournisseurs').delete().eq('id', id);
    if (error) throw error;
  }
};

// ============================================
// PRODUCTS API
// ============================================
export const productsApi = {
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('produits')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('produits')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const { data, error } = await supabase
      .from('produits')
      .insert([product])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, product: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from('produits')
      .update(product)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('produits').delete().eq('id', id);
    if (error) throw error;
  }
};

// ============================================
// ENTREES API
// ============================================
export const entreesApi = {
  async getAll(): Promise<Entree[]> {
    const { data, error } = await supabase
      .from('entrees')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(entree: Omit<Entree, 'id' | 'created_at'>): Promise<Entree> {
    const { data, error } = await supabase
      .from('entrees')
      .insert([entree])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('entrees').delete().eq('id', id);
    if (error) throw error;
  }
};

// ============================================
// SORTIES API
// ============================================
export const sortiesApi = {
  async getAll(): Promise<Sortie[]> {
    const { data, error } = await supabase
      .from('sorties')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(sortie: Omit<Sortie, 'id' | 'created_at'>): Promise<Sortie> {
    const { data, error } = await supabase
      .from('sorties')
      .insert([sortie])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('sorties').delete().eq('id', id);
    if (error) throw error;
  }
};

// ============================================
// ALERTS API
// ============================================
export const alertsApi = {
  async getAll(): Promise<Alert[]> {
    const { data, error } = await supabase
      .from('alertes')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getUnread(): Promise<Alert[]> {
    const { data, error } = await supabase
      .from('alertes')
      .select('*')
      .eq('lu', false)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async markAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('alertes')
      .update({ lu: true })
      .eq('id', id);
    if (error) throw error;
  },

  async markAllAsRead(): Promise<void> {
    const { error } = await supabase
      .from('alertes')
      .update({ lu: true })
      .eq('lu', false);
    if (error) throw error;
  },

  async create(alert: Omit<Alert, 'id' | 'created_at'>): Promise<Alert> {
    const { data, error } = await supabase
      .from('alertes')
      .insert([alert])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('alertes').delete().eq('id', id);
    if (error) throw error;
  },

  async deleteByProductId(productId: string): Promise<void> {
    const { error } = await supabase
      .from('alertes')
      .delete()
      .eq('produit_id', productId);
    if (error) throw error;
  }
};

// ============================================
// GENERATE ALERTS
// ============================================
export async function generateAlerts(
  seuilStockFaible: number = 10,
  joursAvantPeremption: number = 30
): Promise<Alert[]> {
  const products = await productsApi.getAll();
  const today = new Date();
  const newAlerts: Alert[] = [];

  for (const product of products) {
    // Delete existing alerts for this product
    try {
      await alertsApi.deleteByProductId(product.id);
    } catch (e) {
      // Ignore if no alerts exist
    }

    // Check for stock issues
    if (product.quantite_totale === 0) {
      const alert = await alertsApi.create({
        type: 'rupture',
        produit_id: product.id,
        produit_nom: product.nom,
        titre: 'Rupture de stock',
        message: `Le produit "${product.nom}" est en rupture de stock`,
        niveau: 'danger',
        lu: false
      });
      newAlerts.push(alert);
    } else if (product.quantite_totale <= seuilStockFaible) {
      const alert = await alertsApi.create({
        type: 'stock_faible',
        produit_id: product.id,
        produit_nom: product.nom,
        titre: 'Stock faible',
        message: `Le produit "${product.nom}" a un stock faible (${product.quantite_totale} ${product.unite} restantes)`,
        niveau: 'warning',
        lu: false
      });
      newAlerts.push(alert);
    }

    // Check for expiration issues
    if (product.date_peremption) {
      const expirationDate = new Date(product.date_peremption);
      const daysRemaining = Math.ceil(
        (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysRemaining < 0) {
        const alert = await alertsApi.create({
          type: 'perime',
          produit_id: product.id,
          produit_nom: product.nom,
          titre: 'Produit périmé',
          message: `Le produit "${product.nom}" est périmé depuis ${Math.abs(daysRemaining)} jours`,
          niveau: 'danger',
          lu: false
        });
        newAlerts.push(alert);
      } else if (daysRemaining <= joursAvantPeremption) {
        const alert = await alertsApi.create({
          type: 'peremption',
          produit_id: product.id,
          produit_nom: product.nom,
          titre: 'Péremption proche',
          message: `Le produit "${product.nom}" expire dans ${daysRemaining} jours`,
          niveau: 'warning',
          lu: false
        });
        newAlerts.push(alert);
      }
    }
  }

  return newAlerts;
}
