import React from 'react';
import { Gauge, MessageSquare, Lock } from 'lucide-react';

interface FooterProps {
  onOpenQuote: () => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenQuote, onOpenAdmin }) => {
  return (
    <footer id="contato" className="py-12 sm:py-16 bg-[#07080a] border-t border-zinc-800/80 w-full max-w-full min-w-0 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-5 sm:space-y-6">
        
        <div className="inline-block p-2.5 sm:p-3 bg-zinc-900 border border-zinc-800 rounded-full mb-1">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-red-600 rounded-full flex items-center justify-center text-white mx-auto shadow-lg shadow-red-600/40">
            <Gauge className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
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
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-lg shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all cursor-pointer active:scale-95 font-racing"
          >
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 fill-current flex-shrink-0" />
            Agendar Consulta Técnica via WhatsApp
          </button>
        </div>

        <div className="pt-8 sm:pt-12 text-[10px] sm:text-xs text-zinc-500 border-t border-zinc-900 mt-8 sm:mt-12 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div>
            © 2026 63 MOTORSPORT. TODOS OS DIREITOS RESERVADOS.
          </div>
          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6 text-zinc-600 font-medium">
            <span>PREPARAÇÃO DE MOTORES</span>
            <span>•</span>
            <span>DINAMÔMETRO</span>
            <span>•</span>
            <span>REMAP DE ECU</span>
            {onOpenAdmin && (
              <>
                <span>•</span>
                <button
                  onClick={onOpenAdmin}
                  className="text-zinc-500 hover:text-red-400 inline-flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Lock className="w-3 h-3 text-red-500" />
                  <span>Área Restrita / Painel 63</span>
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </footer>
  );
};

