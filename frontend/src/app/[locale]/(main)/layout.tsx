'use client'

import { DesktopSidebar } from '@/components/navigation/DesktopSidebar'
import { BottomTabBar } from '@/components/navigation/BottomTabBar'
import { Header } from '@/components/navigation/Header'
import { RightSidebar } from '@/components/navigation/RightSidebar'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-dvh bg-bg-primary">
      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Mobile/Tablet Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 lg:ml-48 xl:mr-64 flex flex-col min-h-dvh overflow-hidden">
        <div className="flex-1 overflow-y-auto pt-14 md:pt-0 pb-14 md:pb-0">
          {children}
        </div>
      </main>

      {/* Right Sidebar (Desktop only) */}
      <RightSidebar />

      {/* Bottom Tab Bar (Mobile/Tablet only) */}
      <BottomTabBar />
    </div>
  )
}
