import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Smartphone, LayoutDashboard, Package, ShoppingCart, Users, Plus, LogOut, Globe } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onOpenAddProduct }) {
  const { logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Boshqaruv paneli', icon: LayoutDashboard },
    { id: 'products', label: 'Mahsulotlar', icon: Package },
    { id: 'orders', label: 'Buyurtmalar', icon: ShoppingCart },
    { id: 'customers', label: 'Mijozlar', icon: Users },
    { id: 'site-editor', label: 'Saytni tahrirlash', icon: Globe },
  ];

  return (
    <aside className="w-64 bg-[#09090b] text-white flex flex-col min-h-screen shrink-0 border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-800/60">
        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white border border-slate-700 shrink-0">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white leading-tight">Xon Bazzar</h2>
          <p className="text-xs text-slate-400">Boshqaruv tizimi</p>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-800 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer Actions */}
      <div className="p-4 space-y-3 border-t border-slate-800/60">
        <button
          onClick={onOpenAddProduct}
          className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-black font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi mahsulot</span>
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Chiqish</span>
        </button>
      </div>
    </aside>
  );
}

