import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/auth-context'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'EF Buddy - Executive Function Support',
  description: 'ADHD & Autistic-friendly self-management app for better executive function',
  keywords: ['ADHD', 'Autism', 'Executive Function', 'Task Management', 'Productivity'],
  authors: [{ name: 'EF Buddy Team' }],
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0ea5e9' },
    { media: '(prefers-color-scheme: dark)', color: '#0284c7' }
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className={`${inter.className} antialiased bg-background text-foreground min-h-screen`}>
        {/* Skip to main content for accessibility */}
        <a 
          href="#main-content" 
          className="skip-to-main"
          aria-label="Skip to main content"
        >
          Skip to main content
        </a>
        
        {/* Main application wrapper */}
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}