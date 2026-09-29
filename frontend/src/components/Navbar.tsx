import React from 'react';
import { MessageSquare } from 'lucide-react';

interface NavbarProps {
  onOpenQuote: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenQuote }) => {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#090A0D]/90 border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Logo 63 Motorsport */}
        <a href="#" className="flex items-center gap-3 cursor-pointer group">
          <div className="relative flex items-center justify-center w-12 h-12 bg-zinc-900 border-2 border-zinc-700 rounded-lg group-hover:border-red-500 transition-colors shadow-lg">
            <span className="font-racing font-black text-2xl text-white tracking-tighter">63</span>
            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-sm"></div>
          </div>
          <div className="flex flex-col">
            <span className="font-racing font-black text-xl tracking-wider text-white uppercase flex items-center gap-1">
              MOTORSPORT
            </span>
            <span className="text-[10px] tracking-[0.25em] text-zinc-400 uppercase font-mono">
              High Performance Lab
            </span>
          </div>
        </a>

        {/* Links de Navegação */}
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

        {/* Botão de Ação Primária */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenQuote}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-black bg-white rounded-md hover:bg-zinc-200 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-emerald-600 fill-emerald-600" />
            Falar no WhatsApp
          </button>
        </div>

      </div>
    </header>
  );
};
