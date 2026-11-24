import { inngest } from './client'
import { prisma } from '#/db'
import { z } from 'zod'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText } from 'ai'
import { findTopicSlideImage } from '#/lib/slide-images'

const slideSchema = z.object({
  title: z.string().min(1).describe('Slide title'),
  content: z
    .union([
      z.string(),
      z.array(z.string()).transform((items) =>
        items
          .map((item) => item.trim())
          .filter(Boolean)
          .map((item) => (item.startsWith('-') ? item : `- ${item}`))
          .join('\n'),
      ),
    ])
    .describe('Main content / bullet points for the slide'),
  notes: z.string().optional().nullable().describe('Speaker notes'),
  imagePrompt: z
    .string()
    .optional()
    .nullable()
    .transform((v) => v ?? '')
    .describe(
      'A concise 2 to 4 word concrete photo search query matching BOTH the overall presentation topic and this specific slide (e.g. "solar energy panels", "data center servers", "startup team meeting")',
    ),
})

const slidesResponseSchema = z.object({
  title: z.string().optional(),
  slides: z.array(slideSchema).min(1),
})

type SlidesPayload = z.infer<typeof slidesResponseSchema>

type OpenRouterResponse = {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
}

function getOpenRouterModels(): string[] {
  const configured = process.env.OPENROUTER_DEFAULT_MODEL?.replace(
    /^['"]|['"]$/g,
    '',
  ).trim()

  const defaults = [
    'openrouter/free',
    'openrouter/free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'mistralai/mistral-small-3.1-24b-instruct:free',
  ]

  return configured && configured !== 'openrouter/free'
    ? [configured, ...defaults]
    : defaults
}

export function extractJsonObject(raw: string): unknown {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  try {
    return JSON.parse(cleaned)
  } catch {
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1))
    }
    throw new Error('AI returned malformed JSON response')
  }
}

function normalizeSlidesPayload(raw: unknown): SlidesPayload {
  const parsed = slidesResponseSchema.parse(raw)
  return {
    title: parsed.title,
    slides: parsed.slides.map((s) => ({
      title: s.title.trim(),
      content: s.content.trim(),
      notes: s.notes?.trim() || undefined,
      imagePrompt: s.imagePrompt?.trim() || s.title.trim(),
    })),
  }
}

function buildSystemPrompt(presentation: {
  style: string
  tone: string
  layout: string
  slideCount: number
}) {
  return `You are an expert presentation designer and visual storyteller.

Generate a high-quality, cohesive slide deck strictly aligned with the user's topic and notes.

Presentation configuration:
- Style: ${presentation.style}
- Tone: ${presentation.tone}
- Layout preference: ${presentation.layout}
- Number of slides: ${presentation.slideCount}

IMPORTANT:
Generate EXACTLY ${presentation.slideCount} slides.

SLIDE CONTENT & ALIGNMENT RULES:
1. Stay 100% faithful to the user's topic, facts, numbers, and terminology—never drift off-topic or invent generic filler.
2. Slide 1 must be a strong title/hero slide with a compelling title and a crisp 1-2 sentence subtitle in "content".
3. The final slide must provide a meaningful conclusion, summary, key takeaways, or call-to-action tailored to the topic.
4. Every slide must communicate ONE clear idea with zero repetition across slides.
5. For content slides (slides 2..N), write 3-4 crisp, scannable bullet points prefixed with "- " (max ~14 words per bullet so text aligns cleanly alongside the slide image).
6. Give every slide a specific, descriptive title (3-7 words). Avoid generic titles like "Introduction" or "Overview".
7. Include practical, natural speaker notes for every slide.
8. CRITICAL FOR IMAGES ("imagePrompt"): Provide a CONCRETE 2-4 word photographic search phrase that directly matches BOTH the presentation's real-world subject AND that slide's message (e.g. "solar panels rooftop", "server room cloud", "ux wireframe design", "cybersecurity operations center"). NEVER use abstract buzzwords like "synergy" or "success", and NEVER use sentences. Each slide MUST have a distinct "imagePrompt".

Return ONLY valid JSON matching this exact schema:
{
  "title": "Concise Presentation Title (3-8 words)",
  "slides": [
    {
      "title": "Slide title",
      "content": "- Point one\\n- Point two\\n- Point three",
      "notes": "Helpful speaker notes for presenting this slide.",
      "imagePrompt": "2 to 4 word concrete photo query"
    }
  ]
}`
}

/**
 * Shared raw JSON text call to OpenRouter (free models) with Google Gemini fallback.
 */
