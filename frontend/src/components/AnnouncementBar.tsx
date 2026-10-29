import React from 'react';
import { Download } from 'lucide-react';

interface AnnouncementBarProps {
  onInstallApp?: () => void;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ onInstallApp }) => {
  return (
    <div className="border-b border-zinc-800/80 bg-[#0c0e14] px-3 sm:px-4 py-2 text-xs text-zinc-400">
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0"></span>
          <span className="font-mono text-zinc-300 text-[10px] sm:text-xs truncate tracking-tight sm:tracking-normal">
            DINAMÔMETRO ATIVO • OPERAÇÃO & TELEMETRIA
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs shrink-0">
          <span className="hidden md:inline text-zinc-400">STAGE 1 • STAGE 2 • CUSTOM TUNE</span>
          {onInstallApp && (
            <button
              type="button"
              onClick={onInstallApp}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/40 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>Baixar App (iPhone / Android)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
