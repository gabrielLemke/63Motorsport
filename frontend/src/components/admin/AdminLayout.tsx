import type { ReactNode } from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  Wrench,
  ExternalLink,
  LogOut,
  ClipboardCheck,
  Car,
  Shield,
  Repeat,
  Download
} from 'lucide-react';
import { AdminUser, AdminTab, UserRole } from '../../types/admin';

interface AdminLayoutProps {
  user: AdminUser;
  effectiveRole: UserRole;
  onToggleRoleView?: () => void;
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  pendingQuotesCount: number;
  onLogout: () => void;
  onViewSite: () => void;
  onInstallApp?: () => void;
  children: ReactNode;
}

export function AdminLayout({
  user,
  effectiveRole,
  onToggleRoleView,
  activeTab,
  onSelectTab,
  pendingQuotesCount,
  onLogout,
  onViewSite,
  onInstallApp,
  children
}: AdminLayoutProps) {
  const isDirectorView = effectiveRole === 'DIRECTOR';

  return (
    <div className="min-h-screen bg-[#090A0D] text-slate-100 flex flex-col font-['Inter',sans-serif] pb-20 lg:pb-0">
      {/* Top Motorsport Operational Status Bar */}
      <div className="bg-[#050608] border-b border-white/5 py-1.5 px-4 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-mono text-emerald-400 font-semibold tracking-wider uppercase text-[10px]">
            APP OPERACIONAL // PÁTIO, CHECKLIST & TELEMETRIA ATIVOS
          </span>
        </div>

        <div className="flex items-center gap-2.5 text-[11px] text-slate-400">
          <span className="hidden sm:inline">
            Usuário: <strong className="text-slate-200">{user.name}</strong>
          </span>

          <span
            className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase border ${
              isDirectorView
                ? 'bg-red-600/20 text-red-400 border-red-500/30'
                : 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30'
            }`}
          >
            {isDirectorView ? 'PERFIL: DIRETORIA' : 'PERFIL: OPERADOR TÉCNICO'}
          </span>

          {user.role === 'DIRECTOR' && onToggleRoleView && (
            <button
              type="button"
              onClick={onToggleRoleView}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#161922] hover:bg-[#1F2430] text-slate-300 hover:text-white border border-white/10 text-[10px] font-mono transition-colors"
              title="Alternar rapidamente entre a visão completa da Diretoria e a visão técnica de Operador de Pátio"
            >
              <Repeat className="w-3 h-3 text-red-400" />
              <span>{isDirectorView ? 'Simular Visão Operador' : 'Voltar Visão Diretoria'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Admin Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#0F1116]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Logo & Badge */}
          <div className="flex items-center justify-between lg:justify-start gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xl sm:text-2xl font-black italic tracking-tighter text-white font-['Montserrat']">
                63<span className="text-red-500 font-normal">MOTORSPORT</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${
                  isDirectorView
                    ? 'bg-red-600/20 text-red-400 border-red-500/30'
                    : 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30'
                }`}
              >
                <Shield className="w-3 h-3" />
                {isDirectorView ? 'DIRETORIA' : 'OPERAÇÃO'}
              </span>
            </div>

            {/* Mobile Top Right Actions */}
            <div className="flex lg:hidden items-center gap-1.5">
              {onInstallApp && (
                <button
                  onClick={onInstallApp}
                  title="Baixar Aplicativo no Celular"
                  className="px-2.5 py-1.5 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 text-[10px] font-bold uppercase flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>App</span>
                </button>
              )}
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

          {/* Desktop Navigation Tabs */}
          <div className="hidden lg:flex items-center gap-1.5 p-1 rounded-xl bg-[#151820] border border-white/5">
            <button
              onClick={() => onSelectTab('operations')}
              className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                activeTab === 'operations'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Operação / Pátio</span>
            </button>

            <button
              onClick={() => onSelectTab('clients')}
              className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                activeTab === 'clients'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>Clientes & Carros</span>
            </button>

            <button
              onClick={() => onSelectTab('orders')}
              className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                activeTab === 'orders'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Ordens de Serviço</span>
            </button>

            {isDirectorView && (
              <>
                <button
                  onClick={() => onSelectTab('quotes')}
                  className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all relative ${
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
                  onClick={() => onSelectTab('dashboard')}
                  className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Diretoria / KPIs</span>
                </button>
              </>
            )}
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden lg:flex items-center gap-2">
            {onInstallApp && (
              <button
                onClick={onInstallApp}
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-400 hover:text-white px-3 py-2 rounded-lg bg-red-600/15 hover:bg-red-600 border border-red-500/30 transition-all"
                title="Instalar Aplicativo PWA no dispositivo"
              >
                <Download className="w-3.5 h-3.5" />
                Baixar App
              </button>
            )}

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
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 py-5 sm:py-8">
        {children}
      </main>

      {/* Mobile Native-Like Bottom TabBar (Para Uso dos Mecânicos no iPhone e Android) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0D0F15]/95 backdrop-blur-xl border-t border-white/10 px-2 py-1.5 flex items-center justify-around shadow-[0_-10px_25px_rgba(0,0,0,0.6)]">
        <button
          type="button"
          onClick={() => onSelectTab('operations')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold uppercase transition-all ${
            activeTab === 'operations' ? 'text-red-500' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ClipboardCheck className="w-5 h-5 mb-0.5" />
          <span>Pátio</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('clients')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold uppercase transition-all ${
            activeTab === 'clients' ? 'text-red-500' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Car className="w-5 h-5 mb-0.5" />
          <span>Carros</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('orders')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold uppercase transition-all ${
            activeTab === 'orders' ? 'text-red-500' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Wrench className="w-5 h-5 mb-0.5" />
          <span>Ordens OS</span>
        </button>

        {isDirectorView && (
          <>
            <button
              type="button"
              onClick={() => onSelectTab('quotes')}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold uppercase transition-all relative ${
                activeTab === 'quotes' ? 'text-red-500' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ClipboardList className="w-5 h-5 mb-0.5" />
              <span>Orçamentos</span>
              {pendingQuotesCount > 0 && (
                <span className="absolute top-0.5 right-1 w-4 h-4 rounded-full text-[9px] font-black bg-amber-400 text-black flex items-center justify-center">
                  {pendingQuotesCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('dashboard')}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold uppercase transition-all ${
                activeTab === 'dashboard' ? 'text-red-500' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-5 h-5 mb-0.5" />
              <span>Diretoria</span>
            </button>
          </>
        )}
      </nav>

      {/* Admin Footer */}
      <footer className="hidden lg:block bg-[#090A0D] border-t border-white/5 py-4 px-6 text-center text-xs text-slate-500">
        <p className="flex items-center justify-center gap-2">
          <span>63 Motorsport Performance Lab & Garage</span>
          <span className="text-white/20">•</span>
          <span>Aplicativo PWA Operacional (iOS / Android / Desktop)</span>
        </p>
      </footer>
    </div>
  );
}
