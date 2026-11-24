import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Bot, Loader2, Send, Sparkles, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { chatRefinePresentation } from '../actions/presntation-mutation'
import { presentationQueryKeys } from '../hooks/query-keys'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  action?: 'update_slide' | 'add_slide' | 'reply_only'
}

type DeckChatPanelProps = {
  presentationId: string
  activeSlideId?: string
  activeSlideNumber?: number
  activeSlideTitle?: string
  onSlideFocus?: (index: number) => void
}

const QUICK_PROMPTS = [
  'Make bullets punchier and clearer',
  'Match image better to this slide topic',
  'Improve speaker notes for presenting',
  'Add a key metrics & impact slide',
]

export function DeckChatPanel({
  presentationId,
  activeSlideId,
  activeSlideNumber,
  activeSlideTitle,
  onSlideFocus,
}: DeckChatPanelProps) {
  const queryClient = useQueryClient()
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Ask me to refine this slide’s text, match a better topic photo, adjust tone, or add a new slide—changes update live on the canvas.',
    },
  ])

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages])

  const chatMut = useMutation({
    mutationFn: (userText: string) =>
      chatRefinePresentation({
        data: {
          presentationId,
          activeSlideId,
          message: userText,
          history: messages
            .filter((m) => m.id !== 'welcome')
            .slice(-8)
            .map((m) => ({ role: m.role, content: m.content })),
        },
      }),
    onSuccess: (res) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: res.reply,
          action: res.action,
        },
      ])

      if (res.action === 'update_slide' || res.action === 'add_slide') {
        queryClient.invalidateQueries({
          queryKey: presentationQueryKeys.detail(presentationId),
        })
        queryClient.invalidateQueries({
          queryKey: presentationQueryKeys.list(),
        })
        if (typeof res.slideIndex === 'number') {
          onSlideFocus?.(res.slideIndex)
        }
        toast.success(
          res.action === 'add_slide'
            ? 'Added new slide from chat'
            : 'Slide updated from chat',
        )
      }
    },
    onError: (err) => {
      const msg =
        err instanceof Error ? err.message : 'Could not process request'
      toast.error(msg)
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `Sorry, I ran into an error: ${msg}`,
        },
      ])
    },
  })

  const sendMessage = (text?: string) => {
    const prompt = (text ?? input).trim()
    if (!prompt || chatMut.isPending) return

    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: 'user', content: prompt },
    ])
    setInput('')
    chatMut.mutate(prompt)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Active slide context banner */}
      {activeSlideTitle && (
        <div className="border-b border-border/50 bg-primary/[0.04] px-3.5 py-2">
          <p className="truncate text-[11px] text-muted-foreground">
            Focused on{' '}
            <span className="font-semibold text-foreground">
              Slide {activeSlideNumber}: {activeSlideTitle}
            </span>
          </p>
        </div>
      )}

      {/* Messages */}
      <div
        ref={scrollRef}
        className="scrollbar-thin flex-1 space-y-3 overflow-y-auto p-3.5"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${
              msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-primary/15 text-primary'
              }`}
            >
              {msg.role === 'user' ? (
                <User className="size-3.5" />
              ) : (
                <Bot className="size-3.5" />
              )}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border/60 bg-muted/40 text-foreground'
              }`}
            >
              <p className="whitespace-pre-line">{msg.content}</p>
              {msg.action === 'update_slide' && (
                <span className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                  <Sparkles className="size-2.5" />
                  Slide updated
                </span>
              )}
              {msg.action === 'add_slide' && (
                <span className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                  <Sparkles className="size-2.5" />
                  New slide added
                </span>
              )}
            </div>
          </div>
        ))}

        {chatMut.isPending && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin text-primary" />
            Aligning text &amp; visuals…
          </div>
        )}
      </div>

      {/* Quick prompts */}
      <div className="flex flex-wrap gap-1.5 border-t border-border/50 px-3 pt-2.5 pb-1.5">
        {QUICK_PROMPTS.map((chip) => (
          <button
            key={chip}
            type="button"
            disabled={chatMut.isPending}
            onClick={() => sendMessage(chip)}
            className="rounded-lg border border-border/60 bg-muted/30 px-2 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-foreground disabled:opacity-50"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input box */}
      <div className="border-t border-border/50 p-3">
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            placeholder="Ask AI to edit slide, swap image, or add a slide…"
            disabled={chatMut.isPending}
            className="min-h-[42px] max-h-[110px] resize-none rounded-xl border-border/70 bg-background/70 px-3 py-2 text-xs leading-relaxed"
          />
          <Button
            type="button"
            size="icon"
            className="size-10 shrink-0 rounded-xl"
            aria-label="Send chat message"
            disabled={chatMut.isPending || !input.trim()}
            onClick={() => sendMessage()}
          >
            {chatMut.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
