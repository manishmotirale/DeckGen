import { useState } from 'react'
import { Clock, Grid, List, Search, SlidersHorizontal } from 'lucide-react'
import type { Presentation } from '../types/presentation.types'
import { PresentationCard } from './presentation-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type PresentationListSectionProps = {
  presentations: Presentation[]
  isPending: boolean
}

type SortOption = 'recent' | 'oldest' | 'title-asc' | 'title-desc'
type ViewMode = 'grid' | 'list'

function groupPresentationsByDate(presentations: Presentation[]) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const lastWeek = new Date(today)
  lastWeek.setDate(lastWeek.getDate() - 7)
  const lastMonth = new Date(today)
  lastMonth.setMonth(lastMonth.getMonth() - 1)

  const groups = {
    today: [] as Presentation[],
    yesterday: [] as Presentation[],
    lastWeek: [] as Presentation[],
    lastMonth: [] as Presentation[],
    older: [] as Presentation[],
  }

  presentations.forEach((p) => {
    const createdDate = new Date(p.createdAt)
    if (createdDate >= today) {
      groups.today.push(p)
    } else if (createdDate >= yesterday) {
      groups.yesterday.push(p)
    } else if (createdDate >= lastWeek) {
      groups.lastWeek.push(p)
    } else if (createdDate >= lastMonth) {
      groups.lastMonth.push(p)
    } else {
      groups.older.push(p)
    }
  })

  return groups
}

export function PresentationListSection({
  presentations,
  isPending,
}: PresentationListSectionProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showFilters, setShowFilters] = useState(false)

  // Filter presentations by search query
  const filteredPresentations = presentations.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.prompt?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Sort presentations
  const sortedPresentations = [...filteredPresentations].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'title-asc':
        return a.title.localeCompare(b.title)
      case 'title-desc':
        return b.title.localeCompare(a.title)
      default:
        return 0
    }
  })

  // Group presentations by date
  const groupedPresentations = groupPresentationsByDate(sortedPresentations)

  if (presentations.length === 0 && !isPending) {
    return null
  }

  return (
    <section className="mb-12">
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              Your Presentations
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {presentations.length}{' '}
              {presentations.length === 1 ? 'presentation' : 'presentations'}{' '}
              created
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-xl"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="size-4" />
              <span className="hidden sm:inline">Filters</span>
            </Button>

            <div className="flex gap-1 rounded-xl border bg-muted/40 p-1">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className="size-8 rounded-lg"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="size-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                className="size-8 rounded-lg"
                onClick={() => setViewMode('list')}
              >
                <List className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid gap-3 rounded-2xl border bg-card/50 p-4 backdrop-blur-sm sm:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search presentations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 rounded-xl pl-9"
              />
            </div>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="h-10 rounded-xl">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                <SelectItem value="title-desc">Title (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {isPending ? (
        <div className="flex items-center justify-center rounded-2xl border border-dashed bg-muted/20 p-12">
          <div className="text-center">
            <div className="mx-auto mb-3 size-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
            <p className="text-sm text-muted-foreground">
              Loading your presentations...
            </p>
          </div>
        </div>
      ) : filteredPresentations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 p-12 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-muted">
            <Search className="size-6 text-muted-foreground" />
          </div>
          <p className="font-medium">No presentations found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchQuery
              ? 'Try adjusting your search'
              : 'Create your first presentation below'}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Today */}
          {groupedPresentations.today.length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Clock className="size-4 text-primary" />
                <h3 className="text-sm font-semibold">Today</h3>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {groupedPresentations.today.length}
                </span>
              </div>
              <ul
                className={
                  viewMode === 'grid'
                    ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
                    : 'space-y-3'
                }
              >
                {groupedPresentations.today.map((p) => (
                  <li key={p.id}>
                    <PresentationCard presentation={p} viewMode={viewMode} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Yesterday */}
          {groupedPresentations.yesterday.length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Yesterday</h3>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {groupedPresentations.yesterday.length}
                </span>
              </div>
              <ul
                className={
                  viewMode === 'grid'
                    ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
                    : 'space-y-3'
                }
              >
                {groupedPresentations.yesterday.map((p) => (
                  <li key={p.id}>
                    <PresentationCard presentation={p} viewMode={viewMode} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Last 7 days */}
          {groupedPresentations.lastWeek.length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Last 7 days</h3>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {groupedPresentations.lastWeek.length}
                </span>
              </div>
              <ul
                className={
                  viewMode === 'grid'
                    ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
                    : 'space-y-3'
                }
              >
                {groupedPresentations.lastWeek.map((p) => (
                  <li key={p.id}>
                    <PresentationCard presentation={p} viewMode={viewMode} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Last 30 days */}
          {groupedPresentations.lastMonth.length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Last 30 days</h3>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {groupedPresentations.lastMonth.length}
                </span>
              </div>
              <ul
                className={
                  viewMode === 'grid'
                    ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
                    : 'space-y-3'
                }
              >
                {groupedPresentations.lastMonth.map((p) => (
                  <li key={p.id}>
                    <PresentationCard presentation={p} viewMode={viewMode} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Older */}
          {groupedPresentations.older.length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Older</h3>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {groupedPresentations.older.length}
                </span>
              </div>
              <ul
                className={
                  viewMode === 'grid'
                    ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
                    : 'space-y-3'
                }
              >
                {groupedPresentations.older.map((p) => (
                  <li key={p.id}>
                    <PresentationCard presentation={p} viewMode={viewMode} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

