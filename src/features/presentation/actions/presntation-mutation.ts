import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { prisma } from '#/db'
import { inngest } from '#/integrations/inngest/client'
import {
  callDeckAIJson,
  runPresentationGenerationDirect,
} from '#/integrations/inngest/functions'
import { findTopicSlideImage, searchTopicImages } from '#/lib/slide-images'
import { authFnMiddleware } from '#/middleware/auth'

import { deriveTitle } from '../lib/server-helpers'
import {
  addSlideInputSchema,
  chatRefinePresentationInputSchema,
  createPresentationInputSchema,
  deleteSlideInputSchema,
  moveSlideInputSchema,
  presentationIdInputSchema,
  searchSlideImagesInputSchema,
  updatePresentationInputSchema,
  updateSlideInputSchema,
} from '../types/schema'

async function triggerPresentationGeneration(presentationId: string) {
  try {
    await inngest.send({
      name: 'presentation/generate',
      data: { presentationId },
    })
  } catch (error) {
    console.warn(
      'Inngest unavailable, falling back to direct background generation:',
      error instanceof Error ? error.message : String(error),
    )
    void runPresentationGenerationDirect(presentationId).catch((err) => {
      console.error('Direct presentation generation failed:', err)
    })
  }
}

export const createPresentation = createServerFn({
  method: 'POST',
})
  .inputValidator((data: unknown) => createPresentationInputSchema.parse(data))
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id

    if (
      !process.env.OPENROUTER_API_KEY &&
      !process.env.GOOGLE_GENERATIVE_AI_API_KEY
    ) {
      throw new Error(
        'No AI API key configured. Please add OPENROUTER_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY to your .env file.',
      )
    }

    const presentation = await prisma.presentation.create({
      data: {
        userId,
        title: deriveTitle(data.prompt),
        prompt: data.prompt,
        slideCount: data.slideCount,
        style: data.style,
        tone: data.tone,
        layout: data.layout,
        status: 'GENERATING',
      },
    })

    await triggerPresentationGeneration(presentation.id)

    return presentation
  })

export const updatePresentation = createServerFn({
  method: 'POST',
})
  .inputValidator((data: unknown) => updatePresentationInputSchema.parse(data))
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id
    const { id, ...patch } = data

    const existing = await prisma.presentation.findFirst({
      where: { id, userId },
    })

    if (!existing) throw new Error('Presentation not found')

    return prisma.presentation.update({
      where: { id },
      data: patch,
    })
  })

export const deletePresentation = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => presentationIdInputSchema.parse(data))
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id

    const existing = await prisma.presentation.findFirst({
      where: { id: data.id, userId },
    })

    if (!existing) throw new Error('Presentation not found')
    await prisma.presentation.delete({ where: { id: data.id } })

    return { ok: true as const }
  })

export const regeneratePresentation = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => presentationIdInputSchema.parse(data))
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id

    const existing = await prisma.presentation.findFirst({
      where: { id: data.id, userId },
    })

    if (!existing) throw new Error('Presentation not found')

    await prisma.presentation.update({
      where: { id: data.id },
      data: { status: 'GENERATING' },
    })

    await triggerPresentationGeneration(data.id)

    return { ok: true as const }
  })

export const updateSlide = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => updateSlideInputSchema.parse(data))
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id

    const presentation = await prisma.presentation.findFirst({
      where: { id: data.presentationId, userId },
    })

    if (!presentation) throw new Error('Presentation not found')

    const existingSlide = await prisma.slide.findFirst({
      where: { id: data.slideId, presentationId: data.presentationId },
    })

    if (!existingSlide) throw new Error('Slide not found')

    const updated = await prisma.slide.update({
      where: { id: data.slideId },
      data: {
        title: data.title.trim(),
        content: data.content,
        notes: data.notes ?? null,
        ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl } : {}),
      },
    })

    await prisma.presentation.update({
      where: { id: data.presentationId },
      data: { updatedAt: new Date() },
    })

    return updated
  })

