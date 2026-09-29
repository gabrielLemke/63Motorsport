import { FastifyInstance } from 'fastify';
import { createQuoteHandler } from '../controllers/quote.controller.js';

export async function quoteRoutes(app: FastifyInstance) {
  // Rate limiting extra específico para a rota pública de orçamentos (anti-spam / anti-bot)
  app.post(
    '/quotes',
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: '1 hour'
        }
      }
    },
    createQuoteHandler
  );
}
