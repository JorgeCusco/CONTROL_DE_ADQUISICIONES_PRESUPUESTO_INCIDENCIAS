'use client';

import Link from 'next/link';

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="layout-wrapper">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>🏗️ Proyecto Rado</h2>
        </div>
        <nav className="sidebar-nav">
          <Link href="/">📊 Dashboard</Link>
          <Link href="/control-insumos">⚙️ Control Insumos</Link>
          <Link href="/vinculador">🔗 Vinculador</Link>
          <Link href="/ajuste-manual">⚖️ Ajuste Manual</Link>
          <Link href="/editor-maestro">🛠️ Editor Maestro</Link>
        </nav>
        <div className="sidebar-info">
          💡 <strong>Proyecto:</strong> 7_Insumos_rado<br/><br/>
          👤 <strong>Usuario:</strong> Equipo Presupuestos OFI
        </div>
      </aside>

      <div className="main-content">
        {children}
      </div>
    </div>
  );
}