export const addSlide = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => addSlideInputSchema.parse(data))
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id

    const presentation = await prisma.presentation.findFirst({
      where: { id: data.presentationId, userId },
      include: { slides: { orderBy: { order: 'asc' } } },
    })

    if (!presentation) throw new Error('Presentation not found')

    const nextOrder = presentation.slides.length
    const usedUrls = new Set(
      presentation.slides
        .map((s) => s.imageUrl)
        .filter((u): u is string => Boolean(u)),
    )

    const slideTitle = data.title?.trim() || `New Slide ${nextOrder + 1}`
    const imageUrl = await findTopicSlideImage(
      presentation.title,
      slideTitle,
      presentation.title,
      usedUrls,
    )

    const created = await prisma.slide.create({
      data: {
        presentationId: data.presentationId,
        order: nextOrder,
        title: slideTitle,
        content:
          data.content ??
          '- Key takeaway one\n- Supporting insight two\n- Next action step',
        notes: data.notes ?? null,
        imageUrl,
        imagePrompt: presentation.title,
      },
    })

    await prisma.presentation.update({
      where: { id: data.presentationId },
      data: {
        slideCount: nextOrder + 1,
        status:
          presentation.status === 'DRAFT' ? 'COMPLETED' : presentation.status,
      },
    })

    return created
  })

export const deleteSlide = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => deleteSlideInputSchema.parse(data))
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id

    const presentation = await prisma.presentation.findFirst({
      where: { id: data.presentationId, userId },
      include: { slides: { orderBy: { order: 'asc' } } },
    })

    if (!presentation) throw new Error('Presentation not found')

    const remaining = presentation.slides.filter((s) => s.id !== data.slideId)
    if (remaining.length === presentation.slides.length) {
      throw new Error('Slide not found')
    }

    await prisma.slide.delete({ where: { id: data.slideId } })

    await Promise.all(
      remaining.map((s, idx) =>
        prisma.slide.update({
          where: { id: s.id },
          data: { order: idx },
        }),
      ),
    )

    await prisma.presentation.update({
      where: { id: data.presentationId },
      data: { slideCount: remaining.length },
    })

    return { ok: true as const }
  })

export const moveSlide = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => moveSlideInputSchema.parse(data))
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id

    const presentation = await prisma.presentation.findFirst({
      where: { id: data.presentationId, userId },
      include: { slides: { orderBy: { order: 'asc' } } },
    })

    if (!presentation) throw new Error('Presentation not found')

    const currentIdx = presentation.slides.findIndex(
      (s) => s.id === data.slideId,
    )
    if (currentIdx === -1) throw new Error('Slide not found')

    const targetIdx =
      data.direction === 'up' ? currentIdx - 1 : currentIdx + 1

    if (targetIdx < 0 || targetIdx >= presentation.slides.length) {
      return { ok: true as const, newIndex: currentIdx }
    }

    const currentSlide = presentation.slides[currentIdx]
    const targetSlide = presentation.slides[targetIdx]

    await prisma.$transaction([
      prisma.slide.update({
        where: { id: currentSlide.id },
        data: { order: targetIdx },
      }),
      prisma.slide.update({
        where: { id: targetSlide.id },
        data: { order: currentIdx },
      }),
    ])

    return { ok: true as const, newIndex: targetIdx }
  })

export const searchSlideImages = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => searchSlideImagesInputSchema.parse(data))
  .middleware([authFnMiddleware])
  .handler(async ({ data }) => {
    const images = await searchTopicImages(data.query, 6)
    return { images }
  })

const chatActionSchema = z.object({
  action: z.enum(['update_slide', 'add_slide', 'reply_only']),
  reply: z.string().min(1),
  slide: z
    .object({
      title: z.string().min(1),
      content: z.union([
        z.string(),
        z.array(z.string()).transform((items) =>
          items
            .map((i) => i.trim())
            .filter(Boolean)
            .map((i) => (i.startsWith('-') ? i : `- ${i}`))
            .join('\n'),
        ),
      ]),
      notes: z.string().optional().nullable(),
      imageQuery: z.string().optional().nullable(),
      refreshImage: z.boolean().optional(),
    })
    .optional(),
})

export const chatRefinePresentation = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    chatRefinePresentationInputSchema.parse(data),
  )
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id

    const presentation = await prisma.presentation.findFirst({
      where: { id: data.presentationId, userId },
      include: { slides: { orderBy: { order: 'asc' } } },
    })

    if (!presentation) throw new Error('Presentation not found')

    const activeSlide =
      presentation.slides.find((s) => s.id === data.activeSlideId) ??
      presentation.slides[0]

    const deckOutline = presentation.slides
      .map((s, idx) => `${idx + 1}. ${s.title}`)
      .join('\n')

    const recentHistory = (data.history ?? [])
      .slice(-6)
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n')

    const systemPrompt = `You are DeckGen's integrated AI Presentation Copilot.
You keep the deck's topic, slide text, speaker notes, and slide visuals tightly aligned.

Deck context:
- Presentation Title: ${presentation.title}
- Style: ${presentation.style}, Tone: ${presentation.tone}, Layout: ${presentation.layout}
- Original Topic Prompt: ${presentation.prompt.slice(0, 800)}
- Full Deck Outline:
${deckOutline || '(no slides yet)'}

Currently selected slide:
${
  activeSlide
    ? `- Slide #${activeSlide.order + 1} Title: ${activeSlide.title}
