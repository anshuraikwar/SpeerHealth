import { z } from 'zod';

export const insightSchema = z.object({
  priorities: z.array(z.string()).optional(),

  category: z.string().optional(),

  stage: z.string().optional(),

  linkedHCP: z.string().optional(),

  tags: z.array(z.string()).optional(),
});

export type InsightFormValues = z.infer<typeof insightSchema>;