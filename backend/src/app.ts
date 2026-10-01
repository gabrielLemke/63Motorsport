import fastify, { FastifyError } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import fastifyJwt from '@fastify/jwt';
import { ZodError } from 'zod';
import { healthRoutes } from './routes/health.routes.js';
import { quoteRoutes } from './routes/quote.routes.js';
import { projectRoutes } from './routes/project.routes.js';
import { authRoutes } from './routes/auth.routes.js';
import { adminRoutes } from './routes/admin.routes.js';

export function buildApp() {
  const app = fastify({
    logger:
      process.env.NODE_ENV === 'production'
        ? true
        : {
            transport: {
              target: 'pino-pretty',
              options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname'
              }
            }
          }
  });

  // 1. Cabeçalhos de Segurança HTTP (Helmet)
  app.register(helmet, {
    contentSecurityPolicy: false, // Permitido para APIs REST consumidas por SPA
    crossOriginEmbedderPolicy: false
  });

  // 2. CORS com Origens Permitidas
  const allowedOrigins = (
    process.env.CORS_ORIGIN ||
    'http://localhost:5173,http://localhost:5174,http://localhost:80,http://localhost'
  )
    .split(',')
    .map((o) => o.trim());

  app.register(cors, {
    origin: (origin, cb) => {
      // Permite requisições sem origin (como curl, postman, server-to-server) ou origens permitidas
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        cb(null, true);
        return;
      }
      cb(new Error('Origem não permitida pela política de CORS da 63 Motorsport'), false);
    },
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
  });

  // 3. Rate Limiter Global (Anti-DDoS / Brute Force)
  app.register(rateLimit, {
    max: Number(process.env.RATE_LIMIT_MAX) || 120,
    timeWindow: process.env.RATE_LIMIT_TIME_WINDOW || '1 minute',
    errorResponseBuilder: () => ({
      statusCode: 429,
      error: 'Too Many Requests',
      message: 'Muitas requisições enviadas em curto intervalo. Aguarde antes de tentar novamente.'
    })
  });

  // 4. JWT Authentication Plugin
  app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || '63motorsport-secret-ultra-high-torque-key-2026'
  });

  // 5. Registro de Rotas
  app.register(healthRoutes);
  app.register(quoteRoutes, { prefix: '/api/v1' });
  app.register(projectRoutes, { prefix: '/api/v1' });
  app.register(authRoutes, { prefix: '/api/v1' });
  app.register(adminRoutes, { prefix: '/api/v1' });

  // 6. Tratamento Global de Erros
  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Dados de entrada inválidos',
        issues: error.format()
      });
    }

    if (error.statusCode === 429) {
      return reply.status(429).send({
        statusCode: 429,
        error: 'Too Many Requests',
        message: error.message
      });
    }

    app.log.error(error);

    return reply.status(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message:
        process.env.NODE_ENV === 'production'
          ? 'Ocorreu um erro interno no servidor da 63 Motorsport.'
          : error.message
    });
  });

  // 7. Rota 404 Padronizada
  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      statusCode: 404,
      error: 'Not Found',
      message: `Rota ${request.method} ${request.url} não encontrada na API da 63 Motorsport.`
    });
  });

  return app;
}
