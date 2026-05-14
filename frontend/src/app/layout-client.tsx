'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarLeftVisible, setSidebarLeftVisible] = useState(true);

  return (
    <div className="layout-wrapper">
      <button 
        onClick={() => setSidebarLeftVisible(!sidebarLeftVisible)} 
        title={sidebarLeftVisible ? 'Ocultar proyecto' : 'Mostrar proyecto'}
        style={{ 
          position: 'fixed', 
          top: '12px', 
          left: sidebarLeftVisible ? '268px' : '8px',
          background: '#1F3864',
          border: '1px solid rgba(255,255,255,0.2)',
          color: 'white',
          cursor: 'pointer',
          fontSize: '0.9rem',
          padding: '6px 10px',
          borderRadius: '4px',
          zIndex: 1001,
          transition: 'left 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          pointerEvents: 'auto'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#2F5496'}
        onMouseLeave={(e) => e.currentTarget.style.background = '#1F3864'}
      >
        {sidebarLeftVisible ? '◀' : '▶'}
      </button>

      <aside className="sidebar" style={{ 
        width: sidebarLeftVisible ? '260px' : '0px',
        overflow: 'hidden',
        transition: 'width 0.3s ease'
      }}>
        <div className="sidebar-header">
          <h2>🏗️ Proyecto Rado</h2>
        </div>
        <nav className="sidebar-nav">
          <Link href="/">📊 Dashboard</Link>
          <Link href="/control-insumos">⚙️ Control Insumos</Link>
          <Link href="/vinculador">🔗 Vinculador</Link>
          <Link href="/ajuste-manual">⚖️ Ajuste Manual</Link>
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
