import { FastifyReply, FastifyRequest } from 'fastify';
import { loginSchema } from '../schemas/auth.schema.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@63motorsport.com.br';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export class AuthController {
  static async login(request: FastifyRequest, reply: FastifyReply) {
    const { email, password } = loginSchema.parse(request.body);

    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase() || password !== ADMIN_PASSWORD) {
      return reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'E-mail ou senha de administrador incorretos.'
      });
    }

    const token = await reply.jwtSign(
      {
        email: ADMIN_EMAIL,
        role: 'admin',
        name: 'Administrador 63 Motorsport'
      },
      { expiresIn: '7d' }
    );

    return reply.status(200).send({
      success: true,
      message: 'Autenticado com sucesso na central 63 Motorsport.',
      token,
      user: {
        email: ADMIN_EMAIL,
        name: 'Administrador 63 Motorsport',
        role: 'admin'
      }
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
