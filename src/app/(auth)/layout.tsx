export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      {/* Layout para rutas de autenticación con estética Crextio */}
      {children}
    </div>
  )
}
