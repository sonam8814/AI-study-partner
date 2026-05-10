import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <Sidebar />
      <TopBar />
      <div className="md:pl-64 pt-16 pb-20 md:pb-0">
        {children}
      </div>
      <BottomNav />
    </div>
  )
}
