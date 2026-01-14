import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'laby-stock',
    },
  },
});

// Types pour la base de données
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          nom: string;
          prenom: string;
          role_id: string;
          telephone: string | null;
          created_at: string;
          updated_at: string;
          last_login: string | null;
          active: boolean;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      roles: {
        Row: {
          id: string;
          nom: string;
          description: string;
          permissions: string[];
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['roles']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['roles']['Insert']>;
      };
      categories: {
        Row: {
          id: string;
          nom: string;
          code: string;
          description: string;
          couleur: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
      };
      types: {
        Row: {
          id: string;
          nom: string;
          code: string;
          description: string;
          categorie_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['types']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['types']['Insert']>;
      };
      fournisseurs: {
        Row: {
          id: string;
          nom: string;
          contact: string;
          email: string | null;
          telephone: string;
          adresse: string;
          ville: string;
          pays: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['fournisseurs']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['fournisseurs']['Insert']>;
      };
      produits: {
        Row: {
          id: string;
          nom: string;
          code: string;
          categorie_id: string;
          type_id: string;
          description: string | null;
          prix_unitaire: number;
          quantite_totale: number;
          quantite_cartons: number;
          pieces_par_carton: number;
          unite: string;
          seuil_minimum: number;
          date_peremption: string | null;
          lot: string | null;
          emplacement: string;
          fournisseur_id: string | null;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['produits']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['produits']['Insert']>;
      };
      entrees: {
        Row: {
          id: string;
          produit_id: string;
          quantite: number;
          cartons: number;
          prix_unitaire: number;
          valeur_totale: number;
          fournisseur_id: string | null;
          date_entree: string;
          lot: string | null;
          date_peremption: string | null;
          notes: string | null;
          user_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['entrees']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['entrees']['Insert']>;
      };
      sorties: {
        Row: {
          id: string;
          produit_id: string;
          quantite: number;
          cartons: number;
          valeur_unitaire: number;
          valeur_totale: number;
          destination: string;
          date_sortie: string;
          motif: string;
          notes: string | null;
          user_id: string;
          validated_by: string | null;
          validated_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['sorties']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['sorties']['Insert']>;
      };
      alertes: {
        Row: {
          id: string;
          type: 'stock_faible' | 'rupture' | 'peremption' | 'perime';
          produit_id: string;
          titre: string;
          message: string;
          niveau: 'info' | 'warning' | 'danger';
          lu: boolean;
          created_at: string;
          read_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['alertes']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['alertes']['Insert']>;
      };
      parametres: {
        Row: {
          id: string;
          user_id: string;
          langue: string;
          devise: string;
          format_date: string;
          fuseau_horaire: string;
          notifications_email: boolean;
          notifications_stock_faible: boolean;
          notifications_peremption: boolean;
          seuil_stock_faible: number;
          jours_avant_peremption: number;
          theme: 'light' | 'dark';
          son_notifications: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['parametres']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['parametres']['Insert']>;
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          table_name: string;
          record_id: string;
          old_values: any;
          new_values: any;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['audit_logs']['Row'], 'id' | 'created_at'>;
        Update: never;
      };
    };
  };
}
