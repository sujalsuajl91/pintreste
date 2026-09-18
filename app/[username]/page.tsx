import { notFound, redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user as userTable } from '@/lib/db/schema'
import { getFollowCounts, isFollowing } from '@/app/actions/profile'
import { AppShell } from '@/components/app-shell'
import { ProfileHeader } from '@/components/profile-header'
import { FeedPlaceholder } from '@/components/feed-placeholder'

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const [profile] = await db
    .select({
      id: userTable.id,
      name: userTable.name,
      username: userTable.username,
      bio: userTable.bio,
      website: userTable.website,
      image: userTable.image,
      createdAt: userTable.createdAt,
    })
    .from(userTable)
    .where(eq(userTable.username, username.toLowerCase()))
    .limit(1)

  if (!profile) notFound()

  const [counts, following] = await Promise.all([
    getFollowCounts(profile.id),
    isFollowing(profile.id),
  ])

  const viewer = session.user as typeof session.user & {
    username?: string | null
  }
  const isOwnProfile = viewer.id === profile.id

  return (
    <AppShell
      user={{
        name: viewer.name,
        email: viewer.email,
        username: viewer.username ?? null,
        image: viewer.image ?? null,
      }}
    >
      <ProfileHeader
        profile={profile}
        counts={counts}
        initialFollowing={following}
        isOwnProfile={isOwnProfile}
      />
      <div className="mt-8">
        <FeedPlaceholder />
      </div>
    </AppShell>
  )
}
