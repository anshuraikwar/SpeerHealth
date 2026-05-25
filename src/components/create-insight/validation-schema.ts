import { z } from 'zod';

export const insightSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters'),

  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .optional(),

  priority: z.string().min(1, 'Priority is required'),

  category: z.string().optional(),

  stage: z.string(),

  linkedHCP: z.string().optional(),

  drugName: z.string().optional(),

  tags: z.array(z.string()).optional(),
});

export type InsightFormValues = z.infer<typeof insightSchema>;