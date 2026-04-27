import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'DIENA Control 360',
  description: 'Aplicación de gestión operativa para la Dirección de Enseñanza Naval',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className="bg-background text-gray-100">
        <div className="min-h-screen flex flex-col">
          <header className="bg-background-surface p-4 shadow-md flex items-center justify-between">
            <h1 className="text-xl font-semibold text-primary-light">DIENA CONTROL 360</h1>
            {/* Aquí se puede añadir buscador global o acciones globales */}
          </header>
          <main className="flex-1 p-4 overflow-y-auto">{children}</main>
          <footer className="bg-background-surface p-4 text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Dirección de Enseñanza Naval
          </footer>
        </div>
      </body>
    </html>
  );
}