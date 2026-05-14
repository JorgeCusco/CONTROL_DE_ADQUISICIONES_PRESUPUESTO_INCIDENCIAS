import type { Metadata } from 'next';
import './globals.css';
import LayoutClient from './layout-client';

export const metadata: Metadata = {
  title: 'Control de Insumos - Proyecto Rado',
  description: 'Sistema de Control y Ajuste de Insumos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
