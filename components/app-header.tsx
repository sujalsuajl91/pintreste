'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Search, Plus, Bell } from 'lucide-react'
import { signOut } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export type HeaderUser = {
  name: string
  email: string
  username: string | null
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

export function AppHeader({ user }: { user: HeaderUser }) {
  const pathname = usePathname()
  const router = useRouter()

  const profileHref = user.username ? `/${user.username}` : '/settings/profile'

  async function handleSignOut() {
    await signOut()
    router.push('/sign-in')
    router.refresh()
  }

  const navItem = (href: string, label: string, icon: React.ReactNode) => {
    const active = pathname === href
    return (
      <Link
        href={href}
        aria-label={label}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'flex size-11 items-center justify-center rounded-full transition-colors',
          active
            ? 'bg-foreground text-background'
            : 'text-foreground hover:bg-muted',
        )}
      >
        {icon}
      </Link>
    )
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-2 px-3 sm:px-4">
        <Link
          href="/"
          aria-label="PinBoard home"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
        >
          <span className="text-xl font-black">P</span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {navItem('/', 'Home', <Home className="size-5" />)}
        </nav>

        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for ideas"
            className="h-11 rounded-full border-0 bg-muted pl-11 focus-visible:ring-2"
          />
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-11 rounded-full"
            aria-label="Create"
          >
            <Plus className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-11 rounded-full"
            aria-label="Notifications"
          >
            <Bell className="size-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              className="ml-1 rounded-full outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Account menu"
            >
              <Avatar className="size-9">
                <AvatarImage src={user.image ?? undefined} alt={user.name} />
                <AvatarFallback>{initials(user.name)}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex flex-col">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs font-normal text-muted-foreground">
                  {user.email}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href={profileHref} />}>
                Your profile
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/settings/profile" />}>
                Edit profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
