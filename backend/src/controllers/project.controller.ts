import { FastifyReply, FastifyRequest } from 'fastify';
import { projectQuerySchema } from '../schemas/project.schema.js';
import { ProjectService } from '../services/project.service.js';

export async function listProjectsHandler(req: FastifyRequest, reply: FastifyReply) {
  const query = projectQuerySchema.safeParse(req.query);
  const projects = await ProjectService.listProjects(query.success ? query.data : undefined);

  return reply.send({
    statusCode: 200,
    count: projects.length,
    data: projects
  });
}
