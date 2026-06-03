const fs = require('fs');
const { parse: csvParse } = require('csv-parse/sync');

console.log('🔄 GENERANDO INSERT_AA.apus_detallado.sql\n');
console.log('═'.repeat(150));

try {
  // Leer CSV
  const csvContent = fs.readFileSync('DATA_LAST/AA.apus_detallado.csv', 'utf-8');
  const records = csvParse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    bom: true
  });

  console.log(`\n✓ ${records.length} registros leídos de AA.apus_detallado.csv\n`);

  // Generar SQL
  let sql = `-- INSERT APUS_DETALLADO
-- Tabla: apus_detallado
-- Registros: ${records.length}
-- Generado automáticamente
-- Ejecutar en Supabase después de: partidas

BEGIN TRANSACTION;

`;

  records.forEach((row, idx) => {
    const partidaCodigo = String(row.partida_codigo || '').trim().replace(/'/g, "''");
    const partidaDescripcion = String(row.partida_descripcion || '').trim().replace(/'/g, "''");
    const partidaRendimiento = parseFloat(row.partida_rendimiento || 0) || 0;
    const partidaUnidad = String(row.partida_unidad || '').trim().replace(/'/g, "''");
    const partidaCostoUnitario = parseFloat(row.partida_costo_unitario || 0) || 0;
    const tipoInsumo = String(row.tipo_insumo || '').trim().replace(/'/g, "''");
    const insumoCodigo = String(row.insumo_codigo || '').trim().replace(/'/g, "''");
    const insumoDescripcion = String(row.insumo_descripcion || '').trim().replace(/'/g, "''");
    const insumoUnidad = String(row.insumo_unidad || '').trim().replace(/'/g, "''");
    const insumoRecursos = String(row.insumo_recursos || '').trim().replace(/'/g, "''");
    const insumoCantidad = parseFloat(row.insumo_cantidad || 0) || 0;
    const insumoPrecio = parseFloat(row.insumo_precio || 0) || 0;
    const insumoParcial = parseFloat(row.insumo_parcial || 0) || 0;

    sql += `INSERT INTO apus_detallado (
  partida_codigo,
  partida_descripcion,
  partida_rendimiento,
  partida_unidad,
  partida_costo_unitario,
  tipo_insumo,
  insumo_codigo,
  insumo_descripcion,
  insumo_unidad,
  insumo_recursos,
  insumo_cantidad,
  insumo_precio,
  insumo_parcial
) VALUES (
  '${partidaCodigo}',
  '${partidaDescripcion}',
  ${partidaRendimiento},
  '${partidaUnidad}',
  ${partidaCostoUnitario},
  '${tipoInsumo}',
  '${insumoCodigo}',
  '${insumoDescripcion}',
  '${insumoUnidad}',
  '${insumoRecursos}',
  ${insumoCantidad},
  ${insumoPrecio},
  ${insumoParcial}
);\n`;
  });

  sql += `\nCOMMIT TRANSACTION;\n`;

  fs.writeFileSync('DATA_LAST/INSERT_AA.apus_detallado.sql', sql);

  console.log(`✅ SQL generado: DATA_LAST/INSERT_AA.apus_detallado.sql`);
  console.log(`📊 ${records.length} INSERT statements`);
  console.log(`📁 Tamaño: ${(sql.length / 1024).toFixed(2)} KB\n`);

} catch (err) {
  console.error('❌ Error:', err.message);
}
