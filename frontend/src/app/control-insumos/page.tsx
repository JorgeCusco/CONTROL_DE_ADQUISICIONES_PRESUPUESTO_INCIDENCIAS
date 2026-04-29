"use client";

import { useEffect, useState } from 'react';

type Partida = {
  codigo: string;
  descripcion: string;
};

type Insumo = {
  id: number;
  descripcion: string;
  unidad: string;
  incidencia: number;
  cantidad_adquirida: number;
  cantidad_modificada: number;
};

export default function ControlInsumos() {
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [selectedPartida, setSelectedPartida] = useState<string>('');
  
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState('');

  // 1. Fetch partidas
  useEffect(() => {
    fetch('/api/partidas')
      .then(res => res.json())
      .then(data => setPartidas(data));
  }, []);

  // 2. Fetch insumos for partida
  useEffect(() => {
    if (!selectedPartida) {
      setInsumos([]);
      return;
    }
    setLoading(true);
    const codigo = selectedPartida.split(" - ")[0];
    fetch(`/api/partidas?partida=${encodeURIComponent(codigo)}`)
      .then(res => res.json())
      .then(data => {
        setInsumos(data);
        setLoading(false);
      });
  }, [selectedPartida]);

  // Handle cell edits
  const handleEdit = (index: number, field: keyof Insumo, value: number) => {
    const updated = [...insumos];
    updated[index] = { ...updated[index], [field]: value };
    setInsumos(updated);
  };

  // Save to DB
  const handleSave = async () => {
    setSaving(true);
    setNotification('');
    try {
      const updates = insumos.map(i => ({
        id: i.id,
        incidencia: Number(i.incidencia),
        cantidad_adquirida: Number(i.cantidad_adquirida),
        cantidad_modificada: Number(i.cantidad_modificada)
      }));
      
      const res = await fetch('/api/partidas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      });
      
      if (res.ok) {
        setNotification('✅ Cambios guardados correctamente en la base de datos.');
        setTimeout(() => setNotification(''), 3000);
      } else {
        setNotification('❌ Error al guardar.');
      }
    } catch (e) {
      setNotification('❌ Error de conexión.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="container">
      <h1>⚙️ Control de Insumos Colaborativo</h1>
      
      <div className="card">
        <div className="selector-group">
          <label htmlFor="partida-select"><strong>1. Selección de Partida</strong></label>
          <select 
            id="partida-select" 
            value={selectedPartida} 
            onChange={e => setSelectedPartida(e.target.value)}
          >
            <option value="">-- Elija una partida --</option>
            {partidas.map(p => (
              <option key={p.codigo} value={`${p.codigo} - ${p.descripcion}`}>
                {p.codigo} - {p.descripcion}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedPartida && (
        <div className="card">
          <div className="header-row">
            <h2>2. Edición de Insumos</h2>
            <button 
              className={`btn ${saving ? '' : 'btn-success'}`} 
              onClick={handleSave} 
              disabled={saving}
            >
              {saving ? 'Guardando...' : '💾 Guardar Cambios en PostgreSQL'}
            </button>
          </div>
          
          <p style={{color: '#666', marginBottom: '1rem'}}>
            Modifique las cantidades según corresponda:
          </p>

          {notification && (
            <div style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              padding: '0.75rem 1.25rem',
              background: notification.includes('✅') ? '#dcfce7' : notification.includes('⏳') ? '#e0f2fe' : '#fee2e2',
              color: notification.includes('✅') ? '#166534' : notification.includes('⏳') ? '#0369a1' : '#991b1b',
              border: `1px solid ${notification.includes('✅') ? '#86efac' : notification.includes('⏳') ? '#7dd3fc' : '#fca5a5'}`,
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              zIndex: 9999,
              fontSize: '0.85rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              animation: 'slideIn 0.3s ease-out'
            }}>
              <style>{`
                @keyframes slideIn {
                  from { transform: translateX(100%); opacity: 0; }
                  to { transform: translateX(0); opacity: 1; }
                }
              `}</style>
              {notification}
            </div>
          )}

          {loading ? (
            <p>Cargando insumos...</p>
          ) : insumos.length === 0 ? (
            <p>No hay insumos registrados para esta partida.</p>
          ) : (
            <div style={{overflowX: 'auto'}}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Descripción</th>
                    <th>Unidad</th>
                    <th style={{textAlign: 'right'}}>Incidencia</th>
                    <th style={{textAlign: 'right'}}>C. Adquirida</th>
                    <th style={{textAlign: 'right'}}>C. Modificada</th>
                  </tr>
                </thead>
                <tbody>
                  {insumos.map((insumo, index) => (
                    <tr key={insumo.id}>
                      <td>{insumo.id}</td>
                      <td>{insumo.descripcion}</td>
                      <td>{insumo.unidad}</td>
                      
                      <td className="editable">
                        <input 
                          type="number" 
                          step="0.0001"
                          value={insumo.incidencia} 
                          onChange={(e) => handleEdit(index, 'incidencia', parseFloat(e.target.value) || 0)}
                        />
                      </td>
                      <td className="editable">
                        <input 
                          type="number" 
                          step="0.0001"
                          value={insumo.cantidad_adquirida} 
                          onChange={(e) => handleEdit(index, 'cantidad_adquirida', parseFloat(e.target.value) || 0)}
                        />
                      </td>
                      <td className="editable">
                        <input 
                          type="number" 
                          step="0.0001"
                          value={insumo.cantidad_modificada} 
                          onChange={(e) => handleEdit(index, 'cantidad_modificada', parseFloat(e.target.value) || 0)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
