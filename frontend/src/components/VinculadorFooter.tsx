export default function VinculadorFooter() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer style={{
      background: '#1e293b',
      color: '#cbd5e1',
      padding: '1rem',
      marginTop: '1rem',
      borderTop: '1px solid #334155',
      fontSize: '0.75rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '1rem'
    }}>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div>
          <span style={{ color: '#94a3b8', fontWeight: 600 }}>📦 Proyecto Rado</span>
          <span style={{ margin: '0 0.5rem', color: '#64748b' }}>•</span>
          <span>Control de Adquisiciones y Presupuesto</span>
        </div>
        <div style={{ color: '#64748b' }}>
          © {currentYear} Belempampa
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ color: '#64748b' }}>•</span>
          <span style={{ color: '#94a3b8' }}>v1.0.0</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ color: '#64748b' }}>•</span>
          <span>🗄️ PostgreSQL</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ color: '#64748b' }}>•</span>
          <span style={{ color: '#10b981' }}>✓ Online</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" 
          style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#cbd5e1'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
        >
          GitHub
        </a>
        <span style={{ color: '#64748b' }}>•</span>
        <a href="/help" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#cbd5e1'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
        >
          Ayuda
        </a>
        <span style={{ color: '#64748b' }}>•</span>
        <a href="/docs" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#cbd5e1'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
        >
          Documentación
        </a>
      </div>
    </footer>
  );
}
