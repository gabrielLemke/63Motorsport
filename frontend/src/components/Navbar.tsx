import React, { useState } from 'react';
import { MessageSquare, Menu, X } from 'lucide-react';

interface NavbarProps {
  onOpenQuote: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenQuote }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#090A0D]/90 border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Logo 63 Motorsport */}
        <a href="#" className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group">
          <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-zinc-900 border-2 border-zinc-700 rounded-lg group-hover:border-red-500 transition-colors shadow-lg">
            <span className="font-racing font-black text-xl sm:text-2xl text-white tracking-tighter">63</span>
            <div className="absolute -bottom-1 -right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-600 rounded-sm"></div>
          </div>
          <div className="flex flex-col">
            <span className="font-racing font-black text-lg sm:text-xl tracking-wider text-white uppercase flex items-center gap-1 leading-none">
              MOTORSPORT
            </span>
            <span className="text-[8px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.25em] text-zinc-400 uppercase font-mono mt-1">
              High Performance Lab
            </span>
          </div>
        </a>

        {/* Links Desktop */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-300">
          <a href="#servicos" className="hover:text-white transition-colors">Serviços</a>
          <a href="#dinamometro" className="hover:text-white transition-colors">Dinamômetro</a>
          <a href="#projetos" className="hover:text-white transition-colors">Projetos</a>
          <a
            href="#identidade"
            className="text-red-400 hover:text-red-300 transition-colors font-mono text-xs uppercase px-2.5 py-1 bg-red-950/40 border border-red-800/50 rounded"
          >
            Guia Visual
          </a>
        </nav>

        {/* Ações: CTA WhatsApp & Menu Mobile */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenQuote}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-black bg-white rounded-md hover:bg-zinc-200 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 fill-emerald-600 flex-shrink-0" />
            <span className="hidden xs:inline">Falar no </span>WhatsApp
          </button>

          {/* Toggle Hamburger Mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/60 rounded-lg transition-colors cursor-pointer"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-red-500" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Menu Dropdown Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0e1017] border-b border-zinc-800 px-6 py-4 space-y-3 font-mono text-sm animate-in slide-in-from-top-2 duration-200">
          <a
            href="#servicos"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-zinc-300 hover:text-white py-1.5 border-b border-zinc-800/50"
          >
            &gt; Serviços
          </a>
          <a
            href="#dinamometro"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-zinc-300 hover:text-white py-1.5 border-b border-zinc-800/50"
          >
            &gt; Dinamômetro & Telemetria
          </a>
          <a
            href="#projetos"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-zinc-300 hover:text-white py-1.5 border-b border-zinc-800/50"
          >
            &gt; Projetos & Upgrades
          </a>
          <a
            href="#identidade"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-red-400 font-bold py-1.5"
          >
            &gt; Manual de Identidade Visual
          </a>
        </div>
      )}
    </header>
  );
};
