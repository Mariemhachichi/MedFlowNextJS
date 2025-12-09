import './globals.css'

export const metadata = {
  title: 'MedFlow - Réceptionniste',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="flex h-screen bg-gray-100">
        {children}
      </body>
    </html>
  )
}
