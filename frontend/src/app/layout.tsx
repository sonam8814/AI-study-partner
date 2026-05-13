import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'The Library — AI Study Partner',
  description: 'A free, voice-enabled AI study workspace to master any topic.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="light">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-surface font-body-md">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontFamily: 'Literata, Georgia, serif',
              background: 'linear-gradient(180deg, #F9F3E3 0%, #F0E8D4 100%)',
              color: '#1c1b1b',
              border: '1px solid #C8B88A',
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(92, 61, 30, 0.1)',
              fontSize: '14px',
            },
          }}
        />
      </body>
    </html>
  )
}
