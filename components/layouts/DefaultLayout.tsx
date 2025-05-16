"use client"

import { usePathname } from 'next/navigation'
import { GeminiSidebar } from '../SideBar'

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isHomePage = pathname === '/home'

  return (
    <div className="relative w-full h-full">
      <div className="relative">
        {children}
      </div>
      {!isHomePage && (
        <div className="fixed" style={{ zIndex: 100 }}>
          <GeminiSidebar position="right" defaultOpen={false} />
        </div>
      )}
    </div>
  )
}