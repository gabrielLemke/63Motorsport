import type { ReactNode } from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  Wrench,
  ExternalLink,
  LogOut
} from 'lucide-react';
import { AdminUser } from '../../types/admin';

interface AdminLayoutProps {
  user: AdminUser;
  activeTab: 'dashboard' | 'quotes' | 'orders';
  onSelectTab: (tab: 'dashboard' | 'quotes' | 'orders') => void;
  pendingQuotesCount: number;
  onLogout: () => void;
  onViewSite: () => void;
  children: ReactNode;
}

export function AdminLayout({
  user,
  activeTab,
  onSelectTab,
  pendingQuotesCount,
  onLogout,
  onViewSite,
  children
}: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-[#090A0D] text-slate-100 flex flex-col font-['Inter',sans-serif]">
      {/* Top Motorsport Operational Status Bar */}
      <div className="bg-[#050608] border-b border-white/5 py-1.5 px-4 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-mono text-emerald-400 font-semibold tracking-wider uppercase text-[10px]">
            SISTEMA OPERACIONAL // SERVITEC 4X4 ATIVO
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-[11px] text-slate-500">
          <span>Operador: <strong className="text-slate-300">{user.name}</strong></span>
          <span className="text-white/20">|</span>
          <span className="font-mono">Versão 1.0.0 PROD</span>
        </div>
      </div>

      {/* Main Admin Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#0F1116]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Logo & Badge */}
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xl sm:text-2xl font-black italic tracking-tighter text-white font-['Montserrat']">
                63<span className="text-red-500 font-normal">MOTORSPORT</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-600/20 text-red-400 border border-red-500/30">
                ADMIN
              </span>
            </div>

            {/* Mobile Actions */}
            <div className="flex sm:hidden items-center gap-2">
              <button
                onClick={onViewSite}
                title="Ver Site Público"
                className="p-2 rounded-lg bg-[#181B22] text-slate-300 hover:text-white border border-white/10"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
              <button
                onClick={onLogout}
                title="Sair"
                className="p-2 rounded-lg bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white border border-red-500/20"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#151820] border border-white/5 self-center sm:self-auto w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Telemetria</span>
            </button>

            <button
              onClick={() => onSelectTab('quotes')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all relative ${
                activeTab === 'quotes'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Orçamentos</span>
              {pendingQuotesCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-400 text-black animate-pulse">
                  {pendingQuotesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('orders')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                activeTab === 'orders'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Ordens de Serviço</span>
            </button>
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={onViewSite}
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white px-3 py-2 rounded-lg bg-[#181B22] border border-white/10 hover:border-white/20 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-red-500" />
              Ver Site
            </button>

            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-400 hover:text-white px-3 py-2 rounded-lg bg-red-600/10 hover:bg-red-600 border border-red-500/20 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>

      {/* Admin Footer */}
      <footer className="bg-[#090A0D] border-t border-white/5 py-4 px-6 text-center text-xs text-slate-500">
        <p className="flex items-center justify-center gap-2">
          <span>63 Motorsport Performance Lab & Garage</span>
          <span className="text-white/20">•</span>
          <span>Central Administrativa Segura</span>
        </p>
      </footer>
    </div>
  );
}
