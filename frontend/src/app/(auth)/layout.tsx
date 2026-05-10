export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background text-on-background flex items-center justify-center p-4">
      {/* Corner decorative accents */}
      <div className="fixed top-0 left-0 p-8 hidden md:block pointer-events-none">
        <div className="w-24 h-24 border-t border-l border-aged-paper opacity-40"></div>
      </div>
      <div className="fixed bottom-0 right-0 p-8 hidden md:block pointer-events-none">
        <div className="w-24 h-24 border-b border-r border-aged-paper opacity-40"></div>
      </div>
      {children}
    </div>
  )
}
