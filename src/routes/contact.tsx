import { createFileRoute, Link } from '@tanstack/react-router'
import { CheckCircle2, Mail, MessageSquare, Send } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/contact')({
  component: ContactPage,
})

function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Please fill in all fields')
      return
    }
    setSubmitted(true)
    toast.success('Message received! We will get back to you soon.')
  }

  return (
    <main className="bg-grid-subtle min-h-screen bg-background px-4 pb-20 pt-28">
      <div className="mx-auto max-w-5xl">
        <section className="overflow-hidden rounded-3xl border border-border/60 bg-card/75 p-6 shadow-depth-lg backdrop-blur-xl sm:p-10">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <MessageSquare className="size-6" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Contact DeckGen
              </p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
                Let’s build better presentations.
              </h1>
              <p className="mt-5 max-w-md leading-7 text-muted-foreground">
                Have feedback, a partnership idea, or need help with a deck?
                Send us a message and we’ll get back to you.
              </p>
              <a
                href="mailto:support@deckgen.app"
                className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <Mail className="size-4" />
                support@deckgen.app
              </a>
            </div>

            {submitted ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-primary/25 bg-primary/[0.04] p-8 text-center">
                <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <CheckCircle2 className="size-6" />
                </div>
                <h2 className="text-lg font-semibold">Thanks, {name}!</h2>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Your message has been sent. We’ll reply to {email} shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setName('')
                    setEmail('')
                    setMessage('')
                    setSubmitted(false)
                  }}
                  className="mt-5 rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold hover:bg-accent"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-4 rounded-2xl border border-border/60 bg-background/60 p-5 sm:p-6"
              >
                <label className="block text-sm font-medium">
                  Your name
                  <input
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Alex Morgan"
                    className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>
                <label className="block text-sm font-medium">
                  Email address
                  <input
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>
                <label className="block text-sm font-medium">
                  Message
                  <textarea
                    name="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={5}
                    placeholder="Tell us how we can help…"
                    className="mt-2 w-full resize-none rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>
                <button
                  type="submit"
                  className="button-3d shadow-primary-depth inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
                >
                  Send message
                  <Send className="size-4" />
                </button>
              </form>
            )}
          </div>
        </section>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Want to start creating?{' '}
          <Link to="/" className="font-medium text-primary hover:underline">
            Return to the generator
          </Link>
        </p>
      </div>
    </main>
  )
}
