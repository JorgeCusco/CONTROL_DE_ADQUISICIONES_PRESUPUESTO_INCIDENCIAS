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
          left: sidebarLeftVisible ? '78px' : '8px',
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
        width: sidebarLeftVisible ? '70px' : '0px',
        overflow: 'hidden',
        transition: 'width 0.3s ease'
      }}>
        <div className="sidebar-header">
          <h2>🏗️</h2>
        </div>
        <nav className="sidebar-nav">
          <Link href="/"><span className="nav-icon">📊</span><span className="nav-label">Dashboard</span></Link>
          <Link href="/control-insumos"><span className="nav-icon">⚙️</span><span className="nav-label">Control Insumos</span></Link>
          <Link href="/vinculador"><span className="nav-icon">🔗</span><span className="nav-label">Vinculador</span></Link>
          <Link href="/ajuste-manual"><span className="nav-icon">⚖️</span><span className="nav-label">Ajuste Manual</span></Link>
        </nav>
      </aside>

      <div className="main-content">
        {children}
      </div>
    </div>
  );
}
