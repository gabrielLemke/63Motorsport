import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function healthCheckHandler(req: FastifyRequest, reply: FastifyReply) {
  let dbStatus = 'disconnected';

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'healthy';
  } catch {
    dbStatus = 'degraded';
  }

  return reply.send({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: '63 Motorsport High Performance API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus
  });
}
