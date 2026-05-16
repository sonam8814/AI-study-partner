export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh text-on-background flex items-center justify-center p-4"
      style={{
        background: `linear-gradient(180deg, var(--color-auth-start) 0%, var(--color-auth-mid) 60%, var(--color-auth-end) 100%)`,
      }}>
      {/* Corner decorative accents */}
      <div className="fixed top-0 left-0 p-8 hidden md:block pointer-events-none">
        <div className="w-24 h-24 opacity-30" style={{ borderTop: '1px solid var(--color-border)', borderLeft: '1px solid var(--color-border)' }}></div>
      </div>
      <div className="fixed bottom-0 right-0 p-8 hidden md:block pointer-events-none">
        <div className="w-24 h-24 opacity-30" style={{ borderBottom: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)' }}></div>
      </div>
      {children}
    </div>
  )
}
