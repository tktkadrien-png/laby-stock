'use client';

import { useAlerts } from '@/contexts/AlertContext';
import Modal from '@/components/ui/Modal';
import { AlertTriangle, XCircle, AlertCircle, CheckCircle, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useRouter } from 'next/navigation';

export default function AlertPopup() {
  const { alerts, showAlertPopup, setShowAlertPopup, markAllAsRead, markAsRead } = useAlerts();
  const router = useRouter();

  const unreadAlerts = alerts.filter(a => !a.lu);

  const getAlertIcon = (type: string, niveau: string) => {
    if (type === 'rupture' || type === 'perime') {
      return <XCircle size={24} className="text-red-600" />;
    }
    if (type === 'stock_faible' || type === 'peremption') {
      return <AlertTriangle size={24} className="text-amber-600" />;
    }
    return <AlertCircle size={24} className="text-blue-600" />;
  };

  const getAlertBadge = (type: string) => {
    switch (type) {
      case 'rupture':
        return <Badge variant="danger">Rupture</Badge>;
      case 'stock_faible':
        return <Badge variant="warning">Stock Faible</Badge>;
      case 'peremption':
        return <Badge variant="warning">Péremption Proche</Badge>;
      case 'perime':
        return <Badge variant="danger">Périmé</Badge>;
      default:
        return <Badge variant="info">Info</Badge>;
    }
  };

  const handleViewDetails = (produitId: string) => {
    setShowAlertPopup(false);
    router.push('/stock');
  };

  const handleClose = () => {
    markAllAsRead();
    setShowAlertPopup(false);
  };

  if (unreadAlerts.length === 0) {
    return null;
  }

  return (
    <Modal
      isOpen={showAlertPopup}
      onClose={handleClose}
      title="Notifications"
      size="lg"
    >
      <div className="space-y-4">
        {/* Header with count */}
        <div className="flex items-center justify-between pb-4 border-b">
          <div className="flex items-center gap-2">
            <AlertCircle size={24} className="text-blue-800" />
            <div>
              <h3 className="font-semibold text-gray-900">
                {unreadAlerts.length} {unreadAlerts.length === 1 ? 'alerte' : 'alertes'} non {unreadAlerts.length === 1 ? 'lue' : 'lues'}
              </h3>
              <p className="text-sm text-gray-600">Notifications importantes pour votre stock</p>
            </div>
          </div>
        </div>

        {/* Alerts list */}
        <div className="max-h-[400px] overflow-y-auto space-y-3">
          {unreadAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                alert.niveau === 'danger'
                  ? 'bg-red-50 border-red-200'
                  : alert.niveau === 'warning'
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {getAlertIcon(alert.type, alert.niveau)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{alert.titre}</h4>
                    {getAlertBadge(alert.type)}
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewDetails(alert.produit_id)}
                      className="text-xs font-medium text-blue-800 hover:text-blue-900 hover:underline"
                    >
                      Voir les détails
                    </button>
                    <span className="text-xs text-gray-400">•</span>
                    <button
                      onClick={() => markAsRead(alert.id)}
                      className="text-xs font-medium text-gray-600 hover:text-gray-900 hover:underline"
                    >
                      Marquer comme lu
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t">
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">
              {unreadAlerts.filter(a => a.niveau === 'danger').length}
            </p>
            <p className="text-xs text-gray-600">Critiques</p>
          </div>
          <div className="text-center p-3 bg-amber-50 rounded-lg">
            <p className="text-2xl font-bold text-amber-600">
              {unreadAlerts.filter(a => a.niveau === 'warning').length}
            </p>
            <p className="text-xs text-gray-600">Avertissements</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              {unreadAlerts.filter(a => a.niveau === 'info').length}
            </p>
            <p className="text-xs text-gray-600">Info</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="ghost" onClick={handleClose}>
            <CheckCircle size={16} />
            Tout marquer comme lu
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Fermer
          </Button>
        </div>
      </div>
    </Modal>
  );
}
