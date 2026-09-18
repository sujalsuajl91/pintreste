import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { AppShell } from '@/components/app-shell'
import { FeedPlaceholder } from '@/components/feed-placeholder'

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const u = session.user as typeof session.user & {
    username?: string | null
  }

  return (
    <AppShell
      user={{
        name: u.name,
        email: u.email,
        username: u.username ?? null,
        image: u.image ?? null,
      }}
    >
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {u.name.split(' ')[0]}
        </h1>
        <p className="text-sm text-muted-foreground">
          Your home feed of ideas is coming soon. For now, set up your profile
          so people can find you.
        </p>
      </div>
      <FeedPlaceholder />
    </AppShell>
  )
}
