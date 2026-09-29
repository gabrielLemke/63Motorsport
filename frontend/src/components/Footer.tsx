import React from 'react';
import { Gauge, MessageSquare } from 'lucide-react';

interface FooterProps {
  onOpenQuote: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenQuote }) => {
  return (
    <footer id="contato" className="py-16 bg-[#07080a] border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 text-center space-y-6">
        
        <div className="inline-block p-3 bg-zinc-900 border border-zinc-800 rounded-full mb-2">
          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white mx-auto shadow-lg shadow-red-600/40">
            <Gauge className="w-5 h-5 text-white" />
          </div>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black uppercase text-white font-racing tracking-tight">
          Pronto para elevar o nível do seu projeto?
        </h2>

        <p className="text-zinc-400 max-w-xl mx-auto text-sm sm:text-base">
          Fale diretamente com os nossos preparadores. Agende uma passagem de dinamômetro ou solicite uma consultoria técnica para o seu veículo.
        </p>

        <div>
          <button
            onClick={onOpenQuote}
            className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm uppercase tracking-wider rounded-lg shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all cursor-pointer active:scale-95"
          >
            <MessageSquare className="w-5 h-5 fill-current" />
            Agendar Consulta Técnica via WhatsApp
          </button>
        </div>

        <div className="pt-12 text-xs text-zinc-600 font-mono border-t border-zinc-900 mt-12 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            © 2026 63 MOTORSPORT. TODOS OS DIREITOS RESERVADOS. ENGENHARIA DE ALTA PERFORMANCE.
          </div>
          <div className="flex gap-6 text-zinc-500">
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
