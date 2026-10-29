import { FastifyInstance } from 'fastify';
import { healthCheckHandler } from '../controllers/health.controller.js';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', healthCheckHandler);
  app.get('/api/health', healthCheckHandler);
  app.get('/api/v1/health', healthCheckHandler);
}
