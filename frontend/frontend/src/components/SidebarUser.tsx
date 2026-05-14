'use client';
import { useState, useEffect } from 'react';

export default function SidebarUser() {
  const [usuario, setUsuario] = useState('');
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('usuario_rado') || '';
    setUsuario(saved);
    if (!saved) setEditing(true);
  }, []);

  const guardar = () => {
    const nombre = input.trim();
    if (!nombre) return;
    localStorage.setItem('usuario_rado', nombre);
    setUsuario(nombre);
    setEditing(false);
    window.dispatchEvent(new Event('usuario-changed'));
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.4rem 0.6rem', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.35)',
    borderRadius: '4px', color: 'white', fontSize: '0.9rem', outline: 'none',
  };

  if (editing) {
    return (
      <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.25)' }}>
        <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)', marginBottom: '0.4rem' }}>
          Ingresa tu nombre:
        </div>
        <input
          type="text"
          placeholder="Ej: Jorge, Ana..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && guardar()}
          style={inputStyle}
          autoFocus
        />
        <button
          onClick={guardar}
          style={{
            marginTop: '0.5rem', width: '100%', padding: '0.4rem',
            background: '#28a745', border: 'none', borderRadius: '4px',
            color: 'white', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
          }}
        >
          Confirmar
        </button>
      </div>
    );
  }

  return (
    <div style={{
      padding: '0.9rem 1.2rem', background: 'rgba(0,0,0,0.22)',
      fontSize: '0.88rem', color: 'rgba(255,255,255,0.9)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <span>👤 <strong>{usuario}</strong></span>
      <button
        onClick={() => { setInput(usuario); setEditing(true); }}
        title="Cambiar nombre"
        style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)',
          cursor: 'pointer', fontSize: '0.8rem', padding: '2px 4px',
        }}
      >
        ✏️
      </button>
    </div>
  );
}
