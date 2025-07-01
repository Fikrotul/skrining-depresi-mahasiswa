import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MentalCare',
  description: 'Created with v0',
  generator: 'v0.dev',
  icons: {
    icon: '/favicon.png', // logo Mentalcare
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
