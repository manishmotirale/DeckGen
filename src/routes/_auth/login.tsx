import LoginForm from '#/components/auth/login-form'
import { getSession } from '#/lib/auth.functions'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { Sparkles } from 'lucide-react'
import { z } from 'zod'

export const Route = createFileRoute('/_auth/login')({
  beforeLoad: async () => {
    const session = await getSession()

    if (session) {
      throw redirect({
        to: '/',
      })
    }
  },

  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
  component: LoginPage,
})

function LoginPage() {
  const { redirect } = Route.useSearch()

  return (
    <div className="bg-grid-subtle relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 pb-12 pt-24">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-[420px] w-[520px] -translate-x-1/2 rounded-full bg-primary/12 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="glass shadow-depth-lg rounded-3xl p-7 sm:p-8">
          {/* Header */}
          <div className="mb-6 flex flex-col items-center text-center">
            <Link to="/" className="mb-4 inline-flex no-underline">
              <img
                src="/deckgen.png"
                alt="DeckGen"
                className="size-16 rounded-2xl object-cover ring-1 ring-border/60 shadow-md"
              />
            </Link>

            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-[11px] font-semibold text-primary">
              <Sparkles className="size-3" />
              AI Presentation Studio
            </div>

            <h1 className="text-2xl font-bold tracking-tight">
              Welcome to <span className="text-gradient-peach">DeckGen</span>
            </h1>

            <p className="mt-1.5 text-sm text-muted-foreground">
              Sign in to craft, edit, and export AI slide decks
            </p>
          </div>

          <LoginForm redirectTo={redirect} />
        </div>
      </div>
    </div>
  )
}
