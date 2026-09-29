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
    <section id="servicos" className="py-20 max-w-7xl mx-auto px-6 border-b border-zinc-800">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
        <div>
          <span className="text-xs font-mono text-red-500 uppercase tracking-widest font-semibold">
            O Que Fazemos
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white uppercase font-racing mt-1">
            Especialidades da Oficina
          </h2>
        </div>
        <p className="text-zinc-400 text-sm max-w-md mt-4 md:mt-0">
          Equipamentos de nível profissional e instrumentação completa para garantir máxima entrega de potência com segurança mecânica.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => onSelectService(item.id)}
              className="bg-zinc-900/60 border border-zinc-800 hover:border-zinc-600 rounded-xl p-6 transition-all duration-300 group hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center text-white mb-5 border border-zinc-700 group-hover:border-red-500 transition-colors">
                  <Icon className="w-6 h-6 text-zinc-300 group-hover:text-red-500 transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  {item.desc}
                </p>
              </div>
              <span className="text-xs font-mono text-red-400 font-semibold group-hover:underline inline-flex items-center gap-1">
                Solicitar este serviço &rarr;
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
};
