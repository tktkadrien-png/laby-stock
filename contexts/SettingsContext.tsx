'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Settings {
  // Langue & Région
  langue: string;
  devise: string;
  format_date: string;
  fuseau_horaire: string;

  // Notifications
  notifications_email: boolean;
  notifications_stock_faible: boolean;
  notifications_peremption: boolean;
  son_notifications: boolean;
  seuil_stock_faible: number;
  jours_avant_peremption: number;

  // Gestion de Stock
  gestion_cartons: boolean;
  validation_sortie: boolean;
  historique_modifications: boolean;
  auto_calcul_valeur: boolean;

  // Affichage
  produits_par_page: number;
  afficher_images: boolean;
  theme_couleur: string;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  formatPrice: (price: number) => string;
  formatDate: (date: string) => string;
}

const defaultSettings: Settings = {
  langue: 'fr',
  devise: 'FCFA',
  format_date: 'DD/MM/YYYY',
  fuseau_horaire: 'Africa/Dakar',
  notifications_email: true,
  notifications_stock_faible: true,
  notifications_peremption: true,
  son_notifications: true,
  seuil_stock_faible: 10,
  jours_avant_peremption: 30,
  gestion_cartons: true,
  validation_sortie: true,
  historique_modifications: true,
  auto_calcul_valeur: true,
  produits_par_page: 20,
  afficher_images: true,
  theme_couleur: 'blue',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    // Load settings from localStorage on mount
    const savedSettings = localStorage.getItem('labystockpro-settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Error loading settings:', e);
      }
    }
  }, []);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('labystockpro-settings', JSON.stringify(updated));
      return updated;
    });
  };

  const formatPrice = (price: number): string => {
    const formatter = new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
    });

    switch (settings.devise) {
      case 'EUR':
        return formatter.format(price) + ' €';
      case 'USD':
        return '$' + formatter.format(price);
      case 'MAD':
        return formatter.format(price) + ' MAD';
      case 'FCFA':
      default:
        return formatter.format(price) + ' FCFA';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    switch (settings.format_date) {
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'DD/MM/YYYY':
      default:
        return `${day}/${month}/${year}`;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, formatPrice, formatDate }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
