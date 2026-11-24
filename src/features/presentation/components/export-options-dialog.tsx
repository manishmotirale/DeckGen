import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Download, FileText, Printer } from 'lucide-react'
import { toast } from 'sonner'

export type ExportFormat = 'pptx' | 'pdf'

export type ExportOptions = {
  format: ExportFormat
  includeNotes: boolean
  includeImages: boolean
}

type ExportOptionsDialogProps = {
  onExport: (options: ExportOptions) => Promise<void>
  isExporting?: boolean
  children?: React.ReactElement
}

export function ExportOptionsDialog({
  onExport,
  isExporting = false,
  children,
}: ExportOptionsDialogProps) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<ExportOptions>({
    format: 'pptx',
    includeNotes: true,
    includeImages: true,
  })

  const handleExport = async () => {
    try {
      await onExport(options)
      setOpen(false)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Export failed. Please try again.',
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          children ?? (
            <Button variant="outline" size="sm" className="gap-2 rounded-xl">
              <Download className="size-4" />
              Export
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="size-5 text-primary" />
            Export Presentation
          </DialogTitle>
          <DialogDescription>
            Choose your preferred format and what to include in the deck.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-3">
          {/* Format Selection */}
          <div className="space-y-2.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Format
            </Label>
            <div className="grid gap-2.5">
              <button
                type="button"
                onClick={() => setOptions({ ...options, format: 'pptx' })}
                className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
                  options.format === 'pptx'
                    ? 'border-primary bg-primary/8 ring-1 ring-primary/30'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <FileText className="size-4" />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-semibold">
                    PowerPoint (.pptx)
                  </span>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Fully editable 16:9 deck for PowerPoint, Keynote, &amp;
                    Google Slides
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOptions({ ...options, format: 'pdf' })}
                className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
                  options.format === 'pdf'
                    ? 'border-primary bg-primary/8 ring-1 ring-primary/30'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-500">
                  <Printer className="size-4" />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-semibold">
                    PDF / Print View
                  </span>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Opens a clean landscape print-to-PDF layout for sharing
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Content Options
            </Label>
            <div className="space-y-3 rounded-xl border border-border/60 bg-muted/25 p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="include-notes"
                  checked={options.includeNotes}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, includeNotes: checked === true })
                  }
                />
                <div className="flex-1">
                  <label
                    htmlFor="include-notes"
                    className="cursor-pointer text-sm font-medium"
                  >
                    Include speaker notes
                  </label>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Embed presenter notes on each exported slide
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="include-images"
                  checked={options.includeImages}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, includeImages: checked === true })
                  }
                />
                <div className="flex-1">
                  <label
                    htmlFor="include-images"
                    className="cursor-pointer text-sm font-medium"
                  >
                    Include background visuals
                  </label>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Embed AI-generated slide artwork when available
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="gap-2 rounded-xl font-semibold"
          >
            <Download className="size-4" />
            {isExporting
              ? 'Exporting…'
              : options.format === 'pptx'
                ? 'Download .pptx'
                : 'Open PDF Print'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
