import { FastifyInstance } from 'fastify';
import { AdminController } from '../controllers/admin.controller.js';
import { ServiceOrderController } from '../controllers/service-order.controller.js';

export async function adminRoutes(fastify: FastifyInstance) {
  // Rota pública para contagem de acessos (telemetria do site)
  fastify.post('/admin/track', AdminController.trackAccess);

  // Rotas restritas para administração autenticada
  fastify.register(async (protectedRoutes) => {
    protectedRoutes.addHook('onRequest', async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch {
        return reply.status(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Acesso restrito. Faça login com as credenciais de administrador da 63 Motorsport.'
        });
      }
    });

    // Orçamentos & Leads
    protectedRoutes.get('/admin/dashboard', AdminController.getDashboard);
    protectedRoutes.get('/admin/quotes', AdminController.listQuotes);
    protectedRoutes.patch('/admin/quotes/:id/status', AdminController.updateQuoteStatus);
    protectedRoutes.delete('/admin/quotes/:id', AdminController.deleteQuote);

    // Ordens de Serviço (OS)
    protectedRoutes.get('/admin/orders', ServiceOrderController.listOrders);
    protectedRoutes.get('/admin/orders/:id', ServiceOrderController.getOrder);
    protectedRoutes.post('/admin/orders', ServiceOrderController.createOrder);
    protectedRoutes.put('/admin/orders/:id', ServiceOrderController.updateOrder);
    protectedRoutes.delete('/admin/orders/:id', ServiceOrderController.deleteOrder);
  });
}
