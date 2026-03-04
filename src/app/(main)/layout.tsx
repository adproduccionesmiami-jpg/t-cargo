import { BottomNav } from '@/shared/components/bottom-nav'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#fdfdfb] flex flex-col items-center">
      {/* Contenedor App Móvil */}
      <main className="w-full max-w-md relative pb-24">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
