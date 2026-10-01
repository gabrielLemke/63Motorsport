import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/auth.controller.js';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/auth/login', AuthController.login);
  fastify.get('/auth/me', AuthController.me);
}
