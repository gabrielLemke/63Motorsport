import React, { useState } from 'react';
import { MessageSquare, Menu, X, ChevronRight, Lock, Download } from 'lucide-react';

interface NavbarProps {
  onOpenQuote: () => void;
  onOpenAdmin?: () => void;
  onInstallApp?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenQuote, onOpenAdmin, onInstallApp }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#090A0D]/95 border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Logo 63 Motorsport */}
        <a href="#" className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none">
          <div className="relative flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 bg-zinc-900 border-2 border-zinc-700 rounded-lg group-hover:border-red-500 transition-colors shadow-lg flex-shrink-0">
            <span className="font-racing font-black text-lg sm:text-2xl text-white tracking-tighter">63</span>
            <div className="absolute -bottom-1 -right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-600 rounded-sm"></div>
          </div>
          <div className="flex flex-col">
            <span className="font-racing font-black text-base sm:text-xl tracking-wider text-white uppercase flex items-center gap-1 leading-none">
              MOTORSPORT
            </span>
            <span className="text-[7.5px] sm:text-[10px] tracking-[0.18em] sm:tracking-[0.25em] text-zinc-400 uppercase font-mono mt-0.5 sm:mt-1">
              High Performance Lab
            </span>
          </div>
        </a>

        {/* Links Desktop */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-7 text-sm font-medium text-zinc-300">
          <a href="#servicos" className="hover:text-white transition-colors">Serviços</a>
          <a href="#dinamometro" className="hover:text-white transition-colors">Dinamômetro</a>
          <a href="#projetos" className="hover:text-white transition-colors">Projetos</a>
          {onInstallApp && (
            <button
              type="button"
              onClick={onInstallApp}
              className="text-red-400 hover:text-white text-xs font-mono uppercase flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-600/15 hover:bg-red-600 border border-red-500/30 transition-colors cursor-pointer"
              title="Baixar Aplicativo 63 Motorsport no iPhone, Android ou Computador"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar App</span>
            </button>
          )}
          {onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="text-zinc-300 hover:text-white text-xs font-mono uppercase flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
              title="Acessar Central de Operação, Pátio e Diretoria da 63 Motorsport"
            >
              <Lock className="w-3 h-3 text-red-500" />
              <span>Operação / Diretoria</span>
            </button>
          )}
        </nav>

        {/* Ações: Botão App Mobile + CTA WhatsApp + Menu Mobile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {onInstallApp && (
            <button
              type="button"
              onClick={onInstallApp}
              className="md:hidden inline-flex items-center justify-center gap-1 px-2.5 py-2 text-[10px] font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 rounded-md shadow-md cursor-pointer h-9"
              title="Baixar Aplicativo"
            >
              <Download className="w-3.5 h-3.5" />
              <span>App</span>
            </button>
          )}

          <button
            onClick={onOpenQuote}
            className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-black bg-white rounded-md hover:bg-zinc-200 active:scale-95 transition-all shadow-[0_0_15px_rgba(255,255,255,0.15)] cursor-pointer h-9 sm:h-10"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600 flex-shrink-0" />
            <span className="hidden xs:inline">Falar no </span>WhatsApp
          </button>

          {/* Toggle Hamburger Mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/60 rounded-lg transition-colors cursor-pointer w-9 h-9 flex items-center justify-center"
            aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-red-500" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Menu Dropdown Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0e1017]/98 border-b border-zinc-800 px-5 py-5 space-y-3 font-mono text-sm animate-in slide-in-from-top-3 duration-200 shadow-2xl backdrop-blur-2xl">
          <a
            href="#servicos"
            onClick={handleNavClick}
            className="flex items-center justify-between text-zinc-300 hover:text-white py-2.5 border-b border-zinc-800/70"
          >
            <span>&gt; Serviços de Preparação</span>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
          </a>
          <a
            href="#dinamometro"
            onClick={handleNavClick}
            className="flex items-center justify-between text-zinc-300 hover:text-white py-2.5 border-b border-zinc-800/70"
          >
            <span>&gt; Dinamômetro & Telemetria</span>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
          </a>
          <a
            href="#projetos"
            onClick={handleNavClick}
            className="flex items-center justify-between text-zinc-300 hover:text-white py-2.5 border-b border-zinc-800/70"
          >
            <span>&gt; Projetos & Upgrades</span>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
          </a>

          {onInstallApp && (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onInstallApp();
              }}
              className="w-full flex items-center justify-between text-red-400 font-bold py-2.5 border-b border-zinc-800/70 text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Download className="w-4 h-4 text-red-500" />
                <span>&gt; Baixar Aplicativo (iPhone / Android)</span>
              </span>
              <ChevronRight className="w-4 h-4 text-red-500/60" />
            </button>
          )}

          {onOpenAdmin && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="w-full flex items-center justify-between text-zinc-300 hover:text-white py-2.5 border-b border-zinc-800/70 text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-red-500" />
                <span>&gt; Operação & Diretoria (Login)</span>
              </span>
              <ChevronRight className="w-4 h-4 text-zinc-600" />
            </button>
          )}

          <div className="pt-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenQuote();
              }}
              className="w-full py-3 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all text-center flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 font-mono"
            >
              <MessageSquare className="w-4 h-4" />
              Solicitar Orçamento no WhatsApp
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
