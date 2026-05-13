export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh text-on-background flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(180deg, #FAF6EF 0%, #F0E8D4 60%, #EDE7D9 100%)',
      }}>
      {/* Corner decorative accents */}
      <div className="fixed top-0 left-0 p-8 hidden md:block pointer-events-none">
        <div className="w-24 h-24 border-t border-l border-[#D4C9A8] opacity-30"></div>
      </div>
      <div className="fixed bottom-0 right-0 p-8 hidden md:block pointer-events-none">
        <div className="w-24 h-24 border-b border-r border-[#D4C9A8] opacity-30"></div>
      </div>
      {children}
    </div>
  )
}
