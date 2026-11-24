import { getSession } from '@/lib/auth.functions'
import { GenerationStatus } from '@/features/presentation/components/generation-status'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Download,
  ImageIcon,
  Layers,
  Loader2,
  Maximize,
  MessageSquareText,
  Moon,
  Pencil,
  Play,
  PlayCircle,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings2,
  Sparkles,
  Sun,
  Trash2,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { SlideshowModal } from '@/features/presentation/components/slideshow-modal'
import {
  ExportOptionsDialog,
  type ExportOptions,
} from '@/features/presentation/components/export-options-dialog'
import {
  exportToPptx,
  exportToPrintablePdf,
} from '@/features/presentation/lib/export-pptx'
import { SlideCard } from '@/features/presentation/components/slide-card'
import { SlidePreview } from '@/features/presentation/components/slide-preview'
import { DeckChatPanel } from '@/features/presentation/components/deck-chat-panel'
import { searchSlideImages } from '#/features/presentation/actions/presntation-mutation'
import { usePresentationDetail } from '#/features/presentation/hooks/use-presentation-detail'
import { useFullscreen } from '#/features/presentation/hooks/use-fullScreen'
import {
  LAYOUT_OPTIONS,
  SLIDE_STYLES,
  TONE_OPTIONS,
} from '#/features/presentation/constant/presentation-options'

export const Route = createFileRoute('/presentations/$presentationId')({
  beforeLoad: async ({ location }) => {
    const session = await getSession()

    if (!session) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }

    return {
      user: session.user,
    }
  },
  component: PresentationDetailPage,
})

