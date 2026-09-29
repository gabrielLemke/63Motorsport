import React, { useState } from 'react';
import { DynoProject } from '../types';

interface DynoTelemetryCardProps {
  projects: DynoProject[];
}

export const DynoTelemetryCard: React.FC<DynoTelemetryCardProps> = ({ projects }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const currentProject = projects[selectedIndex] || projects[0];

  if (!currentProject) return null;

  const gainHp = currentProject.tunedHp - currentProject.originalHp;
  const gainTorque = (currentProject.tunedTorque - currentProject.originalTorque).toFixed(1);

  return (
    <div id="dinamometro" className="bg-zinc-900/90 border border-zinc-700/80 rounded-2xl p-6 shadow-2xl relative backdrop-blur-md">
      
      {/* Seletor de Veículos para Telemetria */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 border-b border-zinc-800 scrollbar-none">
        {projects.map((proj, idx) => (
          <button
            key={proj.id}
            onClick={() => setSelectedIndex(idx)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
              selectedIndex === idx
                ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/30'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            {proj.vehicle}
          </button>
        ))}
      </div>

      {/* Header do Card */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
        <div>
          <span className="text-xs font-mono text-red-400 uppercase font-semibold">
            {currentProject.engine}
          </span>
          <h3 className="text-lg font-bold text-white mt-0.5">{currentProject.title}</h3>
        </div>
        <span className="px-2.5 py-1 text-[11px] font-mono bg-zinc-800 border border-zinc-700 rounded text-zinc-300">
          {currentProject.stage}
        </span>
      </div>

      {/* Comparativo de Números: OEM vs 63 Motorsport */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-black/60 border border-zinc-800 rounded-xl p-4">
          <span className="text-xs text-zinc-400 uppercase font-mono">Original (OEM)</span>
          <div className="text-2xl font-bold text-zinc-400 mt-1 font-mono">
            {currentProject.originalHp} <span className="text-xs">WHP</span>
          </div>
          <div className="text-xs text-zinc-400 font-mono mt-1">
            {currentProject.originalTorque.toFixed(1)} kgfm
          </div>
        </div>

        <div className="bg-red-950/20 border border-red-800/60 rounded-xl p-4 relative overflow-hidden">
          <div className="absolute top-2 right-2 text-[10px] font-mono text-red-400 bg-red-900/40 px-1.5 py-0.5 rounded">
            +{gainHp} WHP
          </div>
          <span className="text-xs text-red-400 uppercase font-mono font-bold">63 Motorsport</span>
          <div className="text-2xl font-bold text-white mt-1 font-mono">
            {currentProject.tunedHp} <span className="text-xs text-red-400 font-bold">WHP</span>
          </div>
          <div className="text-xs text-zinc-300 font-mono mt-1">
            {currentProject.tunedTorque.toFixed(1)} kgfm (+{gainTorque} kgfm)
          </div>
        </div>
      </div>

      {/* Gráfico Simulado de Curva de Dinamômetro */}
      <div className="bg-black/70 border border-zinc-800 rounded-xl p-4 mb-4">
        <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-2">
          <span>CURVA DE POTÊNCIA (RPM)</span>
          <span className="text-red-400">Pico: {currentProject.peakRpm.toLocaleString()} RPM • {currentProject.boostPressure} BAR</span>
        </div>
        <div className="h-28 flex items-end gap-1.5 pt-4">
          <div className="flex-1 bg-zinc-800 h-[25%] rounded-t-sm" title="2000 RPM"></div>
          <div className="flex-1 bg-zinc-700 h-[40%] rounded-t-sm" title="3000 RPM"></div>
          <div className="flex-1 bg-zinc-600 h-[65%] rounded-t-sm" title="4000 RPM"></div>
          <div className="flex-1 bg-red-600 h-[85%] rounded-t-sm" title="5000 RPM"></div>
          <div className="flex-1 bg-red-500 h-[100%] rounded-t-sm shadow-[0_0_12px_rgba(239,68,68,0.5)]" title="Pico de Potência"></div>
          <div className="flex-1 bg-red-700 h-[92%] rounded-t-sm" title="Over-rev"></div>
          <div className="flex-1 bg-zinc-700 h-[75%] rounded-t-sm" title="Corte"></div>
        </div>
        <div className="flex justify-between text-[10px] font-mono text-zinc-400 mt-2">
          <span>2.000</span>
          <span>4.000</span>
          <span className="text-red-400 font-bold">{currentProject.peakRpm} (PEAK)</span>
          <span>7.200</span>
        </div>
      </div>

      <div className="text-center text-xs text-zinc-400 font-mono">
        Combustível: <span className="text-zinc-200 font-semibold">{currentProject.fuel}</span>
      </div>

    </div>
  );
};
