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
              background: '#F5EFE0',
              color: '#1c1b1b',
              border: '1px solid #D4C9A8',
              borderRadius: '8px',
            },
          }}
        />
      </body>
    </html>
  )
}
