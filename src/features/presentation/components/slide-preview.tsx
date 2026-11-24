import { useEffect, useState } from 'react'

type SlidePreviewProps = {
  slide: {
    id: string
    order: number
    title: string
    content: string
    notes?: string | null
    imageUrl?: string | null
    imagePrompt?: string | null
  }
  style?: string
  layout?: string
  deckTitle?: string
  totalSlides?: number
  isFullscreen?: boolean
}

function parseSlideLines(content: string): string[] {
  return content
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.replace(/^[-•*]\s+/, ''))
}

const STYLE_THEMES: Record<
  string,
  {
    surface: string
    glow: string
    bar: string
    dot: string
    pill: string
  }
> = {
  minimal: {
    surface: 'from-zinc-950 via-zinc-900 to-slate-950',
    glow: 'from-primary/14 via-transparent to-transparent',
    bar: 'bg-primary',
    dot: 'bg-primary',
    pill: 'border-primary/25 bg-primary/10 text-primary',
  },
  professional: {
    surface: 'from-slate-950 via-slate-900 to-zinc-950',
    glow: 'from-sky-500/14 via-transparent to-indigo-500/10',
    bar: 'bg-sky-400',
    dot: 'bg-sky-400',
    pill: 'border-sky-400/25 bg-sky-400/10 text-sky-300',
  },
  creative: {
    surface: 'from-zinc-950 via-neutral-900 to-stone-950',
    glow: 'from-amber-400/16 via-rose-500/8 to-violet-500/12',
    bar: 'bg-amber-400',
    dot: 'bg-amber-400',
    pill: 'border-amber-400/25 bg-amber-400/10 text-amber-300',
  },
  bold: {
    surface: 'from-neutral-950 via-zinc-900 to-neutral-950',
    glow: 'from-orange-500/20 via-primary/10 to-rose-600/10',
    bar: 'bg-orange-400',
    dot: 'bg-orange-400',
    pill: 'border-orange-400/30 bg-orange-400/10 text-orange-300',
  },
}

