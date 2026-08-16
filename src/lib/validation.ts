import { z } from 'zod';

export const sourceInput = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  website_url: z.string().trim().url('Must be a valid URL'),
  rss_url: z.string().trim().url('Must be a valid RSS URL'),
  enabled: z.boolean().default(true),
});

export const topicInput = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80),
  description: z.string().trim().max(500).default(''),
  enabled: z.boolean().default(true),
});

export const settingsInput = z.object({
  only_matching_topics: z.boolean(),
  sort_mode: z.enum(['newest', 'relevance']),
  max_article_age_hours: z.number().int().positive().max(24 * 30),
});

export type SourceInput = z.infer<typeof sourceInput>;
export type TopicInput = z.infer<typeof topicInput>;
export type SettingsInput = z.infer<typeof settingsInput>;
