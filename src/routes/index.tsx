import { getSession } from '@/lib/auth.functions'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '#/components/ui/slider'
import { Textarea } from '#/components/ui/textarea'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createFileRoute,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import {
  ArrowDown,
  BarChart3,
  BookmarkPlus,
  Briefcase,
  Cpu,
  GraduationCap,
  Layers,
  Leaf,
  Megaphone,
  Palette,
  RotateCcw,
  Server,
  ShieldCheck,
  Sparkles,
  Wand2,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { listPresentations } from '#/features/presentation/api/presentation-query'
import { createPresentation } from '#/features/presentation/actions/presntation-mutation'
import {
  LAYOUT_OPTIONS,
  SLIDE_STYLES,
  TONE_OPTIONS,
} from '#/features/presentation/constant/presentation-options'
import { presentationQueryKeys } from '#/features/presentation/hooks/query-keys'
import {
  PRESENTATION_TEMPLATES,
  TEMPLATE_CATEGORIES,
  type PresentationTemplate,
  type TemplateCategory,
} from '#/features/presentation/constant/presentation-templates'
import { PresentationListSection } from '#/features/presentation/components/presentation-list-section'

type HomeFormState = {
  content: string
  slideCount: number
  style: (typeof SLIDE_STYLES)[number]['value']
  tone: (typeof TONE_OPTIONS)[number]['value']
  layout: (typeof LAYOUT_OPTIONS)[number]['value']
}

const CUSTOM_TEMPLATES_KEY = 'deckgen_custom_templates_v1'
const HIDDEN_TEMPLATES_KEY = 'deckgen_hidden_templates_v1'

const TEMPLATE_META: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; accent: string }
> = {
  'ai-product-launch': {
    icon: Cpu,
    accent: 'text-sky-400 bg-sky-500/10 ring-sky-500/20',
  },
  'climatetech-pitch': {
    icon: Leaf,
    accent: 'text-emerald-400 bg-emerald-500/10 ring-emerald-500/20',
  },
  'cloud-architecture': {
    icon: Server,
    accent: 'text-indigo-400 bg-indigo-500/10 ring-indigo-500/20',
  },
  'gtm-strategy': {
    icon: Megaphone,
    accent: 'text-orange-400 bg-orange-500/10 ring-orange-500/20',
  },
  'quarterly-business-review': {
    icon: BarChart3,
    accent: 'text-cyan-400 bg-cyan-500/10 ring-cyan-500/20',
  },
  'generative-ai-lecture': {
    icon: GraduationCap,
    accent: 'text-violet-400 bg-violet-500/10 ring-violet-500/20',
  },
  'cybersecurity-briefing': {
    icon: ShieldCheck,
    accent: 'text-rose-400 bg-rose-500/10 ring-rose-500/20',
  },
  'ux-redesign-case-study': {
    icon: Palette,
    accent: 'text-amber-400 bg-amber-500/10 ring-amber-500/20',
  },
  'enterprise-sales-proposal': {
    icon: Briefcase,
    accent: 'text-teal-400 bg-teal-500/10 ring-teal-500/20',
  },
}

export const Route = createFileRoute('/')({
  beforeLoad: async ({ location }) => {
    const session = await getSession()

    if (!session) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }

    return { user: session.user }
  },
  component: HomePage,
})

function HomePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const [form, setForm] = useState<HomeFormState>({
    content: '',
    slideCount: 8,
    style: 'minimal',
    tone: 'formal',
    layout: 'balanced',
  })

  const [activeCategory, setActiveCategory] = useState<
    'All' | TemplateCategory
  >('All')
  const [customTemplates, setCustomTemplates] = useState<
    PresentationTemplate[]
  >([])
  const [hiddenIds, setHiddenIds] = useState<string[]>([])

  useEffect(() => {
    try {
      const savedCustom = localStorage.getItem(CUSTOM_TEMPLATES_KEY)
      if (savedCustom) {
        setCustomTemplates(JSON.parse(savedCustom) as PresentationTemplate[])
      }
      const savedHidden = localStorage.getItem(HIDDEN_TEMPLATES_KEY)
      if (savedHidden) {
        setHiddenIds(JSON.parse(savedHidden) as string[])
      }
    } catch {
      // ignore invalid storage
    }
  }, [])

  const allTemplates = [
    ...customTemplates,
    ...PRESENTATION_TEMPLATES.filter((t) => !hiddenIds.includes(t.id)),
  ]

  const visibleTemplates =
    activeCategory === 'All'
      ? allTemplates
      : allTemplates.filter((t) => t.category === activeCategory)

  const handleSaveAsTemplate = () => {
    const trimmed = form.content.trim()
    if (!trimmed) {
      toast.error('Write a prompt first to save it as a template')
      return
    }
    const firstLine =
      trimmed
        .split('\n')
        .map((l) => l.trim())
        .find(Boolean) ?? 'Custom Template'
    const label = firstLine.slice(0, 36)
    const newTemplate: PresentationTemplate = {
      id: `custom-${Date.now()}`,
      label,
      category: 'Business',
      summary: trimmed.slice(0, 95),
      content: trimmed,
      slides: form.slideCount,
      style: form.style,
      tone: form.tone,
      layout: form.layout,
      isCustom: true,
    }
    const next = [newTemplate, ...customTemplates]
    setCustomTemplates(next)
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(next))
    toast.success(`Saved "${label}" to your templates`)
  }

  const handleRemoveTemplate = (template: PresentationTemplate) => {
    if (template.isCustom) {
      const next = customTemplates.filter((t) => t.id !== template.id)
      setCustomTemplates(next)
      localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(next))
    } else {
      const next = [...hiddenIds, template.id]
      setHiddenIds(next)
      localStorage.setItem(HIDDEN_TEMPLATES_KEY, JSON.stringify(next))
    }
    toast.info(`Removed "${template.label}" template`)
  }

  const handleResetTemplates = () => {
    setHiddenIds([])
    localStorage.removeItem(HIDDEN_TEMPLATES_KEY)
    toast.success('Restored all default templates')
  }

  const { data: presentations = [], isPending: listPending } = useQuery({
    queryKey: presentationQueryKeys.list(),
    queryFn: () => listPresentations(),
  })

  const createMut = useMutation({
    mutationFn: () =>
      createPresentation({
        data: {
          prompt: form.content.trim(),
          slideCount: form.slideCount,
          style: form.style,
          tone: form.tone,
          layout: form.layout,
        },
      }),
    onSuccess: (presentation) => {
      toast.success('Creating your presentation…')
      queryClient.invalidateQueries({ queryKey: presentationQueryKeys.list() })
      navigate({
        to: '/presentations/$presentationId',
        params: { presentationId: presentation.id },
      })
    },
    onError: (e) => {
      toast.error(
        e instanceof Error ? e.message : 'Could not create presentation',
      )
    },
  })

  const handleGenerate = () => {
    if (!form.content.trim()) {
      toast.error('Please enter your topic or notes first')
      textareaRef.current?.focus()
      return
    }

    createMut.mutate()
  }

  return (
    <main className="bg-grid-subtle relative min-h-screen overflow-hidden bg-background px-4 pb-20 pt-24 sm:pt-28">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[440px] w-[720px] -translate-x-1/2 rounded-full bg-primary/10 blur-[130px]" />
        <div className="absolute -left-32 top-[40%] h-[300px] w-[300px] rounded-full bg-amber-500/5 blur-[110px]" />
        <div className="absolute -right-32 top-[55%] h-[320px] w-[320px] rounded-full bg-orange-500/5 blur-[110px]" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        {/* Hero */}
        <section className="mx-auto mb-9 max-w-3xl text-center">
          <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1 text-xs font-semibold text-primary">
              <Sparkles className="size-3.5" />
              AI Presentation Studio
            </span>

            {presentations.length > 0 && (
              <a
                href="#your-presentations"
                className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/70 px-3.5 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm transition-colors hover:border-primary/40 hover:text-foreground"
              >
                <Layers className="size-3.5 text-primary" />
                {presentations.length}{' '}
                {presentations.length === 1 ? 'saved deck' : 'saved decks'}
                <ArrowDown className="size-3" />
              </a>
            )}
          </div>

          <h1 className="text-balance text-4xl font-extrabold tracking-tight sm:text-5xl md:text-[3.25rem] md:leading-[1.1]">
            Turn ideas into{' '}
            <span className="text-gradient-peach">polished decks</span> in
            seconds.
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
            Paste rough notes, an outline, or a single sentence. DeckGen builds
            topic-aligned slides with matched photography, speaker notes, and an
            integrated AI chat copilot.
          </p>
        </section>

        {/* Main generator card */}
        <section className="relative overflow-hidden rounded-[26px] border border-border/70 bg-card/85 shadow-depth-lg backdrop-blur-xl">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />

          <div className="p-5 sm:p-7">
            <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-semibold tracking-tight">
                  Describe your presentation
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Share your topic, audience, or bullet notes.
                </p>
              </div>

              {form.content.trim().length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 rounded-lg px-2.5 text-xs text-primary hover:bg-primary/10"
                    onClick={handleSaveAsTemplate}
                  >
                    <BookmarkPlus className="size-3.5" />
                    Save as template
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 rounded-lg px-2.5 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => setForm((s) => ({ ...s, content: '' }))}
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>

            {/* Prompt textarea */}
            <div className="relative">
              <Textarea
                ref={textareaRef}
                placeholder="Example: A seed-stage investor pitch for an AI microgrid energy platform, covering the problem, smart battery orchestration, customer traction, business model, and funding ask…"
                value={form.content}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    content: e.target.value,
                  }))
                }
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                    e.preventDefault()
                    handleGenerate()
                  }
                }}
                className="min-h-[190px] resize-y rounded-2xl border-border/70 bg-background/75 px-4 pb-11 pt-4 text-sm leading-6 shadow-inner transition-all placeholder:text-muted-foreground/60 focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10 sm:text-[15px]"
              />

              <div className="pointer-events-none absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-muted-foreground/75">
                <span>{form.content.length.toLocaleString()} characters</span>
                <span className="hidden sm:inline">
                  Ctrl + Enter to generate
                </span>
              </div>
            </div>

            {/* Options grid */}
            <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-border/60 bg-background/50 p-3.5">
                <div className="mb-3 flex items-center justify-between">
                  <Label className="text-xs font-semibold text-foreground/90">
                    Slides
                  </Label>
                  <span className="rounded-md bg-primary/12 px-2 py-0.5 font-mono text-xs font-bold text-primary">
                    {form.slideCount}
                  </span>
                </div>

                <Slider
                  value={[form.slideCount]}
                  onValueChange={(values) =>
                    setForm((s) => ({
                      ...s,
                      slideCount:
                        typeof values === 'number'
                          ? values
                          : (values[0] ?? s.slideCount),
                    }))
                  }
                  min={3}
                  max={20}
                  step={1}
                  className="py-1.5"
                />

                <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
                  <span>3</span>
                  <span>20</span>
                </div>
              </div>

              <div className="space-y-2 rounded-2xl border border-border/60 bg-background/50 p-3.5">
                <Label className="text-xs font-semibold text-foreground/90">
                  Visual Style
                </Label>
                <Select
                  value={form.style}
                  onValueChange={(value) =>
                    setForm((s) => ({
                      ...s,
                      style: value as HomeFormState['style'],
                    }))
                  }
                >
                  <SelectTrigger className="h-10 rounded-xl border-border/60 bg-background/80 text-sm shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {SLIDE_STYLES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 rounded-2xl border border-border/60 bg-background/50 p-3.5">
                <Label className="text-xs font-semibold text-foreground/90">
                  Tone
                </Label>
                <Select
                  value={form.tone}
                  onValueChange={(value) =>
                    setForm((s) => ({
                      ...s,
                      tone: value as HomeFormState['tone'],
                    }))
                  }
                >
                  <SelectTrigger className="h-10 rounded-xl border-border/60 bg-background/80 text-sm shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {TONE_OPTIONS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 rounded-2xl border border-border/60 bg-background/50 p-3.5">
                <Label className="text-xs font-semibold text-foreground/90">
                  Layout
                </Label>
                <Select
                  value={form.layout}
                  onValueChange={(value) =>
                    setForm((s) => ({
                      ...s,
                      layout: value as HomeFormState['layout'],
                    }))
                  }
                >
                  <SelectTrigger className="h-10 rounded-xl border-border/60 bg-background/80 text-sm shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {LAYOUT_OPTIONS.map((l) => (
                      <SelectItem key={l.value} value={l.value}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action bar */}
            <div className="mt-5 flex flex-col gap-3.5 rounded-2xl border border-primary/15 bg-primary/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Wand2 className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    Ready to generate {form.slideCount} aligned slides
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Includes topic-matched visuals, speaker notes, and AI chat
                    editing.
                  </p>
                </div>
              </div>

              <Button
                size="lg"
                onClick={handleGenerate}
                disabled={createMut.isPending || !form.content.trim()}
                className="button-3d shadow-primary-depth h-11 rounded-xl px-6 text-sm font-semibold disabled:opacity-50"
              >
                {createMut.isPending ? (
                  <>
                    <Sparkles className="mr-2 size-4 animate-pulse" />
                    Creating Deck…
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 size-4" />
                    Generate Presentation
                  </>
                )}
              </Button>
            </div>
          </div>
        </section>

        {/* Quick Start Templates */}
        <section className="mt-14">
          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Sample Templates ({allTemplates.length})
              </p>
              <h3 className="mt-1 text-xl font-bold tracking-tight">
                Start from a tailored template
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {TEMPLATE_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                    activeCategory === category
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'border border-border/60 bg-card/70 text-muted-foreground hover:border-primary/35 hover:text-foreground'
                  }`}
                >
                  {category}
                </button>
              ))}

              {hiddenIds.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1 rounded-xl px-2.5 text-xs text-muted-foreground hover:text-foreground"
                  onClick={handleResetTemplates}
                >
                  <RotateCcw className="size-3" />
                  Restore
                </Button>
              )}
            </div>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleTemplates.map((template) => {
              const meta = TEMPLATE_META[template.id] ?? {
                icon: Sparkles,
                accent: 'text-primary bg-primary/10 ring-primary/20',
              }
              const Icon = meta.icon

              return (
                <div
                  key={template.id}
                  className="card-elevated group relative flex flex-col justify-between rounded-2xl border border-border/60 bg-card/75 p-4 backdrop-blur-sm hover:border-primary/40 hover:shadow-depth-md"
                >
                  {/* Remove template button */}
                  <button
                    type="button"
                    aria-label={`Remove ${template.label} template`}
                    title="Remove template"
                    onClick={() => handleRemoveTemplate(template)}
                    className="absolute right-2.5 top-2.5 z-10 flex size-6 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-all hover:bg-destructive/15 hover:text-destructive group-hover:opacity-100"
                  >
                    <X className="size-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setForm({
                        content: template.content,
                        slideCount: template.slides,
                        style: template.style,
                        tone: template.tone,
                        layout: template.layout,
                      })
                      toast.success(`Loaded "${template.label}" template`)
                      textareaRef.current?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                      })
                      textareaRef.current?.focus()
                    }}
                    className="flex h-full flex-col justify-between text-left"
                  >
                    <div>
                      <div className="mb-3 flex items-center justify-between gap-2 pr-6">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`flex size-9 shrink-0 items-center justify-center rounded-xl ring-1 ${meta.accent}`}
                          >
                            <Icon className="size-4" />
                          </div>
                          <div>
                            <span className="block text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                              {template.label}
                            </span>
                            <span className="text-[10px] font-medium text-muted-foreground">
                              {template.isCustom ? 'Custom' : template.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {template.summary}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
                      <div className="flex flex-wrap gap-1.5">
                        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          {template.slides} slides
                        </span>
                        <span className="rounded-md bg-muted/80 px-2 py-0.5 text-[10px] font-medium capitalize text-muted-foreground">
                          {template.style}
                        </span>
                        <span className="rounded-md bg-muted/80 px-2 py-0.5 text-[10px] font-medium capitalize text-muted-foreground">
                          {template.layout}
                        </span>
                      </div>

                      <span className="text-[11px] font-semibold text-primary opacity-75 transition-opacity group-hover:opacity-100">
                        Use →
                      </span>
                    </div>
                  </button>
                </div>
              )
            })}
          </div>
        </section>

        {/* Saved Presentations */}
        <div id="your-presentations" className="mt-16 scroll-mt-24">
          <PresentationListSection
            presentations={presentations}
            isPending={listPending}
          />
        </div>
      </div>
    </main>
  )
}
