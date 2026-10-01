import { z } from 'zod'

export const eventSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().optional().or(z.literal('')),
  event_date: z.string().min(1, 'Date is required'),
  event_time: z.string().optional().or(z.literal('')),
  venue_name: z.string().trim().optional().or(z.literal('')),
  address: z.string().trim().optional().or(z.literal('')),
  category_id: z.string().optional().or(z.literal('')),
  organizer_name: z.string().trim().optional().or(z.literal('')),
  ticket_url: z
    .string()
    .trim()
    .min(1, 'Ticket URL is required')
    .url('Enter a valid URL (including https://)'),
  price_info: z.string().trim().optional().or(z.literal('')),
  is_featured: z.boolean(),
  status: z.enum(['draft', 'published', 'expired']),
})

export type EventFormValues = z.infer<typeof eventSchema>