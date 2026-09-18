'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { Globe, Link2 } from 'lucide-react'
import { toggleFollow } from '@/app/actions/profile'
import { Button } from '@/components/ui/button'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import { toast } from 'sonner'

type Profile = {
  id: string
  name: string
  username: string | null
  bio: string | null
  website: string | null
  image: string | null
}

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function websiteLabel(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function ProfileHeader({
  profile,
  counts,
  initialFollowing,
  isOwnProfile,
}: {
  profile: Profile
  counts: { followers: number; following: number }
  initialFollowing: boolean
  isOwnProfile: boolean
}) {
  const [following, setFollowing] = useState(initialFollowing)
  const [followers, setFollowers] = useState(counts.followers)
  const [isPending, startTransition] = useTransition()

  function handleFollow() {
    // Optimistic update.
    const next = !following
    setFollowing(next)
    setFollowers((c) => c + (next ? 1 : -1))

    startTransition(async () => {
      const res = await toggleFollow(profile.id)
      if (res.error) {
        // Roll back.
        setFollowing(!next)
        setFollowers((c) => c + (next ? -1 : 1))
        toast.error(res.error)
      }
    })
  }

  return (
    <section className="flex flex-col items-center text-center">
      <Avatar className="size-28 border">
        <AvatarImage src={profile.image ?? undefined} alt={profile.name} />
        <AvatarFallback className="text-3xl">
          {initials(profile.name)}
        </AvatarFallback>
      </Avatar>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance">
        {profile.name}
      </h1>
      {profile.username && (
        <p className="mt-1 text-sm text-muted-foreground">
          @{profile.username}
        </p>
      )}

      {profile.bio && (
        <p className="mt-3 max-w-md text-pretty text-sm text-foreground/90">
          {profile.bio}
        </p>
      )}

      {profile.website && (
        <a
          href={profile.website}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          <Globe className="size-4" />
          {websiteLabel(profile.website)}
        </a>
      )}

      <div className="mt-4 flex items-center gap-6 text-sm">
        <span>
          <span className="font-semibold">{followers}</span>{' '}
          <span className="text-muted-foreground">followers</span>
        </span>
        <span>
          <span className="font-semibold">{counts.following}</span>{' '}
          <span className="text-muted-foreground">following</span>
        </span>
      </div>

      <div className="mt-5">
        {isOwnProfile ? (
          <Button
            render={<Link href="/settings/profile" />}
            variant="secondary"
            className="h-11 rounded-full px-6 font-semibold"
          >
            Edit profile
          </Button>
        ) : (
          <Button
            onClick={handleFollow}
            disabled={isPending}
            variant={following ? 'secondary' : 'default'}
            className="h-11 rounded-full px-8 font-semibold"
          >
            {following ? 'Following' : 'Follow'}
          </Button>
        )}
      </div>
    </section>
  )
}
