import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Link } from '@tanstack/react-router'
import { ArrowUpRight, Calendar, Layers } from 'lucide-react'

import type { Presentation as PresentationType } from '../types/presentation.types'
import { presentationThumbnailUrl } from '../utils/thumbnail-url'
import { GenerationStatus } from './generation-status'
import { PresentationActionsMenu } from './presentation-actions-menu'

type PresentationCardProps = {
  presentation: PresentationType
  viewMode?: 'grid' | 'list'
}

export function PresentationCard({
  presentation: p,
  viewMode = 'grid',
}: PresentationCardProps) {
  const updated = new Date(p.updatedAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  const thumb = presentationThumbnailUrl(p.id)

  if (viewMode === 'list') {
    return (
      <div className="group relative">
        <Link
          to="/presentations/$presentationId"
          params={{ presentationId: p.id }}
          className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
        >
          <Card className="relative overflow-hidden border-border/60 bg-card/75 backdrop-blur-md transition-all duration-200 hover:border-primary/40 hover:shadow-depth-sm">
            <div className="flex items-center gap-4 p-3.5 sm:p-4">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-border/50 bg-muted/40">
                <img
                  src={thumb}
                  alt=""
                  width={56}
                  height={56}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="min-w-0 flex-1 pr-10">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="line-clamp-1 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {p.title}
                  </h3>
                  <GenerationStatus status={p.status} />
                </div>

                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Layers className="size-3" />
                    {p.slideCount} {p.slideCount === 1 ? 'slide' : 'slides'}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="size-3" />
                    {updated}
                  </span>
                  <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium capitalize">
                    {p.style}
                  </span>
                  <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium capitalize">
                    {p.tone}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </Link>

        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
          <PresentationActionsMenu presentation={p} />
        </div>
      </div>
    )
  }

  return (
    <div className="group relative h-full">
      <Link
        to="/presentations/$presentationId"
        params={{ presentationId: p.id }}
        className="block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
      >
        <Card className="card-elevated relative flex h-full flex-col justify-between overflow-hidden border-border/60 bg-card/80 py-0 backdrop-blur-md hover:border-primary/40 hover:shadow-depth-md">
          <div className="flex gap-3.5 p-4">
            {/* Thumbnail */}
            <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-border/50 bg-muted/40">
              <img
                src={thumb}
                alt=""
                width={64}
                height={64}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Content */}
            <CardHeader className="min-w-0 flex-1 gap-1.5 p-0 pr-7">
              <CardTitle className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                {p.title}
              </CardTitle>

              <CardDescription className="flex flex-wrap items-center gap-1.5 text-xs">
                <span>
                  {p.slideCount} {p.slideCount === 1 ? 'slide' : 'slides'}
                </span>
                <span className="text-border">·</span>
                <span className="capitalize">{p.style}</span>
                <span className="text-border">·</span>
                <span className="capitalize">{p.tone}</span>
              </CardDescription>
            </CardHeader>
          </div>

          <div className="flex items-center justify-between border-t border-border/40 bg-muted/20 px-4 py-2.5">
            <GenerationStatus status={p.status} />

            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span>{updated}</span>
              <ArrowUpRight className="size-3.5 text-muted-foreground/50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
            </div>
          </div>
        </Card>
      </Link>

      {/* Floating menu button outside Link to prevent navigation conflicts */}
      <div className="absolute right-2.5 top-2.5 z-10">
        <PresentationActionsMenu presentation={p} />
      </div>
    </div>
  )
}
