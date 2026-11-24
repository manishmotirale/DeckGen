import { Button } from '#/components/ui/button'
import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { SlidePreview } from './slide-preview'

type Slide = {
  id: string
  order: number
  title: string
  content: string
  notes?: string | null
  imageUrl?: string | null
  imagePrompt?: string | null
}

type SlideshowModalProps = {
  slides: Slide[]
  style?: string
  layout?: string
  deckTitle?: string
  initialIndex?: number
  autoStart?: boolean
  onClose: () => void
}

const INTERVAL_OPTIONS = [
  { label: '3s', ms: 3000 },
  { label: '5s', ms: 5000 },
  { label: '8s', ms: 8000 },
] as const

export function SlideshowModal({
  slides,
  style = 'minimal',
  layout = 'balanced',
  deckTitle,
  initialIndex = 0,
  autoStart = false,
  onClose,
}: SlideshowModalProps) {
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [currentIndex, setCurrentIndex] = useState(() =>
    Math.min(Math.max(initialIndex, 0), Math.max(slides.length - 1, 0)),
  )
  const [isPlaying, setIsPlaying] = useState(autoStart)
  const [intervalMs, setIntervalMs] = useState<number>(5000)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const hideControlsAfterDelay = useCallback(() => {
    setShowControls(true)

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }

    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false)
    }, 4000)
  }, [])

  // Strictly move EXACTLY one slide backward
  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1))
    hideControlsAfterDelay()
  }, [hideControlsAfterDelay])

  // Strictly move EXACTLY one slide forward
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(slides.length - 1, prev + 1))
    hideControlsAfterDelay()
  }, [slides.length, hideControlsAfterDelay])

  const toggleSlideshow = useCallback(() => {
    setIsPlaying((playing) => {
      // If starting from the very last slide, restart from Slide 1
      if (!playing && currentIndex >= slides.length - 1) {
        setCurrentIndex(0)
      }
      return !playing
    })
    hideControlsAfterDelay()
  }, [currentIndex, slides.length, hideControlsAfterDelay])

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch {
      // ignore browser fullscreen denial
    }
  }, [])

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  // Single deterministic slideshow timer: advances strictly 1 slide at a time
  useEffect(() => {
    if (!isPlaying || slides.length <= 1) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= slides.length - 1) {
          setIsPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, intervalMs)

    return () => clearInterval(timer)
  }, [isPlaying, intervalMs, slides.length])

  // Single keyboard handler (ignores key-repeat so 1 press = 1 slide)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return

      switch (event.key) {
        case 'Escape':
          event.preventDefault()
          onClose()
          break
        case 'ArrowLeft':
          event.preventDefault()
          event.stopPropagation()
          goToPrevious()
          break
        case 'ArrowRight':
          event.preventDefault()
          event.stopPropagation()
          goToNext()
          break
        case ' ':
        case 'p':
        case 'P':
          event.preventDefault()
          toggleSlideshow()
          break
        case 'f':
        case 'F':
          event.preventDefault()
          void toggleFullscreen()
          break
        case 'Home':
          event.preventDefault()
          setCurrentIndex(0)
          hideControlsAfterDelay()
          break
        case 'End':
          event.preventDefault()
          setCurrentIndex(slides.length - 1)
          hideControlsAfterDelay()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown, { capture: true })
    return () =>
      window.removeEventListener('keydown', handleKeyDown, { capture: true })
  }, [
    onClose,
    goToPrevious,
    goToNext,
    toggleSlideshow,
    toggleFullscreen,
    hideControlsAfterDelay,
    slides.length,
  ])

  useEffect(() => {
    hideControlsAfterDelay()
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [hideControlsAfterDelay])

  if (!slides.length) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="text-center">
          <p className="text-lg font-medium text-white">No slides available</p>
          <Button variant="outline" className="mt-6" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    )
  }

  const activeSlide = slides[currentIndex] ?? slides[0]
  const isLastSlide = currentIndex >= slides.length - 1

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-zinc-950 select-none"
      onMouseMove={hideControlsAfterDelay}
    >
      {/* Active Slide View (1-by-1 controlled transition) */}
      <div
        key={activeSlide.id}
        className="relative h-full w-full pb-24 animate-in fade-in duration-300"
      >
        <SlidePreview
          slide={activeSlide}
          style={style}
          layout={layout}
          deckTitle={deckTitle}
          totalSlides={slides.length}
          isFullscreen
        />

        {activeSlide.notes && showControls && (
          <div className="absolute bottom-28 left-1/2 z-20 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2">
            <div className="rounded-xl border border-white/12 bg-black/75 px-4 py-2.5 shadow-2xl backdrop-blur-xl">
              <p className="text-center text-xs leading-relaxed text-white/80">
                <span className="font-semibold text-white">Speaker notes:</span>{' '}
                {activeSlide.notes}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Top controls */}
      <div
        className={`absolute left-0 right-0 top-0 z-30 transition-all duration-300 ${
          showControls
            ? 'translate-y-0 opacity-100'
            : '-translate-y-3 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between p-4 sm:p-6">
          {/* Status badge */}
          <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/55 px-3.5 py-1.5 text-xs font-medium text-white/85 backdrop-blur-xl">
            <span
              className={`size-2 rounded-full ${
                isPlaying ? 'animate-pulse bg-emerald-400' : 'bg-primary'
              }`}
            />
            {isPlaying ? 'Slideshow Playing' : 'Presenting'}
            <span className="text-white/40">·</span>
            <span className="font-mono text-white">
              {currentIndex + 1} / {slides.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="size-10 rounded-full border border-white/15 bg-black/55 text-white hover:bg-white/15 hover:text-white"
              onClick={() => void toggleFullscreen()}
              title="Fullscreen (F)"
              aria-label="Toggle fullscreen"
            >
              {isFullscreen ? (
                <Minimize className="size-4" />
              ) : (
                <Maximize className="size-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-10 rounded-full border border-white/15 bg-black/55 text-white hover:bg-white/15 hover:text-white"
              onClick={onClose}
              title="Close (Esc)"
              aria-label="Close slideshow"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-30 transition-all duration-300 ${
          showControls
            ? 'translate-y-0 opacity-100'
            : 'translate-y-3 opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/95 via-black/65 to-transparent" />
        <div className="px-4 pb-5 pt-8 sm:px-6">
          {/* Progress bar + clickable slide dots */}
          <div className="mx-auto mb-4 flex max-w-3xl items-center gap-3">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{
                  width: `${((currentIndex + 1) / slides.length) * 100}%`,
                }}
              />
            </div>
            <span className="font-mono text-xs text-white/70">
              {currentIndex + 1}/{slides.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            {/* Previous (1 slide) */}
            <Button
              variant="ghost"
              size="icon"
              className="size-11 rounded-full border border-white/15 bg-black/50 text-white hover:bg-white/15 hover:text-white disabled:opacity-35"
              onClick={goToPrevious}
              disabled={currentIndex === 0}
              title="Previous slide (←)"
              aria-label="Previous slide"
            >
              <ChevronLeft className="size-5" />
            </Button>

            {/* Primary Slideshow Play / Pause Pill */}
            <Button
              variant="ghost"
              size="sm"
              className={`h-11 gap-2 rounded-full border px-5 text-xs font-semibold backdrop-blur-xl transition-all ${
                isPlaying
                  ? 'border-primary/50 bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'border-white/20 bg-white/12 text-white hover:bg-white/20 hover:text-white'
              }`}
              onClick={toggleSlideshow}
              title={isPlaying ? 'Pause Slideshow (Space)' : 'Start Slideshow (Space)'}
              aria-label={isPlaying ? 'Pause slideshow' : 'Start slideshow'}
            >
              {isPlaying ? (
                <>
                  <Pause className="size-4 fill-current" />
                  Pause Slideshow
                </>
              ) : isLastSlide ? (
                <>
                  <RotateCcw className="size-4" />
                  Replay Slideshow
                </>
              ) : (
                <>
                  <Play className="size-4 fill-current" />
                  Slideshow
                </>
              )}
            </Button>

            {/* Next (1 slide) */}
            <Button
              variant="ghost"
              size="icon"
              className="size-11 rounded-full border border-white/15 bg-black/50 text-white hover:bg-white/15 hover:text-white disabled:opacity-35"
              onClick={goToNext}
              disabled={isLastSlide}
              title="Next slide (→)"
              aria-label="Next slide"
            >
              <ChevronRight className="size-5" />
            </Button>

            {/* Slideshow Speed Picker */}
            <div className="hidden items-center gap-1 rounded-full border border-white/15 bg-black/50 p-1 sm:flex">
              {INTERVAL_OPTIONS.map((opt) => (
                <button
                  key={opt.ms}
                  type="button"
                  onClick={() => {
                    setIntervalMs(opt.ms)
                    hideControlsAfterDelay()
                  }}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                    intervalMs === opt.ms
                      ? 'bg-white/20 text-white'
                      : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-3 hidden text-center text-[11px] text-white/40 sm:block">
            ← → Move 1 slide · Space Start/Pause Slideshow · F Fullscreen · Esc
            Exit
          </p>
        </div>
      </div>
    </div>
  )
}
