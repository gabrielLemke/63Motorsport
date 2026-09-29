import { z } from 'zod';

export const projectQuerySchema = z.object({
  stage: z.string().optional(),
  featured: z.coerce.boolean().optional()
});

export type ProjectQueryInput = z.infer<typeof projectQuerySchema>;
