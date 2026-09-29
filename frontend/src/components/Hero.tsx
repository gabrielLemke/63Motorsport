import React from 'react';
import { DynoTelemetryCard } from './DynoTelemetryCard';
import { DynoProject } from '../types';

interface HeroProps {
  onOpenQuote: () => void;
  projects: DynoProject[];
}

export const Hero: React.FC<HeroProps> = ({ onOpenQuote, projects }) => {
  return (
    <section className="relative overflow-hidden carbon-pattern border-b border-zinc-800 py-16 lg:py-24">
      <div className="absolute inset-0 bg-gradient-to-t from-[#090A0D] via-transparent to-transparent"></div>
      
      <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center">
        
        {/* Coluna de Texto e Apresentação */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/80 border border-zinc-700 text-xs font-mono text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            PREPARAÇÃO • REMAP • MECÂNICA DE PERFORMANCE
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase font-racing leading-[1.05]">
            Potência que você sente.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-400 to-zinc-600">
              Precisão de pista.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed">
            Na <strong className="text-white">63 Motorsport</strong>, transformamos carros de rua e pista através de engenharia mecânica de precisão, calibrações personalizadas em dinamômetro e peças de altíssima performance.
          </p>

          {/* Grid de Métricas */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-800/80 font-mono">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-white">+500</div>
              <div className="text-[11px] text-zinc-400 uppercase tracking-wider">Carros Acertados</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-white">100%</div>
              <div className="text-[11px] text-zinc-400 uppercase tracking-wider">Dyno Verified</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-red-500">STAGE 1-3</div>
              <div className="text-[11px] text-zinc-400 uppercase tracking-wider">Custom Tunes</div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={onOpenQuote}
              className="px-7 py-3.5 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-sm uppercase tracking-wider rounded-md transition-all shadow-[0_0_25px_rgba(239,68,68,0.3)] cursor-pointer"
            >
              Solicitar Orçamento
            </button>
            <a
              href="#dinamometro"
              className="px-7 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 font-bold text-sm uppercase tracking-wider rounded-md transition-all"
            >
              Ver Telemetria & Gráficos
            </a>
          </div>
        </div>

        {/* Coluna do Card de Telemetria */}
        <div className="lg:col-span-5">
          <DynoTelemetryCard projects={projects} />
        </div>

      </div>
    </section>
  );
};
