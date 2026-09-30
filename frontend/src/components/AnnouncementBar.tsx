import React from 'react';

export const AnnouncementBar: React.FC = () => {
  return (
    <div className="border-b border-zinc-800/80 bg-[#0c0e14] px-3 sm:px-4 py-2 text-xs text-zinc-400">
      <div className="max-w-7xl mx-auto flex justify-center sm:justify-between items-center gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0"></span>
          <span className="font-mono text-zinc-300 text-[10px] sm:text-xs truncate tracking-tight sm:tracking-normal">
            DINAMÔMETRO ATIVO • CALIBRAÇÕES EM TEMPO REAL
          </span>
        </div>
        <div className="hidden md:flex items-center gap-4 font-mono text-xs">
          <span>STAGE 1 • STAGE 2 • CUSTOM TUNE</span>
          <span className="text-zinc-600">|</span>
          <span className="text-red-400 font-semibold">PREPARAÇÃO & OFICINA ESPECIALIZADA</span>
        </div>
      </div>
    </div>
  );
};
