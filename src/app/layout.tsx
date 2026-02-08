import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Skyline Business Hub',
  description: 'Complete business management platform with expense tracking, financial analytics, and P&L reports',
  applicationName: 'Skyline Hub',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Skyline Hub',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Skyline Business Hub',
    title: 'Skyline Business Hub',
    description: 'Complete business management platform for automotive professionals',
  },
  twitter: {
    card: 'summary',
    title: 'Skyline Business Hub',
    description: 'Complete business management platform for automotive professionals',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#2563eb',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/jpeg" href="/skyline-logo.jpg" />
        <link rel="shortcut icon" type="image/jpeg" href="/skyline-logo.jpg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/skyline-logo.jpg" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Skyline Hub" />
      </head>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
          <header className="gradient-bg shadow-lg">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg shadow-lg overflow-hidden">
                    <img 
                      src="/skyline-logo.jpg" 
                      alt="Skyline Customs Logo" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Skyline Customs</h1>
                    <p className="text-blue-100 text-sm">Business Hub</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white text-sm font-medium">Business Management</p>
                  <p className="text-blue-100 text-xs">Finances & Expense Tracking</p>
                </div>
              </div>
            </div>
          </header>
          
          <main className="container mx-auto px-4 py-6">
            {children}
          </main>
          
          <footer className="mt-12 bg-slate-800 text-slate-300 py-8">
            <div className="container mx-auto px-4 text-center">
              <p className="text-sm">© 2026 Skyline Customs - Business Management Hub</p>
              <p className="text-xs mt-2 text-slate-400">Built for automotive professionals</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}