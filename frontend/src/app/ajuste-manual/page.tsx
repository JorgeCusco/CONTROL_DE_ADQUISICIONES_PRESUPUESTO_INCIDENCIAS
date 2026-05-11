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
  const [insumosList, setInsumosList] = useState<{ codigo: string, nombre: string, estado?: string, comentario?: string }[]>([]);
  const [unitsList, setUnitsList] = useState<string[]>([]);
  const [selectedInsumo, setSelectedInsumo] = useState<string>('');
  const [selectedInsumoName, setSelectedInsumoName] = useState<string>('');

  const [compras, setCompras] = useState<Compra[]>([]);
  const [apuData, setApuData] = useState<Apu[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState('');

  const [officialName, setOfficialName] = useState<string>('');
  const [globalAdquirido, setGlobalAdquirido] = useState<number>(0);
  const [isMetaLocked, setIsMetaLocked] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [workflowState, setWorkflowState] = useState('Pendiente');
  const [workflowComment, setWorkflowComment] = useState('');
  const [showBubble, setShowBubble] = useState(false);

  // Dragging states for Help Bubble
  const [bubblePos, setBubblePos] = useState({ x: 121, y: 315 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setBubblePos({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Boolean Filter Logic
  const filteredInsumos = useMemo(() => {
    if (!searchTerm.trim()) return insumosList.slice(0, 100); // Show first 100 if empty
    const terms = searchTerm.toLowerCase().split(/\s+/).filter(Boolean);
    return insumosList.filter(ins => {
      const lowerIns = ins.nombre.toLowerCase() + " " + ins.codigo.toLowerCase();
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
    if (!selectedInsumoName) return [];
    const names = new Set<string>();
    names.add(selectedInsumoName); // APU original
    compras.forEach(c => {
      if (c.detalle && c.detalle.trim() !== '') {
        names.add(c.detalle.trim());
      }
    });
    return Array.from(names);
  }, [selectedInsumoName, compras]);

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

    const insumoData = insumosList.find(i => i.codigo === selectedInsumo);
    if (insumoData) {
      setWorkflowState(insumoData.estado || 'Pendiente');
      setWorkflowComment(insumoData.comentario || '');
    }

    fetch(`/api/compras?insumo=${encodeURIComponent(selectedInsumo)}`)
      .then(res => res.json())
      .then(data => {
        setCompras(data);
        setOfficialName(selectedInsumoName); // Reset official name to current selected
      });

    fetch(`/api/apu?insumo=${encodeURIComponent(selectedInsumo)}`)
      .then(res => res.json())
      .then(data => {
        setApuData(data);
        setLoading(false);
      });
  }, [selectedInsumo, selectedInsumoName]);

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

  const { sumParcial2, diff2 } = useMemo(() => {
    const sum = apuData.reduce((acc, curr) => acc + (Number(curr.cantidad_2) * Number(curr.metrado_fijo)), 0);
    return { sumParcial2: sum, diff2: globalAdquirido - sum };
  }, [apuData, globalAdquirido]);

  // Sync Global Goal with Purchases Total when locked
  useEffect(() => {
    if (isMetaLocked) {
      setGlobalAdquirido(sumAdquiridoValido);
    }
  }, [sumAdquiridoValido, isMetaLocked]);

  const autoSaveApu = async (apu: Apu) => {
    try {
      setNotification('⏳ Guardando APU automáticamente...');
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
        setNotification('✅ Cambio en APU guardado automáticamente.');
        setTimeout(() => setNotification(''), 2000);
      } else {
        setNotification('❌ Error al auto-guardar APU.');
      }
    } catch (e) {
      setNotification('❌ Error de conexión al auto-guardar.');
    }
  };

  const autoSaveGlobalMeta = async () => {
    if (isMetaLocked) return; // Si está bloqueado se sincroniza solo, no forzamos DB si no es edición manual o en save global
    try {
      setNotification('⏳ Guardando Meta Global...');
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
        setNotification('✅ Meta Global guardada en todas las partidas.');
        setTimeout(() => setNotification(''), 2000);
      }
    } catch (e) {
      setNotification('❌ Error de conexión al guardar Meta Global.');
    }
  };

  const autoSaveCompra = async (compra: Compra) => {
    try {
      const res = await fetch('/api/compras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: [{
            id: compra.id,
            unidad: compra.unidad,
            cantidad_und: Number(compra.cantidad_und),
            precio_unit: Number(compra.precio_unit)
          }]
        })
      });
      if (!res.ok) setNotification('❌ Error al auto-guardar compra.');
    } catch (e) {
      setNotification('❌ Error de conexión al auto-guardar.');
    }
  };

  const saveWorkflowState = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/estado-insumo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo_insumo: selectedInsumo,
          estado: workflowState,
          comentario: workflowComment
        })
      });
      if (res.ok) {
        setNotification('✅ Estado guardado exitosamente.');
        setTimeout(() => setNotification(''), 3000);
        // Refresh local list state
        setInsumosList(prev => prev.map(i => i.codigo === selectedInsumo ? { ...i, estado: workflowState, comentario: workflowComment } : i));
      }
    } catch (e) {
      setNotification('❌ Error al guardar estado.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="container">
      <h1>⚖️ Ajuste Manual y Cuadre de Adquisiciones</h1>

      <div className="card">
        <div className="selector-group" style={{ position: 'relative' }}>
          <label htmlFor="insumo-search"><strong>1. Busque y Seleccione el Insumo (Búsqueda Booleana):</strong></label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              id="insumo-search"
              type="text"
              placeholder="Ej: CEMENTO PORTLAND (Busca ambos términos)"
              value={searchTerm || selectedInsumoName}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (selectedInsumoName) setSelectedInsumoName('');
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              style={{ flex: 1, padding: '0.75rem', borderRadius: '4px', border: '2px solid var(--primary)' }}
            />
            {selectedInsumo && (
              <button
                className="btn"
                style={{ background: '#64748b' }}
                onClick={() => {
                  setSelectedInsumo('');
                  setSelectedInsumoName('');
                  setSearchTerm('');
                }}
              >
                ✖ Limpiar
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
                  key={`${ins.codigo}-${i}`}
                  onClick={() => {
                    setSelectedInsumo(ins.codigo);
                    setSelectedInsumoName(ins.nombre);
                    setSearchTerm('');
                    setShowDropdown(false);
                  }}
                  style={{
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f1f5f9',
                    background: selectedInsumo === ins.codigo ? '#eff6ff' : 'white',
                    color: selectedInsumo === ins.codigo ? '#1e40af' : 'inherit',
                    fontWeight: selectedInsumo === ins.codigo ? '600' : 'normal'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = selectedInsumo === ins.codigo ? '#eff6ff' : 'white'}
                >
                  <span style={{ fontSize: '0.8rem', color: '#64748b', marginRight: '0.5rem' }}>{ins.codigo}</span>
                  {ins.nombre}
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
            <h2>🛒 Cuadre Manual de Compras (Unificar Unidades)</h2>
          </div>

          <p style={{ color: '#666', marginBottom: '1rem' }}>
            Edita la <strong>Unidad</strong> y la <strong>Cantidad_Und</strong> para unificar y cuadrar las compras.
          </p>

          <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderLeft: '4px solid var(--primary)' }}>
            <label htmlFor="official-name" style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>✏️ Definir Nombre Oficial del Insumo:</label>
            <select
              id="official-name"
              value={officialName}
              onChange={(e) => {
                setOfficialName(e.target.value);
                // Auto-save name
                fetch('/api/apu', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ updates: [], globalNameUpdate: { oldName: selectedInsumo, newName: e.target.value } })
                }).then(() => {
                  setNotification('✅ Nombre oficial actualizado.');
                  setTimeout(() => setNotification(''), 2000);
                });
              }}
              style={{ width: '100%', maxWidth: '600px' }}
            >
              {availableNames.map((name, i) => (
                <option key={i} value={name}>{name} {name === selectedInsumoName ? '(Actual en APU)' : '(De Compra)'}</option>
              ))}
            </select>
          </div>

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
            <p>Cargando datos...</p>
          ) : compras.length === 0 ? (
            <p>No se encontraron compras para este insumo.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Orden/Doc</th>
                    <th>Detalle</th>
                    <th>Unidad Orig.</th>
                    <th style={{ textAlign: 'right' }}>Cant. Orig.</th>
                    <th style={{ textAlign: 'right' }}>Precio Orig.</th>
                    <th>Unidad (Editable)</th>
                    <th style={{ textAlign: 'right' }}>Cantidad_Und (Editable)</th>
                    <th style={{ textAlign: 'right' }}>Precio Unit.</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
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
                        <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={compra.detalle}>
                          {compra.detalle}
                        </td>
                        <td>
                          {compra.unidad_orig}
                        </td>
                        <td style={{ textAlign: 'right' }}>{Number(compra.cant_orig).toFixed(4)}</td>
                        <td style={{ textAlign: 'right', color: '#64748b', fontSize: '0.9rem' }}>
                          S/ {Number(compra.precio_orig).toFixed(2)}
                        </td>

                        {/* EDITABLE UNIT */}
                        <td className="editable" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', background: 'transparent' }}>
                          <select
                            value={compra.unidad}
                            onChange={(e) => handleEdit(index, 'unidad', e.target.value)}
                            onBlur={() => autoSaveCompra(compra)}
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
                            <span style={{ color: '#c2410c', fontSize: '0.85rem', fontWeight: 'bold' }}>
                              ⚠️ <del>{compra.unidad_orig}</del>
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
                            onBlur={() => autoSaveCompra(compra)}
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
                            onBlur={() => autoSaveCompra(compra)}
                            style={{
                              textAlign: 'right',
                              background: !isMismatch ? '#f8fafc' : 'white',
                              cursor: !isMismatch ? 'not-allowed' : 'text'
                            }}
                            disabled={!isMismatch}
                          />
                        </td>

                        <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                          {(Number(compra.cantidad_und) * Number(compra.precio_unit)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
              <div className="metric-label" style={{ color: '#854d0e', fontWeight: 'bold' }}>Total Adquirido Válido</div>
              <div className="metric-value" style={{ color: '#713f12' }}>{totals.totalAdquirido.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</div>
            </div>
            <div className="metric-card" style={{ opacity: 0.6 }}>
              <div className="metric-label">Suma Total (Costo)</div>
              <div className="metric-value">S/ {totals.sumaImporte.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            <div className="metric-card" style={{ background: '#fefce8', border: '2px solid #facc15', boxShadow: '0 4px 6px -1px rgba(234, 179, 8, 0.15)' }}>
              <div className="metric-label" style={{ color: '#854d0e', fontWeight: 'bold' }}>Precio Promedio Ponderado</div>
              <div className="metric-value" style={{ color: '#713f12' }}>S/ {totals.precioPromedio.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</div>
            </div>
          </div>
          <h2 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>📊 3. Edición de Incidencias (APU 2)</h2>

          <div style={{ marginBottom: '0.75rem', padding: '0.75rem 1rem', background: '#dcfce7', borderLeft: '4px solid #16a34a', borderRadius: '4px', border: '2px solid #22c55e' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#15803d', fontWeight: '600', marginBottom: '0.15rem' }}>✨ Precio Promedio Ponderado (PPP)</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#166534' }}>S/ {totals.precioPromedio.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</div>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#15803d', fontStyle: 'italic', flex: 1 }}>
                Este es el precio unitario que se usará en el APU Nuevo Modificado para todos los APU de este insumo.
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '0.75rem', padding: '0.75rem 1rem', background: '#eef2ff', borderLeft: '4px solid #4f46e5', borderRadius: '4px' }}>
            <label htmlFor="global-adquirido" style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem', color: '#312e81' }}>
              🎯 Meta de Cuadre Global (Total Adquirido Válido a Cuadrar):
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
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
                    padding: '0.5rem',
                    fontSize: '1.1rem',
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
                  <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                    🔒
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  if (isMetaLocked) {
                    const pass = prompt('🔑 Ingrese la clave para desbloquear la Meta Global:');
                    if (pass === '1111') {
                      setIsMetaLocked(false);
                    } else if (pass !== null) {
                      alert('❌ Clave incorrecta');
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
                {isMetaLocked ? '🔓 Desbloquear para Editar' : '🔒 Bloquear Campo'}
              </button>

              <span style={{ fontSize: '0.9rem', color: '#64748b', fontStyle: 'italic' }}>
                Este es el total neto que se comparará contra la suma de tus Parciales 2.
              </span>
            </div>
          </div>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
            <p style={{ color: '#666', margin: 0, fontSize: '0.9rem' }}>
              Edite la <strong>CANTIDAD 2 (Incidencia)</strong> en cada partida para que la suma final cuadre con la Meta Global.
            </p>
            <button
              onClick={() => setShowBubble(!showBubble)}
              style={{ borderRadius: '50%', background: showBubble ? '#1e40af' : '#dbeafe', color: showBubble ? 'white' : '#1e40af', border: 'none', width: '22px', height: '22px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
              title="Ver estado de cuadre"
            >
              ?
            </button>
            {showBubble && (
              <div style={{
                position: 'fixed',
                top: `${bubblePos.y}px`,
                left: `${bubblePos.x}px`,
                background: 'white',
                border: '1px solid #cbd5e1',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
                padding: '0.8rem',
                borderRadius: '8px',
                width: '180px',
                zIndex: 9999,
                userSelect: isDragging ? 'none' : 'auto'
              }}>
                <div
                  onMouseDown={(e) => {
                    setIsDragging(true);
                    setDragStart({
                      x: e.clientX - bubblePos.x,
                      y: e.clientY - bubblePos.y
                    });
                  }}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    borderBottom: '1px solid #e2e8f0',
                    paddingBottom: '4px',
                    userSelect: 'none'
                  }}
                  title="Arrastra para mover"
                >
                  <h4 style={{ margin: 0, color: '#1e293b', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>⣿</span> 📊 Cuadre
                  </h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent drag activation when clicking close button
                      setShowBubble(false);
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1.2rem', padding: '0', lineHeight: 1 }}
                  >
                    ×
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '6px', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '2px' }}>Meta Global:</span>
                  <strong style={{ fontSize: '0.85rem', color: '#1e293b' }}>{globalAdquirido.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</strong>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '2px' }}>Suma APU:</span>
                  <strong style={{ fontSize: '0.85rem', color: '#1e293b' }}>{sumParcial2.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</strong>
                </div>

                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: Math.abs(diff2) < 0.0001 ? '#166534' : '#991b1b',
                  padding: '0.5rem',
                  background: Math.abs(diff2) < 0.0001 ? '#dcfce7' : '#fee2e2',
                  borderRadius: '6px',
                  border: `1px solid ${Math.abs(diff2) < 0.0001 ? '#bbf7d0' : '#fecaca'}`,
                  textAlign: 'center',
                  lineHeight: '1.2'
                }}>
                  {Math.abs(diff2) < 0.0001 ? (
                    '✅ Cuadre Exacto'
                  ) : diff2 > 0 ? (
                    `⚠️ Falta: ${diff2.toFixed(4)}\n(Aumentar incidencia)`
                  ) : (
                    `⚠️ Exceso: ${Math.abs(diff2).toFixed(4)}\n(Reducir incidencia)`
                  )}
                </div>
              </div>
            )}
          </div>

          <div style={{ width: '100%', overflowX: 'hidden' }}>
            <table className="data-table" style={{ fontSize: '0.8rem' }}>
              <thead>
                <tr>
                  <th style={{ width: '30px', padding: '0.5rem' }}></th>
                  <th style={{ whiteSpace: 'nowrap', padding: '0.5rem' }}>Item 1</th>
                  <th style={{ whiteSpace: 'nowrap', padding: '0.5rem' }}>Código 1</th>
                  <th style={{ padding: '0.5rem' }}>Descripción Partida</th>
                  <th style={{ whiteSpace: 'nowrap', padding: '0.5rem' }}>Unid.</th>
                  <th style={{ textAlign: 'right', whiteSpace: 'nowrap', padding: '0.5rem' }}>Cantidad 1</th>
                  <th style={{ textAlign: 'right', whiteSpace: 'nowrap', padding: '0.5rem' }}>Metrado Fijo</th>
                  <th style={{ textAlign: 'right', whiteSpace: 'nowrap', padding: '0.5rem' }}>Parcial 1</th>
                  <th style={{ textAlign: 'right', color: '#64748b', padding: '0.5rem' }}>Precio Unit Orig.</th>
                  <th style={{ textAlign: 'right', background: '#e2e8f0', color: '#1e293b', padding: '0.5rem', width: '100px' }}>CANTIDAD 2 (INCIDENCIA)</th>
                  <th style={{ textAlign: 'right', whiteSpace: 'nowrap', padding: '0.5rem' }}>Parcial 2</th>
                  <th style={{ textAlign: 'right', background: '#dcfce7', color: '#166534', fontWeight: 'bold', padding: '0.5rem' }}>Precio Unit Nuevo</th>
                  <th style={{ textAlign: 'right', background: '#dcfce7', color: '#166534', fontWeight: 'bold', padding: '0.5rem' }}>Costo Total Nuevo</th>
                </tr>
              </thead>
              <tbody>
                {apuData.map((apu, index) => {
                  const parcial2 = Number(apu.cantidad_2) * Number(apu.metrado_fijo);
                  const costoTotalNuevo = parcial2 * totals.precioPromedio;
                  const isExpanded = expandedRows.has(apu.id);
                  return (
                    <React.Fragment key={apu.id}>
                      <tr style={{ background: isExpanded ? '#f1f5f9' : 'transparent', borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ textAlign: 'center', padding: '0.5rem' }}>
                          <button
                            onClick={() => toggleRow(apu.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
                            title={isExpanded ? "Ocultar APU" : "Ver APU Completo"}
                          >
                            {isExpanded ? '🔽' : '▶️'}
                          </button>
                        </td>
                        <td style={{ padding: '0.5rem' }}>{apu.item_1}</td>
                        <td style={{ padding: '0.5rem' }}>{apu.codigo_insumo}</td>
                        <td style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: '0.5rem' }} title={apu.partida_desc}>
                          {apu.codigo_partida} - {apu.partida_desc}
                        </td>
                        <td style={{ padding: '0.5rem' }}>{apu.unidad}</td>
                        <td style={{ textAlign: 'right', padding: '0.5rem' }}>{Number(apu.cantidad_1).toFixed(6)}</td>
                        <td style={{ textAlign: 'right', padding: '0.5rem' }}>{Number(apu.metrado_fijo).toFixed(4)}</td>
                        <td style={{ textAlign: 'right', padding: '0.5rem' }}>{Number(apu.parcial_1).toFixed(4)}</td>

                        {/* PRECIO UNIT ORIGINAL */}
                        <td style={{ textAlign: 'right', color: '#64748b', fontSize: '0.8rem', padding: '0.5rem' }}>
                          S/ {Number(apu.precio_unit_original).toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                        </td>

                        {/* EDITABLE CANTIDAD 2 */}
                        <td className="editable" style={{ border: '2px solid #94a3b8', padding: '0' }}>
                          <input
                            type="number"
                            step="0.000001"
                            style={{ fontWeight: 'bold', color: '#0f172a', width: '90px', textAlign: 'right', fontSize: '0.8rem', padding: '0.25rem' }}
                            value={apu.cantidad_2}
                            onChange={(e) => handleApuEdit(index, 'cantidad_2', parseFloat(e.target.value) || 0)}
                            onBlur={() => autoSaveApu(apu)}
                          />
                        </td>

                        <td style={{ textAlign: 'right', fontWeight: 'bold', padding: '0.5rem' }}>{parcial2.toFixed(4)}</td>

                        {/* PRECIO UNIT NUEVO (PPP) */}
                        <td style={{ textAlign: 'right', fontWeight: 'bold', background: '#f0fdf4', color: '#166534', padding: '0.5rem' }}>
                          S/ {totals.precioPromedio.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                        </td>

                        {/* COSTO TOTAL NUEVO */}
                        <td style={{ textAlign: 'right', fontWeight: 'bold', background: '#dcfce7', color: '#166534', padding: '0.5rem' }}>
                          S/ {costoTotalNuevo.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={13} style={{ padding: '0 1rem 1rem 1rem', background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                            <ApuComparative
                              codigoPartida={apu.codigo_partida}
                              selectedInsumoName={selectedInsumoName}
                              modifiedIncidencia={Number(apu.cantidad_2)}
                              ppp={totals.precioPromedio}
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
            return (
              <div className="metrics">
                <div className="metric-card">
                  <div className="metric-label">INSUMOS SEGÚN ADQUISICIONES</div>
                  <div className="metric-value">{globalAdquirido.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">SEGÚN EXPEDIENTE</div>
                  <div className="metric-value">{sumParcial2.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</div>
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
                      '✅ Cuadre Exacto'
                    ) : diff2 > 0 ? (
                      `⚠️ Falta: ${diff2.toFixed(4)} (Aumentar incidencia)`
                    ) : (
                      `⚠️ Exceso: ${Math.abs(diff2).toFixed(4)} (Reducir cantidad o incidencia)`
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
          {/* WORKFLOW STATE PANEL */}
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '300px' }}>
              <h3 style={{ marginBottom: '1rem', color: '#1e293b' }}>🚦 Cierre de Flujo de Cuadre</h3>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Estado Actual del Insumo:</label>
                <select
                  value={workflowState}
                  onChange={e => setWorkflowState(e.target.value)}
                  style={{
                    width: '100%', padding: '0.75rem', fontSize: '1rem', borderRadius: '4px', border: '2px solid #cbd5e1',
                    background: workflowState === 'Terminado' ? '#dcfce7' : workflowState === 'Cuadre Parcial' ? '#dbeafe' : workflowState === 'Excedente' ? '#fef08a' : 'white'
                  }}
                >
                  <option value="Pendiente">⚪ Pendiente</option>
                  <option value="En Revisión">🟡 En Revisión</option>
                  <option value="Cuadre Parcial">🔵 Cuadre Parcial (Falta Partida)</option>
                  <option value="Excedente">🟠 Excedente a Justificar</option>
                  <option value="Terminado">🟢 Terminado / Cuadrado</option>
                </select>
              </div>
              <button
                onClick={saveWorkflowState}
                disabled={saving}
                className="btn btn-success"
                style={{ width: '100%', fontSize: '1.1rem', padding: '0.75rem' }}
              >
                {saving ? 'Guardando...' : '✅ Guardar y Sellar Estado'}
              </button>
            </div>

            <div style={{ flex: '2', minWidth: '300px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>📝 Nota de Justificación (Para Status Gerencial):</label>
              <textarea
                value={workflowComment}
                onChange={e => setWorkflowComment(e.target.value)}
                placeholder="Ej. Dejo S/ 500 libres porque falta crear la partida de Muro de Contención para absorber este saldo..."
                style={{ width: '100%', minHeight: '120px', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', resize: 'vertical' }}
              />
            </div>
          </div>

        </div>
      )}
    </main>
  );
}
