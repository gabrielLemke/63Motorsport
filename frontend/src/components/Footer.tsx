import React from 'react';
import { Gauge, MessageSquare } from 'lucide-react';

interface FooterProps {
  onOpenQuote: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenQuote }) => {
  return (
    <footer id="contato" className="py-12 sm:py-16 bg-[#07080a] border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-5 sm:space-y-6">
        
        <div className="inline-block p-2.5 sm:p-3 bg-zinc-900 border border-zinc-800 rounded-full mb-1">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-red-600 rounded-full flex items-center justify-center text-white mx-auto shadow-lg shadow-red-600/40">
            <Gauge className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
        </div>

        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase text-white font-racing tracking-tight leading-tight">
          Pronto para elevar o nível do seu projeto?
        </h2>

        <p className="text-zinc-400 max-w-xl mx-auto text-xs sm:text-sm lg:text-base leading-relaxed">
          Fale diretamente com os nossos preparadores. Agende uma passagem de dinamômetro ou solicite uma consultoria técnica para o seu veículo.
        </p>

        <div className="pt-2">
          <button
            onClick={onOpenQuote}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-lg shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all cursor-pointer active:scale-95"
          >
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 fill-current flex-shrink-0" />
            Agendar Consulta Técnica via WhatsApp
          </button>
        </div>

        <div className="pt-8 sm:pt-12 text-[10px] sm:text-xs text-zinc-500 font-mono border-t border-zinc-900 mt-8 sm:mt-12 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div>
            © 2026 63 MOTORSPORT. TODOS OS DIREITOS RESERVADOS.
          </div>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6 text-zinc-600">
            <span>PREPARAÇÃO DE MOTORES</span>
            <span>•</span>
            <span>DINAMÔMETRO</span>
            <span>•</span>
            <span>REMAP DE ECU</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
