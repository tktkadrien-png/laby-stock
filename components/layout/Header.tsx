'use client';

import { Bell, User } from 'lucide-react';
import { useAlerts } from '@/contexts/AlertContext';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { unreadCount } = useAlerts();
  const router = useRouter();

  const handleBellClick = () => {
    router.push('/notifications');
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 transition-colors">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Page title - will be dynamic later */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Bienvenue sur LABY STOCK</p>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <button
            onClick={handleBellClick}
            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:scale-110 active:scale-95"
            title={unreadCount > 0 ? `${unreadCount} alerte${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}` : 'Aucune alerte'}
          >
            <Bell size={22} className={unreadCount > 0 ? 'text-amber-600' : 'text-gray-600 dark:text-gray-300'} />
            {unreadCount > 0 && (
              <>
                <span className="absolute top-0.5 right-0.5 flex h-5 w-5 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-5 w-5 bg-red-600 text-white text-xs font-bold items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </span>
              </>
            )}
          </button>

          {/* User menu */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-blue-800 dark:bg-blue-600 flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Administrateur</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Admin</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
