import React from 'react';
import { MessageSquare } from 'lucide-react';

interface FloatingWhatsAppProps {
  onOpenQuote: () => void;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ onOpenQuote }) => {
  return (
    <aside aria-label="Atendimento rápido WhatsApp" className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center">
      <button
        onClick={onOpenQuote}
        aria-label="Falar no WhatsApp"
        className="group relative flex items-center gap-2.5 px-4 py-3 sm:px-5 sm:py-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold rounded-full shadow-[0_4px_25px_rgba(16,185,129,0.5)] transition-all cursor-pointer font-mono text-xs uppercase tracking-wider"
      >
        {/* Pulsing indicator ring */}
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-300"></span>
        </span>

        <MessageSquare className="w-5 h-5 fill-current" />
        <span className="inline text-[11px] sm:text-xs">
          WhatsApp Oficina
        </span>
      </button>
    </aside>
  );
};
