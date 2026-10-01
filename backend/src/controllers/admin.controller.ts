import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { QuoteService } from '../services/quote.service.js';

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONTACTED', 'SCHEDULED', 'COMPLETED', 'CANCELLED'])
});

export class AdminController {
  static async getDashboard(request: FastifyRequest, reply: FastifyReply) {
    const metrics = await QuoteService.getDashboardMetrics();
    return reply.status(200).send({
      success: true,
      data: metrics
    });
  }

  static async listQuotes(request: FastifyRequest<{ Querystring: { status?: string; search?: string } }>, reply: FastifyReply) {
    const { status, search } = request.query;
    const quotes = await QuoteService.listQuotes({ status, search });
    return reply.status(200).send({
      success: true,
      count: quotes.length,
      data: quotes
    });
  }

  static async updateQuoteStatus(
    request: FastifyRequest<{ Params: { id: string }; Body: { status: 'PENDING' | 'CONTACTED' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const { status } = updateStatusSchema.parse(request.body);

    const updated = await QuoteService.updateStatus(id, status);
    if (!updated) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Solicitação de orçamento não encontrada.'
      });
    }

    return reply.status(200).send({
      success: true,
      message: 'Status atualizado com sucesso.',
      data: updated
    });
  }

  static async deleteQuote(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;
    await QuoteService.deleteQuote(id);
    return reply.status(200).send({
      success: true,
      message: 'Solicitação removida com sucesso.'
    });
  }

  static async trackAccess(request: FastifyRequest<{ Body: { path?: string } }>, reply: FastifyReply) {
    const path = request.body?.path || '/';
    await QuoteService.recordAccess(path);
    return reply.status(200).send({ success: true });
  }
}
