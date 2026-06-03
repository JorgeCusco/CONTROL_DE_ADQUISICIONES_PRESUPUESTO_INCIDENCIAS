'use client';

import { useState, useEffect } from 'react';

type Partida = {
  item: string;
  descripcion: string;
  unidad: string;
  cantidad_p: number;
  precio_unitario_p?: number;
  total_p?: number;
  rendimiento_p?: string;
};

export default function EditorPartidas() {
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [search, setSearch] = useState('');
  const [selectedPartida, setSelectedPartida] = useState<Partida | null>(null);
  
  // Edit State
  const [editForm, setEditForm] = useState<Partida | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchPartidas();
    }
  }, [isAuthenticated]);

  const fetchPartidas = async (q = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/maestro/partidas?q=${q}&limit=100`);
      const data = await res.json();
      if (data.partidas) {
        setPartidas(data.partidas);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPartida = (p: Partida) => {
    setSelectedPartida(p);
    setEditForm({ ...p });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm || !selectedPartida) return;
    
    if (!confirm(`¿Estás seguro de guardar los cambios en la partida ${selectedPartida.item}? Si el metrado ha cambiado, se recalcularán los insumos globalmente.`)) {
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/maestro/partidas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldItem: selectedPartida.item,
          ...editForm
        })
      });

      const data = await res.json();
      if (res.ok) {
        alert('Partida actualizada correctamente.');
        fetchPartidas(search); // Refresh the list
        // Update selection reference
        setSelectedPartida(editForm);
      } else {
        alert(`Error al actualizar: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión al intentar guardar.');
    }
    setSaving(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '1111') {
      setIsAuthenticated(true);
    } else {
      alert('Contraseña incorrecta');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
        <form onSubmit={handleLogin} style={{ background: '#1e293b', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)', textAlign: 'center', color: 'white', minWidth: '320px' }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '1.5rem', fontWeight: 600 }}>Editor de Partidas</h2>
          <p style={{ color: '#94a3b8', marginBottom: '30px', fontSize: '0.9rem' }}>Ingreso Seguro (Admin)</p>
          <input 
            type="password" 
            value={passwordInput} 
            onChange={e => setPasswordInput(e.target.value)} 
            placeholder="Contraseña"
            style={{ padding: '12px', width: '100%', marginBottom: '20px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: 'white', boxSizing: 'border-box' }}
            autoFocus
          />
          <button type="submit" style={{ width: '100%', padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', transition: 'background 0.2s' }}>
            Acceder
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f1f5f9', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Sidebar: Lista de Partidas */}
      <div style={{ width: '380px', background: 'white', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', boxShadow: '2px 0 5px rgba(0,0,0,0.02)' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', background: '#1e293b', color: 'white' }}>
          <h1 style={{ margin: '0 0 15px 0', fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.5rem' }}>🏗️</span> Editor de Partidas
          </h1>
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Buscar por Item o Descripción..." 
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                fetchPartidas(e.target.value);
              }}
              style={{ width: '100%', padding: '10px 15px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: 'white', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Cargando partidas...</div>
          ) : partidas.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No se encontraron resultados.</div>
          ) : (
            partidas.map(p => (
              <div 
                key={p.item} 
                onClick={() => handleSelectPartida(p)}
                style={{ 
                  padding: '12px 15px', 
                  marginBottom: '8px',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: selectedPartida?.item === p.item ? '#bfdbfe' : '#f1f5f9',
                  background: selectedPartida?.item === p.item ? '#eff6ff' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedPartida?.item === p.item ? '0 2px 4px rgba(59, 130, 246, 0.1)' : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, color: selectedPartida?.item === p.item ? '#1d4ed8' : '#334155' }}>
                    {p.item}
                  </span>
                  <span style={{ fontSize: '0.75rem', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', color: '#475569', fontWeight: 600 }}>
                    {p.unidad}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {p.descripcion}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content: Formulario de Edición */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f8fafc', overflowY: 'auto' }}>
        {editForm ? (
          <div style={{ maxWidth: '800px', margin: '40px auto', width: '100%', padding: '0 20px' }}>
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -1px rgb(0 0 0 / 0.06)', overflow: 'hidden' }}>
              <div style={{ background: '#f1f5f9', padding: '20px 30px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem', fontWeight: 600 }}>Editar Registro</h2>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Item Seleccionado: <strong style={{ color: '#0f172a' }}>{selectedPartida?.item}</strong></div>
              </div>
              
              <form onSubmit={handleSave} style={{ padding: '30px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  
                  {/* Item */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                      Código / Item <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input 
                      type="text" 
                      required
                      value={editForm.item} 
                      onChange={e => setEditForm({...editForm, item: e.target.value})}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', outlineColor: '#3b82f6', boxSizing: 'border-box' }}
                    />
                    <p style={{ margin: '6px 0 0 0', fontSize: '0.75rem', color: '#f59e0b', fontWeight: 500 }}>
                      ⚠️ Al cambiar el código, se re-asignarán automáticamente los APUs en la base de datos para no perderlos.
                    </p>
                  </div>

                  {/* Descripción */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                      Descripción de la Partida <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <textarea 
                      required
                      rows={3}
                      value={editForm.descripcion} 
                      onChange={e => setEditForm({...editForm, descripcion: e.target.value})}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', outlineColor: '#3b82f6', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }}
                    />
                  </div>

                  {/* Unidad */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Unidad</label>
                    <input 
                      type="text" 
                      value={editForm.unidad} 
                      onChange={e => setEditForm({...editForm, unidad: e.target.value})}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', outlineColor: '#3b82f6', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Metrado */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                      Metrado (Cantidad Total) <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input 
                      type="number" 
                      required
                      step="0.01"
                      value={editForm.cantidad_p} 
                      onChange={e => setEditForm({...editForm, cantidad_p: parseFloat(e.target.value)})}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', outlineColor: '#3b82f6', boxSizing: 'border-box', fontWeight: 600, color: '#0f172a' }}
                    />
                  </div>

                  {/* Precio Unitario */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Precio Unitario (S/)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={editForm.precio_unitario_p || 0} 
                      onChange={e => setEditForm({...editForm, precio_unitario_p: parseFloat(e.target.value)})}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', outlineColor: '#3b82f6', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Total Partida */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Total (S/)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={editForm.total_p || 0} 
                      onChange={e => setEditForm({...editForm, total_p: parseFloat(e.target.value)})}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', outlineColor: '#3b82f6', boxSizing: 'border-box', background: '#f8fafc' }}
                    />
                  </div>
                  
                  {/* Rendimiento */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Rendimiento</label>
                    <input 
                      type="text" 
                      value={editForm.rendimiento_p || ''} 
                      onChange={e => setEditForm({...editForm, rendimiento_p: e.target.value})}
                      placeholder="Ej: MO. 25.0000 EQ. 25.0000"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', outlineColor: '#3b82f6', boxSizing: 'border-box' }}
                    />
                  </div>

                </div>

                <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditForm({...selectedPartida});
                    }}
                    style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Descartar Cambios
                  </button>
                  <button 
                    type="submit" 
                    disabled={saving}
                    style={{ padding: '10px 24px', borderRadius: '6px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)' }}
                  >
                    {saving ? 'Guardando...' : '💾 Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
            <div style={{ fontSize: '4rem', marginBottom: '15px', opacity: 0.5 }}>📝</div>
            <h2 style={{ margin: 0, fontWeight: 500 }}>Selecciona una partida</h2>
            <p style={{ marginTop: '8px' }}>Haz clic en cualquier partida de la lista para editar su metrado y propiedades.</p>
          </div>
        )}
      </div>
    </div>
  );
}