export function SlidePreview({
  slide,
  style = 'minimal',
  layout = 'balanced',
  deckTitle,
  totalSlides,
  isFullscreen = false,
}: SlidePreviewProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    setImageLoaded(false)
    setImageError(false)
  }, [slide.id, slide.imageUrl])

  const lines = parseSlideLines(slide.content)
  const isHero = slide.order === 0
  const theme = STYLE_THEMES[style] ?? STYLE_THEMES.minimal
  const hasImage = Boolean(slide.imageUrl) && !imageError
  // Alternate image side on content slides for visual rhythm (right on even, left on odd)
  const imageOnLeft =
    !isHero && layout !== 'bullet-points' && slide.order % 2 === 0
  const isVisualHeavy = layout === 'visual'

  return (
    <div
      className={`overflow-hidden ${
        isFullscreen
          ? 'h-full w-full bg-zinc-950'
          : 'rounded-2xl border border-border/60 bg-zinc-950 shadow-depth-md'
      }`}
    >
      {/* 16:9 Slide Canvas */}
      <div
        className={`relative flex flex-col justify-between overflow-hidden bg-gradient-to-br ${theme.surface} text-white ${
          isFullscreen ? 'h-full w-full' : 'aspect-video w-full'
        }`}
      >
        {/* Subtle ambient lighting */}
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${theme.glow}`}
        />
        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl" />

        {/* Top bar inside slide */}
        <div
          className={`relative z-20 flex items-center justify-between ${
            isFullscreen
              ? 'px-10 pt-8 md:px-14 md:pt-10'
              : 'px-6 pt-4 md:px-8 md:pt-5'
          }`}
        >
          <span
            className={`inline-flex items-center rounded-full border font-mono font-medium backdrop-blur-md ${theme.pill} ${
              isFullscreen ? 'px-3.5 py-1 text-xs' : 'px-2.5 py-0.5 text-[10px]'
            }`}
          >
            {String(slide.order + 1).padStart(2, '0')}
            {totalSlides ? ` / ${String(totalSlides).padStart(2, '0')}` : ''}
          </span>

          {deckTitle && !isHero && (
            <span
              className={`max-w-[50%] truncate font-medium text-white/40 ${
                isFullscreen ? 'text-xs' : 'pr-20 text-[10px]'
              }`}
            >
              {deckTitle}
            </span>
          )}
        </div>

        {/* Main Aligned Content Area (Split Text + Framed Topic Image) */}
        <div
          className={`relative z-10 flex flex-1 items-center ${
            isFullscreen
              ? 'px-10 py-6 md:px-14 md:py-10'
              : 'px-6 py-4 md:px-8 md:py-5'
          }`}
        >
          {hasImage ? (
            <div
              className={`grid h-full w-full items-center ${
                isFullscreen ? 'gap-10 md:grid-cols-12' : 'gap-5 sm:grid-cols-12'
              }`}
            >
              {/* Text Column */}
              <div
                className={`flex flex-col justify-center ${
                  isVisualHeavy ? 'sm:col-span-6' : 'sm:col-span-7'
                } ${imageOnLeft ? 'sm:order-2' : 'sm:order-1'}`}
              >
                <div
                  className={`mb-3 h-1 w-10 rounded-full ${theme.bar} ${
                    isFullscreen ? 'mb-5 h-1.5 w-14' : ''
                  }`}
                />

                <h2
                  className={`font-bold tracking-tight text-white ${
                    isHero
                      ? isFullscreen
                        ? 'text-4xl leading-[1.08] sm:text-5xl md:text-6xl'
                        : 'text-xl leading-[1.14] sm:text-2xl md:text-3xl'
                      : isFullscreen
                        ? 'text-3xl leading-[1.15] sm:text-4xl md:text-5xl'
                        : 'text-lg leading-snug sm:text-xl md:text-2xl'
                  }`}
                >
                  {slide.title}
                </h2>

                {lines.length > 0 &&
                  (isHero || lines.length === 1 ? (
                    <p
                      className={`leading-relaxed text-zinc-300 ${
                        isFullscreen
                          ? 'mt-5 text-lg sm:text-xl md:text-2xl'
                          : 'mt-3 text-xs sm:text-sm md:text-[15px]'
                      }`}
                    >
                      {lines.join(' ')}
                    </p>
                  ) : (
                    <ul
                      className={`${
                        isFullscreen
                          ? 'mt-7 space-y-4 text-base sm:text-lg md:text-xl'
                          : 'mt-3.5 space-y-2 text-[11px] sm:text-xs md:text-[13.5px]'
                      }`}
                    >
                      {lines.slice(0, 5).map((line, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2.5 leading-snug text-zinc-200/95"
                        >
                          <span
                            className={`mt-1.5 size-1.5 shrink-0 rounded-full ${theme.dot}`}
                          />
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  ))}
              </div>

              {/* Crisp Framed Topic Image Column */}
              <div
                className={`flex items-center justify-center ${
                  isVisualHeavy ? 'sm:col-span-6' : 'sm:col-span-5'
                } ${imageOnLeft ? 'sm:order-1' : 'sm:order-2'}`}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/15 bg-zinc-900/90 shadow-2xl ring-1 ring-black/40">
                  {!imageLoaded && (
                    <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-zinc-800/80 to-zinc-900" />
                  )}
                  <img
                    src={slide.imageUrl!}
                    alt={slide.imagePrompt || slide.title}
                    className={`h-full w-full object-cover transition-opacity duration-500 ${
                      imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => {
                      setImageLoaded(true)
                      setImageError(false)
                    }}
                    onError={() => {
                      setImageLoaded(false)
                      setImageError(true)
                    }}
                  />
                  {/* Subtle edge sheen */}
                  <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10" />
                </div>
              </div>
            </div>
          ) : (
            /* Clean Single-Column Editorial Layout when no image */
            <div
              className={`mx-auto w-full ${
                isHero ? 'max-w-3xl text-center' : 'max-w-3xl text-left'
              }`}
            >
              <div
                className={`mb-4 h-1 w-12 rounded-full ${theme.bar} ${
                  isHero ? 'mx-auto' : ''
                }`}
              />
              <h2
                className={`font-bold tracking-tight text-white ${
                  isHero
                    ? isFullscreen
                      ? 'text-4xl leading-[1.08] sm:text-5xl md:text-6xl'
                      : 'text-2xl leading-[1.12] sm:text-3xl md:text-4xl'
                    : isFullscreen
                      ? 'text-3xl leading-[1.12] sm:text-4xl md:text-5xl'
                      : 'text-xl leading-snug sm:text-2xl md:text-3xl'
                }`}
              >
                {slide.title}
              </h2>

              {lines.length > 0 &&
                (isHero || lines.length === 1 ? (
                  <p
                    className={`leading-relaxed text-zinc-300 ${
                      isHero ? 'mx-auto max-w-2xl' : ''
                    } ${
                      isFullscreen
                        ? 'mt-6 text-lg sm:text-xl md:text-2xl'
                        : 'mt-3.5 text-xs sm:text-sm md:text-base'
                    }`}
                  >
                    {lines.join(' ')}
                  </p>
                ) : (
                  <ul
                    className={`${
                      isFullscreen
                        ? 'mt-8 space-y-4 text-lg sm:text-xl md:text-2xl'
                        : 'mt-4 space-y-2.5 text-xs sm:text-sm md:text-[15px]'
                    }`}
                  >
                    {lines.slice(0, 6).map((line, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 leading-relaxed text-zinc-200/95"
                      >
                        <span
                          className={`mt-2 size-1.5 shrink-0 rounded-full ${theme.dot}`}
                        />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                ))}
            </div>
          )}
        </div>

        {/* Subtle bottom accent footer */}
        <div
          className={`relative z-20 flex items-center justify-between border-t border-white/[0.06] ${
            isFullscreen ? 'px-10 py-3.5 md:px-14' : 'px-6 py-2 md:px-8'
          }`}
        >
          <span className="text-[10px] font-medium tracking-wide text-white/35">
            DeckGen Studio
          </span>
          {slide.imagePrompt && hasImage && (
            <span className="max-w-[55%] truncate text-[10px] capitalize text-white/35">
              Visual: {slide.imagePrompt}
            </span>
          )}
        </div>
      </div>

      {/* Speaker notes strip (editor view) */}
      {slide.notes && !isFullscreen && (
        <div className="border-t border-white/10 bg-zinc-900/95 px-5 py-3 text-zinc-300">
          <div className="flex items-start gap-2.5">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
            <p className="text-xs leading-relaxed">
              <span className="font-semibold text-white/90">Speaker notes</span>
              <span className="mx-1.5 text-white/25">·</span>
              {slide.notes}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
