import { FastifyReply, FastifyRequest } from 'fastify';
import { createQuoteSchema } from '../schemas/quote.schema.js';
import { QuoteService } from '../services/quote.service.js';

export async function createQuoteHandler(req: FastifyRequest, reply: FastifyReply) {
  const parseResult = createQuoteSchema.safeParse(req.body);

  if (!parseResult.success) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Dados inválidos no formulário de orçamento',
      issues: parseResult.error.format()
    });
  }

  const clientIp = req.ip;
  const result = await QuoteService.createQuote(parseResult.data, clientIp);

  return reply.status(201).send({
    statusCode: 201,
    message: 'Solicitação de orçamento registrada com sucesso!',
    data: result
  });
}
