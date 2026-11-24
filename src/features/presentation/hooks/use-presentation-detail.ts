import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type {
  SlideLayout,
  SlideStyle,
  SlideTone,
} from '../constant/presentation-options'
import { presentationQueryKeys } from './query-keys'
import { getPresentationWithSlides } from '../api/presentation-query'
import {
  addSlide,
  deletePresentation,
  deleteSlide,
  moveSlide,
  regeneratePresentation,
  updatePresentation,
  updateSlide,
} from '../actions/presntation-mutation'
import {
  presentationLayoutSchema,
  presentationStyleSchema,
  presentationToneSchema,
} from '../types/schema'

type SettingsForm = {
  title: string
  prompt: string
  slideCount: number
  style: SlideStyle
  tone: SlideTone
  layout: SlideLayout
}

export function usePresentationDetail(
  presentationId: string,
  opts?: {
    onDeleted?: () => void
  },
) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: presentationQueryKeys.detail(presentationId),
    queryFn: () => getPresentationWithSlides({ data: { id: presentationId } }),
    refetchInterval: (q) =>
      q.state.data?.status === 'GENERATING' ? 2500 : false,
  })

  const [form, setForm] = useState<SettingsForm>({
    title: '',
    prompt: '',
    slideCount: 8,
    style: 'minimal',
    tone: 'formal',
    layout: 'balanced',
  })

  useEffect(() => {
    if (!query.data) return
    const safeStyle = presentationStyleSchema.safeParse(query.data.style)
    const safeTone = presentationToneSchema.safeParse(query.data.tone)
    const safeLayout = presentationLayoutSchema.safeParse(query.data.layout)

    setForm({
      title: query.data.title,
      prompt: query.data.prompt,
      slideCount: query.data.slideCount,
      style: safeStyle.success ? safeStyle.data : 'minimal',
      tone: safeTone.success ? safeTone.data : 'formal',
      layout: safeLayout.success ? safeLayout.data : 'balanced',
    })
  }, [query.data])

  const invalidateDetail = () => {
    queryClient.invalidateQueries({
      queryKey: presentationQueryKeys.detail(presentationId),
    })
    queryClient.invalidateQueries({
      queryKey: presentationQueryKeys.list(),
    })
  }

  const updateMut = useMutation({
    mutationFn: () =>
      updatePresentation({
        data: {
          id: presentationId,
          title: form.title,
          prompt: form.prompt,
          slideCount: form.slideCount,
          style: form.style,
          tone: form.tone,
          layout: form.layout,
        },
      }),
    onSuccess: () => {
      toast.success('Presentation settings saved')
      invalidateDetail()
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'Could not save')
    },
  })

  const regenerateMut = useMutation({
    mutationFn: () => regeneratePresentation({ data: { id: presentationId } }),
    onSuccess: () => {
      toast.success('Generating fresh slides…')
      invalidateDetail()
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'Could not regenerate')
    },
  })

  const deleteMut = useMutation({
    mutationFn: () => deletePresentation({ data: { id: presentationId } }),
    onSuccess: () => {
      toast.success('Presentation deleted')
      queryClient.invalidateQueries({ queryKey: presentationQueryKeys.list() })
      queryClient.removeQueries({
        queryKey: presentationQueryKeys.detail(presentationId),
      })
      opts?.onDeleted?.()
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'Could not delete')
    },
  })

  const updateSlideMut = useMutation({
    mutationFn: (payload: {
      slideId: string
      title: string
      content: string
      notes?: string | null
      imageUrl?: string | null
    }) =>
      updateSlide({
        data: {
          presentationId,
          ...payload,
        },
      }),
    onSuccess: () => {
      toast.success('Slide updated')
      invalidateDetail()
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'Could not update slide')
    },
  })

  const addSlideMut = useMutation({
    mutationFn: (payload?: { title?: string; content?: string }) =>
      addSlide({
        data: {
          presentationId,
          ...payload,
        },
      }),
    onSuccess: () => {
      toast.success('New slide added')
      invalidateDetail()
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'Could not add slide')
    },
  })

  const deleteSlideMut = useMutation({
    mutationFn: (slideId: string) =>
      deleteSlide({
        data: {
          presentationId,
          slideId,
        },
      }),
    onSuccess: () => {
      toast.success('Slide removed')
      invalidateDetail()
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'Could not delete slide')
    },
  })

  const moveSlideMut = useMutation({
    mutationFn: (payload: { slideId: string; direction: 'up' | 'down' }) =>
      moveSlide({
        data: {
          presentationId,
          ...payload,
        },
      }),
    onSuccess: () => {
      invalidateDetail()
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'Could not reorder slide')
    },
  })

  const slides = query.data?.slides ?? []
  const isGenerating = query.data?.status === 'GENERATING'

  const updatedLabel = useMemo(() => {
    if (!query.data?.updatedAt) return ''
    return new Date(query.data.updatedAt).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }, [query.data?.updatedAt])

  return {
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
  }
}
