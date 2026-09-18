import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user as userTable } from '@/lib/db/schema'
import { AppShell } from '@/components/app-shell'
import { EditProfileForm } from '@/components/edit-profile-form'

export default async function EditProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const [profile] = await db
    .select({
      name: userTable.name,
      username: userTable.username,
      bio: userTable.bio,
      website: userTable.website,
    })
    .from(userTable)
    .where(eq(userTable.id, session.user.id))
    .limit(1)

  const viewer = session.user as typeof session.user & {
    username?: string | null
  }

  return (
    <AppShell
      user={{
        name: viewer.name,
        email: viewer.email,
        username: viewer.username ?? null,
        image: viewer.image ?? null,
      }}
    >
      <div className="mx-auto max-w-xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit profile
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep your personal details private. Info you add here is visible to
            anyone who can see your profile.
          </p>
        </div>
        <EditProfileForm
          initial={{
            name: profile?.name ?? viewer.name,
            username: profile?.username ?? '',
            bio: profile?.bio ?? '',
            website: profile?.website ?? '',
          }}
        />
      </div>
    </AppShell>
  )
}
