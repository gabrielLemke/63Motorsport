import React from 'react';
import { DynoTelemetryCard } from './DynoTelemetryCard';
import { DynoProject } from '../types';

interface HeroProps {
  onOpenQuote: () => void;
  projects: DynoProject[];
}

export const Hero: React.FC<HeroProps> = ({ onOpenQuote, projects }) => {
  return (
    <section className="relative overflow-hidden carbon-pattern border-b border-zinc-800/80 py-8 sm:py-16 lg:py-20 w-full max-w-full">
      <div className="absolute inset-0 bg-gradient-to-t from-[#090A0D] via-transparent to-transparent pointer-events-none"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-8 lg:gap-12 items-center min-w-0 w-full">
        
        {/* Coluna de Texto e Apresentação */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6 min-w-0 w-full">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700/80 text-[11px] sm:text-xs text-zinc-300 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0"></span>
            <span className="font-semibold tracking-wide">PREPARAÇÃO • REMAP • DINAMÔMETRO</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase font-racing leading-[1.08]">
            Potência que você sente.<br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-300 to-zinc-500 block sm:inline">
              {" "}Precisão de pista.
            </span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-zinc-300 max-w-2xl leading-relaxed">
            Na <strong className="text-white font-bold">63 Motorsport</strong>, transformamos carros de rua e pista através de engenharia mecânica de alta precisão, calibrações personalizadas em dinamômetro e soluções mecânicas comprovadas.
          </p>

          {/* Grid de Métricas Limpo e 100% Responsivo */}
          <div className="grid grid-cols-3 gap-2 py-3.5 border-y border-zinc-800/80 w-full min-w-0 text-center sm:text-left">
            <div className="min-w-0 px-1">
              <div className="text-2xl sm:text-3xl font-black text-white leading-none font-racing">+500</div>
              <div className="text-[10px] sm:text-xs text-zinc-400 uppercase tracking-wider mt-1.5 font-medium">
                Carros Acertados
              </div>
            </div>
            <div className="min-w-0 px-1 border-x border-zinc-800/80 sm:border-x-0">
              <div className="text-2xl sm:text-3xl font-black text-white leading-none font-racing">100%</div>
              <div className="text-[10px] sm:text-xs text-zinc-400 uppercase tracking-wider mt-1.5 font-medium">
                Dyno Verified
              </div>
            </div>
            <div className="min-w-0 px-1">
              <div className="text-2xl sm:text-3xl font-black text-red-500 leading-none font-racing">STAGE 1-3</div>
              <div className="text-[10px] sm:text-xs text-zinc-400 uppercase tracking-wider mt-1.5 font-medium">
                Custom Tunes
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              onClick={onOpenQuote}
              className="w-full sm:w-auto px-8 py-4 bg-red-600 hover:bg-red-500 active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-lg transition-all shadow-[0_0_25px_rgba(239,68,68,0.35)] text-center cursor-pointer min-h-[48px] flex items-center justify-center font-racing"
            >
              Solicitar Orçamento
            </button>
            <a
              href="#dinamometro"
              className="w-full sm:w-auto px-8 py-4 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-lg transition-all text-center min-h-[48px] flex items-center justify-center font-racing"
            >
              Ver Telemetria & Gráficos
            </a>
          </div>

        </div>

        {/* Coluna do Card de Telemetria */}
        <div className="lg:col-span-5 w-full min-w-0">
          <DynoTelemetryCard projects={projects} />
        </div>

      </div>
    </section>
  );
};
