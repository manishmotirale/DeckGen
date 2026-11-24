import { useState } from 'react'
import { ImageIcon, Loader2, Download, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Slide = {
  id: string
  order: number
  title: string
  content: string
  notes?: string | null
  imageUrl?: string | null
}

type SlideThumbnailGridProps = {
  slides: Slide[]
  activeIndex: number
  onSlideClick: (index: number) => void
  onExportSlide?: (slide: Slide) => void
}

function SlideThumbnail({
  slide,
  isActive,
  onClick,
  onExportSlide,
}: {
  slide: Slide
  isActive: boolean
  onClick: () => void
  onExportSlide?: (slide: Slide) => void
}) {
  const [imageStatus, setImageStatus] = useState<
    'loading' | 'loaded' | 'error'
  >('loading')

  return (
    <div
      className={`group relative overflow-hidden rounded-xl transition-all duration-200 ${
        isActive
          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
          : 'hover:ring-1 hover:ring-border'
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        className="relative w-full text-left"
      >
        {/* Thumbnail */}
        <div
          className={`relative aspect-video overflow-hidden rounded-lg bg-muted/50 ${
            isActive ? 'border-2 border-primary' : 'border border-border/40'
          }`}
        >
          {slide.imageUrl ? (
            <>
              {imageStatus === 'loading' && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              )}

              {imageStatus === 'error' && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <ImageIcon className="size-5 text-muted-foreground" />
                </div>
              )}

              <img
                src={slide.imageUrl}
                alt={slide.title}
                className={`h-full w-full object-cover transition-all ${
                  imageStatus === 'loaded'
                    ? 'opacity-100 group-hover:scale-105'
                    : 'opacity-0'
                }`}
                loading="lazy"
                onLoad={() => setImageStatus('loaded')}
                onError={() => setImageStatus('error')}
              />
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <ImageIcon className="size-5 text-muted-foreground" />
            </div>
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="absolute bottom-0 left-0 right-0 p-2">
              <div className="flex items-center gap-1">
                {onExportSlide && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 gap-1 rounded-lg bg-background/90 px-2 text-xs backdrop-blur"
                    onClick={(e) => {
                      e.stopPropagation()
                      onExportSlide(slide)
                    }}
                  >
                    <Download className="size-3" />
                    Export
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-7 gap-1 rounded-lg bg-background/90 px-2 text-xs backdrop-blur"
                >
                  <Eye className="size-3" />
                  View
                </Button>
              </div>
            </div>
          </div>

          {/* Slide number badge */}
          <div
            className={`absolute left-2 top-2 flex size-6 items-center justify-center rounded-md text-[10px] font-bold shadow-sm ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'bg-background/90 text-foreground backdrop-blur'
            }`}
          >
            {slide.order + 1}
          </div>
        </div>

        {/* Title */}
        <p className="mt-2 truncate text-xs font-medium">{slide.title}</p>
      </button>
    </div>
  )
}

export function SlideThumbnailGrid({
  slides,
  activeIndex,
  onSlideClick,
  onExportSlide,
}: SlideThumbnailGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
      {slides.map((slide, index) => (
        <SlideThumbnail
          key={slide.id}
          slide={slide}
          isActive={index === activeIndex}
          onClick={() => onSlideClick(index)}
          onExportSlide={onExportSlide}
        />
      ))}
    </div>
  )
}
