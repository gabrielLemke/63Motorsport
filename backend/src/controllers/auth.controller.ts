import { FastifyReply, FastifyRequest } from 'fastify';
import { loginSchema } from '../schemas/auth.schema.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@63motorsport.com.br';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const OPERATOR_EMAIL = process.env.OPERATOR_EMAIL || 'operador@63motorsport.com.br';
const OPERATOR_PASSWORD = process.env.OPERATOR_PASSWORD || 'operador123';

export class AuthController {
  static async login(request: FastifyRequest, reply: FastifyReply) {
    const { email, password } = loginSchema.parse(request.body);
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Perfil Diretoria / Admin Completo
    if (
      (normalizedEmail === ADMIN_EMAIL.toLowerCase() ||
        normalizedEmail === 'diretoria@63motorsport.com.br' ||
        normalizedEmail === 'admin@63.com') &&
      password === ADMIN_PASSWORD
    ) {
      const user = {
        email: normalizedEmail,
        name: 'Gabriel Lemke // Diretoria 63',
        role: 'DIRECTOR' as const,
        specialty: 'Diretoria & Engenharia Chefe'
      };
      const token = await reply.jwtSign(user, { expiresIn: '7d' });

      return reply.status(200).send({
        success: true,
        message: 'Autenticado como Diretoria na central 63 Motorsport.',
        token,
        user
      });
    }

    // 2. Perfil Operador / Pátio / Preparador
    if (
      (normalizedEmail === OPERATOR_EMAIL.toLowerCase() ||
        normalizedEmail === 'mecanico@63motorsport.com.br' ||
        normalizedEmail === 'patio@63motorsport.com.br') &&
      (password === OPERATOR_PASSWORD || password === 'admin123')
    ) {
      const user = {
        email: normalizedEmail,
        name: 'Lucas M. // Operador Chefe de Pátio',
        role: 'OPERATOR' as const,
        specialty: 'Mecânica de Performance & Vistoria'
      };
      const token = await reply.jwtSign(user, { expiresIn: '7d' });

      return reply.status(200).send({
        success: true,
        message: 'Autenticado como Operador Técnico 63 Motorsport.',
        token,
        user
      });
    }

    return reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Credenciais inválidas. Utilize o acesso de Diretoria ou de Operador.'
    });
  }

  static async me(request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
      return reply.send({
        authenticated: true,
        user: request.user
      });
    } catch {
      return reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Token expirado ou inválido.'
      });
    }
  }
}
