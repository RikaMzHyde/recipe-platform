import { ReactNode } from 'react'
import { Footer } from './footer'
import { Toaster } from '@/components/ui/toaster'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">{children}</main>
      <Footer />
      <Toaster />
    </div>
  )
}
