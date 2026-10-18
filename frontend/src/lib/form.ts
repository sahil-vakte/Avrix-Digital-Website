import { z } from 'zod';
export const serviceSlugs = [
  'performance-marketing',
  'ga4-consulting',
  'web-development',
  'web-application-development',
  'ai-automation',
  'microsoft-365-copilot',
  'google-workspace',
  'aws-consulting',
  'talent-acquisition',
  'voice-call-agent',
  'wims',
  'hr-desk',
  'not-sure',
] as const;
export const enquirySchema = z.object({
  full_name: z.string().trim().min(1).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional(),
  company: z.string().max(160).optional(),
  website: z
    .union([
      z
        .string()
        .url()
        .regex(/^https?:\/\//),
      z.literal(''),
    ])
    .optional(),
  services: z.array(z.enum(serviceSlugs)).min(1),
  budget: z.enum([
    'under-1k',
    '1k-3k',
    '3k-5k',
    '5k-10k',
    '10k-plus',
    'monthly-retainer',
    'not-sure',
  ]),
  timeline: z.enum(['', 'asap', '1-3-months', '3-6-months', 'exploring']).optional(),
  message: z.string().trim().min(20).max(5000),
  preferred_contact: z.enum(['email', 'phone', 'video-call']),
  marketing_opt_in: z.boolean(),
  privacy_ack: z.boolean().refine((v) => v, 'Please acknowledge the privacy policy.'),
  company_website_hp: z.string().optional(),
});
export type EnquiryInput = z.infer<typeof enquirySchema>;
