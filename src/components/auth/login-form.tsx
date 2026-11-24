import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { authClient } from '#/lib/auth-client'
import { toInternalPath } from '#/lib/auth-redirect'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, Loader2, Lock, Mail, User } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

type Provider = 'github' | 'google'
type AuthMode = 'signin' | 'signup'

export default function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const navigate = useNavigate()

  const [mode, setMode] = useState<AuthMode>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false)
  const [isSocialSubmitting, setIsSocialSubmitting] =
    useState<Provider | null>(null)

  const targetRedirect = toInternalPath(redirectTo) ?? '/'

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim() || !password) {
      toast.error('Please enter your email and password')
      return
    }

    if (mode === 'signup' && password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setIsEmailSubmitting(true)
    try {
      if (mode === 'signup') {
        const res = await authClient.signUp.email({
          email: email.trim(),
          password,
          name: name.trim() || email.split('@')[0] || 'User',
        })

        if (res.error) {
          toast.error(res.error.message || 'Could not create account')
          setIsEmailSubmitting(false)
          return
        }

        toast.success('Account created! Welcome to DeckGen.')
      } else {
        const res = await authClient.signIn.email({
          email: email.trim(),
          password,
        })

        if (res.error) {
          toast.error(res.error.message || 'Invalid email or password')
          setIsEmailSubmitting(false)
          return
        }

        toast.success('Welcome back!')
      }

      navigate({ to: targetRedirect })
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Authentication failed',
      )
      setIsEmailSubmitting(false)
    }
  }

  const handleSocialLogin = async (provider: Provider) => {
    try {
      setIsSocialSubmitting(provider)

      await authClient.signIn.social({
        provider,
        callbackURL: targetRedirect,
        fetchOptions: {
          onError: ({ error }) => {
            toast.error(error.message || 'Failed to login. Please try again.')
            setIsSocialSubmitting(null)
          },
        },
      })
    } catch (error) {
      console.error('OAuth login error:', error)
      toast.error('Failed to login. Please try again.')
      setIsSocialSubmitting(null)
    }
  }

  const isBusy = isEmailSubmitting || isSocialSubmitting !== null

  return (
    <div className="space-y-5">
      {/* Mode toggle */}
      <div className="grid grid-cols-2 rounded-xl border border-border/60 bg-muted/40 p-1">
        <button
          type="button"
          onClick={() => setMode('signin')}
          className={`rounded-lg py-2 text-xs font-semibold transition-all ${
            mode === 'signin'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode('signup')}
          className={`rounded-lg py-2 text-xs font-semibold transition-all ${
            mode === 'signup'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Create account
        </button>
      </div>

      {/* Email / Password form */}
      <form onSubmit={handleEmailAuth} className="space-y-3.5">
        {mode === 'signup' && (
          <div className="space-y-1.5">
            <Label htmlFor="auth-name" className="text-xs font-medium">
              Full name
            </Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="auth-name"
                type="text"
                placeholder="Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isBusy}
                className="h-10 rounded-xl pl-9"
              />
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="auth-email" className="text-xs font-medium">
            Email address
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="auth-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isBusy}
              required
              className="h-10 rounded-xl pl-9"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="auth-password" className="text-xs font-medium">
            Password
          </Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="auth-password"
              type="password"
              placeholder={
                mode === 'signup' ? 'At least 8 characters' : '••••••••'
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isBusy}
              required
              className="h-10 rounded-xl pl-9"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isBusy}
          className="button-3d shadow-primary-depth h-10 w-full rounded-xl font-semibold"
        >
          {isEmailSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              {mode === 'signup' ? 'Creating account…' : 'Signing in…'}
            </>
          ) : (
            <>
              {mode === 'signup' ? 'Create free account' : 'Sign in'}
              <ArrowRight className="ml-2 size-4" />
            </>
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center py-1">
        <div className="flex-1 border-t border-border/60" />
        <span className="px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Or continue with
        </span>
        <div className="flex-1 border-t border-border/60" />
      </div>

      {/* Social buttons */}
      <div className="grid grid-cols-2 gap-2.5">
        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-xl gap-2 text-xs font-medium"
          onClick={() => handleSocialLogin('github')}
          disabled={isBusy}
        >
          <svg
            className="size-4"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          {isSocialSubmitting === 'github' ? 'Redirecting…' : 'GitHub'}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-xl gap-2 text-xs font-medium"
          onClick={() => handleSocialLogin('google')}
          disabled={isBusy}
        >
          <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {isSocialSubmitting === 'google' ? 'Redirecting…' : 'Google'}
        </Button>
      </div>

      <p className="text-center text-[11px] text-muted-foreground">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  )
}
