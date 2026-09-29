import { FastifyInstance } from 'fastify';
import { listProjectsHandler } from '../controllers/project.controller.js';

export async function projectRoutes(app: FastifyInstance) {
  app.get('/projects', listProjectsHandler);
}
