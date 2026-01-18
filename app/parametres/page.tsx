'use client';

import { useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Settings, Globe, Bell, Package, DollarSign, Calendar, Save, CheckCircle } from 'lucide-react';

export default function ParametresPage() {
  const [saved, setSaved] = useState(false);
  const { settings, updateSettings } = useSettings();

  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    updateSettings(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const langues = [
    { code: 'fr', nom: 'Français', flag: '🇫🇷' },
    { code: 'en', nom: 'English', flag: '🇬🇧' },
    { code: 'es', nom: 'Español', flag: '🇪🇸' },
    { code: 'ar', nom: 'العربية', flag: '🇸🇦' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Paramètres Système</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Configuration de l'application</p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={handleSave}
          disabled={saved}
        >
          {saved ? (
            <>
              <CheckCircle size={20} />
              Enregistré
            </>
          ) : (
            <>
              <Save size={20} />
              Enregistrer
            </>
          )}
        </Button>
      </div>

      {/* Langue & Région */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Globe className="text-blue-800 dark:text-blue-400" size={24} />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Langue & Région</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Langue de l'interface
            </label>
            <select
              value={localSettings.langue}
              onChange={(e) => setLocalSettings({ ...localSettings, langue: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
            >
              {langues.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.nom}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Langue utilisée pour l'affichage de l'application
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Devise
            </label>
            <select
              value={localSettings.devise}
              onChange={(e) => setLocalSettings({ ...localSettings, devise: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
            >
              <option value="FCFA">FCFA (Franc CFA)</option>
              <option value="EUR">EUR (Euro)</option>
              <option value="USD">USD (Dollar)</option>
              <option value="MAD">MAD (Dirham)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Format de date
            </label>
            <select
              value={localSettings.format_date}
              onChange={(e) => setLocalSettings({ ...localSettings, format_date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
            >
              <option value="DD/MM/YYYY">JJ/MM/AAAA (31/12/2025)</option>
              <option value="MM/DD/YYYY">MM/JJ/AAAA (12/31/2025)</option>
              <option value="YYYY-MM-DD">AAAA-MM-JJ (2025-12-31)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fuseau horaire
            </label>
            <select
              value={localSettings.fuseau_horaire}
              onChange={(e) => setLocalSettings({ ...localSettings, fuseau_horaire: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
            >
              <option value="Africa/Dakar">Dakar (GMT+0)</option>
              <option value="Africa/Casablanca">Casablanca (GMT+1)</option>
              <option value="Europe/Paris">Paris (GMT+1)</option>
              <option value="America/New_York">New York (GMT-5)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Bell className="text-blue-800 dark:text-blue-400" size={24} />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notifications & Alertes</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Notifications par email</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Recevoir les alertes importantes par email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.notifications_email}
                onChange={(e) => setLocalSettings({ ...localSettings, notifications_email: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-800"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Alertes stock faible</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Notification quand le stock atteint le seuil</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.notifications_stock_faible}
                onChange={(e) => setLocalSettings({ ...localSettings, notifications_stock_faible: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-800"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Alertes de péremption</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Notification avant expiration des produits</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.notifications_peremption}
                onChange={(e) => setLocalSettings({ ...localSettings, notifications_peremption: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-800"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Seuil de stock faible
              </label>
              <input
                type="number"
                value={localSettings.seuil_stock_faible}
                onChange={(e) => setLocalSettings({ ...localSettings, seuil_stock_faible: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                min="1"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Quantité minimale avant alerte</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Jours avant péremption
              </label>
              <input
                type="number"
                value={localSettings.jours_avant_peremption}
                onChange={(e) => setLocalSettings({ ...localSettings, jours_avant_peremption: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                min="1"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Alerter X jours avant expiration</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Gestion de Stock */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Package className="text-blue-800 dark:text-blue-400" size={24} />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gestion de Stock</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Gestion des cartons</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Activer le suivi des cartons et unités libres</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.gestion_cartons}
                onChange={(e) => setLocalSettings({ ...localSettings, gestion_cartons: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-800"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Validation des sorties</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Vérifier le stock avant les sorties</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.validation_sortie}
                onChange={(e) => setLocalSettings({ ...localSettings, validation_sortie: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-800"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Historique des modifications</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Conserver un journal de toutes les modifications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.historique_modifications}
                onChange={(e) => setLocalSettings({ ...localSettings, historique_modifications: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-800"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Calcul automatique des valeurs</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Calculer automatiquement les montants totaux</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.auto_calcul_valeur}
                onChange={(e) => setLocalSettings({ ...localSettings, auto_calcul_valeur: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-800"></div>
            </label>
          </div>
        </div>
      </Card>

      {/* Affichage */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Settings className="text-blue-800 dark:text-blue-400" size={24} />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Préférences d'Affichage</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Produits par page
            </label>
            <select
              value={localSettings.produits_par_page}
              onChange={(e) => setLocalSettings({ ...localSettings, produits_par_page: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
            >
              <option value="10">10 produits</option>
              <option value="20">20 produits</option>
              <option value="50">50 produits</option>
              <option value="100">100 produits</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Thème de couleur
            </label>
            <select
              value={localSettings.theme_couleur}
              onChange={(e) => setLocalSettings({ ...localSettings, theme_couleur: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
            >
              <option value="blue">Bleu (Défaut)</option>
              <option value="green">Vert</option>
              <option value="purple">Violet</option>
              <option value="red">Rouge</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Current Configuration Summary */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Configuration Actuelle</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400">Langue</p>
            <p className="font-bold text-blue-800 dark:text-blue-400">{langues.find(l => l.code === localSettings.langue)?.nom}</p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400">Devise</p>
            <p className="font-bold text-amber-700 dark:text-amber-400">{localSettings.devise}</p>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400">Notifications</p>
            <p className="font-bold text-green-700 dark:text-green-400">{localSettings.notifications_email ? 'Activées' : 'Désactivées'}</p>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400">Gestion Cartons</p>
            <p className="font-bold text-purple-700 dark:text-purple-400">{localSettings.gestion_cartons ? 'Active' : 'Inactive'}</p>
          </div>
        </div>
      </Card>

      {/* Save Success Message */}
      {saved && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <CheckCircle size={20} />
          <span className="font-semibold">Paramètres enregistrés avec succès!</span>
        </div>
      )}
    </div>
  );
}