export async function callDeckAIJson(
  system: string,
  userPrompt: string,
): Promise<unknown> {
  const openRouterKey = process.env.OPENROUTER_API_KEY
  const errors: string[] = []

  if (openRouterKey) {
    const models = getOpenRouterModels()
    for (const model of models) {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 55_000)

        const response = await fetch(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            method: 'POST',
            signal: controller.signal,
            headers: {
              Authorization: `Bearer ${openRouterKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer':
                process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
              'X-Title': 'DeckGen',
            },
            body: JSON.stringify({
              model,
              temperature: 0.65,
              messages: [
                { role: 'system', content: system },
                {
                  role: 'user',
                  content: `${userPrompt}\n\nIMPORTANT: Return ONLY a single valid JSON object matching the schema with no markdown fences and no extra commentary.`,
                },
              ],
            }),
          },
        ).finally(() => clearTimeout(timeout))

        if (!response.ok) {
          const errorText = await response.text()
          errors.push(
            `${model}: ${response.status} - ${errorText.slice(0, 200)}`,
          )
          continue
        }

        const result = (await response.json()) as OpenRouterResponse
        const content = result.choices?.[0]?.message?.content

        if (!content) {
          errors.push(`${model}: Empty response`)
          continue
        }

        return extractJsonObject(content)
      } catch (error) {
        errors.push(
          `${model}: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    }
  }

  const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (geminiKey) {
    const google = createGoogleGenerativeAI({ apiKey: geminiKey })
    const geminiModels = ['gemini-3.8-flash', 'gemini-2.5-flash-lite']

    for (const modelName of geminiModels) {
      try {
        const { text } = await generateText({
          model: google(modelName),
          system,
          prompt: `${userPrompt}\n\nReturn ONLY a valid JSON object matching the schema.`,
          temperature: 0.65,
        })

        if (!text) {
          errors.push(`gemini/${modelName}: Empty response`)
          continue
        }

        return extractJsonObject(text)
      } catch (error) {
        errors.push(
          `gemini/${modelName}: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    }
  }

  throw new Error(
    `AI generation failed across all providers:\n${errors.join('\n')}`,
  )
}

async function generateSlidesWithAI(
  system: string,
  prompt: string,
): Promise<SlidesPayload> {
  const raw = await callDeckAIJson(system, prompt)
  return normalizeSlidesPayload(raw)
}

async function resolveTopicSlideRows(
  presentationId: string,
  deckTopic: string,
  slides: SlidesPayload['slides'],
) {
  const usedUrls = new Set<string>()
  const rows: Array<{
    presentationId: string
    order: number
    title: string
    content: string
    notes: string | null
    imagePrompt: string
    imageUrl: string | null
  }> = []

  // Resolve sequentially with deduplication so every slide gets a unique topic-matched photo
  for (let index = 0; index < slides.length; index++) {
    const slide = slides[index]
    const imagePrompt = slide.imagePrompt || slide.title
    const imageUrl = await findTopicSlideImage(
      imagePrompt,
      slide.title,
      deckTopic,
      usedUrls,
    )

    rows.push({
      presentationId,
      order: index,
      title: slide.title,
      content: slide.content,
      notes: slide.notes ?? null,
      imagePrompt,
      imageUrl,
    })
  }

  return rows
}

/**
 * Direct server-side generation runner (used when Inngest dev server is not running).
 */
export async function runPresentationGenerationDirect(presentationId: string) {
  try {
    const presentation = await prisma.presentation.findUnique({
      where: { id: presentationId },
    })

    if (!presentation) {
      throw new Error('Presentation not found')
    }

    await prisma.presentation.update({
      where: { id: presentationId },
      data: { status: 'GENERATING' },
    })

    const systemPrompt = buildSystemPrompt(presentation)
    const generated = await generateSlidesWithAI(
      systemPrompt,
      presentation.prompt,
    )

    const refinedTitle = (
      generated.title?.trim() ||
      generated.slides[0]?.title?.trim() ||
      presentation.title
    ).slice(0, 120)

    const slideRows = await resolveTopicSlideRows(
      presentationId,
      refinedTitle,
      generated.slides,
    )

    await prisma.slide.deleteMany({
      where: { presentationId },
    })

    await prisma.slide.createMany({
      data: slideRows,
    })

    await prisma.presentation.update({
      where: { id: presentationId },
      data: {
        status: 'COMPLETED',
        title: refinedTitle,
        slideCount: slideRows.length,
      },
    })

    return { success: true, slideCount: slideRows.length }
  } catch (error) {
    console.error('Presentation generation failed:', error)
    await prisma.presentation
      .update({
        where: { id: presentationId },
        data: { status: 'FAILED' },
      })
      .catch(() => {})
    throw error
  }
}

export const generatePresentation = inngest.createFunction(
  {
    id: 'generate-presentation',
    retries: 2,
    triggers: [{ event: 'presentation/generate' }],
    onFailure: async ({ event }) => {
      const presentationId = (
        event.data?.event?.data as { presentationId?: string } | undefined
      )?.presentationId

      if (presentationId) {
        await prisma.presentation
          .update({
            where: { id: presentationId },
            data: { status: 'FAILED' },
          })
          .catch(() => {})
      }
    },
  },
  async ({ event, step }) => {
    const { presentationId } = event.data as { presentationId: string }

    const presentation = await step.run('fetch-presentation', async () => {
      const p = await prisma.presentation.findUnique({
        where: { id: presentationId },
      })

      if (!p) {
        throw new Error('Presentation not found')
      }

      return p
    })

    await step.run('mark-generating', async () => {
      await prisma.presentation.update({
        where: { id: presentationId },
        data: { status: 'GENERATING' },
      })
    })

    const generated = await step.run('generate-slides-content', async () => {
      const systemPrompt = buildSystemPrompt(presentation)
      return generateSlidesWithAI(systemPrompt, presentation.prompt)
    })

    const refinedTitle = (
      generated.title?.trim() ||
      generated.slides[0]?.title?.trim() ||
      presentation.title
    ).slice(0, 120)

    await step.run('delete-old-slides', async () => {
      await prisma.slide.deleteMany({
        where: { presentationId },
      })
    })

    await step.run('create-slides', async () => {
      const data = await resolveTopicSlideRows(
        presentationId,
        refinedTitle,
        generated.slides,
      )

      await prisma.slide.createMany({
        data,
      })
    })

    await step.run('mark-completed', async () => {
      await prisma.presentation.update({
        where: { id: presentationId },
        data: {
          status: 'COMPLETED',
          title: refinedTitle,
          slideCount: generated.slides.length,
        },
      })
    })

    return { success: true, slideCount: generated.slides.length }
  },
)
