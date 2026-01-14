'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:scale-110 active:scale-95"
      title={theme === 'light' ? 'Activer le mode sombre' : 'Activer le mode clair'}
    >
      {theme === 'light' ? (
        <Moon size={20} className="text-gray-600" />
      ) : (
        <Sun size={20} className="text-amber-500" />
      )}
    </button>
  );
}
