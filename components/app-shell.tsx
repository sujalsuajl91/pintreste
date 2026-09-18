import { AppHeader, type HeaderUser } from '@/components/app-header'

export function AppShell({
  user,
  children,
}: {
  user: HeaderUser
  children: React.ReactNode
}) {
  return (
    <div className="min-h-svh">
      <AppHeader user={user} />
      <main className="mx-auto max-w-[1600px] px-3 py-6 sm:px-4">
        {children}
      </main>
    </div>
  )
}
