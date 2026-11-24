import { z } from 'zod'

export const presentationStyleSchema = z.enum([
  'minimal',
  'professional',
  'creative',
  'bold',
])

export const presentationToneSchema = z.enum([
  'formal',
  'casual',
  'persuasive',
  'informative',
])

export const presentationLayoutSchema = z.enum([
  'text-heavy',
  'visual',
  'balanced',
  'bullet-points',
])

export const presentationIdInputSchema = z.object({
  id: z.string().min(1),
})

export const createPresentationInputSchema = z.object({
  prompt: z.string().min(1).max(50_000),
  slideCount: z.number().int().min(3).max(20),
  style: presentationStyleSchema,
  tone: presentationToneSchema,
  layout: presentationLayoutSchema,
})

export const updatePresentationInputSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1).max(200).optional(),
    prompt: z.string().min(1).max(50_000).optional(),
    slideCount: z.number().int().min(3).max(20).optional(),
    style: presentationStyleSchema.optional(),
    tone: presentationToneSchema.optional(),
    layout: presentationLayoutSchema.optional(),
  })
  .refine(
    (data) => {
      const { id: _id, ...fields } = data
      return Object.keys(fields).length > 0
    },
    {
      message: 'At least one field is required to update',
    },
  )

export const updateSlideInputSchema = z.object({
  slideId: z.string().min(1),
  presentationId: z.string().min(1),
  title: z.string().min(1).max(200),
  content: z.string().max(10_000),
  notes: z.string().max(5_000).nullable().optional(),
  imageUrl: z.string().max(2_000).nullable().optional(),
})

export const addSlideInputSchema = z.object({
  presentationId: z.string().min(1),
  title: z.string().min(1).max(200).optional(),
  content: z.string().max(10_000).optional(),
  notes: z.string().max(5_000).nullable().optional(),
})

export const deleteSlideInputSchema = z.object({
  slideId: z.string().min(1),
  presentationId: z.string().min(1),
})

export const moveSlideInputSchema = z.object({
  slideId: z.string().min(1),
  presentationId: z.string().min(1),
  direction: z.enum(['up', 'down']),
})

export const searchSlideImagesInputSchema = z.object({
  query: z.string().min(1).max(200),
})

export const chatRefinePresentationInputSchema = z.object({
  presentationId: z.string().min(1),
  activeSlideId: z.string().optional(),
  message: z.string().min(1).max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      }),
    )
    .max(12)
    .optional(),
})
