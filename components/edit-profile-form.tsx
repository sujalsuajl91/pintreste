'use client'

import type React from 'react'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfile } from '@/app/actions/profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

type Initial = {
  name: string
  username: string
  bio: string
  website: string
}

export function EditProfileForm({ initial }: { initial: Initial }) {
  const router = useRouter()
  const [form, setForm] = useState(initial)
  const [isPending, startTransition] = useTransition()

  function set<K extends keyof Initial>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = await updateProfile(form)
      if (res.error) {
        toast.error(res.error)
        return
      }
      toast.success('Profile saved')
      router.push(`/${res.username}`)
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          maxLength={50}
          required
          className="h-11 rounded-xl"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="username">Username</Label>
        <div className="flex items-center rounded-xl border bg-transparent focus-within:ring-2 focus-within:ring-ring">
          <span className="pl-3 text-sm text-muted-foreground">pinboard.app/</span>
          <Input
            id="username"
            value={form.username}
            onChange={(e) => set('username', e.target.value)}
            placeholder="username"
            className="h-11 rounded-xl border-0 pl-1 focus-visible:ring-0"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          3–20 characters. Lowercase letters, numbers, and underscores only.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="bio">About</Label>
        <Textarea
          id="bio"
          value={form.bio}
          onChange={(e) => set('bio', e.target.value)}
          maxLength={160}
          rows={3}
          placeholder="Tell the world a little about yourself"
          className="resize-none rounded-xl"
        />
        <p className="text-xs text-muted-foreground">
          {form.bio.length}/160
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          type="url"
          value={form.website}
          onChange={(e) => set('website', e.target.value)}
          placeholder="https://example.com"
          className="h-11 rounded-xl"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="ghost"
          className="h-11 rounded-full px-6"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="h-11 rounded-full px-6 font-semibold"
        >
          {isPending ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  )
}
