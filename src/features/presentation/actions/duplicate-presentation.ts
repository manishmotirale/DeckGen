import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { prisma } from '#/db'
import { authFnMiddleware } from '#/middleware/auth'

const duplicatePresentationSchema = z.object({
  id: z.string(),
})

export const duplicatePresentation = createServerFn({
  method: 'POST',
})
  .inputValidator((data: unknown) => duplicatePresentationSchema.parse(data))
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id

    const original = await prisma.presentation.findFirst({
      where: { id: data.id, userId },
      include: { slides: { orderBy: { order: 'asc' } } },
    })

    if (!original) {
      throw new Error('Presentation not found')
    }

    const duplicate = await prisma.presentation.create({
      data: {
        userId,
        title: `${original.title} (Copy)`,
        prompt: original.prompt,
        slideCount: original.slides.length || original.slideCount,
        style: original.style,
        tone: original.tone,
        layout: original.layout,
        status: original.slides.length > 0 ? 'COMPLETED' : 'DRAFT',
        slides: {
          create: original.slides.map((slide) => ({
            order: slide.order,
            title: slide.title,
            content: slide.content,
            notes: slide.notes,
            imagePrompt: slide.imagePrompt,
            imageUrl: slide.imageUrl,
          })),
        },
      },
      include: { slides: true },
    })

    return duplicate
  })
