'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { follow, user } from '@/lib/db/schema'
import { and, eq, ne, sql } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export type ProfileInput = {
  name: string
  username: string
  bio: string
  website: string
}

const USERNAME_RE = /^[a-z0-9_]{3,20}$/

export async function updateProfile(input: ProfileInput) {
  const userId = await getUserId()

  const name = input.name.trim()
  const username = input.username.trim().toLowerCase()
  const bio = input.bio.trim()
  const website = input.website.trim()

  if (!name) return { error: 'Name is required.' }
  if (name.length > 50) return { error: 'Name must be 50 characters or fewer.' }
  if (!USERNAME_RE.test(username)) {
    return {
      error:
        'Username must be 3–20 characters: lowercase letters, numbers, or underscores.',
    }
  }
  if (bio.length > 160) return { error: 'Bio must be 160 characters or fewer.' }
  if (website && !/^https?:\/\/.+/.test(website)) {
    return { error: 'Website must start with http:// or https://' }
  }

  // Ensure the username is not taken by another account.
  const taken = await db
    .select({ id: user.id })
    .from(user)
    .where(and(eq(user.username, username), ne(user.id, userId)))
    .limit(1)

  if (taken.length > 0) return { error: 'That username is already taken.' }

  await db
    .update(user)
    .set({
      name,
      username,
      bio: bio || null,
      website: website || null,
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId))

  revalidatePath('/', 'layout')
  return { success: true, username }
}

export async function toggleFollow(targetUserId: string) {
  const userId = await getUserId()
  if (userId === targetUserId) return { error: 'You cannot follow yourself.' }

  const existing = await db
    .select({ id: follow.id })
    .from(follow)
    .where(
      and(
        eq(follow.followerId, userId),
        eq(follow.followingId, targetUserId),
      ),
    )
    .limit(1)

  let following: boolean
  if (existing.length > 0) {
    await db.delete(follow).where(eq(follow.id, existing[0].id))
    following = false
  } else {
    await db
      .insert(follow)
      .values({ followerId: userId, followingId: targetUserId })
      .onConflictDoNothing()
    following = true
  }

  revalidatePath('/', 'layout')
  return { success: true, following }
}

export async function getFollowCounts(targetUserId: string) {
  const [followers] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(follow)
    .where(eq(follow.followingId, targetUserId))

  const [followingRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(follow)
    .where(eq(follow.followerId, targetUserId))

  return {
    followers: followers?.count ?? 0,
    following: followingRow?.count ?? 0,
  }
}

export async function isFollowing(targetUserId: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return false
  if (session.user.id === targetUserId) return false

  const existing = await db
    .select({ id: follow.id })
    .from(follow)
    .where(
      and(
        eq(follow.followerId, session.user.id),
        eq(follow.followingId, targetUserId),
      ),
    )
    .limit(1)

  return existing.length > 0
}
