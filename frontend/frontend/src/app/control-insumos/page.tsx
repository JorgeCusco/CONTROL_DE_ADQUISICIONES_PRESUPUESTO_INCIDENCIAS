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
  const [filteredPartidas, setFilteredPartidas] = useState<Partida[]>([]);
  const [selectedPartida, setSelectedPartida] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState('');

  // Evaluador booleano
  const evaluateBooleanQuery = (text: string, query: string): boolean => {
    const normalizedText = text.toLowerCase();

    if (!query.trim()) return true;

    const tokens = query.toLowerCase().match(/(\(|\)|AND|OR|NOT|"[^"]*"|\S+)/g) || [];

    const evaluate = (tokenList: string[], index: number): [boolean, number] => {
      let result = true;
      let i = index;

      while (i < tokenList.length) {
        const token = tokenList[i];

        if (token === ')') {
          return [result, i];
        }

        if (token === 'NOT') {
          i++;
          const [subResult, nextIdx] = evaluateTerm(tokenList, i);
          result = result && !subResult;
          i = nextIdx;
        } else if (token === 'AND') {
          i++;
          const [subResult, nextIdx] = evaluateTerm(tokenList, i);
          result = result && subResult;
          i = nextIdx;
        } else if (token === 'OR') {
          i++;
          const [subResult, nextIdx] = evaluateTerm(tokenList, i);
          result = result || subResult;
          i = nextIdx;
        } else {
          return [result, i];
        }
      }

      return [result, i];
    };

    const evaluateTerm = (tokenList: string[], index: number): [boolean, number] => {
      if (index >= tokenList.length) return [true, index];

      const token = tokenList[index];

      if (token === '(') {
        const [result, nextIdx] = evaluate(tokenList, index + 1);
        return [result, nextIdx + 1];
      }

      if (token === 'NOT') {
        const [result, nextIdx] = evaluateTerm(tokenList, index + 1);
        return [!result, nextIdx];
      }

      const cleanToken = token.replace(/^"|"$/g, '');
      const matches = normalizedText.includes(cleanToken);
      return [matches, index + 1];
    };

    const [result] = evaluateTerm(tokens, 0);
    return result;
  };

  // 1. Fetch partidas
  useEffect(() => {
    fetch('/api/partidas')
      .then(res => res.json())
      .then(data => {
        setPartidas(data);
        setFilteredPartidas(data);
      });
  }, []);

  // 2. Filter partidas on search query change
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPartidas(partidas);
      return;
    }
    const filtered = partidas.filter(p =>
      evaluateBooleanQuery(`${p.codigo} ${p.descripcion}`, searchQuery)
    );
    setFilteredPartidas(filtered);
  }, [searchQuery, partidas]);

  // 3. Fetch insumos for partida
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
          <label htmlFor="partida-search"><strong>1. Selección de Partida</strong></label>

          <input
            id="partida-search"
            type="text"
            placeholder='Busca por código o descripción: ej: OE.1.1 | ESTRUCTURAL AND CONCRETO | NOT AYUDANTE'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '0.95rem',
              marginBottom: '0.75rem',
              boxSizing: 'border-box'
            }}
          />

          <div style={{fontSize: '0.85rem', color: '#666', marginBottom: '1rem', lineHeight: '1.5'}}>
            <strong>Operadores:</strong> <code style={{background: '#f3f4f6', padding: '2px 4px', borderRadius: '2px'}}>AND</code>
            {' '}<code style={{background: '#f3f4f6', padding: '2px 4px', borderRadius: '2px'}}>OR</code>
            {' '}<code style={{background: '#f3f4f6', padding: '2px 4px', borderRadius: '2px'}}>NOT</code>
          </div>

          <select
            id="partida-select"
            value={selectedPartida}
            onChange={e => setSelectedPartida(e.target.value)}
            size={Math.min(filteredPartidas.length + 1, 10)}
          >
            <option value="">-- Selecciona una partida --</option>
            {filteredPartidas.map(p => (
              <option key={p.codigo} value={`${p.codigo} - ${p.descripcion}`}>
                {p.codigo} - {p.descripcion}
              </option>
            ))}
          </select>

          {searchQuery && filteredPartidas.length > 0 && (
            <div style={{
              marginTop: '0.75rem',
              padding: '0.75rem',
              background: '#f0f9ff',
              border: '1px solid #bfdbfe',
              borderRadius: '4px',
              color: '#0369a1',
              fontSize: '0.9rem'
            }}>
              📊 Se encontraron <strong>{filteredPartidas.length}</strong> partidas
            </div>
          )}

          {searchQuery && filteredPartidas.length === 0 && (
            <div style={{
              marginTop: '0.75rem',
              padding: '0.75rem',
              background: '#fef3c7',
              border: '1px solid #fcd34d',
              borderRadius: '4px',
              color: '#92400e',
              fontSize: '0.9rem'
            }}>
              ⚠️ No se encontraron partidas con esos criterios
            </div>
          )}
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
