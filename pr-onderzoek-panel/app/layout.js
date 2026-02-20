import './globals.css'

export const metadata = {
  title: 'PR Onderzoek Panel',
  description: 'ANP Persportaal PR Research Analysis Dashboard',
}

export default function RootLayout({ children }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  )
}
