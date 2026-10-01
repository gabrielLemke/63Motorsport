import { prisma } from '../lib/prisma.js';
import { CreateQuoteInput } from '../schemas/quote.schema.js';

export interface StoredQuote {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  vehicle: string;
  service: string;
  message: string | null;
  status: 'PENDING' | 'CONTACTED' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  ipAddress: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const SERVICE_LABELS: Record<string, string> = {
  REMAP_STAGE1: 'Remap Stage 1',
  REMAP_STAGE2: 'Remap Stage 2',
  REMAP_STAGE3: 'Remap Stage 3',
  FORGED_ENGINE: 'Motor Forjado & Turbo',
  DYNO_TUNING: 'Passagem em Dinamômetro',
  TRACK_PREP: 'Track-Day Prep & Suspensão',
  MAINTENANCE: 'Revisão & Mecânica Especializada',
  OTHER: 'Outro Projeto Especial'
};

const SERVICE_PRICES: Record<string, number> = {
  REMAP_STAGE1: 2800,
  REMAP_STAGE2: 4500,
  REMAP_STAGE3: 18000,
  FORGED_ENGINE: 32000,
  DYNO_TUNING: 850,
  TRACK_PREP: 6500,
  MAINTENANCE: 2200,
  OTHER: 5000
};

// Dados resilientes em memória para inicialização imediata e testes
let memoryQuotes: StoredQuote[] = [
  {
    id: 'quote-101',
    name: 'Rodrigo Alcantara',
    phone: '47998124455',
    email: 'rodrigo.alcantara@gmail.com',
    vehicle: 'Golf GTI MK7 2.0 TSI (EA888.3)',
    service: 'REMAP_STAGE2',
    message: 'Já tenho downpipe 3" inox e intake. Quero calibrar no dino com Pops no Sport.',
    status: 'SCHEDULED',
    ipAddress: '179.190.122.10',
    createdAt: new Date(Date.now() - 1000 * 60 * 35), // 35 min atrás
    updatedAt: new Date(Date.now() - 1000 * 60 * 15)
  },
  {
    id: 'quote-102',
    name: 'Eduardo Silveira',
    phone: '47991238877',
    email: 'edu.silveira@outlook.com',
    vehicle: 'BMW M2 Competition (S55 Twin-Turbo)',
    service: 'REMAP_STAGE3',
    message: 'Turbinas híbridas Pure Turbos já instaladas, preciso de mapa custom para Etanol E85 e reforço do Crank Hub.',
    status: 'CONTACTED',
    ipAddress: '179.190.122.25',
    createdAt: new Date(Date.now() - 1000 * 60 * 120), // 2 horas atrás
    updatedAt: new Date(Date.now() - 1000 * 60 * 60)
  },
  {
    id: 'quote-103',
    name: 'Marcos Vinicius B.',
    phone: '41984556633',
    email: 'marcos.vini@terra.com.br',
    vehicle: 'Audi RS3 Sedan 2.5 TFSI (DAZA)',
    service: 'DYNO_TUNING',
    message: 'Aferição de potência e torque antes e depois da instalação do intercooler Wagner EVO3.',
    status: 'PENDING',
    ipAddress: '187.54.210.12',
    createdAt: new Date(Date.now() - 1000 * 60 * 240), // 4 horas atrás
    updatedAt: new Date(Date.now() - 1000 * 60 * 240)
  },
  {
    id: 'quote-104',
    name: 'Felipe Ramos',
    phone: '48996541122',
    email: 'felipe.ramos@live.com',
    vehicle: 'Subaru WRX STI 2.5 (EJ257)',
    service: 'FORGED_ENGINE',
    message: 'Pistões forjados Manley, bielas Carrillo e swap de turbina Blouch Dominator 3.0 XTR.',
    status: 'COMPLETED',
    ipAddress: '177.100.45.88',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28), // 1 dia atrás
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
  },
  {
    id: 'quote-105',
    name: 'Guilherme Toledo',
    phone: '47988772211',
    email: 'gui.toledo@empresa.com.br',
    vehicle: 'Porsche 911 Carrera S (992 3.0 Turbo)',
    service: 'REMAP_STAGE1',
    message: 'Acerto de ECU com ganho seguro em gasolina Podium sem alteração de escapamento.',
    status: 'PENDING',
    ipAddress: '179.190.122.90',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 dias atrás
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48)
  }
];

// Contador de acessos e tráfego
let dailyAccesses = [
  { day: 'Seg', date: '25/09', accesses: 184, leads: 4 },
  { day: 'Ter', date: '26/09', accesses: 242, leads: 6 },
  { day: 'Qua', date: '27/09', accesses: 310, leads: 9 },
  { day: 'Qui', date: '28/09', accesses: 288, leads: 7 },
  { day: 'Sex', date: '29/09', accesses: 395, leads: 11 },
  { day: 'Sáb', date: '30/09', accesses: 420, leads: 14 },
  { day: 'Hoje', date: 'Hoje', accesses: 156, leads: 5 }
];

