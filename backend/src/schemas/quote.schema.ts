import { z } from 'zod';

export const createQuoteSchema = z.object({
  name: z
    .string({ required_error: 'Nome é obrigatório' })
    .trim()
    .min(2, 'Nome deve conter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo'),
  phone: z
    .string({ required_error: 'Telefone/WhatsApp é obrigatório' })
    .trim()
    .regex(/^[0-9+()\-\s]{8,20}$/, 'Número de telefone ou WhatsApp inválido'),
  email: z
    .string()
    .trim()
    .email('E-mail em formato inválido')
    .optional()
    .or(z.literal('')),
  vehicle: z
    .string({ required_error: 'Veículo é obrigatório' })
    .trim()
    .min(2, 'Informe o modelo e motorização do veículo (ex: Golf GTI 2.0, BMW 320i)')
    .max(100),
  service: z
    .enum(
      [
        'REMAP_STAGE1',
        'REMAP_STAGE2',
        'REMAP_STAGE3',
        'FORGED_ENGINE',
        'DYNO_TUNING',
        'TRACK_PREP',
        'MAINTENANCE',
        'OTHER'
      ],
      {
        errorMap: () => ({ message: 'Selecione um serviço automotivo válido' })
      }
    ),
  message: z
    .string()
    .trim()
    .max(1000, 'Mensagem deve ter no máximo 1000 caracteres')
    .optional()
});

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
