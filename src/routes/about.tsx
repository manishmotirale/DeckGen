import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowRight,
  Brain,
  LayoutTemplate,
  Presentation,
  Sparkles,
  Zap,
} from 'lucide-react'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <main className="min-h-screen bg-background px-4 pb-20 pt-28">
      <div className="mx-auto max-w-6xl">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 px-6 py-14 text-center shadow-sm backdrop-blur-xl sm:px-10 sm:py-20">
          {/* Background glow */}
          <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-20 size-80 rounded-full bg-primary/5 blur-3xl" />

          <div className="relative z-10 mx-auto max-w-3xl">
            {/* Icon */}
            <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
              <Presentation className="size-7 text-primary" />
            </div>

            {/* Label */}
            <div className="mb-4 flex items-center justify-center gap-2">
              <Sparkles className="size-4 text-primary" />

              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                About DeckGen
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Turn your ideas into{' '}
              <span className="text-primary">presentations.</span>
            </h1>

            {/* Description */}
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              DeckGen helps you transform a simple idea or topic into a
              structured, visually engaging presentation using artificial
              intelligence.
            </p>

            {/* CTA */}
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                Create a presentation
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mt-10">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              What we do
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              From idea to slide deck
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              We're on a mission to make creating presentations as easy as 
              having a conversation. No more wrestling with layouts or 
              staring at blank slides—just share your vision, and we'll 
              bring it to life.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1 */}
            <div className="group rounded-2xl border border-border/50 bg-card/50 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md">
              <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Brain className="size-5" />
              </div>

              <h3 className="font-semibold text-foreground">AI Generated</h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Our AI understands what makes a great presentation and creates 
                slides that actually tell your story.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-2xl border border-border/50 bg-card/50 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md">
              <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <LayoutTemplate className="size-5" />
              </div>

              <h3 className="font-semibold text-foreground">
                Beautiful Slides
              </h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Every slide is designed to look professional and keep your 
                audience engaged from start to finish.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-2xl border border-border/50 bg-card/50 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md">
              <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Zap className="size-5" />
              </div>

              <h3 className="font-semibold text-foreground">Fast Workflow</h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Stop spending hours on slides. Get a complete deck in minutes, 
                not days.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group rounded-2xl border border-border/50 bg-card/50 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md">
              <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Presentation className="size-5" />
              </div>

              <h3 className="font-semibold text-foreground">Export Ready</h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Download your presentation as PowerPoint and make any final 
                tweaks before showtime.
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mt-14 rounded-3xl border border-border/50 bg-muted/20 p-6 sm:p-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                How it works
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                How it works (it's really simple!)
              </h2>

              <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
                Just tell us what you want to present, pick a style that fits 
                your vibe, and let the AI do the heavy lifting. You'll have a 
                complete deck ready in minutes.
              </p>
            </div>

            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex gap-4 rounded-2xl border border-border/40 bg-background/50 p-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
                  1
                </div>

                <div>
                  <h3 className="font-semibold text-foreground">
                    Describe your topic
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Enter the topic, idea, or subject you want to turn into a
                    presentation.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4 rounded-2xl border border-border/40 bg-background/50 p-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
                  2
                </div>

                <div>
                  <h3 className="font-semibold text-foreground">
                    Customize your deck
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Choose the number of slides, visual style, tone, and layout
                    that fits your presentation.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4 rounded-2xl border border-border/40 bg-background/50 p-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
                  3
                </div>

                <div>
                  <h3 className="font-semibold text-foreground">
                    Generate and export
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Review your generated slides, make changes, present them, or
                    export them to PowerPoint.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mt-10 overflow-hidden rounded-3xl border border-primary/20 bg-primary/5 px-6 py-10 text-center sm:px-10">
          <Sparkles className="mx-auto size-6 text-primary" />

          <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Ready to create something amazing?
          </h2>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Stop staring at blank slides. Start with DeckGen and focus on 
            what really matters—your message.
          </p>

          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            Start creating
            <ArrowRight className="size-4" />
          </Link>
        </section>
      </div>
    </main>
  )
}