- Content:\n${activeSlide.content}
- Speaker Notes: ${activeSlide.notes ?? '(none)'}
- Current Image Query: ${activeSlide.imagePrompt ?? '(none)'}`
    : '(no active slide)'
}

Choose the right action for the user's request:
- "update_slide": Modify the currently selected slide's text, notes, and/or replace its visual with a better topic-matched image (set "refreshImage": true and provide a concrete 2-4 word "imageQuery" whenever the user asks to improve/change the image or changes the slide's topic).
- "add_slide": Create and append a new slide aligned with the presentation topic (always include "imageQuery").
- "reply_only": Answer a question or offer advice without editing slides.

For content slides, keep bullets crisp (3-4 bullets prefixed with "- ", max ~14 words each) so text aligns cleanly alongside the slide image.

Return ONLY valid JSON:
{
  "action": "update_slide" | "add_slide" | "reply_only",
  "reply": "Short friendly explanation of what you changed or answered",
  "slide": {
    "title": "Updated or new slide title",
    "content": "- Bullet 1\\n- Bullet 2\\n- Bullet 3",
    "notes": "Updated speaker notes",
    "imageQuery": "2 to 4 word concrete topic photo search phrase",
    "refreshImage": true
  }
}`

    const userMessage = recentHistory
      ? `Recent conversation:\n${recentHistory}\n\nNew user request: ${data.message}`
      : `User request: ${data.message}`

    const raw = await callDeckAIJson(systemPrompt, userMessage)
    const parsed = chatActionSchema.parse(raw)

    const usedUrls = new Set(
      presentation.slides
        .map((s) => s.imageUrl)
        .filter((u): u is string => Boolean(u)),
    )

    if (parsed.action === 'update_slide' && activeSlide && parsed.slide) {
      let nextImageUrl = activeSlide.imageUrl
      const nextImagePrompt =
        parsed.slide.imageQuery?.trim() || activeSlide.imagePrompt

      if (parsed.slide.refreshImage || (!nextImageUrl && nextImagePrompt)) {
        // Allow finding a fresh photo different from the current one
        const found = await findTopicSlideImage(
          nextImagePrompt || parsed.slide.title,
          parsed.slide.title,
          presentation.title,
          usedUrls,
        )
        if (found) {
          nextImageUrl = found
        }
      }

      const updatedSlide = await prisma.slide.update({
        where: { id: activeSlide.id },
        data: {
          title: parsed.slide.title.trim(),
          content: parsed.slide.content.trim(),
          notes: parsed.slide.notes?.trim() ?? activeSlide.notes,
          imagePrompt: nextImagePrompt,
          imageUrl: nextImageUrl,
        },
      })

      await prisma.presentation.update({
        where: { id: presentation.id },
        data: { updatedAt: new Date() },
      })

      return {
        action: 'update_slide' as const,
        reply: parsed.reply,
        slideIndex: activeSlide.order,
        slideId: updatedSlide.id,
      }
    }

    if (parsed.action === 'add_slide' && parsed.slide) {
      const nextOrder = presentation.slides.length
      const query = parsed.slide.imageQuery?.trim() || parsed.slide.title
      const imageUrl = await findTopicSlideImage(
        query,
        parsed.slide.title,
        presentation.title,
        usedUrls,
      )

      const created = await prisma.slide.create({
        data: {
          presentationId: presentation.id,
          order: nextOrder,
          title: parsed.slide.title.trim(),
          content: parsed.slide.content.trim(),
          notes: parsed.slide.notes?.trim() ?? null,
          imagePrompt: query,
          imageUrl,
        },
      })

      await prisma.presentation.update({
        where: { id: presentation.id },
        data: {
          slideCount: nextOrder + 1,
          status: 'COMPLETED',
        },
      })

      return {
        action: 'add_slide' as const,
        reply: parsed.reply,
        slideIndex: nextOrder,
        slideId: created.id,
      }
    }

    return {
      action: 'reply_only' as const,
      reply: parsed.reply,
      slideIndex: activeSlide?.order ?? 0,
      slideId: activeSlide?.id,
    }
  })
