import { DynoProject, QuoteInput, QuoteResponse } from '../types';
import { supabaseRest } from '../lib/supabase';

const DEFAULT_WHATSAPP_PHONE = import.meta.env.VITE_WHATSAPP_PHONE || '5547998821455';

const SERVICE_PRICES: Record<string, { label: string; value: number }> = {
  REMAP_STAGE1: { label: 'Remap ECU Stage 1', value: 2400 },
  REMAP_STAGE2: { label: 'Remap ECU Stage 2 Custom', value: 3500 },
  REMAP_STAGE3: { label: 'Projeto Stage 3 / Big Turbo', value: 12000 },
  DYNO_TUNING: { label: 'Aferição & Acerto em Dinamômetro 4x4', value: 850 },
  FORGED_ENGINE: { label: 'Preparação de Motor Forjado', value: 25000 },
  TRACK_PREP: { label: 'Freios, Suspensão & Track Prep', value: 4200 },
  MAINTENANCE: { label: 'Manutenção Premium & Diagnóstico', value: 1500 }
};

export async function submitQuote(input: QuoteInput): Promise<QuoteResponse> {
  const quoteId = `lead-${Date.now()}`;
  const serviceMeta = SERVICE_PRICES[input.service] || {
    label: input.service.replace(/_/g, ' '),
    value: 3500
  };

  // 1. Grava diretamente no Supabase Cloud (public.quotes)
  try {
    await supabaseRest.upsert(
      'quotes',
      {
        id: quoteId,
        name: input.name,
        phone: input.phone,
        email: input.email || '',
        vehicle: input.vehicle,
        service: input.service,
        service_label: serviceMeta.label,
        message: input.message || '',
        status: 'PENDING',
        estimated_value: serviceMeta.value,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      'id'
    );
  } catch (err) {
    console.warn('Aviso ao gravar orçamento no Supabase (salvo no cache local):', err);
  }

  saveQuoteToLocalStore(input, quoteId, serviceMeta.label, serviceMeta.value);

  const message = encodeURIComponent(
    `🏁 *63 MOTORSPORT // SOLICITAÇÃO DE ORÇAMENTO*\n\n` +
      `👤 *Cliente:* ${input.name}\n` +
      `📱 *WhatsApp:* ${input.phone}\n` +
      `🚗 *Veículo:* ${input.vehicle}\n` +
      `⚡ *Serviço:* ${serviceMeta.label}\n` +
      (input.message ? `📝 *Detalhes:* ${input.message}\n` : '') +
      `\nAguardo retorno da engenharia 63 Motorsport!`
  );

  return {
    statusCode: 201,
    message: 'Orçamento registrado na nuvem 63 Motorsport! Redirecionando para o WhatsApp...',
    data: {
      quoteId,
      whatsappUrl: `https://wa.me/${DEFAULT_WHATSAPP_PHONE}?text=${message}`,
      serviceLabel: serviceMeta.label
    }
  };
}

function saveQuoteToLocalStore(
  input: QuoteInput,
  serverId: string,
  serviceLabel: string,
  estimatedValue: number
) {
  try {
    const STORE_KEY = '63motorsport_admin_local_quotes_v1';
    const raw = localStorage.getItem(STORE_KEY);
    const list = raw ? JSON.parse(raw) : [];

    const newQuote = {
      id: serverId,
      name: input.name,
      phone: input.phone,
      email: input.email || '',
      vehicle: input.vehicle,
      service: input.service,
      serviceLabel,
      message: input.message || '',
      status: 'PENDING',
      estimatedValue,
      createdAt: new Date().toISOString()
    };

    list.unshift(newQuote);
    localStorage.setItem(STORE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('Falha ao salvar no store local:', e);
  }
}

export async function fetchDynoProjects(): Promise<DynoProject[]> {
  return [
    {
      id: 'proj-1',
      slug: 'golf-gti-mk7-stage2',
      title: 'Golf GTI MK7 2.0 TSI - Stage 2 Custom',
      vehicle: 'VW Golf GTI MK7',
      engine: '2.0 TSI (EA888 Gen 3)',
      stage: 'STAGE 2 CUSTOM',
      originalHp: 220,
      originalTorque: 35.0,
      tunedHp: 330,
      tunedTorque: 49.8,
      peakRpm: 6200,
      boostPressure: 1.6,
      fuel: 'Gasolina Podium',
      mods: [
        'Downpipe 3" em Inox 304 com manta térmica',
        'Intake R600 RacingLine',
        'Inlet Pipe & Muffler Delete',
        'Intercooler frontal de alta vazão',
        'Mapa de ECU & TCU 63 Motorsport'
      ],
      isFeatured: true
    },
    {
      id: 'proj-2',
      slug: 'bmw-m2-competition-stage3',
      title: 'BMW M2 Competition - Stage 3 Pure Turbos',
      vehicle: 'BMW M2 Competition (F87)',
      engine: '3.0 Twin-Turbo (S55)',
      stage: 'STAGE 3 FORGED',
      originalHp: 410,
      originalTorque: 56.1,
      tunedHp: 580,
      tunedTorque: 76.5,
      peakRpm: 6800,
      boostPressure: 1.9,
      fuel: 'Etanol E85',
      mods: [
        'Turbinas híbridas Pure Stage 2 High Flow',
        'Charge pipes em alumínio e J-Pipe',
        'Downpipes sem restrição',
        'Bielas e pistões forjados Carrillo',
        'Crank Hub reforçado com 4 pinos'
      ],
      isFeatured: true
    },
    {
      id: 'proj-3',
      slug: 'audi-rs3-8v-stage2-flex',
      title: 'Audi RS3 8V - 2.5 TFSI 5 Cilindros Stage 2 Flex',
      vehicle: 'Audi RS3 Sedan (8V)',
      engine: '2.5 TFSI DAZA 5 Cilindros',
      stage: 'STAGE 2 FLEX',
      originalHp: 400,
      originalTorque: 48.9,
      tunedHp: 535,
      tunedTorque: 69.2,
      peakRpm: 6400,
      boostPressure: 1.7,
      fuel: 'Etanol / Podium Flex',
      mods: [
        'Sensor Flex Fuel com calibração automática',
        'Downpipe 3.5" inox com cat-back esportivo',
        'Inlet 4" CTS Turbo com filtro cônico',
        'Intercooler Wagner Tuning EVO3',
        'Calibração de DSG DQ500'
      ],
      isFeatured: true
    }
  ];
}
