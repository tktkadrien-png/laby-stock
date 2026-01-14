'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  Users,
  FileText,
  Settings,
  Menu,
  X,
  Layers,
  Tag
} from 'lucide-react';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Inventaire', href: '/stock', icon: Package },
  { name: 'Entrées', href: '/entrees', icon: ArrowDownToLine },
  { name: 'Sorties', href: '/sorties', icon: ArrowUpFromLine },
  { name: 'Catégories', href: '/categories', icon: Layers },
  { name: 'Types', href: '/types', icon: Tag },
  { name: 'Fournisseurs', href: '/fournisseurs', icon: Users },
  { name: 'Rapports', href: '/rapports', icon: FileText },
  { name: 'Paramètres', href: '/parametres', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-blue-800 text-white hover:bg-blue-900 transition-colors"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-blue-800 text-white w-64 transform transition-transform duration-300 z-40
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-blue-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Package size={28} className="text-blue-900" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-amber-500">LABY STOCK</h1>
              <p className="text-xs text-blue-200">Gestion de Stock</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${
                    isActive
                      ? 'bg-amber-500 text-white shadow-lg'
                      : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                  }
                `}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-700">
          <div className="text-xs text-blue-200 text-center">
            © 2026 LABY STOCK
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
        />
      )}
    </>
  );
}
