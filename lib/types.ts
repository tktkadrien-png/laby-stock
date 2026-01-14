export interface StockItem {
  id: string;
  nom: string;
  categorie_id: string;
  type_id: string;
  conditionnement_id: string;
  fournisseur: string;
  numero_lot: string;
  date_reception: string;
  date_peremption: string;
  quantite_recue: number;
  quantite_utilisee: number;
  stock_actuel: number;
  emplacement?: string;
  prix_unitaire: number;
  est_en_carton: boolean;
  unite_par_carton?: number;
  cartons_actuels?: number;
  unites_libres?: number;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  nom: string;
  created_at?: string;
}

export interface Type {
  id: string;
  nom: string;
  created_at?: string;
}

export interface Conditionnement {
  id: string;
  nom: string;
  created_at?: string;
}

export interface Entree {
  id: string;
  stock_id: string;
  quantite: number;
  prix_unitaire: number;
  montant_total?: number;
  date_entree: string;
  user_id?: string;
  user_name: string;
  commentaire?: string;
  created_at?: string;
}

export interface Sortie {
  id: string;
  stock_id: string;
  quantite: number;
  prix_unitaire: number;
  montant_total?: number;
  date_sortie: string;
  user_id?: string;
  user_name: string;
  motif?: string;
  created_at?: string;
}

export interface HistoriqueCout {
  id: string;
  type_operation: 'entree' | 'sortie';
  stock_id?: string;
  produit_nom: string;
  quantite: number;
  prix_unitaire: number;
  montant_total: number;
  date_operation: string;
  user_name: string;
  created_at?: string;
}
