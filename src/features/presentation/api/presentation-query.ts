import { createServerFn } from '@tanstack/react-start'
import { presentationIdInputSchema } from '../types/schema'
import { authFnMiddleware } from '#/middleware/auth'
import { prisma } from '#/db'

export const getPresentationWithSlides = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => presentationIdInputSchema.parse(data))
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id

    const row = await prisma.presentation.findFirst({
      where: {
        id: data.id,
        userId,
      },
      include: {
        slides: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!row) {
      throw new Error('Presentation not found')
    }

    return row
  })

export const listPresentations = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .handler(async ({ context }) => {
    const userId = context.session.user.id

    return prisma.presentation.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })
  })
