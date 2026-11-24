import { useEffect, useState } from 'react'

type SlideCardProps = {
  slide: {
    id: string
    order: number
    title: string
    content: string
    notes?: string | null
    imageUrl?: string | null
  }
  isActive?: boolean
  onClick?: () => void
}

export function SlideCard({
  slide,
  isActive = false,
  onClick,
}: SlideCardProps) {
  const [imageStatus, setImageStatus] = useState<
    'loading' | 'loaded' | 'error'
  >(slide.imageUrl ? 'loading' : 'error')

  useEffect(() => {
    setImageStatus(slide.imageUrl ? 'loading' : 'error')
  }, [slide.id, slide.imageUrl])

  const hasImage = Boolean(slide.imageUrl) && imageStatus !== 'error'

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? 'true' : undefined}
      className={`group relative w-full overflow-hidden rounded-xl text-left transition-all duration-200 ${
        isActive
          ? 'bg-primary/10 ring-2 ring-primary/70 shadow-sm'
          : 'border border-border/50 bg-card/50 hover:border-primary/35 hover:bg-card'
      }`}
    >
      <div className="p-2.5">
        {/* Header row */}
        <div className="mb-2 flex items-center gap-2">
          <span
            className={`flex size-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold transition-colors ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground group-hover:bg-primary/15 group-hover:text-primary'
            }`}
          >
            {slide.order + 1}
          </span>

          <h3 className="min-w-0 flex-1 truncate text-xs font-semibold text-foreground">
            {slide.title}
          </h3>
        </div>

        {/* Mini 16:9 Aligned Slide Preview */}
        <div
          className={`relative grid aspect-video grid-cols-12 items-center gap-2 overflow-hidden rounded-lg border bg-gradient-to-br from-zinc-950 via-zinc-900 to-slate-950 p-2.5 ${
            isActive ? 'border-primary/40' : 'border-border/40'
          }`}
        >
          {/* Mini text column */}
          <div className={hasImage ? 'col-span-7 min-w-0' : 'col-span-12 min-w-0'}>
            <div className="mb-1 h-0.5 w-4 rounded-full bg-primary" />
            <p className="line-clamp-2 text-[9px] font-semibold leading-tight text-white">
              {slide.title}
            </p>
            <p className="mt-1 line-clamp-2 text-[7.5px] leading-tight text-zinc-400">
              {slide.content.replace(/^[-•*]\s+/gm, '')}
            </p>
          </div>

          {/* Mini framed image column */}
          {hasImage && (
            <div className="col-span-5 h-full max-h-[68px] overflow-hidden rounded-md border border-white/15 bg-zinc-800">
              <img
                src={slide.imageUrl!}
                alt=""
                loading="lazy"
                onLoad={() => setImageStatus('loaded')}
                onError={() => setImageStatus('error')}
                className={`h-full w-full object-cover transition-opacity duration-300 ${
                  imageStatus === 'loaded' ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </div>
          )}
        </div>
      </div>
    </button>
  )
}
