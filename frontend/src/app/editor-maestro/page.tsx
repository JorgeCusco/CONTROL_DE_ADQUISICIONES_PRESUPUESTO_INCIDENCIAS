'use client';

import { useState, useEffect, useCallback } from 'react';

type Partida = {
  item: string;
  descripcion: string;
  unidad: string;
  cantidad_p: number;
};

type Insumo = {
  codigo: string;
  descripcion: string;
  unidad: string;
  costo_p: number;
};

type APU = {
  id?: number;
  codigo_insumo: string;
  descripcion_insumo: string;
  unidad: string;
  cantidad_p: number;
  precio_p: number;
};

export default function EditorMaestro() {
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [insumosList, setInsumosList] = useState<Insumo[]>([]);
  
  const [searchPartida, setSearchPartida] = useState('');
  const [selectedPartida, setSelectedPartida] = useState<Partida | null>(null);
  
  const [acus, setAcus] = useState<APU[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Modal Nuevo Insumo
  const [showNewInsumo, setShowNewInsumo] = useState(false);
  const [newInsumoData, setNewInsumoData] = useState({ codigo: '', descripcion: '', unidad: '', costo_p: 0 });

  useEffect(() => {
    fetchPartidas();
    fetchInsumos();
  }, []);

  const fetchPartidas = async (q = '') => {
    const res = await fetch(`/api/maestro/partidas?q=${q}`);
    const data = await res.json();
    if (data.partidas) setPartidas(data.partidas);
  };

  const fetchInsumos = async () => {
    const res = await fetch(`/api/maestro/insumos`);
    const data = await res.json();
    if (data.insumos) setInsumosList(data.insumos);
  };

  const fetchAcus = async (item: string) => {
    setLoading(true);
    const res = await fetch(`/api/maestro/acus?partida=${item}`);
    const data = await res.json();
    if (data.acus) setAcus(data.acus);
    setLoading(false);
  };

  const handleSelectPartida = (p: Partida) => {
    setSelectedPartida(p);
    fetchAcus(p.item);
  };

  const handleAddApu = () => {
    setAcus([...acus, { codigo_insumo: '', descripcion_insumo: '', unidad: '', cantidad_p: 0, precio_p: 0 }]);
  };

  const handleApuChange = (index: number, field: keyof APU, value: any) => {
    const newAcus = [...acus];
    newAcus[index] = { ...newAcus[index], [field]: value };

    // Auto-fill details if insumo is selected
    if (field === 'codigo_insumo') {
      const found = insumosList.find(i => i.codigo === value);
      if (found) {
        newAcus[index].descripcion_insumo = found.descripcion;
        newAcus[index].unidad = found.unidad;
        newAcus[index].precio_p = found.costo_p;
      }
    }

    setAcus(newAcus);
  };

  const handleSaveAcus = async () => {
    if (!selectedPartida) return;
    setSaving(true);
    try {
      const res = await fetch('/api/maestro/acus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partida: selectedPartida.item, acus })
      });
      if (res.ok) {
        alert('APUs guardados correctamente');
      } else {
        alert('Error al guardar APUs');
      }
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const handleCreateInsumo = async () => {
    try {
      const res = await fetch('/api/maestro/insumos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInsumoData)
      });
      if (res.ok) {
        alert('Insumo creado!');
        setShowNewInsumo(false);
        fetchInsumos(); // Refresh list
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePartida = async () => {
    const item = prompt('Ingrese el nuevo Item de Partida (Ej: 01.01.01):');
    if (!item) return;
    const descripcion = prompt('Ingrese la descripción de la partida:');
    
    try {
      const res = await fetch('/api/maestro/partidas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item, descripcion: descripcion || '', unidad: 'UND', cantidad_p: 1, precio_unitario_p: 0, total_p: 0, rendimiento_p: '' })
      });
      if (res.ok) {
        fetchPartidas();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="editor-maestro-container" style={{ display: 'flex', height: '100vh', padding: '20px', gap: '20px', background: '#f8fafc' }}>
      {/* Panel Izquierdo: Partidas */}
      <div style={{ width: '350px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '15px', borderBottom: '1px solid #e2e8f0', background: '#1e293b', color: 'white', borderRadius: '8px 8px 0 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem' }}>📚 Partidas</h2>
            <button onClick={handleCreatePartida} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>+ Nueva</button>
          </div>
          <input 
            type="text" 
            placeholder="Buscar partida..." 
            value={searchPartida}
            onChange={(e) => {
              setSearchPartida(e.target.value);
              fetchPartidas(e.target.value);
            }}
            style={{ width: '100%', marginTop: '10px', padding: '8px', borderRadius: '4px', border: 'none', color: '#333' }}
          />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
          {partidas.map(p => (
            <div 
              key={p.item} 
              onClick={() => handleSelectPartida(p)}
              style={{ 
                padding: '10px', 
                borderBottom: '1px solid #f1f5f9', 
                cursor: 'pointer',
                background: selectedPartida?.item === p.item ? '#eff6ff' : 'transparent',
                borderLeft: selectedPartida?.item === p.item ? '4px solid #3b82f6' : '4px solid transparent'
              }}
            >
              <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#1e293b' }}>{p.item}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{p.descripcion}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Panel Derecho: APUs e Insumos */}
      <div style={{ flex: 1, background: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', display: 'flex', flexDirection: 'column' }}>
        {selectedPartida ? (
          <>
            <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
              <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#1e293b' }}>{selectedPartida.item} - {selectedPartida.descripcion}</h1>
              <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>Unidad: {selectedPartida.unidad} | Metrado: {selectedPartida.cantidad_p}</p>
            </div>
            
            <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <h3 style={{ margin: 0 }}>Análisis de Costos Unitarios (APUs)</h3>
                <div>
                  <button 
                    onClick={() => setShowNewInsumo(true)}
                    style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}
                  >
                    ➕ Crear Insumo Nuevo
                  </button>
                  <button 
                    onClick={handleAddApu}
                    style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    ➕ Agregar Fila APU
                  </button>
                </div>
              </div>

              {loading ? <p>Cargando APUs...</p> : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                      <th style={{ padding: '10px', borderBottom: '2px solid #e2e8f0' }}>Insumo</th>
                      <th style={{ padding: '10px', borderBottom: '2px solid #e2e8f0' }}>Unidad</th>
                      <th style={{ padding: '10px', borderBottom: '2px solid #e2e8f0' }}>Cantidad</th>
                      <th style={{ padding: '10px', borderBottom: '2px solid #e2e8f0' }}>Precio Unit.</th>
                      <th style={{ padding: '10px', borderBottom: '2px solid #e2e8f0' }}>Parcial</th>
                      <th style={{ padding: '10px', borderBottom: '2px solid #e2e8f0' }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {acus.map((apu, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '10px' }}>
                          <select 
                            value={apu.codigo_insumo} 
                            onChange={(e) => handleApuChange(i, 'codigo_insumo', e.target.value)}
                            style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                          >
                            <option value="">-- Seleccionar Insumo --</option>
                            {insumosList.map(ins => (
                              <option key={ins.codigo} value={ins.codigo}>{ins.codigo} - {ins.descripcion}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ padding: '10px' }}>{apu.unidad}</td>
                        <td style={{ padding: '10px' }}>
                          <input 
                            type="number" 
                            value={apu.cantidad_p} 
                            onChange={(e) => handleApuChange(i, 'cantidad_p', parseFloat(e.target.value))}
                            style={{ width: '80px', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                          />
                        </td>
                        <td style={{ padding: '10px' }}>
                          <input 
                            type="number" 
                            value={apu.precio_p} 
                            onChange={(e) => handleApuChange(i, 'precio_p', parseFloat(e.target.value))}
                            style={{ width: '80px', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                          />
                        </td>
                        <td style={{ padding: '10px', fontWeight: 'bold' }}>
                          S/ {(apu.cantidad_p * apu.precio_p).toFixed(2)}
                        </td>
                        <td style={{ padding: '10px' }}>
                          <button 
                            onClick={() => setAcus(acus.filter((_, index) => index !== i))}
                            style={{ background: '#ef4444', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            X
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <div style={{ marginTop: '20px', textAlign: 'right' }}>
                <button 
                  onClick={handleSaveAcus}
                  disabled={saving}
                  style={{ background: '#1e293b', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' }}
                >
                  {saving ? 'Guardando...' : '💾 Guardar APUs'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
            <h2>Selecciona una partida para editar sus APUs</h2>
          </div>
        )}
      </div>

      {/* Modal Nuevo Insumo */}
      {showNewInsumo && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', width: '400px' }}>
            <h2 style={{ marginTop: 0 }}>Crear Nuevo Insumo</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input 
                type="text" placeholder="Código (Ej: 39001000...)" value={newInsumoData.codigo}
                onChange={e => setNewInsumoData({...newInsumoData, codigo: e.target.value})}
                style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
              <input 
                type="text" placeholder="Descripción del Insumo" value={newInsumoData.descripcion}
                onChange={e => setNewInsumoData({...newInsumoData, descripcion: e.target.value})}
                style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
              <input 
                type="text" placeholder="Unidad (Ej: UND, BLS, M3)" value={newInsumoData.unidad}
                onChange={e => setNewInsumoData({...newInsumoData, unidad: e.target.value})}
                style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
              <input 
                type="number" placeholder="Costo / Precio Unitario" value={newInsumoData.costo_p}
                onChange={e => setNewInsumoData({...newInsumoData, costo_p: parseFloat(e.target.value)})}
                style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setShowNewInsumo(false)} style={{ padding: '8px 12px', border: '1px solid #cbd5e1', background: 'white', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleCreateInsumo} style={{ padding: '8px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Crear Insumo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