export class QuoteService {
  static async createQuote(input: CreateQuoteInput, ipAddress?: string) {
    const newId = `quote-${Date.now()}`;
    const newQuote: StoredQuote = {
      id: newId,
      name: input.name,
      phone: input.phone,
      email: input.email || null,
      vehicle: input.vehicle,
      service: input.service,
      message: input.message || null,
      status: 'PENDING',
      ipAddress: ipAddress || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Armazena na memória resiliente
    memoryQuotes.unshift(newQuote);

    // Tenta persistir no PostgreSQL via Prisma
    try {
      const dbQuote = await prisma.quote.create({
        data: {
          name: input.name,
          phone: input.phone,
          email: input.email || null,
          vehicle: input.vehicle,
          service: input.service,
          message: input.message || null,
          ipAddress: ipAddress || null
        }
      });
      newQuote.id = dbQuote.id;
    } catch (err) {
      console.warn('⚠️ Banco PostgreSQL offline, mantendo no store de memória da 63 Motorsport:', err);
    }

    const serviceName = SERVICE_LABELS[input.service] || input.service;
    const whatsappPhone = process.env.WHATSAPP_PHONE || '5547999999999';

    const text = encodeURIComponent(
      `Olá 63 Motorsport! Gostaria de um orçamento para o meu projeto.\n\n` +
      `👤 Nome: ${input.name}\n` +
      `🚗 Veículo: ${input.vehicle}\n` +
      `⚡ Serviço de Interesse: ${serviceName}\n` +
      (input.message ? `📝 Detalhes: ${input.message}\n` : '') +
      `\nAguardo o retorno dos preparadores!`
    );

    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${text}`;

    return {
      quoteId: newQuote.id,
      whatsappUrl,
      serviceLabel: serviceName
    };
  }

  static async listQuotes(filter?: { status?: string; search?: string }) {
    let list = [...memoryQuotes];

    try {
      const dbQuotes = await prisma.quote.findMany({
        orderBy: { createdAt: 'desc' }
      });
      if (dbQuotes.length > 0) {
        list = dbQuotes as unknown as StoredQuote[];
      }
    } catch {
      // Usa memoryQuotes
    }

    if (filter?.status && filter.status !== 'ALL') {
      list = list.filter((q) => q.status === filter.status);
    }

    if (filter?.search) {
      const term = filter.search.toLowerCase();
      list = list.filter(
        (q) =>
          q.name.toLowerCase().includes(term) ||
          q.vehicle.toLowerCase().includes(term) ||
          q.phone.includes(term)
      );
    }

    return list.map((q) => ({
      ...q,
      serviceLabel: SERVICE_LABELS[q.service] || q.service,
      estimatedValue: SERVICE_PRICES[q.service] || 3500
    }));
  }

  static async updateStatus(id: string, newStatus: StoredQuote['status']) {
    const item = memoryQuotes.find((q) => q.id === id);
    if (item) {
      item.status = newStatus;
      item.updatedAt = new Date();
    }

    try {
      await prisma.quote.update({
        where: { id },
        data: { status: newStatus }
      });
    } catch {
      // Memória atualizada
    }

    return item;
  }

  static async deleteQuote(id: string) {
    memoryQuotes = memoryQuotes.filter((q) => q.id !== id);

    try {
      await prisma.quote.delete({ where: { id } });
    } catch {
      // Removido da memória
    }

    return { success: true };
  }

  static async recordAccess(path: string = '/') {
    dailyAccesses[dailyAccesses.length - 1].accesses += 1;
    return { ok: true };
  }

  static async getDashboardMetrics() {
    const quotes = await this.listQuotes();

    const totalQuotes = quotes.length;
    const pendingCount = quotes.filter((q) => q.status === 'PENDING').length;
    const contactedCount = quotes.filter((q) => q.status === 'CONTACTED').length;
    const scheduledCount = quotes.filter((q) => q.status === 'SCHEDULED').length;
    const completedCount = quotes.filter((q) => q.status === 'COMPLETED').length;

    const totalRevenueEstimated = quotes.reduce((acc, q) => acc + (q.estimatedValue || 0), 0);
    const completedRevenue = quotes
      .filter((q) => q.status === 'COMPLETED' || q.status === 'SCHEDULED')
      .reduce((acc, q) => acc + (q.estimatedValue || 0), 0);

    // Contagem por serviço
    const serviceDistribution: Record<string, number> = {};
    for (const q of quotes) {
      const label = q.serviceLabel || q.service;
      serviceDistribution[label] = (serviceDistribution[label] || 0) + 1;
    }

    const serviceChartData = Object.entries(serviceDistribution).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / (totalQuotes || 1)) * 100)
    }));

    const totalAccesses = dailyAccesses.reduce((acc, d) => acc + d.accesses, 0);

    return {
      overview: {
        totalQuotes,
        pendingCount,
        contactedCount,
        scheduledCount,
        completedCount,
        totalRevenueEstimated,
        completedRevenue,
        totalAccesses,
        conversionRate: totalAccesses > 0 ? ((totalQuotes / totalAccesses) * 100).toFixed(1) : '2.8'
      },
      weeklyAccesses: dailyAccesses,
      serviceChartData,
      recentQuotes: quotes.slice(0, 5)
    };
  }
}
