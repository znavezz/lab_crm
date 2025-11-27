'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import {
  BeakerIcon,
  UsersIcon,
  FolderIcon,
  FileTextIcon,
  BanknoteIcon,
  BookOpenIcon,
  LayoutDashboardIcon,
  TrendingUpIcon,
  MenuIcon,
  XIcon,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboardIcon },
  { name: 'Members', href: '/members', icon: UsersIcon },
  { name: 'Projects', href: '/projects', icon: FolderIcon },
  { name: 'Publications', href: '/publications', icon: FileTextIcon },
  { name: 'Grants', href: '/grants', icon: BanknoteIcon },
  { name: 'Equipment', href: '/equipment', icon: BeakerIcon },
  { name: 'Protocols', href: '/protocols', icon: BookOpenIcon },
  { name: 'Analytics', href: '/analytics', icon: TrendingUpIcon },
]

// SidebarContent component moved outside to avoid creating during render
function SidebarContent() {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col">
      {/* Logo/Title */}
      <div className="flex h-16 items-center justify-center border-b border-sidebar-border px-6 lg:px-0">
        <Link href="/dashboard" className="flex items-center gap-2" title="Lab CRM">
          <BeakerIcon className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg lg:hidden">Lab CRM</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-3 lg:justify-center lg:gap-0',
                  isActive && 'bg-sidebar-accent text-sidebar-accent-foreground'
                )}
                title={item.name}
              >
                <Icon className="h-5 w-5" />
                <span className="lg:hidden">{item.name}</span>
              </Button>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export function ResponsiveSidebar() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [tabletSidebarOpen, setTabletSidebarOpen] = useState(true)

  return (
    <>
      {/* Mobile Sidebar - Sheet overlay */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <MenuIcon className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 bg-sidebar">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Tablet Sidebar - Collapsible */}
      <aside
        className={cn(
          'hidden md:flex lg:hidden fixed inset-y-0 z-50 w-64 flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-300',
          tabletSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent />
        {/* Close button for tablet - positioned inside sidebar */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4"
          onClick={() => setTabletSidebarOpen(false)}
        >
          <XIcon className="h-5 w-5" />
          <span className="sr-only">Close sidebar</span>
        </Button>
      </aside>

      {/* Desktop Sidebar - Always visible on desktop (>= 1024px) - Icon only */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-16 lg:flex-col bg-sidebar border-r border-sidebar-border">
        <SidebarContent />
      </aside>
    </>
  )
}
