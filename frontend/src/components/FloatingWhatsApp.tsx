import React from 'react';
import { MessageSquare } from 'lucide-react';

interface FloatingWhatsAppProps {
  onOpenQuote: () => void;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ onOpenQuote }) => {
  return (
    <aside aria-label="Atendimento rápido WhatsApp" className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40">
      <button
        onClick={onOpenQuote}
        aria-label="Falar no WhatsApp com a 63 Motorsport"
        className="group relative flex items-center justify-center w-12 h-12 sm:w-auto sm:h-auto sm:px-5 sm:py-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold rounded-full shadow-[0_4px_25px_rgba(16,185,129,0.6)] transition-all cursor-pointer border border-emerald-400/40"
      >
        {/* Pulsing beacon indicator */}
        <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-200"></span>
        </span>

        <MessageSquare className="w-5 h-5 sm:w-5 sm:h-5 fill-current flex-shrink-0" />
        <span className="hidden sm:inline text-xs uppercase tracking-wider font-semibold ml-2">
          WhatsApp Oficina
        </span>
      </button>
    </aside>
  );
};
