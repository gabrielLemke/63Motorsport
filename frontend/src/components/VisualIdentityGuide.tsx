import React from 'react';

export const VisualIdentityGuide: React.FC = () => {
  return (
    <section id="identidade" className="py-12 sm:py-16 bg-[#0c0d12] border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="border border-zinc-800 rounded-xl sm:rounded-2xl bg-zinc-900/80 p-5 sm:p-8 shadow-xl">
          
          <div className="flex items-center gap-2.5 sm:gap-3 mb-6">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 flex-shrink-0"></span>
            <h2 className="text-sm sm:text-xl font-bold uppercase tracking-wider text-white font-mono truncate">
              Manual de Identidade Visual Oficial: 63 Motorsport
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. Paleta de Cores */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase font-mono text-zinc-400 tracking-wider">
                1. Paleta de Cores Monocromática
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 sm:p-2.5 rounded bg-[#090A0D] border border-zinc-800">
                  <span className="text-[11px] sm:text-xs font-mono text-zinc-300">Asphalt Black (Fundo)</span>
                  <span className="text-[11px] sm:text-xs font-mono text-zinc-500">#090A0D</span>
                </div>
                <div className="flex items-center justify-between p-2 sm:p-2.5 rounded bg-[#13151A] border border-zinc-800">
                  <span className="text-[11px] sm:text-xs font-mono text-zinc-300">Carbon Graphite (Cards)</span>
                  <span className="text-[11px] sm:text-xs font-mono text-zinc-500">#13151A</span>
                </div>
                <div className="flex items-center justify-between p-2 sm:p-2.5 rounded bg-[#262933] border border-zinc-700">
                  <span className="text-[11px] sm:text-xs font-mono text-zinc-300">Gunmetal (Bordas)</span>
                  <span className="text-[11px] sm:text-xs font-mono text-zinc-400">#262933</span>
                </div>
                <div className="flex items-center justify-between p-2 sm:p-2.5 rounded bg-zinc-100 text-black font-semibold">
                  <span className="text-[11px] sm:text-xs font-mono">Pure Titanium (Destaques)</span>
                  <span className="text-[11px] sm:text-xs font-mono">#FFFFFF</span>
                </div>
                <div className="flex items-center justify-between p-2 sm:p-2.5 rounded bg-red-600 text-white font-semibold">
                  <span className="text-[11px] sm:text-xs font-mono">Tachometer Red (Ação)</span>
                  <span className="text-[11px] sm:text-xs font-mono">#EF4444</span>
                </div>
              </div>
            </div>

            {/* 2. Tipografia */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase font-mono text-zinc-400 tracking-wider">
                2. Tipografia Esportiva
              </h4>
              <div className="bg-black/40 border border-zinc-800 rounded-lg p-3.5 sm:p-4 space-y-3 sm:space-y-4">
                <div>
                  <span className="text-[10px] sm:text-[11px] text-zinc-500 uppercase font-mono">Títulos de Impacto (Racing Display)</span>
                  <div className="font-racing font-black text-xl sm:text-2xl text-white tracking-tight mt-0.5">
                    63 MOTORSPORT
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-zinc-400">Montserrat Black Italic</span>
                </div>
                <div>
                  <span className="text-[10px] sm:text-[11px] text-zinc-500 uppercase font-mono">Telemetria & Dados Técnicos</span>
                  <div className="font-mono text-xs sm:text-sm text-red-400 font-bold mt-0.5">
                    540 WHP • 68.5 KGFM • 1.8 BAR
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-zinc-400">JetBrains Mono</span>
                </div>
                <div>
                  <span className="text-[10px] sm:text-[11px] text-zinc-500 uppercase font-mono">Texto de Leitura (Body)</span>
                  <div className="text-xs sm:text-sm text-zinc-300 mt-0.5">
                    Space Grotesk (Claro, moderno e legível)
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Elementos Gráficos */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase font-mono text-zinc-400 tracking-wider">
                3. Elementos Gráficos
              </h4>
              <ul className="text-xs text-zinc-400 space-y-2.5 bg-black/40 border border-zinc-800 rounded-lg p-3.5 sm:p-4">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></span>
                  <span><strong>Textura Carbon:</strong> micro-pontos sutis para profundidade.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></span>
                  <span><strong>Bordas Técnicas:</strong> traços finos (1px) simulando gauges de painel.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></span>
                  <span><strong>Comparativos Before/After:</strong> gráficos de dinamômetro com ganho.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></span>
                  <span><strong>CTA WhatsApp:</strong> botão de alta conversão fixo e presente.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
