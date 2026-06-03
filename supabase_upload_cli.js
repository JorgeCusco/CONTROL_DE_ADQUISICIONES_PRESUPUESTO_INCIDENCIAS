require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function uploadViaCLI() {
  try {
    console.log('🚀 USANDO SUPABASE CLI PARA SUBIDA RÁPIDA\n');

    // Test CLI
    console.log('✓ Verificando Supabase CLI...');
    const { stdout: version } = await execPromise('supabase --version');
    console.log(`✓ CLI versión: ${version.trim()}\n`);

    // Generar SQL de inserción
    console.log('⚙️  Generando SQL...');
    const sql = generateSQL();
    const sqlFile = path.join(__dirname, 'temp_insert.sql');
    fs.writeFileSync(sqlFile, sql);
    console.log(`✓ SQL generado (${sql.length} bytes)\n`);

    // Ejecutar SQL en Supabase
    console.log('⏳ Ejecutando inserción en Supabase...');
    const connStr = process.env.DATABASE_URL || process.env.SUPABASE_CONNECTION_STRING;

    const cmd = `psql "${connStr}" -f "${sqlFile}"`;
    console.log(`Comando: ${cmd.substring(0, 80)}...\n`);

    const { stdout, stderr } = await execPromise(cmd, { maxBuffer: 10 * 1024 * 1024 });

    console.log('✅ INSERCIÓN COMPLETADA\n');
    console.log(stdout);

    if (stderr) console.log('Warnings:', stderr);

    // Cleanup
    fs.unlinkSync(sqlFile);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

function generateSQL() {
  const finalFinal = fs.readFileSync(
    path.join(__dirname, 'FINAL_FINAL.csv'),
    'utf-8'
  );

  const lines = finalFinal.split('\n').filter(l => l.trim()).slice(1);

  const inserts = lines
    .filter(line => {
      const cols = line.split(',');
      return cols[0] && cols[0].trim();
    })
    .map(line => {
      const cols = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
      const [codigo, desc, unit, incid, parc] = cols;
      return `('${codigo}', '${desc}', '${unit}', ${incid || 0}, ${parc || 0})`;
    })
    .join(',\n  ');

  return `
-- Insertar FINAL_FINAL.csv a Supabase insumos
INSERT INTO insumos (codigo_partida, item_1, codigo_insumo, descripcion, unidad, incidencia_original, parcial_original, incidencia, cantidad_modificada, cantidad_adquirida)
SELECT
  p.codigo,
  ROW_NUMBER() OVER (PARTITION BY p.codigo ORDER BY apus.Item_1) as item,
  f.codigo_insumo,
  f.descripcion,
  f.unidad,
  f.incidencia_original,
  f.parcial_original,
  f.incidencia_original,
  0,
  0
FROM (
  VALUES ${inserts}
) f(codigo_insumo, descripcion, unidad, incidencia_original, parcial_original)
CROSS JOIN partidas p
LEFT JOIN apus_detallado apus ON
  apus.Insumo_Codigo = f.codigo_insumo AND
  apus.Partida_Codigo = p.codigo
WHERE apus.Partida_Codigo IS NOT NULL
ON CONFLICT DO NOTHING;

-- Verificar
SELECT COUNT(*) as insumos_subidos FROM insumos;
  `;
}

uploadViaCLI();
