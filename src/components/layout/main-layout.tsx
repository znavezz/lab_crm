'use client'

import type { ReactNode } from 'react'
import { ResponsiveSidebar } from './responsive-sidebar'
import { HeaderBar } from './header-bar'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <ResponsiveSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <HeaderBar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
