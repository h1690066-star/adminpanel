import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, RefreshCw, Plus, ShieldCheck, Calendar, Menu } from 'lucide-react';

export default function Topbar({
  title = 'Boshqaruv paneli',
  search,
  setSearch,
  onRefresh,
  onOpenAddProduct,
  onOpenSidebar,
}) {
  const { user } = useAuth();
  const userName = user?.name || user?.username || 'Bosh Admin';
  const initials =
    userName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || 'AD';

  const todayStr = new Date().toLocaleDateString('uz-UZ', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="min-h-16 py-2.5 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 2xl:px-8 flex items-center justify-between gap-3 sticky top-0 z-20 shadow-2xs">
      {/* Left Title & Live Indicator */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {onOpenSidebar && (
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 shrink-0 cursor-pointer"
            title="Menyu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-base sm:text-lg 2xl:text-xl font-black tracking-tight text-slate-900 truncate">
              {title}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Jonli Baza
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mt-0.5 truncate">
            <Calendar className="w-3 h-3 text-indigo-500 shrink-0" />
            <span className="truncate">Bugun: {todayStr}</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline text-slate-500 font-semibold truncate">
              Xon Bozor Analytics v2.5
            </span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5 2xl:gap-3.5 shrink-0">
        {/* Search Input */}
        <div className="relative w-40 md:w-48 xl:w-56 2xl:w-72 hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={search || ''}
            onChange={(e) => setSearch && setSearch(e.target.value)}
            placeholder="Mahsulot, buyurtma yoki mijoz..."
            className="w-full pl-9 pr-3 py-2 bg-slate-100/80 border border-slate-200/90 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
          />
        </div>

        {/* Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Ma'lumotlarni yangilash"
            className="px-3 py-2 text-slate-600 hover:text-indigo-600 bg-slate-100/80 hover:bg-indigo-50 border border-slate-200/80 rounded-xl transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 text-xs font-bold shrink-0 whitespace-nowrap"
          >
            <RefreshCw className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden xl:inline">Yangilash</span>
          </button>
        )}

        {/* Quick Add Product */}
        {onOpenAddProduct && (
          <button
            onClick={onOpenAddProduct}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer shrink-0 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span>Mahsulot</span>
          </button>
        )}

        <div className="h-6 w-px bg-slate-200 hidden sm:block shrink-0" />

        {/* Admin User Profile */}
        <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 pl-2 pr-3 py-1 rounded-2xl shrink-0">
          <div className="w-7 h-7 bg-gradient-to-br from-indigo-600 to-violet-600 text-white font-black text-[11px] rounded-xl flex items-center justify-center shadow-xs shrink-0">
            {initials}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-extrabold text-slate-900 leading-tight whitespace-nowrap">
              {userName}
            </div>
            <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 whitespace-nowrap">
              <ShieldCheck className="w-3 h-3 shrink-0" />
              <span>Super Admin</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
