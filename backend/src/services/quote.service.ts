import { prisma } from '../lib/prisma.js';
import { CreateQuoteInput } from '../schemas/quote.schema.js';

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

export class QuoteService {
  static async createQuote(input: CreateQuoteInput, ipAddress?: string) {
    let createdQuoteId: string | null = null;

    try {
      const quote = await prisma.quote.create({
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
      createdQuoteId = quote.id;
    } catch (err) {
      console.warn('⚠️ Banco de dados indisponível, gerando link do WhatsApp diretamente:', err);
    }

    // Gerar link formatado do WhatsApp
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
      quoteId: createdQuoteId,
      whatsappUrl,
      serviceLabel: serviceName
    };
  }

  static async listQuotes() {
    return prisma.quote.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }
}
