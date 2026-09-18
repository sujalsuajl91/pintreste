'use client'

import type React from 'react'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn, signUp } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isSignUp = mode === 'sign-up'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (isSignUp) {
        const { error } = await signUp.email({ email, password, name })
        if (error) {
          setError(error.message ?? 'Could not create your account.')
          return
        }
      } else {
        const { error } = await signIn.email({ email, password })
        if (error) {
          setError(error.message ?? 'Invalid email or password.')
          return
        }
      }
      router.push('/')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <span className="text-2xl font-black">P</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">
          {isSignUp ? 'Welcome to PinBoard' : 'Welcome back to PinBoard'}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground text-pretty">
          {isSignUp
            ? 'Find new ideas to try and save what inspires you.'
            : 'Sign in to pick up where you left off.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {isSignUp && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ada Lovelace"
              className="h-11 rounded-xl"
            />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="h-11 rounded-xl"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="h-11 rounded-xl"
          />
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="h-11 rounded-full text-base font-semibold"
        >
          {loading
            ? 'Please wait…'
            : isSignUp
              ? 'Create account'
              : 'Sign in'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {isSignUp ? 'Already on PinBoard?' : 'No account yet?'}{' '}
        <Link
          href={isSignUp ? '/sign-in' : '/sign-up'}
          className="font-semibold text-foreground underline-offset-4 hover:underline"
        >
          {isSignUp ? 'Sign in' : 'Sign up'}
        </Link>
      </p>
    </div>
  )
}
