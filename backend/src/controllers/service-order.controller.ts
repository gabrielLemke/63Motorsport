import { FastifyReply, FastifyRequest } from 'fastify';
import { ServiceOrderService, type ServiceOrder } from '../services/service-order.service.js';

export class ServiceOrderController {
  static async listOrders(
    request: FastifyRequest<{ Querystring: { status?: string; search?: string } }>,
    reply: FastifyReply
  ) {
    const { status, search } = request.query;
    const orders = await ServiceOrderService.listOrders({ status, search });
    return reply.status(200).send({
      success: true,
      count: orders.length,
      data: orders
    });
  }

  static async getOrder(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;
    const order = await ServiceOrderService.getOrderById(id);
    if (!order) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Ordem de serviço não encontrada.'
      });
    }
    return reply.status(200).send({
      success: true,
      data: order
    });
  }

  static async createOrder(
    request: FastifyRequest<{ Body: Partial<ServiceOrder> }>,
    reply: FastifyReply
  ) {
    const created = await ServiceOrderService.createOrder(request.body as Partial<ServiceOrder>);
    return reply.status(201).send({
      success: true,
      message: `Ordem de Serviço ${created.osNumber} criada com sucesso.`,
      data: created
    });
  }

  static async updateOrder(
    request: FastifyRequest<{ Params: { id: string }; Body: Partial<ServiceOrder> }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const updated = await ServiceOrderService.updateOrder(id, request.body as Partial<ServiceOrder>);
    if (!updated) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Ordem de serviço não encontrada para atualização.'
      });
    }
    return reply.status(200).send({
      success: true,
      message: `Ordem de Serviço ${updated.osNumber} atualizada.`,
      data: updated
    });
  }

  static async deleteOrder(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;
    const deleted = await ServiceOrderService.deleteOrder(id);
    if (!deleted) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Ordem de serviço não encontrada.'
      });
    }
    return reply.status(200).send({
      success: true,
      message: 'Ordem de serviço removida com sucesso.'
    });
  }
}
