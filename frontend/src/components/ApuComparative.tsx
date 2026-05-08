import { useEffect, useState } from 'react';

type InsumoAPU = {
  id: number;
  descripcion: string;
  unidad: string;
  incidencia_original: number;
  parcial_original: number;
  cantidad_2: number;
};

export default function ApuComparative({
  codigoPartida,
  selectedInsumoName,
  modifiedIncidencia,
  ppp,
  onIncidenciaChange,
  onIncidenciaBlur
}: {
  codigoPartida: string;
  selectedInsumoName: string;
  modifiedIncidencia: number;
  ppp: number;
  onIncidenciaChange: (val: number) => void;
  onIncidenciaBlur?: () => void;
}) {
  const [insumos, setInsumos] = useState<InsumoAPU[]>([]);
  const [rendimientoOriginal, setRendimientoOriginal] = useState<string>('');
  const [metradoFijo, setMetradoFijo] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/apu-full?partida=${encodeURIComponent(codigoPartida)}`)
      .then(res => res.json())
      .then(data => {
        if (data.insumos) {
          setInsumos(data.insumos);
          setRendimientoOriginal(data.rendimiento);
          setMetradoFijo(data.metrado_fijo || 0);
        } else {
          setInsumos(Array.isArray(data) ? data : []);
        }
        setLoading(false);
      });
  }, [codigoPartida]);

  if (loading) return <div style={{padding: '1rem', textAlign: 'center'}}>Cargando APU...</div>;

  let totalAntiguo = 0;
  let totalNuevo = 0;

  return (
    <div style={{display: 'flex', gap: '2rem', padding: '1rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', margin: '1rem 0'}}>
      
      {/* LEFT SIDE: APU ANTIGUO */}
      <div style={{flex: 1}}>
        <h4 style={{color: '#475569', marginBottom: '0.5rem', borderBottom: '2px solid #94a3b8', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <span>📜 APU Antiguo (Original)</span>
          <div style={{display: 'flex', gap: '0.5rem'}}>
            <span style={{fontSize: '0.75rem', background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '4px', color: '#475569', fontWeight: 'bold'}}>
              Metrado Fijo: {Number(metradoFijo).toFixed(4)}
            </span>
            <span style={{fontSize: '0.75rem', background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px', color: '#475569', fontWeight: 'bold'}}>
              Rend: {rendimientoOriginal}
            </span>
          </div>
        </h4>
        <table style={{width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse'}}>
          <thead>
            <tr style={{background: '#e2e8f0'}}>
              <th style={{textAlign: 'left', padding: '4px'}}>Insumo</th>
              <th style={{padding: '4px'}}>Unid</th>
              <th style={{textAlign: 'right', padding: '4px'}}>Cant</th>
              <th style={{textAlign: 'right', padding: '4px'}}>Inci X M</th>
              <th style={{textAlign: 'right', padding: '4px'}}>P.U.</th>
              <th style={{textAlign: 'right', padding: '4px'}}>Parcial</th>
            </tr>
          </thead>
          <tbody>
            {insumos.map((ins, index) => {
              const cant = Number(ins.incidencia_original) || 0;
              const inci_x_m = cant * metradoFijo;
              const parcial = Number(ins.parcial_original) || 0;
              const precio = cant > 0 ? (parcial / cant) : 0;
              totalAntiguo += parcial;

              const isSelected = ins.descripcion === selectedInsumoName;
              return (
                <tr key={`${ins.id}-${index}`} style={{background: isSelected ? '#fef08a' : 'transparent', borderBottom: '1px solid #e2e8f0'}}>
                  <td style={{padding: '4px', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}} title={ins.descripcion}>
                    {ins.descripcion}
                  </td>
                  <td style={{padding: '4px', textAlign: 'center'}}>{ins.unidad}</td>
                  <td style={{
                    padding: '4px', 
                    textAlign: 'right', 
                    background: '#fef08a', 
                    fontWeight: isSelected ? 'bold' : 'normal'
                  }}>
                    {cant.toFixed(4)}
                  </td>
                  <td style={{
                    padding: '4px', 
                    textAlign: 'right', 
                    background: '#fef08a', 
                    fontWeight: isSelected ? 'bold' : 'normal'
                  }}>
                    {inci_x_m.toFixed(4)}
                  </td>
                  <td style={{padding: '4px', textAlign: 'right'}}>{precio.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 4})}</td>
                  <td style={{padding: '4px', textAlign: 'right', fontWeight: isSelected ? 'bold' : 'normal'}}>{parcial.toFixed(4)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={5} style={{textAlign: 'right', fontWeight: 'bold', padding: '8px'}}>TOTAL:</td>
              <td style={{textAlign: 'right', fontWeight: 'bold', padding: '8px'}}>{totalAntiguo.toFixed(4)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div style={{width: '2px', background: '#cbd5e1'}}></div>

      {/* RIGHT SIDE: APU MODIFICADO */}
      <div style={{flex: 1}}>
        <h4 style={{color: '#1d4ed8', marginBottom: '0.5rem', borderBottom: '2px solid #93c5fd', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <span>✨ APU Nuevo (Modificado)</span>
          <div style={{display: 'flex', gap: '0.5rem'}}>
            <span style={{fontSize: '0.75rem', background: '#eff6ff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #bfdbfe', color: '#1d4ed8', fontWeight: 'bold'}}>
              Metrado Fijo: {Number(metradoFijo).toFixed(4)}
            </span>
            <span style={{fontSize: '0.75rem', background: '#dbeafe', padding: '2px 8px', borderRadius: '4px', border: '1px solid #93c5fd', color: '#1d4ed8', fontWeight: 'bold'}}>
              Rend: {rendimientoOriginal}
            </span>
          </div>
        </h4>
        <table style={{width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse'}}>
          <thead>
            <tr style={{background: '#dbeafe'}}>
              <th style={{textAlign: 'left', padding: '4px'}}>Insumo</th>
              <th style={{padding: '4px'}}>Unid</th>
              <th style={{textAlign: 'right', padding: '4px'}}>Cant (N)</th>
              <th style={{textAlign: 'right', padding: '4px'}}>Inci X M</th>
              <th style={{textAlign: 'right', padding: '4px'}}>P.U. (N)</th>
              <th style={{textAlign: 'right', padding: '4px'}}>Parcial (N)</th>
            </tr>
          </thead>
          <tbody>
            {insumos.map((ins, index) => {
              const cantOrig = Number(ins.incidencia_original) || 0;
              const parcialOrig = Number(ins.parcial_original) || 0;
              const precioOrig = cantOrig > 0 ? (parcialOrig / cantOrig) : 0;

              const isSelected = ins.descripcion === selectedInsumoName;

              const cantNueva = isSelected ? modifiedIncidencia : cantOrig;
              const inci_x_m = cantNueva * metradoFijo;
              const precioNuevo = isSelected ? ppp : precioOrig;
              const parcialNuevo = cantNueva * precioNuevo;

              totalNuevo += parcialNuevo;

              return (
                <tr key={`${ins.id}-${index}`} style={{background: isSelected ? '#bfdbfe' : 'transparent', borderBottom: '1px solid #e2e8f0'}}>
                  <td style={{padding: '4px', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}} title={ins.descripcion}>
                    {ins.descripcion}
                  </td>
                  <td style={{padding: '4px', textAlign: 'center'}}>{ins.unidad}</td>

                  {/* EDITABLE CANTIDAD FOR SELECTED INSUMO */}
                  <td style={{
                    padding: '4px', 
                    textAlign: 'right', 
                    background: '#bfdbfe',
                    fontWeight: isSelected ? 'bold' : 'normal'
                  }}>
                    {isSelected ? (
                      <input
                        type="number"
                        step="0.000001"
                        value={modifiedIncidencia}
                        onChange={(e) => onIncidenciaChange(parseFloat(e.target.value) || 0)}
                        onBlur={onIncidenciaBlur}
                        style={{
                          width: '80px', 
                          textAlign: 'right', 
                          padding: '2px', 
                          border: '1px solid #2563eb', 
                          fontWeight: 'bold',
                          background: '#eff6ff'
                        }}
                      />
                    ) : (
                      cantNueva.toFixed(4)
                    )}
                  </td>

                  <td style={{
                    padding: '4px', 
                    textAlign: 'right', 
                    background: '#bfdbfe', 
                    fontWeight: isSelected ? 'bold' : 'normal', 
                    color: isSelected ? '#1e40af' : 'inherit'
                  }}>
                    {inci_x_m.toFixed(4)}
                  </td>

                  <td style={{padding: '4px', textAlign: 'right', fontWeight: isSelected ? 'bold' : 'normal', color: isSelected ? '#166534' : 'inherit'}}>
                    {precioNuevo.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 4})}
                  </td>

                  <td style={{padding: '4px', textAlign: 'right', fontWeight: isSelected ? 'bold' : 'normal', color: isSelected ? '#1d4ed8' : 'inherit'}}>
                    {parcialNuevo.toFixed(4)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={5} style={{textAlign: 'right', fontWeight: 'bold', padding: '8px', color: '#1d4ed8'}}>TOTAL NUEVO:</td>
              <td style={{textAlign: 'right', fontWeight: 'bold', padding: '8px', color: '#1d4ed8'}}>{totalNuevo.toFixed(4)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

    </div>
  );
}
