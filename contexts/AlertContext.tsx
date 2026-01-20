'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useData } from './DataContext';
import { useSettings } from './SettingsContext';

export interface Alert {
  id: string;
  type: 'stock_faible' | 'rupture' | 'peremption' | 'perime';
  produit_id: string;
  produit_nom: string;
  titre: string;
  message: string;
  niveau: 'info' | 'warning' | 'danger';
  lu: boolean;
  created_at: string;
}

interface AlertContextType {
  alerts: Alert[];
  unreadCount: number;
  showAlertPopup: boolean;
  setShowAlertPopup: (show: boolean) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refreshAlerts: () => void;
  playNotificationSound: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const { products, isLoading } = useData();
  const { settings } = useSettings();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showAlertPopup, setShowAlertPopup] = useState(false);
  const [hasPlayedSound, setHasPlayedSound] = useState(false);
  const [readAlertIds, setReadAlertIds] = useState<string[]>([]);

  // Fonction pour jouer le son de notification
  const playNotificationSound = useCallback(() => {
    if (settings.son_notifications !== false) {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);

        setTimeout(() => {
          const oscillator2 = audioContext.createOscillator();
          const gainNode2 = audioContext.createGain();

          oscillator2.connect(gainNode2);
          gainNode2.connect(audioContext.destination);

          oscillator2.frequency.value = 1000;
          gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

          oscillator2.start(audioContext.currentTime);
          oscillator2.stop(audioContext.currentTime + 0.3);
        }, 200);
      } catch (e) {
        console.log('Audio notification not supported');
      }
    }
  }, [settings.son_notifications]);

  // Fonction pour générer les alertes basées sur les produits depuis Supabase
  const generateAlerts = useCallback(() => {
    const newAlerts: Alert[] = [];

    if (!products || products.length === 0) return newAlerts;

    const today = new Date();
    const seuilStockFaible = settings.seuil_stock_faible || 10;
    const joursAvantPeremption = settings.jours_avant_peremption || 30;

    products.forEach((product: any) => {
      // Alerte de rupture de stock
      if (product.quantite_totale === 0) {
        newAlerts.push({
          id: `rupture-${product.id}`,
          type: 'rupture',
          produit_id: product.id,
          produit_nom: product.nom,
          titre: 'Rupture de stock',
          message: `Le produit "${product.nom}" est en rupture de stock`,
          niveau: 'danger',
          lu: false,
          created_at: new Date().toISOString(),
        });
      }
      // Alerte de stock faible
      else if (product.quantite_totale <= seuilStockFaible) {
        newAlerts.push({
          id: `stock_faible-${product.id}`,
          type: 'stock_faible',
          produit_id: product.id,
          produit_nom: product.nom,
          titre: 'Stock faible',
          message: `Le produit "${product.nom}" a un stock faible (${product.quantite_totale} ${product.unite} restantes)`,
          niveau: 'warning',
          lu: false,
          created_at: new Date().toISOString(),
        });
      }

      // Alertes de péremption
      if (product.date_peremption) {
        const datePeremption = new Date(product.date_peremption);
        const joursRestants = Math.ceil((datePeremption.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // Produit périmé
        if (joursRestants < 0) {
          newAlerts.push({
            id: `perime-${product.id}`,
            type: 'perime',
            produit_id: product.id,
            produit_nom: product.nom,
            titre: 'Produit périmé',
            message: `Le produit "${product.nom}" est périmé depuis ${Math.abs(joursRestants)} jours`,
            niveau: 'danger',
            lu: false,
            created_at: new Date().toISOString(),
          });
        }
        // Proche de la péremption
        else if (joursRestants <= joursAvantPeremption) {
          newAlerts.push({
            id: `peremption-${product.id}`,
            type: 'peremption',
            produit_id: product.id,
            produit_nom: product.nom,
            titre: 'Péremption proche',
            message: `Le produit "${product.nom}" expire dans ${joursRestants} jours`,
            niveau: 'warning',
            lu: false,
            created_at: new Date().toISOString(),
          });
        }
      }
    });

    return newAlerts;
  }, [products, settings.seuil_stock_faible, settings.jours_avant_peremption]);

  // Fonction pour rafraîchir les alertes
  const refreshAlerts = useCallback(() => {
    if (isLoading) return;

    const newAlerts = generateAlerts();

    // Marquer comme lu les alertes qui étaient déjà lues
    const alertsWithReadStatus = newAlerts.map(alert => ({
      ...alert,
      lu: readAlertIds.includes(alert.id),
    }));

    setAlerts(alertsWithReadStatus);
  }, [generateAlerts, readAlertIds, isLoading]);

  // Charger les alertes quand les produits changent
  useEffect(() => {
    if (!isLoading && products.length > 0) {
      refreshAlerts();
    }
  }, [products, isLoading, refreshAlerts]);

  // Afficher le popup automatiquement au chargement si il y a des alertes non lues
  useEffect(() => {
    const unreadAlerts = alerts.filter(a => !a.lu);
    if (unreadAlerts.length > 0 && !hasPlayedSound) {
      setShowAlertPopup(true);
      playNotificationSound();
      setHasPlayedSound(true);
    }
  }, [alerts, hasPlayedSound, playNotificationSound]);

  // Rafraîchir les alertes toutes les 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refreshAlerts();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refreshAlerts]);

  // Marquer une alerte comme lue
  const markAsRead = (id: string) => {
    setReadAlertIds(prev => [...prev, id]);
    setAlerts(prev => prev.map(alert =>
      alert.id === id ? { ...alert, lu: true } : alert
    ));
  };

  // Marquer toutes les alertes comme lues
  const markAllAsRead = () => {
    const allIds = alerts.map(a => a.id);
    setReadAlertIds(prev => [...new Set([...prev, ...allIds])]);
    setAlerts(prev => prev.map(alert => ({ ...alert, lu: true })));
  };

  const unreadCount = alerts.filter(a => !a.lu).length;

  return (
    <AlertContext.Provider
      value={{
        alerts,
        unreadCount,
        showAlertPopup,
        setShowAlertPopup,
        markAsRead,
        markAllAsRead,
        refreshAlerts,
        playNotificationSound,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
}

export function useAlerts() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
}
