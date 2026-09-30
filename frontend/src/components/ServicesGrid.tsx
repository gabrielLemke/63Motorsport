import React from 'react';
import { Zap, Wrench, BarChart3, ShieldCheck } from 'lucide-react';
import { ServiceType } from '../types';

interface ServicesGridProps {
  onSelectService: (service: ServiceType) => void;
}

export const ServicesGrid: React.FC<ServicesGridProps> = ({ onSelectService }) => {
  const services = [
    {
      id: 'REMAP_STAGE2' as ServiceType,
      title: 'Remapeamento de ECU',
      icon: Zap,
      desc: 'Stage 1, Stage 2 e Stage 3 com calibração em tempo real. Pop & Bangs programável, Launch Control e acerto flex fuel.'
    },
    {
      id: 'FORGED_ENGINE' as ServiceType,
      title: 'Motores Forjados & Turbo',
      icon: Wrench,
      desc: 'Montagem de motores com pistões e bielas forjadas, swaps de turbinas híbridas, coletores em inox e intercoolers dimensionados.'
    },
    {
      id: 'DYNO_TUNING' as ServiceType,
      title: 'Dinamômetro Calibrado',
      icon: BarChart3,
      desc: 'Passagens com aferição precisa de torque, potência na roda, AFR (sonda lambda de banda larga), ponto de ignição e pressão de turbo.'
    },
    {
      id: 'TRACK_PREP' as ServiceType,
      title: 'Track-Day & Manutenção',
      icon: ShieldCheck,
      desc: 'Geometria de suspensão, pastilhas e fluídos de competição (RBF 660), barras estabilizadoras, alívio de peso e revisão preventiva.'
    }
  ];

  return (
    <section id="servicos" className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 border-b border-zinc-800/80 w-full max-w-full min-w-0 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12">
        <div>
          <span className="text-[11px] sm:text-xs text-red-500 uppercase tracking-widest font-bold">
            O Que Fazemos
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white uppercase font-racing mt-1">
            Especialidades da Oficina
          </h2>
        </div>
        <p className="text-zinc-400 text-xs sm:text-sm max-w-md mt-3 md:mt-0 leading-relaxed">
          Equipamentos de nível profissional e instrumentação completa para garantir máxima entrega de potência com segurança mecânica.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full min-w-0">
        {services.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => onSelectService(item.id)}
              className="bg-zinc-900/60 border border-zinc-800 hover:border-zinc-600 rounded-xl p-5 sm:p-6 transition-all duration-300 group hover:-translate-y-1 cursor-pointer flex flex-col justify-between active:scale-[0.99] min-w-0"
            >
              <div>
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-white mb-4 sm:mb-5 border border-zinc-700 group-hover:border-red-500 transition-colors">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-300 group-hover:text-red-500 transition-colors" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-2 font-racing">{item.title}</h3>
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">
                  {item.desc}
                </p>
              </div>
              <span className="text-xs text-red-400 font-semibold group-hover:text-red-300 inline-flex items-center gap-1.5 transition-colors">
                Solicitar este serviço &rarr;
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
};
