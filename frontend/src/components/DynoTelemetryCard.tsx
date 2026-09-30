import React, { useState } from 'react';
import { DynoProject } from '../types';
import { ChevronRight, Wrench } from 'lucide-react';

interface DynoTelemetryCardProps {
  projects: DynoProject[];
}

export const DynoTelemetryCard: React.FC<DynoTelemetryCardProps> = ({ projects }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showMods, setShowMods] = useState(false);
  const currentProject = projects[selectedIndex] || projects[0];

  if (!currentProject) return null;

  const gainHp = currentProject.tunedHp - currentProject.originalHp;
  const gainTorque = (currentProject.tunedTorque - currentProject.originalTorque).toFixed(1);

  return (
    <div id="dinamometro" className="bg-zinc-900/95 border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-2xl relative backdrop-blur-xl w-full max-w-full min-w-0 overflow-hidden">
      
      {/* Seletor de Veículos para Telemetria */}
      <div className="w-full max-w-full min-w-0 overflow-hidden pb-1 mb-3.5 border-b border-zinc-800/80">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none touch-pan-x w-full">
          {projects.map((proj, idx) => (
            <button
              key={proj.id}
              onClick={() => setSelectedIndex(idx)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 min-h-[34px] flex items-center justify-center ${
                selectedIndex === idx
                  ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/30'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700'
              }`}
            >
              {proj.vehicle}
            </button>
          ))}
        </div>
      </div>

      {/* Header do Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800/80 pb-3 mb-3.5 gap-1.5 sm:gap-2 min-w-0">
        <div className="min-w-0 flex-1">
          <span className="text-[11px] sm:text-xs text-red-500 font-bold uppercase tracking-wider block">
            {currentProject.engine}
          </span>
          <h3 className="text-base sm:text-lg font-bold text-white mt-0.5 leading-snug">
            {currentProject.title}
          </h3>
        </div>
        <div className="self-start sm:self-center flex-shrink-0">
          <span className="px-2.5 py-1 text-[11px] font-mono bg-zinc-800 border border-zinc-700 rounded text-zinc-200 font-bold">
            {currentProject.stage}
          </span>
        </div>
      </div>

      {/* Comparativo de Números: OEM vs 63 Motorsport (100% responsivo e sem overlap) */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 mb-3.5 w-full min-w-0">
        
        {/* Box OEM */}
        <div className="bg-black/60 border border-zinc-800 rounded-xl p-3 sm:p-4 min-w-0 flex flex-col justify-between">
          <span className="text-[10px] sm:text-xs text-zinc-400 uppercase font-semibold tracking-wider">
            Original (OEM)
          </span>
          <div className="my-1.5 min-w-0">
            <div className="text-2xl sm:text-3xl font-black text-zinc-400 font-racing leading-none">
              {currentProject.originalHp} <span className="text-xs sm:text-sm font-normal font-sans">WHP</span>
            </div>
            <div className="text-xs sm:text-sm text-zinc-400 font-mono mt-1">
              {currentProject.originalTorque.toFixed(1)} kgfm
            </div>
          </div>
          <span className="text-[10px] text-zinc-500">De fábrica</span>
        </div>

        {/* Box 63 Motorsport */}
        <div className="bg-red-950/25 border border-red-800/60 rounded-xl p-3 sm:p-4 min-w-0 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1 min-w-0">
            <span className="text-[10px] sm:text-xs text-red-400 uppercase font-bold tracking-wider truncate">
              63 Motorsport
            </span>
            <span className="text-[9.5px] font-mono text-red-300 bg-red-900/70 px-1.5 py-0.5 rounded font-bold whitespace-nowrap flex-shrink-0">
              +{gainHp} WHP
            </span>
          </div>

          <div className="my-1.5 min-w-0">
            <div className="text-2xl sm:text-3xl font-black text-white font-racing leading-none">
              {currentProject.tunedHp} <span className="text-xs sm:text-sm font-bold text-red-500 font-sans">WHP</span>
            </div>
            <div className="text-xs sm:text-sm text-zinc-200 font-mono mt-1 font-semibold">
              {currentProject.tunedTorque.toFixed(1)} kgfm <span className="text-red-400 font-bold">(+{gainTorque})</span>
            </div>
          </div>

          <span className="text-[10px] text-red-400 font-medium">Acerto Dinamômetro</span>
        </div>

      </div>

      {/* Gráfico Simulado de Curva de Dinamômetro */}
      <div className="bg-black/70 border border-zinc-800 rounded-xl p-3 sm:p-4 mb-3 w-full min-w-0">
        <div className="flex justify-between items-center text-[10px] sm:text-xs text-zinc-300 mb-2 font-mono">
          <span className="font-semibold text-zinc-400">CURVA DE POTÊNCIA</span>
          <span className="text-red-400 font-bold">{currentProject.peakRpm} RPM • {currentProject.boostPressure} BAR</span>
        </div>

        {/* Barras do Dinamômetro */}
        <div className="h-20 sm:h-28 flex items-end gap-1.5 sm:gap-2 pt-2 w-full">
          <div className="flex-1 bg-zinc-800 h-[25%] rounded-t-sm" title="2000 RPM"></div>
          <div className="flex-1 bg-zinc-700 h-[40%] rounded-t-sm" title="3000 RPM"></div>
          <div className="flex-1 bg-zinc-600 h-[65%] rounded-t-sm" title="4000 RPM"></div>
          <div className="flex-1 bg-red-600/80 h-[85%] rounded-t-sm" title="5000 RPM"></div>
          <div className="flex-1 bg-red-500 h-[100%] rounded-t-sm shadow-[0_0_15px_rgba(239,68,68,0.7)]" title="Pico de Potência"></div>
          <div className="flex-1 bg-red-700 h-[92%] rounded-t-sm" title="Over-rev"></div>
          <div className="flex-1 bg-zinc-700 h-[75%] rounded-t-sm" title="Corte"></div>
        </div>

        <div className="flex justify-between text-[10px] font-mono text-zinc-400 mt-2 border-t border-zinc-800/80 pt-1.5">
          <span>2.000</span>
          <span>4.000</span>
          <span className="text-red-400 font-bold">{currentProject.peakRpm} (PICO)</span>
          <span>7.200</span>
        </div>
      </div>

      {/* Upgrades Instalados */}
      <div className="border border-zinc-800 rounded-xl p-3 bg-black/40 text-xs w-full min-w-0">
        <button
          onClick={() => setShowMods(!showMods)}
          className="w-full flex items-center justify-between text-zinc-200 hover:text-white transition-colors cursor-pointer select-none"
        >
          <span className="flex items-center gap-2 font-bold text-xs sm:text-sm">
            <Wrench className="w-4 h-4 text-red-500 flex-shrink-0" />
            Upgrades do Projeto ({currentProject.mods?.length || 0})
          </span>
          <ChevronRight className={`w-4 h-4 text-zinc-400 transition-transform ${showMods ? 'rotate-90 text-red-500' : ''}`} />
        </button>

        {showMods && (
          <ul className="mt-2.5 space-y-1.5 pt-2.5 border-t border-zinc-800 text-xs text-zinc-300 animate-in fade-in duration-150">
            {currentProject.mods?.map((mod, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-red-500 font-bold">›</span>
                <span className="leading-snug">{mod}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="text-center text-xs text-zinc-400 mt-3 font-medium">
        Combustível: <span className="text-white font-bold">{currentProject.fuel}</span>
      </div>

    </div>
  );
};
