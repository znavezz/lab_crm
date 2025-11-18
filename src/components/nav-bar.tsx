'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { BeakerIcon, UsersIcon, FolderIcon, FileTextIcon, BanknoteIcon, BookOpenIcon, LayoutDashboardIcon, TrendingUpIcon, CalendarIcon } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboardIcon },
  { name: 'Members', href: '/members', icon: UsersIcon },
  { name: 'Projects', href: '/projects', icon: FolderIcon },
  { name: 'Publications', href: '/publications', icon: FileTextIcon },
  { name: 'Grants', href: '/grants', icon: BanknoteIcon },
  { name: 'Equipment', href: '/equipment', icon: BeakerIcon },
  { name: 'Events', href: '/events', icon: CalendarIcon },
  { name: 'Protocols', href: '/protocols', icon: BookOpenIcon },
  { name: 'Analytics', href: '/analytics', icon: TrendingUpIcon },
]

export function NavBar() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
            <BeakerIcon className="h-6 w-6" style={{ color: 'var(--logo)' }} />
            <span className="font-semibold text-lg hidden sm:inline">Lab CRM</span>
          </Link>
          
          <div className="flex items-center gap-1 justify-center flex-1 overflow-x-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    size="sm"
                    className={cn(
                      'gap-1.5 flex-shrink-0',
                      isActive && 'bg-secondary'
                    )}
                    title={item.name}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden xl:inline">{item.name}</span>
                  </Button>
                </Link>
              )
            })}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
