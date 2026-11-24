import { authClient } from '#/lib/auth-client'
import { Link, useLocation, useRouter } from '@tanstack/react-router'
import { LogOut, Moon, Sun, User } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

type Theme = 'light' | 'dark'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'dark'
  }

  const stored = localStorage.getItem('theme')

  if (stored === 'light' || stored === 'dark') {
    return stored
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export default function Navbar() {
  const router = useRouter()
  const location = useLocation()
  const { data: session, isPending } = authClient.useSession()

  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const initial = getInitialTheme()
    setTheme(initial)
    document.documentElement.classList.toggle('dark', initial === 'dark')
  }, [])

  // Hide the floating marketing navbar inside the full-bleed Presentation Studio editor
  if (location.pathname.startsWith('/presentations/')) {
    return null
  }

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
  }

  const handleSignOut = async () => {
    await authClient.signOut()
    router.navigate({ to: '/login' })
  }

  const navItems = [
    { to: '/', label: 'Studio' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ] as const

  return (
    <header className="fixed left-0 right-0 top-0 z-50">
      <nav className="mx-auto max-w-6xl px-4 py-3">
        <div className="glass flex items-center justify-between rounded-2xl px-4 py-2.5">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <img
              src="/deckgen.png"
              alt="DeckGen"
              className="size-8 rounded-xl object-cover ring-1 ring-border/50 transition-transform duration-200 hover:scale-105"
            />
            <span className="text-base font-bold tracking-tight text-foreground">
              Deck<span className="text-primary">Gen</span>
            </span>
          </Link>

          {/* Center nav links */}
          <div className="hidden items-center gap-1 sm:flex">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`rounded-xl px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/12 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={
                theme === 'dark'
                  ? 'Switch to light mode'
                  : 'Switch to dark mode'
              }
              className="size-9 rounded-xl transition-colors hover:bg-accent"
            >
              {theme === 'dark' ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </Button>

            {isPending ? (
              <div className="size-9 animate-pulse rounded-full bg-muted" />
            ) : session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Open user menu"
                      className="relative size-9 rounded-full p-0 transition-transform duration-200 hover:scale-105"
                    >
                      <Avatar className="size-9 border-2 border-primary/35">
                        <AvatarImage
                          src={session.user.image || undefined}
                          alt={session.user.name || 'User'}
                        />
                        <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                          {session.user.name ? (
                            session.user.name.charAt(0).toUpperCase()
                          ) : (
                            <User className="size-4" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  }
                />

                <DropdownMenuContent
                  align="end"
                  className="glass w-56 rounded-xl border-border/60 p-1.5"
                >
                  <div className="px-2.5 py-2">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {session.user.name || 'User'}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>

                  <DropdownMenuSeparator className="sm:hidden" />

                  <div className="sm:hidden">
                    {navItems.map((item) => (
                      <DropdownMenuItem
                        key={item.to}
                        onClick={() => router.navigate({ to: item.to })}
                      >
                        {item.label}
                      </DropdownMenuItem>
                    ))}
                  </div>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer rounded-lg text-destructive focus:bg-destructive/10 focus:text-destructive"
                  >
                    <LogOut className="mr-2 size-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                size="sm"
                className="rounded-xl px-4 font-semibold"
                render={<Link to="/login" />}
              >
                Sign in
              </Button>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
