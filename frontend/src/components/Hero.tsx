import React from 'react';
import { DynoTelemetryCard } from './DynoTelemetryCard';
import { DynoProject } from '../types';

interface HeroProps {
  onOpenQuote: () => void;
  projects: DynoProject[];
}

export const Hero: React.FC<HeroProps> = ({ onOpenQuote, projects }) => {
  return (
    <section className="relative overflow-hidden carbon-pattern border-b border-zinc-800 py-8 xs:py-12 sm:py-16 lg:py-24">
      <div className="absolute inset-0 bg-gradient-to-t from-[#090A0D] via-transparent to-transparent pointer-events-none"></div>
      
      <div className="relative max-w-7xl mx-auto px-3.5 sm:px-6 grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Coluna de Texto e Apresentação */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6">
          <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-zinc-800/80 border border-zinc-700 text-[9.5px] sm:text-xs font-mono text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0"></span>
            <span className="truncate">PREPARAÇÃO • REMAP • MECÂNICA DE PERFORMANCE</span>
          </div>

          <h1 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase font-racing leading-[1.12] sm:leading-[1.05]">
            Potência que você sente.<br className="hidden xs:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-400 to-zinc-600 block xs:inline mt-0.5 xs:mt-0">
              {" "}Precisão de pista.
            </span>
          </h1>

          <p className="text-xs xs:text-sm sm:text-base lg:text-lg text-zinc-400 max-w-2xl leading-relaxed">
            Na <strong className="text-white">63 Motorsport</strong>, transformamos carros de rua e pista através de engenharia mecânica de precisão, calibrações personalizadas em dinamômetro e peças de altíssima performance.
          </p>

          {/* Grid de Métricas Responsivo */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-3 sm:pt-4 border-t border-zinc-800/80 font-mono text-center sm:text-left">
            <div className="bg-zinc-900/60 sm:bg-transparent p-2.5 sm:p-0 rounded-lg sm:rounded-none border border-zinc-800 sm:border-0 shadow-sm sm:shadow-none">
              <div className="text-lg xs:text-xl sm:text-3xl font-black text-white">+500</div>
              <div className="text-[8.5px] xs:text-[9.5px] sm:text-[11px] text-zinc-400 uppercase tracking-tight sm:tracking-wider mt-0.5">
                Carros Acertados
              </div>
            </div>
            <div className="bg-zinc-900/60 sm:bg-transparent p-2.5 sm:p-0 rounded-lg sm:rounded-none border border-zinc-800 sm:border-0 shadow-sm sm:shadow-none">
              <div className="text-lg xs:text-xl sm:text-3xl font-black text-white">100%</div>
              <div className="text-[8.5px] xs:text-[9.5px] sm:text-[11px] text-zinc-400 uppercase tracking-tight sm:tracking-wider mt-0.5">
                Dyno Verified
              </div>
            </div>
            <div className="bg-zinc-900/60 sm:bg-transparent p-2.5 sm:p-0 rounded-lg sm:rounded-none border border-zinc-800 sm:border-0 shadow-sm sm:shadow-none">
              <div className="text-lg xs:text-xl sm:text-3xl font-black text-red-500">STAGE 1-3</div>
              <div className="text-[8.5px] xs:text-[9.5px] sm:text-[11px] text-zinc-400 uppercase tracking-tight sm:tracking-wider mt-0.5">
                Custom Tunes
              </div>
            </div>
          </div>

          {/* Botões de Ação Mobile Friendly */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-4 pt-2 sm:pt-4">
            <button
              onClick={onOpenQuote}
              className="w-full sm:w-auto px-6 sm:px-7 py-3.5 bg-red-600 hover:bg-red-500 active:scale-[0.98] text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-lg transition-all shadow-[0_0_25px_rgba(239,68,68,0.3)] text-center cursor-pointer min-h-[46px] flex items-center justify-center font-mono"
            >
              Solicitar Orçamento
            </button>
            <a
              href="#dinamometro"
              className="w-full sm:w-auto px-6 sm:px-7 py-3.5 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80 font-bold text-xs sm:text-sm uppercase tracking-wider rounded-lg transition-all text-center min-h-[46px] flex items-center justify-center font-mono"
            >
              Ver Telemetria & Gráficos
            </a>
          </div>
        </div>

        {/* Coluna do Card de Telemetria */}
        <div className="lg:col-span-5 w-full">
          <DynoTelemetryCard projects={projects} />
        </div>

      </div>
    </section>
  );
};
