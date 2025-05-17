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
    <div className="relative w-full h-full overflow-hidden">
      <div className="relative overflow-auto h-screen custom-scrollbar">
        {children}
      </div>
      {!isHomePage && (
        <div className="fixed top-0 right-0 z-50 sidebar-container h-screen overflow-hidden">
          {/* <GeminiSidebar position="left" defaultOpen={false} /> */}
        </div>
      )}
    </div>
  )
}