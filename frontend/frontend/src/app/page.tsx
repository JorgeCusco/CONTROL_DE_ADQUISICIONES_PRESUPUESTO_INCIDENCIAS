export default function Home() {
  return (
    <main className="container">
      <h1>🏗️ Sistema de Control y Ajuste de Insumos</h1>
      
      <div className="card" style={{marginTop: '2rem'}}>
        <h2>📊 Dashboard General</h2>
        <p>Bienvenido al sistema de control. Utiliza el menú lateral para navegar a los módulos interactivos.</p>
        
        <div className="metrics" style={{marginTop: '2rem'}}>
          <div className="metric-card">
            <div className="metric-label">Módulo</div>
            <div className="metric-value" style={{fontSize: '1.2rem', marginBottom: '0.5rem'}}>⚙️ Control de Insumos</div>
            <p style={{fontSize: '0.9rem', color: '#666', margin: 0}}>Gestión y visualización de partidas e incidencias.</p>
          </div>
          
          <div className="metric-card">
            <div className="metric-label">Módulo</div>
            <div className="metric-value" style={{fontSize: '1.2rem', marginBottom: '0.5rem'}}>⚖️ Ajuste Manual</div>
            <p style={{fontSize: '0.9rem', color: '#666', margin: 0}}>Cuadre de adquisiciones y unificación de unidades.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