function PresentationDetailPage() {
  const { presentationId } = Route.useParams()
  const navigate = useNavigate()

  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const [sidebarTab, setSidebarTab] = useState<'slides' | 'chat'>('slides')
  const [showSettings, setShowSettings] = useState(false)
  const [showSlideEditor, setShowSlideEditor] = useState(false)
  const [showSlideshow, setShowSlideshow] = useState(false)
  const [autoStartSlideshow, setAutoStartSlideshow] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  const [slideDraft, setSlideDraft] = useState({
    title: '',
    content: '',
    notes: '',
    imageUrl: '',
  })

  const [imageSearchQuery, setImageSearchQuery] = useState('')
  const [imageResults, setImageResults] = useState<
    Array<{ url: string; title: string }>
  >([])
  const [isSearchingImages, setIsSearchingImages] = useState(false)

  const {
    query,
    slides,
    isGenerating,
    updatedLabel,
    form,
    setForm,
    updateMut,
    regenerateMut,
    deleteMut,
    updateSlideMut,
    addSlideMut,
    deleteSlideMut,
    moveSlideMut,
  } = usePresentationDetail(presentationId, {
    onDeleted: () => navigate({ to: '/' }),
  })

  const { isFullscreen, toggleFullscreen } = useFullscreen(
    'slide-preview-container',
  )

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    setTheme(isDark ? 'dark' : 'light')
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
  }

  useEffect(() => {
    if (slides.length > 0 && activeSlideIndex >= slides.length) {
      setActiveSlideIndex(slides.length - 1)
    }
  }, [slides.length, activeSlideIndex])

  const activeSlide = slides.at(activeSlideIndex)

  useEffect(() => {
    if (!activeSlide) return
    setSlideDraft({
      title: activeSlide.title,
      content: activeSlide.content,
      notes: activeSlide.notes ?? '',
      imageUrl: activeSlide.imageUrl ?? '',
    })
    setImageSearchQuery(activeSlide.imagePrompt || activeSlide.title)
    setImageResults([])
  }, [
    activeSlide?.id,
    activeSlide?.title,
    activeSlide?.content,
    activeSlide?.notes,
    activeSlide?.imageUrl,
    activeSlide?.imagePrompt,
  ])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (showSlideshow || event.repeat) return
      const target = event.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        setActiveSlideIndex((i) => Math.max(0, i - 1))
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        setActiveSlideIndex((i) => Math.min(slides.length - 1, i + 1))
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [slides.length, showSlideshow])

  const handleExport = useCallback(
    async (options: ExportOptions) => {
      const data = query.data
      if (!data || slides.length === 0) return

      setIsExporting(true)
      try {
        if (options.format === 'pdf') {
          exportToPrintablePdf({
            title: data.title,
            slides,
            includeNotes: options.includeNotes,
            includeImages: options.includeImages,
          })
          toast.success('Opened print-to-PDF view')
        } else {
          const filename = await exportToPptx({
            title: data.title,
            slides,
            includeNotes: options.includeNotes,
            includeImages: options.includeImages,
          })
          toast.success(`Exported ${filename}`)
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Export failed')
        throw e
      } finally {
        setIsExporting(false)
      }
    },
    [query.data, slides],
  )

  const handleSaveSlide = () => {
    if (!activeSlide) return
    if (!slideDraft.title.trim()) {
      toast.error('Slide title cannot be empty')
      return
    }
    updateSlideMut.mutate({
      slideId: activeSlide.id,
      title: slideDraft.title.trim(),
      content: slideDraft.content,
      notes: slideDraft.notes.trim() || null,
      imageUrl: slideDraft.imageUrl.trim() || null,
    })
  }

  const handleSearchTopicImages = async () => {
    const q = imageSearchQuery.trim() || slideDraft.title.trim()
    if (!q) return
    setIsSearchingImages(true)
    try {
      const res = await searchSlideImages({ data: { query: q } })
      setImageResults(res.images)
      if (res.images.length === 0) {
        toast.info('No matching photos found — try a shorter 2-word topic query')
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Image search failed',
      )
    } finally {
      setIsSearchingImages(false)
    }
  }

  const handleAddSlide = async () => {
    try {
      await addSlideMut.mutateAsync({})
      setActiveSlideIndex(slides.length)
      setShowSlideEditor(true)
    } catch {
      // handled in mutation
    }
  }

  const handleMoveSlide = async (direction: 'up' | 'down') => {
    if (!activeSlide) return
    const res = await moveSlideMut.mutateAsync({
      slideId: activeSlide.id,
      direction,
    })
    setActiveSlideIndex(res.newIndex)
  }

  if (query.isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl border bg-card shadow-sm">
            <RefreshCw className="size-5 animate-spin text-primary" />
          </div>
          <div>
            <p className="font-semibold">Loading presentation</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Preparing your studio workspace…
            </p>
          </div>
        </div>
      </main>
    )
  }

  if (query.isError) {
    const error = query.error
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-3xl border bg-card p-8 text-center shadow-depth-md">
          <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-destructive/10">
            <AlertTriangle className="size-6 text-destructive" />
          </div>
          <h1 className="text-lg font-semibold">Unable to load presentation</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {error instanceof Error
              ? error.message
              : 'Something went wrong while loading your presentation.'}
          </p>
          <Button
            variant="outline"
            className="mt-6 rounded-xl"
            render={<Link to="/" />}
          >
            <ArrowLeft className="mr-2 size-4" />
            Back to Studio
          </Button>
        </div>
      </main>
    )
  }

  const data = query.data
  if (!data) return null
  const isFailed = data.status === 'FAILED'

  return (
    <main className="min-h-screen bg-background">
      {/* Dedicated Studio Topbar */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6">
          {/* Left: Back + Title + Status */}
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="size-9 shrink-0 rounded-xl"
              aria-label="Back to Studio"
              render={<Link to="/" />}
            >
              <ArrowLeft className="size-4" />
            </Button>

            <Link
              to="/"
              className="hidden shrink-0 items-center gap-2 sm:flex"
            >
              <img
                src="/deckgen.png"
                alt="DeckGen"
                className="size-7 rounded-lg object-cover ring-1 ring-border/50"
              />
            </Link>

            <div className="hidden h-5 w-px bg-border sm:block" />

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="max-w-[160px] truncate text-sm font-semibold sm:max-w-[300px] md:max-w-[400px]">
                  {data.title}
                </h1>
                <GenerationStatus status={data.status} />
              </div>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {slides.length} {slides.length === 1 ? 'slide' : 'slides'}
                {' · '}
                Updated {updatedLabel}
              </p>
            </div>
          </div>

          {/* Right: Studio Controls */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {slides.length > 0 && (
              <>
                <Button
                  variant={sidebarTab === 'chat' ? 'secondary' : 'ghost'}
                  size="sm"
                  aria-label="Open AI Deck Chat"
                  className="gap-1.5 rounded-xl"
                  onClick={() =>
                    setSidebarTab((t) => (t === 'chat' ? 'slides' : 'chat'))
                  }
                >
                  <MessageSquareText className="size-3.5 text-primary" />
                  <span className="hidden lg:inline">AI Chat</span>
                </Button>

                <Button
                  variant={showSlideEditor ? 'secondary' : 'ghost'}
                  size="sm"
                  aria-label={
                    showSlideEditor ? 'Done editing slide' : 'Edit slide'
                  }
                  className="gap-1.5 rounded-xl"
                  onClick={() => {
                    setShowSlideEditor((v) => !v)
                    if (!showSlideEditor) setShowSettings(false)
                  }}
                >
                  <Pencil className="size-3.5" />
                  <span className="hidden md:inline">
                    {showSlideEditor ? 'Done' : 'Edit Slide'}
                  </span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Present manually"
                  className="gap-1.5 rounded-xl"
                  onClick={() => {
                    setAutoStartSlideshow(false)
                    setShowSlideshow(true)
                  }}
                >
                  <Play className="size-3.5" />
                  <span className="hidden sm:inline">Present</span>
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  aria-label="Start automatic slideshow"
                  className="gap-1.5 rounded-xl border border-primary/25 bg-primary/12 text-primary hover:bg-primary/20"
                  onClick={() => {
                    setAutoStartSlideshow(true)
                    setShowSlideshow(true)
                  }}
                >
                  <PlayCircle className="size-3.5" />
                  <span className="hidden sm:inline">Slideshow</span>
                </Button>

                <ExportOptionsDialog
                  onExport={handleExport}
                  isExporting={isExporting}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label="Export presentation"
                    className="gap-1.5 rounded-xl"
                    disabled={isExporting}
                  >
                    <Download className="size-3.5" />
                    <span className="hidden sm:inline">
                      {isExporting ? 'Exporting…' : 'Export'}
                    </span>
                  </Button>
                </ExportOptionsDialog>
              </>
            )}

            <Button
              variant={showSettings ? 'default' : 'outline'}
              size="sm"
              aria-label={showSettings ? 'Close deck settings' : 'Deck settings'}
              className="gap-1.5 rounded-xl"
              onClick={() => {
                setShowSettings((v) => !v)
                if (!showSettings) setShowSlideEditor(false)
              }}
            >
              <Settings2 className="size-3.5" />
              <span className="hidden xl:inline">
                {showSettings ? 'Close' : 'Deck Settings'}
              </span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="size-9 rounded-xl"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Studio Body */}
      <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:py-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px] xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="min-w-0 space-y-5">
            {/* Failed Alert Banner */}
            {isFailed && (
              <div className="flex flex-col gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
                  <div>
                    <p className="text-sm font-semibold text-destructive">
                      Slide generation encountered an error
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      This can happen if an AI provider was temporarily
                      rate-limited. Click retry to generate again.
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="destructive"
                  className="shrink-0 gap-2 rounded-xl"
                  disabled={regenerateMut.isPending}
                  onClick={() => regenerateMut.mutate()}
                >
                  <RefreshCw className="size-3.5" />
                  Retry Generation
                </Button>
              </div>
            )}

            {/* Deck Settings Panel */}
            {showSettings && (
              <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-depth-sm">
                <div className="flex items-center justify-between border-b bg-muted/25 px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-xl bg-primary/15">
                      <Sparkles className="size-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">Deck Settings</h3>
                      <p className="text-xs text-muted-foreground">
                        Update title, prompt, or regenerate with new styling.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-lg"
                    onClick={() => setShowSettings(false)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>

                <div className="space-y-5 p-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="pres-title" className="text-xs font-semibold">
                      Presentation title
                    </Label>
                    <Input
                      id="pres-title"
                      value={form.title}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, title: e.target.value }))
                      }
                      className="h-10 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="presentation-prompt"
                      className="text-xs font-semibold"
                    >
                      AI Prompt / Outline
                    </Label>
                    <Textarea
                      id="presentation-prompt"
                      value={form.prompt}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, prompt: e.target.value }))
                      }
                      className="min-h-[110px] resize-y rounded-xl text-sm leading-6"
                    />
                  </div>

                  <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl border bg-muted/20 p-3.5">
                      <div className="mb-3 flex items-center justify-between">
                        <Label className="text-xs font-semibold">Slides</Label>
                        <span className="rounded-md bg-primary/15 px-2 py-0.5 font-mono text-xs font-bold text-primary">
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
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Style</Label>
                      <Select
                        value={form.style}
                        onValueChange={(value) =>
                          setForm((s) => ({
                            ...s,
                            style:
                              value as (typeof SLIDE_STYLES)[number]['value'],
                          }))
                        }
                      >
                        <SelectTrigger className="h-10 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SLIDE_STYLES.map((style) => (
                            <SelectItem key={style.value} value={style.value}>
                              {style.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Tone</Label>
                      <Select
                        value={form.tone}
                        onValueChange={(value) =>
                          setForm((s) => ({
                            ...s,
                            tone: value as (typeof TONE_OPTIONS)[number]['value'],
                          }))
                        }
                      >
                        <SelectTrigger className="h-10 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TONE_OPTIONS.map((tone) => (
                            <SelectItem key={tone.value} value={tone.value}>
                              {tone.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Layout</Label>
                      <Select
                        value={form.layout}
                        onValueChange={(value) =>
                          setForm((s) => ({
                            ...s,
                            layout:
                              value as (typeof LAYOUT_OPTIONS)[number]['value'],
                          }))
                        }
                      >
                        <SelectTrigger className="h-10 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LAYOUT_OPTIONS.map((layout) => (
                            <SelectItem key={layout.value} value={layout.value}>
                              {layout.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                    <AlertDialog>
                      <AlertDialogTrigger
                        render={
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                            disabled={deleteMut.isPending}
                          >
                            <Trash2 className="mr-2 size-4" />
                            Delete Deck
                          </Button>
                        }
                      />
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete presentation?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This permanently deletes &ldquo;{data.title}&rdquo;
                            and all of its slides.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => deleteMut.mutate()}
                          >
                            {deleteMut.isPending ? 'Deleting…' : 'Delete'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1.5 rounded-xl"
                        disabled={regenerateMut.isPending || isGenerating}
                        onClick={() => regenerateMut.mutate()}
                      >
                        <RefreshCw
                          className={`size-3.5 ${isGenerating ? 'animate-spin' : ''}`}
                        />
                        {isGenerating ? 'Generating…' : 'Regenerate Deck'}
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        className="gap-1.5 rounded-xl font-semibold"
                        disabled={
                          updateMut.isPending ||
                          !form.title.trim() ||
                          !form.prompt.trim()
                        }
                        onClick={() => updateMut.mutate()}
                      >
                        <Save className="size-3.5" />
                        {updateMut.isPending ? 'Saving…' : 'Save Settings'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Main Slide Canvas */}
            {activeSlide && (
              <div className="overflow-hidden rounded-3xl border border-border/70 bg-muted/20 shadow-depth-sm">
                <div
                  id="slide-preview-container"
                  className="group relative flex items-center justify-center overflow-hidden p-3 sm:p-5 lg:p-6"
                >
                  <div className="relative w-full max-w-5xl">
                    <SlidePreview
                      key={activeSlide.id}
                      slide={activeSlide}
                      style={data.style}
                      layout={data.layout}
                      deckTitle={data.title}
                      totalSlides={slides.length}
                      isFullscreen={isFullscreen}
                    />

                    {/* Floating Quick Action Buttons on Canvas */}
                    <div
                      className={`absolute right-3 top-3 z-20 flex items-center gap-1.5 transition-opacity ${
                        isFullscreen
                          ? 'opacity-100'
                          : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {!isFullscreen && (
                        <Button
                          variant="secondary"
                          size="icon"
                          className="size-8 rounded-lg border border-white/15 bg-black/60 text-white backdrop-blur hover:bg-black/80"
                          title="Edit this slide"
                          aria-label="Edit this slide"
                          onClick={() => setShowSlideEditor((v) => !v)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        size="icon"
                        className="size-8 rounded-lg border border-white/15 bg-black/60 text-white backdrop-blur hover:bg-black/80"
                        title="Toggle fullscreen"
                        aria-label="Toggle fullscreen"
                        onClick={toggleFullscreen}
                      >
                        <Maximize className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Bottom Slide Navigation Bar */}
                <div className="flex items-center justify-between border-t border-border/60 bg-card/80 px-4 py-3 sm:px-6">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 rounded-xl"
                    disabled={activeSlideIndex === 0}
                    onClick={() =>
                      setActiveSlideIndex((i) => Math.max(0, i - 1))
                    }
                  >
                    <ChevronLeft className="size-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </Button>

                  <div className="flex items-center gap-1.5">
                    {slides
                      .slice(0, Math.min(slides.length, 10))
                      .map((s, index) => (
                        <button
                          key={s.id}
                          type="button"
                          aria-label={`Go to slide ${index + 1}`}
                          onClick={() => setActiveSlideIndex(index)}
                          className={`h-1.5 rounded-full transition-all duration-200 ${
                            index === activeSlideIndex
                              ? 'w-6 bg-primary'
                              : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60'
                          }`}
                        />
                      ))}
                    {slides.length > 10 && (
                      <span className="ml-1 text-[11px] font-medium text-muted-foreground">
                        {activeSlideIndex + 1}/{slides.length}
                      </span>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 rounded-xl"
                    disabled={activeSlideIndex >= slides.length - 1}
                    onClick={() =>
                      setActiveSlideIndex((i) =>
                        Math.min(slides.length - 1, i + 1),
                      )
                    }
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Inline Slide Editor Panel + Topic Image Picker */}
            {activeSlide && showSlideEditor && (
              <div className="overflow-hidden rounded-2xl border border-primary/25 bg-card shadow-depth-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-primary/[0.04] px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                      {activeSlideIndex + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold">
                        Editing Slide {activeSlideIndex + 1}
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        Refine headline, bullet points, speaker notes, or pick a
                        topic-matched visual
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-8 rounded-lg"
                      title="Move slide up"
                      aria-label="Move slide up"
                      disabled={activeSlideIndex === 0 || moveSlideMut.isPending}
                      onClick={() => void handleMoveSlide('up')}
                    >
                      <ArrowUp className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-8 rounded-lg"
                      title="Move slide down"
                      aria-label="Move slide down"
                      disabled={
                        activeSlideIndex >= slides.length - 1 ||
                        moveSlideMut.isPending
                      }
                      onClick={() => void handleMoveSlide('down')}
                    >
                      <ArrowDown className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
                      title="Delete this slide"
                      aria-label="Delete this slide"
                      disabled={slides.length <= 1 || deleteSlideMut.isPending}
                      onClick={() => deleteSlideMut.mutate(activeSlide.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="grid gap-5 p-5 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="slide-title-input"
                        className="text-xs font-semibold"
                      >
                        Slide Headline
                      </Label>
                      <Input
                        id="slide-title-input"
                        value={slideDraft.title}
                        onChange={(e) =>
                          setSlideDraft((s) => ({
                            ...s,
                            title: e.target.value,
                          }))
                        }
                        className="h-10 rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="slide-content-input"
                        className="text-xs font-semibold"
                      >
                        Content / Bullet Points (one per line)
                      </Label>
                      <Textarea
                        id="slide-content-input"
                        value={slideDraft.content}
                        onChange={(e) =>
                          setSlideDraft((s) => ({
                            ...s,
                            content: e.target.value,
                          }))
                        }
                        className="min-h-[140px] resize-y rounded-xl text-sm leading-6"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="slide-notes-input"
                        className="text-xs font-semibold"
                      >
                        Speaker Notes
                      </Label>
                      <Textarea
                        id="slide-notes-input"
                        placeholder="Add presenter talking points…"
                        value={slideDraft.notes}
                        onChange={(e) =>
                          setSlideDraft((s) => ({
                            ...s,
                            notes: e.target.value,
                          }))
                        }
                        className="min-h-[86px] resize-y rounded-xl text-sm leading-6"
                      />
                    </div>

                    {/* Topic Image Search Picker */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="slide-image-search"
                          className="text-xs font-semibold"
                        >
                          Topic Visual Search
                        </Label>
                        {slideDraft.imageUrl && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 rounded-md px-2 text-[11px] text-muted-foreground"
                            onClick={() =>
                              setSlideDraft((s) => ({ ...s, imageUrl: '' }))
                            }
                          >
                            Remove image
                          </Button>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Input
                          id="slide-image-search"
                          placeholder="e.g. solar farm, data center, team meeting"
                          value={imageSearchQuery}
                          onChange={(e) => setImageSearchQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              void handleSearchTopicImages()
                            }
                          }}
                          className="h-9 rounded-xl text-xs"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-9 shrink-0 gap-1.5 rounded-xl"
                          disabled={isSearchingImages}
                          onClick={() => void handleSearchTopicImages()}
                        >
                          {isSearchingImages ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Search className="size-3.5" />
                          )}
                          Find Photos
                        </Button>
                      </div>

                      {imageResults.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 pt-1">
                          {imageResults.map((img) => {
                            const selected = slideDraft.imageUrl === img.url
                            return (
                              <button
                                key={img.url}
                                type="button"
                                onClick={() =>
                                  setSlideDraft((s) => ({
                                    ...s,
                                    imageUrl: img.url,
                                  }))
                                }
                                title={img.title}
                                className={`relative aspect-video overflow-hidden rounded-lg border transition-all ${
                                  selected
                                    ? 'ring-2 ring-primary border-primary'
                                    : 'border-border/60 hover:border-primary/60'
                                }`}
                              >
                                <img
                                  src={img.url}
                                  alt={img.title}
                                  className="h-full w-full object-cover"
                                />
                              </button>
                            )
                          })}
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        <ImageIcon className="size-3.5 shrink-0 text-muted-foreground" />
                        <Input
                          placeholder="Or paste custom image URL…"
                          value={slideDraft.imageUrl}
                          onChange={(e) =>
                            setSlideDraft((s) => ({
                              ...s,
                              imageUrl: e.target.value,
                            }))
                          }
                          className="h-8 rounded-lg text-[11px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t bg-muted/20 px-5 py-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => setShowSlideEditor(false)}
                  >
                    Close
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="gap-1.5 rounded-xl font-semibold"
                    disabled={updateSlideMut.isPending}
                    onClick={handleSaveSlide}
                  >
                    <Save className="size-3.5" />
                    {updateSlideMut.isPending ? 'Saving…' : 'Save Slide'}
                  </Button>
                </div>
              </div>
            )}

            {/* Empty / Ready to Generate State */}
            {slides.length === 0 && !isGenerating && (
              <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-card/40 px-6 text-center">
                <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-primary/12 ring-8 ring-primary/5">
                  <Sparkles className="size-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold tracking-tight">
                  {isFailed
                    ? 'Generation failed — let’s try again'
                    : 'No slides yet'}
                </h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  Generate AI slides with topic-matched visuals from your
                  prompt, or add your first slide manually.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Button
                    className="gap-2 rounded-xl px-5 font-semibold"
                    onClick={() => regenerateMut.mutate()}
                    disabled={regenerateMut.isPending}
                  >
                    <Sparkles className="size-4" />
                    {isFailed ? 'Retry AI Generation' : 'Generate Slides'}
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2 rounded-xl"
                    onClick={() => void handleAddSlide()}
                    disabled={addSlideMut.isPending}
                  >
                    <Plus className="size-4" />
                    Add Blank Slide
                  </Button>
                </div>
              </div>
            )}

            {/* Generating State */}
            {slides.length === 0 && isGenerating && (
              <div className="relative flex min-h-[60vh] flex-col items-center justify-center overflow-hidden rounded-3xl border border-border/70 bg-card/50 px-6 text-center">
                <div className="pointer-events-none absolute size-72 rounded-full bg-primary/12 blur-3xl" />
                <div className="relative flex flex-col items-center">
                  <div className="mb-5 flex size-16 items-center justify-center rounded-2xl border border-primary/25 bg-background shadow-md">
                    <RefreshCw className="size-7 animate-spin text-primary" />
                  </div>
                  <h3 className="text-lg font-bold tracking-tight">
                    Crafting your presentation…
                  </h3>
                  <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                    Writing {data.slideCount} aligned slides and finding
                    topic-matched photography for &ldquo;{data.title}&rdquo;.
                  </p>
                  <div className="mt-6 h-1.5 w-56 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-2/3 animate-pulse rounded-full bg-primary" />
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Usually finishes in 15–30 seconds
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Right Studio Sidebar: Tabbed Slides + AI Copilot Chat */}
          {slides.length > 0 && (
            <aside className="lg:sticky lg:top-[84px] lg:h-[calc(100vh-108px)]">
              <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/85 shadow-depth-sm backdrop-blur-md">
                {/* Sidebar Tabs Header */}
                <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-muted/25 px-3 py-2.5">
                  <div className="grid flex-1 grid-cols-2 rounded-xl border border-border/60 bg-background/70 p-0.5">
                    <button
                      type="button"
                      onClick={() => setSidebarTab('slides')}
                      className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                        sidebarTab === 'slides'
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Layers className="size-3.5" />
                      Slides ({slides.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSidebarTab('chat')}
                      className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                        sidebarTab === 'chat'
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <MessageSquareText className="size-3.5" />
                      AI Chat
                    </button>
                  </div>

                  {sidebarTab === 'slides' && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-8 shrink-0 rounded-lg"
                      title="Add slide"
                      aria-label="Add slide"
                      disabled={addSlideMut.isPending}
                      onClick={() => void handleAddSlide()}
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  )}
                </div>

                {sidebarTab === 'slides' ? (
                  <div className="scrollbar-thin flex-1 space-y-2.5 overflow-y-auto p-3">
                    {slides.map((slide, index) => (
                      <SlideCard
                        key={slide.id}
                        slide={slide}
                        isActive={index === activeSlideIndex}
                        onClick={() => setActiveSlideIndex(index)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="min-h-[420px] flex-1 overflow-hidden">
                    <DeckChatPanel
                      presentationId={presentationId}
                      activeSlideId={activeSlide?.id}
                      activeSlideNumber={activeSlideIndex + 1}
                      activeSlideTitle={activeSlide?.title}
                      onSlideFocus={(idx) => setActiveSlideIndex(idx)}
                    />
                  </div>
                )}
              </div>
            </aside>
          )}
        </div>
      </div>

      {showSlideshow && (
        <SlideshowModal
          slides={slides}
          style={data.style}
          layout={data.layout}
          deckTitle={data.title}
          initialIndex={activeSlideIndex}
          autoStart={autoStartSlideshow}
          onClose={() => {
            setShowSlideshow(false)
            setAutoStartSlideshow(false)
          }}
        />
      )}
    </main>
  )
}
