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
    <div id="dinamometro" className="bg-zinc-900/95 border border-zinc-700/80 rounded-2xl p-4 sm:p-6 shadow-2xl relative backdrop-blur-xl w-full">
      
      {/* Seletor de Veículos para Telemetria */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2.5 mb-3.5 border-b border-zinc-800/80 scrollbar-none touch-pan-x">
        {projects.map((proj, idx) => (
          <button
            key={proj.id}
            onClick={() => setSelectedIndex(idx)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all cursor-pointer flex-shrink-0 min-h-[34px] flex items-center justify-center ${
              selectedIndex === idx
                ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/30'
                : 'bg-zinc-800/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            {proj.vehicle}
          </button>
        ))}
      </div>

      {/* Header do Card */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between border-b border-zinc-800 pb-3 mb-3.5 gap-1.5 xs:gap-2">
        <div className="min-w-0">
          <span className="text-[10px] sm:text-xs font-mono text-red-400 uppercase font-semibold block tracking-tight">
            {currentProject.engine}
          </span>
          <h3 className="text-sm xs:text-base sm:text-lg font-bold text-white mt-0.5 leading-snug">
            {currentProject.title}
          </h3>
        </div>
        <div className="self-start xs:self-center flex-shrink-0">
          <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9.5px] sm:text-[11px] font-mono bg-zinc-800 border border-zinc-700 rounded text-zinc-300">
            {currentProject.stage}
          </span>
        </div>
      </div>

      {/* Comparativo de Números: OEM vs 63 Motorsport (Sem overlap de badge!) */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-3.5 sm:mb-4">
        
        {/* Box OEM */}
        <div className="bg-black/60 border border-zinc-800 rounded-xl p-3 sm:p-4 flex flex-col justify-between">
          <span className="text-[9.5px] sm:text-xs text-zinc-400 uppercase font-mono tracking-tight">
            Original (OEM)
          </span>
          <div className="my-1">
            <div className="text-xl sm:text-2xl font-black text-zinc-400 font-mono leading-none">
              {currentProject.originalHp} <span className="text-[10px] sm:text-xs font-normal">WHP</span>
            </div>
            <div className="text-[10px] sm:text-xs text-zinc-500 font-mono mt-1">
              {currentProject.originalTorque.toFixed(1)} kgfm
            </div>
          </div>
          <span className="text-[8.5px] sm:text-[9.5px] text-zinc-600 font-mono">Calibração de fábrica</span>
        </div>

        {/* Box 63 Motorsport */}
        <div className="bg-red-950/20 border border-red-800/60 rounded-xl p-3 sm:p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[9.5px] sm:text-xs text-red-400 uppercase font-mono font-bold tracking-tight truncate">
              63 Motorsport
            </span>
            <span className="text-[8.5px] sm:text-[9.5px] font-mono text-red-400 bg-red-900/60 px-1.5 py-0.5 rounded font-bold whitespace-nowrap">
              +{gainHp} WHP
            </span>
          </div>

          <div className="my-1">
            <div className="text-xl sm:text-2xl font-black text-white font-mono leading-none">
              {currentProject.tunedHp} <span className="text-[10px] sm:text-xs text-red-400 font-bold">WHP</span>
            </div>
            <div className="text-[10px] sm:text-xs text-zinc-300 font-mono mt-1">
              {currentProject.tunedTorque.toFixed(1)} kgfm <span className="text-red-400 font-bold">(+{gainTorque})</span>
            </div>
          </div>

          <span className="text-[8.5px] sm:text-[9.5px] text-red-400/80 font-mono">Calibração Dinamômetro</span>
        </div>

      </div>

      {/* Gráfico Simulado de Curva de Dinamômetro */}
      <div className="bg-black/70 border border-zinc-800 rounded-xl p-3 sm:p-4 mb-3">
        <div className="flex justify-between items-center text-[9.5px] sm:text-[11px] font-mono text-zinc-400 mb-2">
          <span>CURVA DE POTÊNCIA (RPM)</span>
          <span className="text-red-400 font-bold">{currentProject.peakRpm} RPM • {currentProject.boostPressure} BAR</span>
        </div>

        {/* Barras do Dinamômetro */}
        <div className="h-20 sm:h-28 flex items-end gap-1.5 sm:gap-2 pt-2">
          <div className="flex-1 bg-zinc-800 h-[25%] rounded-t-sm" title="2000 RPM"></div>
          <div className="flex-1 bg-zinc-700 h-[40%] rounded-t-sm" title="3000 RPM"></div>
          <div className="flex-1 bg-zinc-600 h-[65%] rounded-t-sm" title="4000 RPM"></div>
          <div className="flex-1 bg-red-600/80 h-[85%] rounded-t-sm" title="5000 RPM"></div>
          <div className="flex-1 bg-red-500 h-[100%] rounded-t-sm shadow-[0_0_14px_rgba(239,68,68,0.6)]" title="Pico de Potência"></div>
          <div className="flex-1 bg-red-700 h-[92%] rounded-t-sm" title="Over-rev"></div>
          <div className="flex-1 bg-zinc-700 h-[75%] rounded-t-sm" title="Corte"></div>
        </div>

        <div className="flex justify-between text-[8.5px] sm:text-[10px] font-mono text-zinc-500 mt-2 border-t border-zinc-800/80 pt-1">
          <span>2.000</span>
          <span>4.000</span>
          <span className="text-red-400 font-bold">{currentProject.peakRpm} (PEAK)</span>
          <span>7.200</span>
        </div>
      </div>

      {/* Upgrades Instalados (Toggle expansível para Mobile) */}
      <div className="border border-zinc-800/80 rounded-lg p-2.5 bg-black/40 text-xs font-mono">
        <button
          onClick={() => setShowMods(!showMods)}
          className="w-full flex items-center justify-between text-zinc-300 hover:text-white transition-colors cursor-pointer select-none text-[11px]"
        >
          <span className="flex items-center gap-1.5 font-bold">
            <Wrench className="w-3.5 h-3.5 text-red-500" />
            Upgrades Instalados ({currentProject.mods?.length || 0})
          </span>
          <ChevronRight className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${showMods ? 'rotate-90 text-red-500' : ''}`} />
        </button>

        {showMods && (
          <ul className="mt-2 space-y-1.5 pt-2 border-t border-zinc-800 text-[10.5px] text-zinc-400 animate-in fade-in duration-150">
            {currentProject.mods?.map((mod, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-red-500 font-bold">›</span>
                <span>{mod}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="text-center text-[10px] sm:text-xs text-zinc-500 font-mono mt-3">
        Combustível Calibrado: <span className="text-zinc-300 font-semibold">{currentProject.fuel}</span>
      </div>

    </div>
  );
};
