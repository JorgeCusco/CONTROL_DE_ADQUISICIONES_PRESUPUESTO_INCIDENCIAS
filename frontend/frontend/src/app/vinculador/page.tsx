"use client";
import { useEffect, useState, useCallback } from 'react';
import { getClientUsuario } from '@/lib/clientUtils';

type InsumoStat = {
  codigo: string;
  nombre: string;
  unidad: string;
  meta_cantidad: number;
  linked_count: number;
  adquirido: number;
  precio?: number;
  es_extra?: number;
  total_registros: number;
};

type CompraItem = {
  id: number;
  orden_doc: string;
  detalle_compra: string;
  tipo_c: string;
  anio_c: string;
  unidad: string;
  cantidad: number;
  precio: number;
  total: number;
  insumo_descripcion: string;
  observacion: string;
  estado: 'vinculado' | 'bloqueado' | 'disponible';
  vinculado_a?: string;
};

type ComprasData = {
  meta_cantidad: number;
  unidad: string;
  adquirido: number;
  compras: CompraItem[];
};

const STATUS_BG: Record<string, string> = {
  vinculado: '#dcfce7',
  bloqueado: '#fee2e2',
  disponible: 'transparent',
};

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export default function VinculadorPage() {
  const [insumos, setInsumos] = useState<InsumoStat[]>([]);
  const [totalUnlinkedCompras, setTotalUnlinkedCompras] = useState(0);
  const [loadingInsumos, setLoadingInsumos] = useState(true);
  const [selectedInsumoCodigo, setSelectedInsumoCodigo] = useState<string | null>(null);
  const [selectedInsumoNombre, setSelectedInsumoNombre] = useState<string | null>(null);
  const [comprasData, setComprasData] = useState<ComprasData | null>(null);
  const [loadingCompras, setLoadingCompras] = useState(false);
  const [searchInsumo, setSearchInsumo] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'vinculado' | 'sin_vincular'>('all');
  const [searchCompra, setSearchCompra] = useState('');
  const [filterCompra, setFilterCompra] = useState<'all' | 'disponible' | 'vinculado' | 'bloqueado'>('all');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [confirmUnlink, setConfirmUnlink] = useState<number | null>(null);

  const loadInsumos = useCallback(() => {
    setLoadingInsumos(true);
    fetch('/api/vinculacion?mode=insumos')
      .then(r => r.json())
      .then((data) => { 
        setInsumos(data.insumos || []); 
        setTotalUnlinkedCompras(data.total_unlinked_compras || 0);
        setLoadingInsumos(false); 
      });
  }, []);

  const loadCompras = useCallback((codigo: string) => {
    setLoadingCompras(true);
    setSelected(new Set());
    fetch(`/api/vinculacion?insumo=${encodeURIComponent(codigo)}`)
      .then(r => r.json())
      .then((data: ComprasData) => { setComprasData(data); setLoadingCompras(false); });
  }, []);

  useEffect(() => { loadInsumos(); }, [loadInsumos]);

  const handleSelectInsumo = (codigo: string, nombre: string) => {
    setSelectedInsumoCodigo(codigo);
    setSelectedInsumoNombre(nombre);
    // REMOVED: setSearchCompra('') to keep the search term intact when switching insumos
    // REMOVED: setFilterCompra('all') to keep filters intact
    loadCompras(codigo);
  };

  const toggleSelect = (id: number, estado: string) => {
    if (estado !== 'disponible') return;
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleVincular = async () => {
    if (!selectedInsumoCodigo || selected.size === 0) return;
    setSaving(true);
    try {
      const res = await fetch('/api/vinculacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Usuario': getClientUsuario() },
        body: JSON.stringify({ codigo_insumo: selectedInsumoCodigo, compra_ids: [...selected] }),
      });
      if (res.ok) {
        setSelected(new Set());
        loadCompras(selectedInsumoCodigo);
        loadInsumos();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDesvincular = async (compra_id: number) => {
    if (!selectedInsumoCodigo) return;
    const res = await fetch(
      `/api/vinculacion?codigo_insumo=${encodeURIComponent(selectedInsumoCodigo)}&compra_id=${compra_id}`,
      { method: 'DELETE', headers: { 'X-Usuario': getClientUsuario() } }
    );
    if (res.ok) {
      setConfirmUnlink(null);
      loadCompras(selectedInsumoCodigo);
      loadInsumos();
    }
  };

  const matchesBoolean = (target: string, search: string) => {
    if (!search) return true;
    const tokens = normalize(search).split(/\s+/).filter(t => t.length > 0);
    const normalizedTarget = normalize(target);
    return tokens.every(token => normalizedTarget.includes(token));
  };

  const filteredInsumos = insumos.filter(i => {
    if (filterStatus === 'vinculado' && Number(i.linked_count) === 0) return false;
    if (filterStatus === 'sin_vincular' && Number(i.linked_count) > 0) return false;
    if (searchInsumo) {
      return matchesBoolean(i.nombre || '', searchInsumo) || matchesBoolean(i.codigo || '', searchInsumo);
    }
    return true;
  });

  const filteredCompras = (comprasData?.compras ?? []).filter(c => {
    if (filterCompra !== 'all' && c.estado !== filterCompra) return false;
    if (searchCompra) {
      const combinedTarget = `${c.detalle_compra ?? ''} ${c.orden_doc ?? ''} ${c.insumo_descripcion ?? ''}`;
      return matchesBoolean(combinedTarget, searchCompra);
    }
    return true;
  });

  const vinculadoCount  = comprasData?.compras?.filter(c => c.estado === 'vinculado').length ?? 0;
  const disponibleCount = comprasData?.compras?.filter(c => c.estado === 'disponible').length ?? 0;
  const bloqueadoCount  = comprasData?.compras?.filter(c => c.estado === 'bloqueado').length ?? 0;
  const meta      = Number(comprasData?.meta_cantidad || 0);
  const adquirido = Number(comprasData?.adquirido || 0);
  const resta     = meta - adquirido;
  const unlinkedCount = insumos.filter(i => Number(i.linked_count) === 0).length;
  const extraCount = insumos.filter(i => i.es_extra === 1).length;

  return (
    <div style={{ padding: '1.25rem', fontFamily: 'system-ui, sans-serif', height: 'calc(100vh - 32px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.35rem' }}>🔗 Vinculador — Insumos ↔ Compras</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {!loadingInsumos && unlinkedCount > 0 && (
              <span style={{ fontSize: '0.82rem', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '10px', padding: '2px 10px', color: '#92400e' }}>
                ⚠️ {unlinkedCount} sin vincular
              </span>
            )}
            {totalUnlinkedCompras > 0 && (
              <span style={{ fontSize: '0.82rem', background: '#e0f2fe', border: '1px solid #7dd3fc', borderRadius: '10px', padding: '2px 10px', color: '#0369a1' }}>
                📦 {totalUnlinkedCompras} Caja Chica totales
              </span>
            )}
            {extraCount > 0 && (
              <span style={{ fontSize: '0.82rem', background: '#dcfce7', border: '1px solid #86efac', borderRadius: '10px', padding: '2px 10px', color: '#166534' }}>
                ✨ {extraCount} extras
              </span>
            )}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => window.location.href = '/api/exportar-insumos'}
            style={{
              background: '#8b5cf6', color: 'white', border: 'none', padding: '0.6rem 1.2rem',
              borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(139, 92, 246, 0.3), 0 2px 4px -1px rgba(139, 92, 246, 0.2)',
              transition: 'all 0.2s', fontSize: '0.95rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            title="Descargar tabla de insumos del presupuesto en Excel"
          >
            📋 Insumos
          </button>

          <button
            onClick={() => window.location.href = '/api/exportar-compras'}
            style={{
              background: '#f59e0b', color: 'white', border: 'none', padding: '0.6rem 1.2rem',
              borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.3), 0 2px 4px -1px rgba(245, 158, 11, 0.2)',
              transition: 'all 0.2s', fontSize: '0.95rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            title="Descargar tabla de compras en Excel"
          >
            📦 Compras
          </button>

          <button
            onClick={() => window.location.href = '/api/exportar-vinculos'}
            style={{
              background: '#10b981', color: 'white', border: 'none', padding: '0.6rem 1.2rem',
              borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3), 0 2px 4px -1px rgba(16, 185, 129, 0.2)',
              transition: 'all 0.2s', fontSize: '0.95rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            title="Descargar vinculaciones en CSV"
          >
            🔗 Vinculaciones
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1rem', flex: 1, minHeight: 0 }}>

        {/* ── PANEL IZQUIERDO: Insumos ── */}
        <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'white' }}>
          <div style={{ background: '#1e293b', color: 'white', padding: '0.65rem 0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Insumos del Presupuesto</span>
            <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.18)', padding: '2px 8px', borderRadius: '10px' }}>
              {filteredInsumos.length} / {insumos.length}
            </span>
          </div>

          <div style={{ padding: '0.55rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', flexShrink: 0 }}>
            <input
              value={searchInsumo}
              onChange={e => setSearchInsumo(e.target.value)}
              placeholder="Buscar insumo (ej: cemento sol)..."
              style={{ width: '100%', padding: '5px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.82rem', boxSizing: 'border-box', marginBottom: '0.35rem' }}
            />
            <div style={{ display: 'flex', gap: '3px' }}>
              {(['all', 'vinculado', 'sin_vincular'] as const).map(f => (
                <button key={f} onClick={() => setFilterStatus(f)}
                  style={{ flex: 1, padding: '3px 0', fontSize: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: filterStatus === f ? 700 : 400, background: filterStatus === f ? '#1e293b' : '#fff', color: filterStatus === f ? 'white' : '#64748b' }}>
                  {f === 'all' ? 'Todos' : f === 'vinculado' ? '🟢 Vinculados' : '🔴 Sin vincular'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loadingInsumos ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>Cargando...</div>
            ) : filteredInsumos.map((ins, index) => {
              const isSelected = selectedInsumoCodigo === ins.codigo;
              const isLinked = Number(ins.linked_count) > 0;
              return (
                <div key={`${ins.codigo}-${index}`} onClick={() => handleSelectInsumo(ins.codigo, ins.nombre)}
                  style={{ padding: '0.55rem 0.85rem', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', background: isSelected ? '#dbeafe' : isLinked ? '#f0fdf4' : '#fff7ed', borderLeft: `3px solid ${isSelected ? '#2563eb' : isLinked ? '#16a34a' : '#f97316'}`, transition: 'background 0.1s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: isSelected ? 600 : 400, color: '#1e293b', lineHeight: 1.3, flex: 1 }}>
                      {ins.nombre}
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
                      <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '10px', whiteSpace: 'nowrap', background: isLinked ? '#dcfce7' : '#fee2e2', color: isLinked ? '#166534' : '#dc2626', fontWeight: 600 }}>
                        {isLinked ? `🔗 ${ins.linked_count}` : '⬜ 0'}
                      </span>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', textAlign: 'right' }}>
                        Precio:<br/>
                        <span style={{fontWeight: 600}}>S/ {Number(ins.precio || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                    Código: {ins.codigo} | Meta: {Number(ins.meta_cantidad).toFixed(2)} {ins.unidad}
                    {isLinked && <span style={{ color: '#16a34a', marginLeft: '6px' }}>• Adq: {Number(ins.adquirido).toFixed(2)}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── PANEL DERECHO: Compras ── */}
        <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'white' }}>
          {!selectedInsumoCodigo ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.5rem', color: '#94a3b8' }}>
              <span style={{ fontSize: '2.5rem' }}>👈</span>
              <span>Selecciona un insumo para ver y gestionar sus vínculos</span>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ background: '#1d4ed8', color: 'white', padding: '0.65rem 1rem', flexShrink: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{selectedInsumoNombre}</span>
                  <div style={{ display: 'flex', gap: '0.4rem', fontSize: '0.72rem' }}>
                    <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>✅ {vinculadoCount}</span>
                    <span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '10px' }}>⬜ {disponibleCount}</span>
                    <span style={{ background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '10px' }}>🔒 {bloqueadoCount}</span>
                  </div>
                </div>
                {!loadingCompras && (
                  <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.4rem', fontSize: '0.78rem', flexWrap: 'wrap' }}>
                    <span>📋 Meta: <b>{meta.toFixed(2)} {comprasData?.unidad}</b></span>
                    <span>📦 Adquirido: <b style={{ color: '#bfdbfe' }}>{adquirido.toFixed(2)}</b></span>
                    <span style={{ color: resta >= 0 ? '#bbf7d0' : '#fca5a5' }}>
                      {resta >= 0 ? '↓ Resta' : '⚠️ Exceso'}: <b>{Math.abs(resta).toFixed(2)}</b>
                    </span>
                  </div>
                )}
              </div>

              {/* Toolbar */}
              <div style={{ padding: '0.55rem 0.75rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
                <input value={searchCompra} onChange={e => setSearchCompra(e.target.value)}
                  placeholder="Buscar en compras (ej: factura cemento)..."
                  style={{ flex: '1 1 180px', padding: '5px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.82rem' }} />
                <div style={{ display: 'flex', gap: '3px' }}>
                  {(['all', 'vinculado', 'disponible', 'bloqueado'] as const).map(f => (
                    <button key={f} onClick={() => setFilterCompra(f)}
                      style={{ padding: '4px 9px', fontSize: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: filterCompra === f ? 700 : 400, background: filterCompra === f ? '#1d4ed8' : '#fff', color: filterCompra === f ? 'white' : '#64748b', whiteSpace: 'nowrap' }}>
                      {f === 'all' ? 'Todos' : f === 'vinculado' ? '✅ Vinc.' : f === 'disponible' ? '⬜ Disp.' : '🔒 Bloq.'}
                    </button>
                  ))}
                </div>
                {selected.size > 0 && (
                  <button onClick={handleVincular} disabled={saving}
                    style={{ padding: '5px 14px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                    {saving ? '...' : `🔗 Vincular (${selected.size})`}
                  </button>
                )}
              </div>

              {/* Tabla */}
              {loadingCompras ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Cargando compras...</div>
              ) : (
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                      <tr style={{ background: '#e2e8f0' }}>
                        <th style={{ padding: '6px 8px', width: '28px' }}></th>
                        <th style={{ padding: '6px 8px', textAlign: 'left' }}>Estado</th>
                        <th style={{ padding: '6px 8px', textAlign: 'left' }}>Orden / Tipo</th>
                        <th style={{ padding: '6px 8px', textAlign: 'left' }}>Detalle de compra</th>
                        <th style={{ padding: '6px 8px', textAlign: 'center' }}>Und</th>
                        <th style={{ padding: '6px 8px', textAlign: 'right' }}>Cantidad</th>
                        <th style={{ padding: '6px 8px', textAlign: 'right' }}>P.U.</th>
                        <th style={{ padding: '6px 8px', textAlign: 'right' }}>Total</th>
                        <th style={{ padding: '6px 8px', textAlign: 'center' }}>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCompras.length === 0 && (
                        <tr><td colSpan={9} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Sin resultados</td></tr>
                      )}
                      {filteredCompras.slice(0, 150).map((c, index) => {
                        const isSel = selected.has(c.id);
                        return (
                          <tr key={`${c.id}-${index}`}
                            style={{ background: isSel ? '#dbeafe' : STATUS_BG[c.estado], borderBottom: '1px solid #f1f5f9', cursor: c.estado === 'disponible' ? 'pointer' : 'default' }}
                            onClick={() => toggleSelect(c.id, c.estado)}>
                            <td style={{ padding: '5px 8px', textAlign: 'center' }}>
                              {c.estado === 'disponible' && (
                                <input type="checkbox" checked={isSel} onChange={() => toggleSelect(c.id, c.estado)} onClick={e => e.stopPropagation()} />
                              )}
                            </td>
                            <td style={{ padding: '5px 8px', whiteSpace: 'nowrap' }}>
                              <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '10px', fontWeight: 600, background: c.estado === 'vinculado' ? '#dcfce7' : c.estado === 'bloqueado' ? '#fee2e2' : '#f1f5f9', color: c.estado === 'vinculado' ? '#166534' : c.estado === 'bloqueado' ? '#991b1b' : '#475569' }}>
                                {c.estado === 'vinculado' ? '✅ Vinculado' : c.estado === 'bloqueado' ? '🔒 Bloqueado' : '⬜ Disponible'}
                              </span>
                              {c.estado === 'bloqueado' && c.vinculado_a && (
                                <div style={{ fontSize: '0.65rem', color: '#9ca3af', marginTop: '2px', maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.vinculado_a}>
                                  → {c.vinculado_a}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '5px 8px', whiteSpace: 'nowrap' }}>
                              <div style={{ fontWeight: 600, color: '#334155' }}>{c.orden_doc || '—'}</div>
                              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{c.tipo_c} {c.anio_c}</div>
                            </td>
                            <td style={{ padding: '5px 8px', maxWidth: '280px' }}>
                              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }} title={c.insumo_descripcion}>doc: {c.insumo_descripcion}</div>
                              {selectedInsumoNombre && (
                                <div style={{ fontSize: '0.65rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={selectedInsumoNombre}>{selectedInsumoNombre}</div>
                              )}
                            </td>
                            <td style={{ padding: '5px 8px', textAlign: 'center', color: '#475569' }}>{c.unidad}</td>
                            <td style={{ padding: '5px 8px', textAlign: 'right', fontWeight: c.estado === 'vinculado' ? 600 : 400, color: c.estado === 'vinculado' ? '#166534' : 'inherit' }}>
                              {Number(c.cantidad).toFixed(3)}
                            </td>
                            <td style={{ padding: '5px 8px', textAlign: 'right', color: '#475569' }}>{Number(c.precio).toFixed(2)}</td>
                            <td style={{ padding: '5px 8px', textAlign: 'right', fontWeight: 600 }}>{Number(c.total).toFixed(2)}</td>
                            <td style={{ padding: '5px 8px', textAlign: 'center' }}>
                              {c.estado === 'vinculado' && (
                                confirmUnlink === c.id ? (
                                  <div style={{ display: 'flex', gap: '3px', justifyContent: 'center' }}>
                                    <button onClick={e => { e.stopPropagation(); handleDesvincular(c.id); }}
                                      style={{ padding: '2px 7px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700 }}>Sí</button>
                                    <button onClick={e => { e.stopPropagation(); setConfirmUnlink(null); }}
                                      style={{ padding: '2px 7px', background: '#e2e8f0', border: '1px solid #cbd5e1', borderRadius: '3px', cursor: 'pointer', fontSize: '0.7rem' }}>No</button>
                                  </div>
                                ) : (
                                  <button onClick={e => { e.stopPropagation(); setConfirmUnlink(c.id); }}
                                    title="Desvincular"
                                    style={{ padding: '2px 9px', background: '#fee2e2', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: '3px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}>
                                    🔓
                                  </button>
                                )
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {filteredCompras.length > 150 && (
                        <tr>
                          <td colSpan={9} style={{ padding: '1rem', textAlign: 'center', background: '#f8fafc', color: '#64748b', fontSize: '0.8rem', borderTop: '1px dashed #cbd5e1' }}>
                            Mostrando los primeros 150 resultados de {filteredCompras.length}. Usa el buscador para encontrar más compras.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
