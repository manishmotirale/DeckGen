import { useState } from 'react'
import {
  Copy,
  Download,
  ExternalLink,
  MoreVertical,
  Share2,
  Trash2,
} from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { deletePresentation } from '../actions/presntation-mutation'
import { duplicatePresentation } from '../actions/duplicate-presentation'
import { getPresentationWithSlides } from '../api/presentation-query'
import { exportToPptx } from '../lib/export-pptx'
import { presentationQueryKeys } from '../hooks/query-keys'
import type { Presentation } from '../types/presentation.types'

type PresentationActionsMenuProps = {
  presentation: Presentation
  onDeleted?: () => void
}

export function PresentationActionsMenu({
  presentation,
  onDeleted,
}: PresentationActionsMenuProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const duplicateMut = useMutation({
    mutationFn: () => duplicatePresentation({ data: { id: presentation.id } }),
    onSuccess: (duplicate) => {
      toast.success('Presentation duplicated!')
      queryClient.invalidateQueries({ queryKey: presentationQueryKeys.list() })
      navigate({
        to: '/presentations/$presentationId',
        params: { presentationId: duplicate.id },
      })
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to duplicate',
      )
    },
  })

  const deleteMut = useMutation({
    mutationFn: () => deletePresentation({ data: { id: presentation.id } }),
    onSuccess: () => {
      toast.success('Presentation deleted')
      queryClient.invalidateQueries({ queryKey: presentationQueryKeys.list() })
      onDeleted?.()
      setShowDeleteDialog(false)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete')
    },
  })

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const full = await getPresentationWithSlides({
        data: { id: presentation.id },
      })
      if (!full.slides.length) {
        toast.error('This presentation has no slides to export yet.')
        return
      }
      const filename = await exportToPptx({
        title: full.title,
        slides: full.slides,
      })
      toast.success(`Exported ${filename}`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not export deck',
      )
    } finally {
      setIsExporting(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Link copied to clipboard!')
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/presentations/${presentation.id}`
    if ('share' in navigator) {
      try {
        await navigator.share({
          title: presentation.title,
          text: `Check out my presentation: ${presentation.title}`,
          url,
        })
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          await copyToClipboard(url)
        }
      }
    } else {
      await copyToClipboard(url)
    }
  }

  return (
    <div
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Presentation actions"
              className="size-8 rounded-lg hover:bg-accent"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              <MoreVertical className="size-4" />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-48 rounded-xl">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              navigate({
                to: '/presentations/$presentationId',
                params: { presentationId: presentation.id },
              })
            }}
          >
            <ExternalLink className="mr-2 size-4" />
            Open in Studio
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              duplicateMut.mutate()
            }}
            disabled={duplicateMut.isPending}
          >
            <Copy className="mr-2 size-4" />
            {duplicateMut.isPending ? 'Duplicating…' : 'Duplicate'}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              void handleExport()
            }}
            disabled={isExporting || presentation.status !== 'COMPLETED'}
          >
            <Download className="mr-2 size-4" />
            {isExporting ? 'Exporting…' : 'Export .pptx'}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              void handleShare()
            }}
          >
            <Share2 className="mr-2 size-4" />
            Copy Link
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              setShowDeleteDialog(true)
            }}
            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
          >
            <Trash2 className="mr-2 size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete presentation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &ldquo;{presentation.title}&rdquo;
              and all of its slides. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMut.mutate()}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMut.isPending ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
