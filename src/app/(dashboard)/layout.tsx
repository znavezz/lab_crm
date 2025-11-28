import { NavBar } from '@/components/nav-bar'
import { Footer } from '@/components/footer'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 container mx-auto px-8 py-10 max-w-7xl">
        {children}
      </main>
      <Footer />
    </div>
  )
}
