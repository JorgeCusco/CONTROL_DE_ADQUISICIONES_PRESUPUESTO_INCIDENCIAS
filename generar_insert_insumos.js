const fs = require('fs');
const { parse: csvParse } = require('csv-parse/sync');

console.log('🔄 GENERANDO INSERT_AA.insumos.sql\n');
console.log('═'.repeat(150));

try {
  // Leer CSV
  const csvContent = fs.readFileSync('DATA_LAST/AA.insumos.csv', 'utf-8');
  const records = csvParse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    bom: true
  });

  console.log(`\n✓ ${records.length} registros leídos de AA.insumos.csv\n`);

  // Generar SQL
  let sql = `-- INSERT INSUMOS
-- Tabla: insumos
-- Registros: ${records.length}
-- Generado automáticamente
-- Ejecutar en Supabase después de: partidas, apus_detallado

BEGIN TRANSACTION;

`;

  records.forEach((row, idx) => {
    const id = parseInt(row.id) || (idx + 1);
    const codigoPartida = String(row.codigo_partida || '').trim().replace(/'/g, "''");
    const codigoInsumo = String(row.codigo_insumo || '').trim().replace(/'/g, "''");
    const descripcion = String(row.descripcion || '').trim().replace(/'/g, "''");
    const unidad = String(row.unidad || '').trim().replace(/'/g, "''");
    const incidenciaOriginal = parseFloat(row.incidencia_original || 0) || 0;
    const parcialOriginal = parseFloat(row.parcial_original || 0) || 0;
    const incidencia = parseFloat(row.incidencia || 0) || 0;
    const cantidadModificada = parseFloat(row.cantidad_modificada || 0) || 0;
    const cantidadAdquirida = parseFloat(row.cantidad_adquirida || 0) || 0;
    const comentario = String(row.comentario || '').trim().replace(/'/g, "''");
    const esExtra = row.es_extra === 'true' || row.es_extra === '1' || row.es_extra === true;

    sql += `INSERT INTO insumos (
  id,
  codigo_partida,
  codigo_insumo,
  descripcion,
  unidad,
  incidencia_original,
  parcial_original,
  incidencia,
  cantidad_modificada,
  cantidad_adquirida,
  comentario,
  es_extra
) VALUES (
  ${id},
  '${codigoPartida}',
  '${codigoInsumo}',
  '${descripcion}',
  '${unidad}',
  ${incidenciaOriginal},
  ${parcialOriginal},
  ${incidencia},
  ${cantidadModificada},
  ${cantidadAdquirida},
  '${comentario}',
  ${esExtra ? 'true' : 'false'}
);\n`;
  });

  sql += `\nCOMMIT TRANSACTION;\n`;

  fs.writeFileSync('DATA_LAST/INSERT_AA.insumos.sql', sql);

  console.log(`✅ SQL generado: DATA_LAST/INSERT_AA.insumos.sql`);
  console.log(`📊 ${records.length} INSERT statements`);
  console.log(`📁 Tamaño: ${(sql.length / 1024).toFixed(2)} KB\n`);

} catch (err) {
  console.error('❌ Error:', err.message);
}
