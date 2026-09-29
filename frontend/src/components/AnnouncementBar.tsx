import React from 'react';

export const AnnouncementBar: React.FC = () => {
  return (
    <div className="border-b border-zinc-800 bg-[#0e1017] px-4 py-2 text-xs text-zinc-400">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span className="font-mono text-zinc-300 text-[11px] sm:text-xs">
            DINAMÔMETRO ATIVO • CALIBRAÇÕES EM TEMPO REAL
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-4 font-mono text-xs">
          <span>STAGE 1 • STAGE 2 • CUSTOM TUNE</span>
          <span className="text-zinc-600">|</span>
          <span className="text-red-400 font-semibold">PREPARAÇÃO & OFICINA ESPECIALIZADA</span>
        </div>
      </div>
    </div>
  );
};
