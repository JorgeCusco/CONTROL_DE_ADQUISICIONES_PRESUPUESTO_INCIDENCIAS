"use client";

import React, { useEffect, useState, useMemo } from 'react';
import ApuComparative from '@/components/ApuComparative';

type Compra = {
  id: number;
  orden: string;
  detalle: string;
  unidad_orig: string;
  cant_orig: number;
  unidad: string;
  cantidad_und: number;
  precio_unit: number;
  precio_orig: number;
  total: number;
  observacion: string;
};

type Apu = {
  id: number;
  codigo_partida: string;
  item_1: string;
  codigo_insumo: string;
  partida_desc: string;
  unidad: string;
  cantidad_1: number;
  metrado_fijo: number;
  parcial_1: number;
  cantidad_2: number;
  cantidad_modificada: number;
  cantidad_adquirida: number;
  precio_unit_original: number;
};

export default function Home() {
  const [insumosList, setInsumosList] = useState<string[]>([]);
  const [unitsList, setUnitsList] = useState<string[]>([]);
  const [selectedInsumo, setSelectedInsumo] = useState<string>('');
  
  const [compras, setCompras] = useState<Compra[]>([]);
  const [apuData, setApuData] = useState<Apu[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState('');
  
  const [officialName, setOfficialName] = useState<string>('');
  const [globalAdquirido, setGlobalAdquirido] = useState<number>(0);
  const [isMetaLocked, setIsMetaLocked] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Boolean Filter Logic
  const filteredInsumos = useMemo(() => {
    if (!searchTerm.trim()) return insumosList.slice(0, 100); // Show first 100 if empty
    const terms = searchTerm.toLowerCase().split(/\s+/).filter(Boolean);
    return insumosList.filter(ins => {
      const lowerIns = ins.toLowerCase();
      return terms.every(term => lowerIns.includes(term));
    }).slice(0, 100); // Limit to 100 results for performance
  }, [searchTerm, insumosList]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.selector-group')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleRow = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedRows(newExpanded);
  };
  
  // Available names: APU name + any distinct names from the purchases
  const availableNames = useMemo(() => {
    if (!selectedInsumo) return [];
    const names = new Set<string>();
    names.add(selectedInsumo); // APU original
    compras.forEach(c => {
      if (c.detalle && c.detalle.trim() !== '') {
        names.add(c.detalle.trim());
      }
    });
    return Array.from(names);
  }, [selectedInsumo, compras]);

  // 1. Fetch metadata on load
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        setInsumosList(data.insumos || []);
        setUnitsList(data.unidades || []);
      });
  }, []);

  // 2. Fetch compras when insumo changes
  useEffect(() => {
    if (!selectedInsumo) {
      setCompras([]);
      setApuData([]);
      return;
    }
    setLoading(true);
    
    fetch(`/api/compras?insumo=${encodeURIComponent(selectedInsumo)}`)
      .then(res => res.json())
      .then(data => {
        setCompras(data);
        setOfficialName(selectedInsumo); // Reset official name to current selected
      });
      
    fetch(`/api/apu?insumo=${encodeURIComponent(selectedInsumo)}`)
      .then(res => res.json())
      .then(data => {
        setApuData(data);
        setLoading(false);
      });
  }, [selectedInsumo]);

  // Handle cell edits
  const handleEdit = (index: number, field: keyof Compra, value: string | number) => {
    const updated = [...compras];
    updated[index] = { ...updated[index], [field]: value };
    
    // If we edit the unit of the FIRST row, propagate it to ALL other rows
    if (index === 0 && field === 'unidad') {
      for (let i = 1; i < updated.length; i++) {
        updated[i].unidad = value as string;
      }
    }
    
    setCompras(updated);
  };

  const handleApuEdit = (index: number, field: keyof Apu, value: number) => {
    const updated = [...apuData];
    updated[index] = { ...updated[index], [field]: value };
    setApuData(updated);
  };

  // 3. Reactive Calculations for Compras
  const totals = useMemo(() => {
    let totalAdquirido = 0;
    let sumaImporte = 0;
    
    compras.forEach(c => {
      const cant = Number(c.cantidad_und) || 0;
      const pu = Number(c.precio_unit) || 0;
      totalAdquirido += cant;
      sumaImporte += (cant * pu);
    });

    const precioPromedio = totalAdquirido > 0 ? (sumaImporte / totalAdquirido) : 0;

    return { totalAdquirido, sumaImporte, precioPromedio };
  }, [compras]);

  const sumAdquiridoValido = useMemo(() => {
    return compras.reduce((acc, curr) => acc + Number(curr.cantidad_und), 0);
  }, [compras]);

  // Sync Global Goal with Purchases Total when locked
  useEffect(() => {
    if (isMetaLocked) {
      setGlobalAdquirido(sumAdquiridoValido);
    }
  }, [sumAdquiridoValido, isMetaLocked]);

  const autoSaveApu = async (apu: Apu) => {
    try {
      setNotification('ÔÅ│ Guardando APU autom├íticamente...');
      const updatePayload = {
        id: apu.id,
        cantidad_2: Number(apu.cantidad_2),
        cantidad_adquirida: globalAdquirido,
        cantidad_modificada: Number(apu.cantidad_2) * Number(apu.metrado_fijo)
      };
      
      const res = await fetch('/api/apu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: [updatePayload] })
      });

      if (res.ok) {
        setNotification('Ô£à Cambio en APU guardado autom├íticamente.');
        setTimeout(() => setNotification(''), 2000);
      } else {
        setNotification('ÔØî Error al auto-guardar APU.');
      }
    } catch(e) {
      setNotification('ÔØî Error de conexi├│n al auto-guardar.');
    }
  };

  const autoSaveGlobalMeta = async () => {
    if (isMetaLocked) return; // Si est├í bloqueado se sincroniza solo, no forzamos DB si no es edici├│n manual o en save global
    try {
      setNotification('ÔÅ│ Guardando Meta Global...');
      const updatesApu = apuData.map(a => ({
        id: a.id,
        cantidad_2: Number(a.cantidad_2),
        cantidad_adquirida: globalAdquirido,
        cantidad_modificada: Number(a.cantidad_2) * Number(a.metrado_fijo)
      }));
      
      const res = await fetch('/api/apu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: updatesApu })
      });
      
      if (res.ok) {
        setNotification('Ô£à Meta Global guardada en todas las partidas.');
        setTimeout(() => setNotification(''), 2000);
      }
    } catch(e) {
      setNotification('ÔØî Error de conexi├│n al guardar Meta Global.');
    }
  };

  // Save to DB
  const handleSave = async () => {
    setSaving(true);
    setNotification('');
    try {
      const updatesCompras = compras.map(c => ({
        id: c.id,
        unidad: c.unidad,
        cantidad_und: Number(c.cantidad_und)
      }));
      
      const resCompras = await fetch('/api/compras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: updatesCompras })
      });
      
      const updatesApu = apuData.map(a => ({
        id: a.id,
        cantidad_2: Number(a.cantidad_2),
        cantidad_adquirida: globalAdquirido, // Apply global value to all rows
        cantidad_modificada: Number(a.cantidad_2) * Number(a.metrado_fijo)
      }));
      
      const resApu = await fetch('/api/apu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          updates: updatesApu,
          globalNameUpdate: {
            oldName: selectedInsumo,
            newName: officialName
          }
        })
      });
      
      if (resCompras.ok && resApu.ok) {
        setNotification('Ô£à Cambios guardados. Si cambiaste el nombre, ver├ís la lista actualizada.');
        setTimeout(() => setNotification(''), 4000);
        
        // Refresh the main list if name changed
        if (officialName !== selectedInsumo) {
          fetch('/api/data')
            .then(res => res.json())
            .then(data => {
              setInsumosList(data.insumos || []);
              setSelectedInsumo(officialName);
            });
        }
      } else {
        setNotification('ÔØî Error al guardar en una de las tablas.');
      }
    } catch (e) {
      setNotification('ÔØî Error de conexi├│n.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="container">
      <h1>ÔÜû´©Å Ajuste Manual y Cuadre de Adquisiciones</h1>
      
      <div className="card">
        <div className="selector-group" style={{position: 'relative'}}>
          <label htmlFor="insumo-search"><strong>1. Busque y Seleccione el Insumo (B├║squeda Booleana):</strong></label>
          <div style={{display: 'flex', gap: '0.5rem'}}>
            <input 
              id="insumo-search"
              type="text" 
              placeholder="Ej: CEMENTO PORTLAND (Busca ambos t├®rminos)"
              value={searchTerm || selectedInsumo} 
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              style={{flex: 1, padding: '0.75rem', borderRadius: '4px', border: '2px solid var(--primary)'}}
            />
            {selectedInsumo && (
              <button 
                className="btn" 
                style={{background: '#64748b'}}
                onClick={() => {
                  setSelectedInsumo('');
                  setSearchTerm('');
                }}
              >
                Ô£û Limpiar
              </button>
            )}
          </div>

          {showDropdown && filteredInsumos.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 1000,
              background: 'white',
              border: '1px solid #cbd5e1',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              maxHeight: '300px',
              overflowY: 'auto',
              borderRadius: '0 0 8px 8px'
            }}>
              {filteredInsumos.map((ins, i) => (
                <div 
                  key={i} 
                  onClick={() => {
                    setSelectedInsumo(ins);
                    setSearchTerm(ins);
                    setShowDropdown(false);
                  }}
                  style={{
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f1f5f9',
                    background: selectedInsumo === ins ? '#eff6ff' : 'white',
                    color: selectedInsumo === ins ? '#1e40af' : 'inherit',
                    fontWeight: selectedInsumo === ins ? '600' : 'normal'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = selectedInsumo === ins ? '#eff6ff' : 'white'}
                >
                  {ins}
                </div>
              ))}
            </div>
          )}
          {showDropdown && filteredInsumos.length === 0 && searchTerm && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000,
              background: 'white', padding: '1rem', border: '1px solid #cbd5e1', color: '#64748b'
            }}>
              No se encontraron coincidencias.
            </div>
          )}
        </div>
      </div>

      {selectedInsumo && (
        <div className="card">
          <div className="header-row">
            <h2>­ƒøÆ Cuadre Manual de Compras (Unificar Unidades)</h2>
            <button 
              className={`btn ${saving ? '' : 'btn-success'}`} 
              onClick={handleSave} 
              disabled={saving}
            >
              {saving ? 'Guardando...' : '­ƒÆ¥ Guardar Cuadre'}
            </button>
          </div>
          
          <p style={{color: '#666', marginBottom: '1rem'}}>
            Edita la <strong>Unidad</strong> y la <strong>Cantidad_Und</strong> para unificar y cuadrar las compras. 
            El Precio Promedio Ponderado se recalcula en tiempo real.
          </p>

          <div style={{marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderLeft: '4px solid var(--primary)'}}>
            <label htmlFor="official-name" style={{fontWeight: 'bold', display: 'block', marginBottom: '0.5rem'}}>Ô£Å´©Å Definir Nombre Oficial del Insumo:</label>
            <select 
              id="official-name"
              value={officialName}
              onChange={(e) => setOfficialName(e.target.value)}
              style={{width: '100%', maxWidth: '600px'}}
            >
              {availableNames.map((name, i) => (
                <option key={i} value={name}>{name} {name === selectedInsumo ? '(Actual en APU)' : '(De Compra)'}</option>
              ))}
            </select>
          </div>

          {notification && (
            <div style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              padding: '0.75rem 1.25rem',
              background: notification.includes('Ô£à') ? '#dcfce7' : notification.includes('ÔÅ│') ? '#e0f2fe' : '#fee2e2',
              color: notification.includes('Ô£à') ? '#166534' : notification.includes('ÔÅ│') ? '#0369a1' : '#991b1b',
              border: `1px solid ${notification.includes('Ô£à') ? '#86efac' : notification.includes('ÔÅ│') ? '#7dd3fc' : '#fca5a5'}`,
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
            <p>Cargando datos...</p>
          ) : compras.length === 0 ? (
            <p>No se encontraron compras para este insumo.</p>
          ) : (
            <div style={{overflowX: 'auto'}}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Orden/Doc</th>
                    <th>Detalle</th>
                    <th>Unidad Orig.</th>
                    <th style={{textAlign: 'right'}}>Cant. Orig.</th>
                    <th style={{textAlign: 'right'}}>Precio Orig.</th>
                    <th>Unidad (Editable)</th>
                    <th style={{textAlign: 'right'}}>Cantidad_Und (Editable)</th>
                    <th style={{textAlign: 'right'}}>Precio Unit.</th>
                    <th style={{textAlign: 'right'}}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {compras.map((compra, index) => {
                    const isMismatch = compra.unidad !== compra.unidad_orig;
                    
                    return (
                      <tr key={compra.id} style={{
                        background: isMismatch ? '#fff7ed' : 'transparent',
                        borderLeft: isMismatch ? '4px solid #f97316' : 'none'
                      }}>
                        <td>{compra.orden}</td>
                        <td style={{maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}} title={compra.detalle}>
                          {compra.detalle}
                        </td>
                        <td>
                          {compra.unidad_orig}
                        </td>
                        <td style={{textAlign: 'right'}}>{Number(compra.cant_orig).toFixed(4)}</td>
                        <td style={{textAlign: 'right', color: '#64748b', fontSize: '0.9rem'}}>
                          S/ {Number(compra.precio_orig).toFixed(2)}
                        </td>

                        {/* EDITABLE UNIT */}
                        <td className="editable" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', background: 'transparent'}}>
                          <select 
                            value={compra.unidad} 
                            onChange={(e) => handleEdit(index, 'unidad', e.target.value)}
                            style={{
                              border: index === 0 ? '2px solid var(--primary)' : '1px solid #cbd5e1',
                              background: index === 0 ? '#eff6ff' : 'white',
                              cursor: 'pointer'
                            }}
                          >
                            {unitsList.map(u => (
                              <option key={u} value={u}>{u}</option>
                            ))}
                          </select>
                          {isMismatch && (
                            <span style={{color: '#c2410c', fontSize: '0.85rem', fontWeight: 'bold'}}>
                              ÔÜá´©Å <del>{compra.unidad_orig}</del>
                            </span>
                          )}
                        </td>
                        
                        {/* EDITABLE QUANTITY */}
                        <td className="editable">
                          <input 
                            type="number" 
                            step="0.0001"
                            value={compra.cantidad_und} 
                            onChange={(e) => handleEdit(index, 'cantidad_und', parseFloat(e.target.value) || 0)}
                            disabled={!isMismatch}
                            style={{
                              background: !isMismatch ? '#f8fafc' : 'white',
                              cursor: !isMismatch ? 'not-allowed' : 'text'
                            }}
                          />
                        </td>
                        
                        {/* EDITABLE PRICE UNIT (NEW) */}
                        <td className="editable">
                          <input 
                            type="number" 
                            step="0.0001"
                            value={compra.precio_unit} 
                            onChange={(e) => handleEdit(index, 'precio_unit', parseFloat(e.target.value) || 0)}
                            style={{
                              textAlign: 'right',
                              background: !isMismatch ? '#f8fafc' : 'white',
                              cursor: !isMismatch ? 'not-allowed' : 'text'
                            }}
                            disabled={!isMismatch}
                          />
                        </td>

                        <td style={{textAlign: 'right', fontWeight: 'bold'}}>
                          {(Number(compra.cantidad_und) * Number(compra.precio_unit)).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="metrics">
            <div className="metric-card" style={{ background: '#fefce8', border: '2px solid #facc15', boxShadow: '0 4px 6px -1px rgba(234, 179, 8, 0.15)' }}>
              <div className="metric-label" style={{ color: '#854d0e', fontWeight: 'bold' }}>Total Adquirido V├ílido</div>
              <div className="metric-value" style={{ color: '#713f12' }}>{totals.totalAdquirido.toLocaleString('en-US', {minimumFractionDigits: 4, maximumFractionDigits: 4})}</div>
            </div>
            <div className="metric-card" style={{ opacity: 0.6 }}>
              <div className="metric-label">Suma Total (Costo)</div>
              <div className="metric-value">S/ {totals.sumaImporte.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            </div>
            <div className="metric-card" style={{ background: '#fefce8', border: '2px solid #facc15', boxShadow: '0 4px 6px -1px rgba(234, 179, 8, 0.15)' }}>
              <div className="metric-label" style={{ color: '#854d0e', fontWeight: 'bold' }}>Precio Promedio Ponderado</div>
              <div className="metric-value" style={{ color: '#713f12' }}>S/ {totals.precioPromedio.toLocaleString('en-US', {minimumFractionDigits: 4, maximumFractionDigits: 4})}</div>
            </div>
          </div>
          
          <h2 style={{marginTop: '3rem'}}>­ƒôè 3. Edici├│n de Incidencias (APU 2)</h2>

          <div style={{marginBottom: '1.5rem', padding: '1.5rem', background: '#dcfce7', borderLeft: '4px solid #16a34a', borderRadius: '4px', border: '2px solid #22c55e'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '1.5rem'}}>
              <div>
                <div style={{fontSize: '0.9rem', color: '#15803d', fontWeight: '600', marginBottom: '0.25rem'}}>Ô£¿ Precio Promedio Ponderado (PPP)</div>
                <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#166534'}}>S/ {totals.precioPromedio.toLocaleString('en-US', {minimumFractionDigits: 4, maximumFractionDigits: 4})}</div>
              </div>
              <div style={{fontSize: '0.85rem', color: '#15803d', fontStyle: 'italic', flex: 1}}>
                Este es el precio unitario que se usar├í en el APU Nuevo Modificado para todos los APU de este insumo.
              </div>
            </div>
          </div>

          <div style={{marginBottom: '1.5rem', padding: '1.5rem', background: '#eef2ff', borderLeft: '4px solid #4f46e5', borderRadius: '4px'}}>
            <label htmlFor="global-adquirido" style={{fontWeight: 'bold', display: 'block', marginBottom: '0.5rem', color: '#312e81'}}>
              ­ƒÄ» Meta de Cuadre Global (Total Adquirido V├ílido a Cuadrar):
            </label>
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
              <div style={{position: 'relative', flex: 1, maxWidth: '300px'}}>
                <input 
                  type="number" 
                  step="0.0001"
                  className="meta-input"
                  value={globalAdquirido} 
                  onChange={(e) => setGlobalAdquirido(parseFloat(e.target.value) || 0)}
                  onBlur={autoSaveGlobalMeta}
                  disabled={isMetaLocked}
                  style={{
                    width: '100%',
                    padding: '0.75rem', 
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    borderRadius: '6px', 
                    border: isMetaLocked ? '2px solid #e2e8f0' : '2px solid var(--primary)',
                    background: isMetaLocked ? '#f1f5f9' : 'white',
                    color: isMetaLocked ? '#64748b' : '#1e293b',
                    cursor: isMetaLocked ? 'not-allowed' : 'text',
                    transition: 'all 0.2s'
                  }}
                />
                {isMetaLocked && (
                  <div style={{position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8'}}>
                    ­ƒöÆ
                  </div>
                )}
              </div>

              <button 
                onClick={() => {
                  if (isMetaLocked) {
                    const pass = prompt('­ƒöæ Ingrese la clave para desbloquear la Meta Global:');
                    if (pass === '1111') {
                      setIsMetaLocked(false);
                    } else if (pass !== null) {
                      alert('ÔØî Clave incorrecta');
                    }
                  } else {
                    setIsMetaLocked(true);
                  }
                }}
                className="btn"
                style={{
                  background: isMetaLocked ? '#64748b' : '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem'
                }}
              >
                {isMetaLocked ? '­ƒöô Desbloquear para Editar' : '­ƒöÆ Bloquear Campo'}
              </button>

              <span style={{fontSize: '0.9rem', color: '#64748b', fontStyle: 'italic'}}>
                Este es el total neto que se comparar├í contra la suma de tus Parciales 2.
              </span>
            </div>
          </div>

          <p style={{color: '#666', marginBottom: '1rem'}}>
            Edite la <strong>CANTIDAD 2 (Incidencia)</strong> en cada partida para que la suma final cuadre con la Meta Global.
          </p>

          <div style={{overflowX: 'auto'}}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{width: '40px'}}></th>
                  <th>Item 1</th>
                  <th>C├│digo 1</th>
                  <th>Descripci├│n Partida</th>
                  <th>Unid.</th>
                  <th style={{textAlign: 'right'}}>Cantidad 1</th>
                  <th style={{textAlign: 'right'}}>Metrado Fijo</th>
                  <th style={{textAlign: 'right'}}>Parcial 1</th>
                  <th style={{textAlign: 'right', color: '#64748b'}}>Precio Unit Orig.</th>
                  <th style={{textAlign: 'right', background: '#e2e8f0', color: '#1e293b'}}>CANTIDAD 2</th>
                  <th style={{textAlign: 'right'}}>Parcial 2</th>
                  <th style={{textAlign: 'right', background: '#dcfce7', color: '#166534', fontWeight: 'bold'}}>Precio Unit Nuevo</th>
                  <th style={{textAlign: 'right', background: '#dcfce7', color: '#166534', fontWeight: 'bold'}}>Costo Total Nuevo</th>
                </tr>
              </thead>
              <tbody>
                {apuData.map((apu, index) => {
                  const parcial2 = Number(apu.cantidad_2) * Number(apu.metrado_fijo);
                  const costoTotalNuevo = parcial2 * totals.precioPromedio;
                  const isExpanded = expandedRows.has(apu.id);
                  return (
                    <React.Fragment key={apu.id}>
                      <tr style={{background: isExpanded ? '#f1f5f9' : 'transparent', borderBottom: '1px solid #e2e8f0'}}>
                        <td style={{textAlign: 'center'}}>
                          <button
                            onClick={() => toggleRow(apu.id)}
                            style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem'}}
                            title={isExpanded ? "Ocultar APU" : "Ver APU Completo"}
                          >
                            {isExpanded ? '­ƒö¢' : 'ÔûÂ´©Å'}
                          </button>
                        </td>
                        <td>{apu.item_1}</td>
                        <td>{apu.codigo_insumo}</td>
                        <td style={{maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}} title={apu.partida_desc}>
                          {apu.codigo_partida} - {apu.partida_desc}
                        </td>
                        <td>{apu.unidad}</td>
                        <td style={{textAlign: 'right'}}>{Number(apu.cantidad_1).toFixed(6)}</td>
                        <td style={{textAlign: 'right'}}>{Number(apu.metrado_fijo).toFixed(4)}</td>
                        <td style={{textAlign: 'right'}}>{Number(apu.parcial_1).toFixed(4)}</td>

                        {/* PRECIO UNIT ORIGINAL */}
                        <td style={{textAlign: 'right', color: '#64748b', fontSize: '0.9rem'}}>
                          S/ {Number(apu.precio_unit_original).toLocaleString('en-US', {minimumFractionDigits: 4, maximumFractionDigits: 4})}
                        </td>

                        {/* EDITABLE CANTIDAD 2 */}
                        <td className="editable" style={{border: '2px solid #94a3b8'}}>
                          <input
                            type="number"
                            step="0.000001"
                            style={{fontWeight: 'bold', color: '#0f172a'}}
                            value={apu.cantidad_2}
                            onChange={(e) => handleApuEdit(index, 'cantidad_2', parseFloat(e.target.value) || 0)}
                            onBlur={() => autoSaveApu(apu)}
                          />
                        </td>

                        <td style={{textAlign: 'right', fontWeight: 'bold'}}>{parcial2.toFixed(4)}</td>

                        {/* PRECIO UNIT NUEVO (PPP) */}
                        <td style={{textAlign: 'right', fontWeight: 'bold', background: '#f0fdf4', color: '#166534'}}>
                          S/ {totals.precioPromedio.toLocaleString('en-US', {minimumFractionDigits: 4, maximumFractionDigits: 4})}
                        </td>

                        {/* COSTO TOTAL NUEVO */}
                        <td style={{textAlign: 'right', fontWeight: 'bold', background: '#dcfce7', color: '#166534'}}>
                          S/ {costoTotalNuevo.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={10} style={{padding: '0 1rem 1rem 1rem', background: '#f8fafc', borderBottom: '2px solid #cbd5e1'}}>
                            <ApuComparative 
                              codigoPartida={apu.codigo_partida} 
                              selectedInsumoName={selectedInsumo}
                              modifiedIncidencia={Number(apu.cantidad_2)}
                              onIncidenciaChange={(val) => handleApuEdit(index, 'cantidad_2', val)}
                              onIncidenciaBlur={() => autoSaveApu(apu)}
                            />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {(() => {
            const sumParcial2 = apuData.reduce((acc, curr) => acc + (Number(curr.cantidad_2) * Number(curr.metrado_fijo)), 0);
            const diff2 = globalAdquirido - sumParcial2;
            
            return (
              <div className="metrics">
                <div className="metric-card">
                  <div className="metric-label">Meta Global (A Cuadrar)</div>
                  <div className="metric-value">{globalAdquirido.toLocaleString('en-US', {minimumFractionDigits: 4, maximumFractionDigits: 4})}</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Suma Parcial 2 (APU)</div>
                  <div className="metric-value">{sumParcial2.toLocaleString('en-US', {minimumFractionDigits: 4, maximumFractionDigits: 4})}</div>
                  <div style={{
                    fontSize: '0.9rem', 
                    fontWeight: '600',
                    color: Math.abs(diff2) < 0.0001 ? '#16a34a' : '#dc2626', 
                    marginTop: '0.75rem',
                    padding: '0.5rem',
                    background: Math.abs(diff2) < 0.0001 ? '#f0fdf4' : '#fef2f2',
                    borderRadius: '4px',
                    display: 'inline-block',
                    border: `1px solid ${Math.abs(diff2) < 0.0001 ? '#bbf7d0' : '#fecaca'}`
                  }}>
                    {Math.abs(diff2) < 0.0001 ? (
                      'Ô£à Cuadre Exacto'
                    ) : diff2 > 0 ? (
                      `ÔÜá´©Å Falta: ${diff2.toFixed(4)} (Aumentar incidencia)`
                    ) : (
                      `ÔÜá´©Å Exceso: ${Math.abs(diff2).toFixed(4)} (Reducir cantidad o incidencia)`
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

        </div>
      )}
    </main>
  );
}
