import { DynoProject, QuoteInput, QuoteResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3334';
const DEFAULT_WHATSAPP_PHONE = import.meta.env.VITE_WHATSAPP_PHONE || '5547999999999';

export async function submitQuote(input: QuoteInput): Promise<QuoteResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/quotes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(input)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao registrar orçamento na API');
    }

    return await res.json();
  } catch (err) {
    console.warn('API backend indisponível ou offline. Gerando redirecionamento direto:', err);

    // Fallback gracioso: gera o link do WhatsApp no cliente para não perder a conversão do lead
    const message = encodeURIComponent(
      `Olá 63 Motorsport! Gostaria de um orçamento para o meu projeto.\n\n` +
      `👤 Nome: ${input.name}\n` +
      `🚗 Veículo: ${input.vehicle}\n` +
      `⚡ Serviço: ${input.service}\n` +
      (input.message ? `📝 Detalhes: ${input.message}\n` : '') +
      `\nAguardo contato!`
    );

    return {
      statusCode: 200,
      message: 'Redirecionando para o WhatsApp da equipe 63 Motorsport...',
      data: {
        quoteId: null,
        whatsappUrl: `https://wa.me/${DEFAULT_WHATSAPP_PHONE}?text=${message}`,
        serviceLabel: input.service
      }
    };
  }
}

export async function fetchDynoProjects(): Promise<DynoProject[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/projects`);
    if (res.ok) {
      const body = await res.json();
      return body.data;
    }
  } catch (err) {
    console.warn('Usando projetos mock padrão:', err);
  }

  // Projetos padrão caso API não esteja ativa
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
