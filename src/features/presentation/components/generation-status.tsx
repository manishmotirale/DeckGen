import { Loader2, CheckCircle2, XCircle, FileEdit } from 'lucide-react'

type GenerationStatusProps = {
  status: 'DRAFT' | 'GENERATING' | 'COMPLETED' | 'FAILED'
}

const statusConfig = {
  DRAFT: {
    icon: FileEdit,
    label: 'Draft',
    className: 'text-muted-foreground',
    badgeClass: 'border-border bg-muted/50',
  },
  GENERATING: {
    icon: Loader2,
    label: 'Generating',
    className: 'text-primary',
    badgeClass: 'border-primary/20 bg-primary/10',
  },
  COMPLETED: {
    icon: CheckCircle2,
    label: 'Ready',
    className: 'text-emerald-500',
    badgeClass: 'border-emerald-500/20 bg-emerald-500/10',
  },
  FAILED: {
    icon: XCircle,
    label: 'Failed',
    className: 'text-destructive',
    badgeClass: 'border-destructive/20 bg-destructive/10',
  },
}

export function GenerationStatus({ status }: GenerationStatusProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${config.badgeClass}`}
    >
      <Icon
        className={`size-3.5 shrink-0 ${config.className} ${
          status === 'GENERATING' ? 'animate-spin' : ''
        }`}
      />

      <span className={config.className}>{config.label}</span>

      {status === 'GENERATING' && (
        <span className="flex gap-0.5">
          <span className="size-0.5 animate-pulse rounded-full bg-primary" />
          <span className="size-0.5 animate-pulse rounded-full bg-primary [animation-delay:150ms]" />
          <span className="size-0.5 animate-pulse rounded-full bg-primary [animation-delay:300ms]" />
        </span>
      )}
    </div>
  )
}
