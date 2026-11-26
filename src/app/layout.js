import './globals.css'

export const metadata = { title: 'Catálogo', description: 'Catálogo de ropa' }

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
