const fs = require('fs');
const path = require('path');

console.log('📋 SCRIPT DE BACKUP/RESTORE DE VÍNCULOS\n');
console.log('═'.repeat(200));

const backupDir = 'DATA_LAST/VINCULOS_BACKUP';

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// =====================================================
// DOCUMENTACIÓN: FLUJO DE MIGRACIÓN DE VÍNCULOS
// =====================================================

const documentacion = `
╔════════════════════════════════════════════════════════════════════════════════╗
║                    MIGRACIÓN DE VÍNCULOS (mapeo_vinculacion)                   ║
║                                                                                ║
║ PROBLEMA: Los vínculos actuales usan compra_id (FK a compras.id), pero        ║
║           cuando subimos la tabla compras con nuevos datos, los IDs cambian.   ║
║                                                                                ║
║ SOLUCIÓN: 3 pasos de backup → truncate → restore                              ║
╚════════════════════════════════════════════════════════════════════════════════╝

PASO 1️⃣: BACKUP VÍNCULOS ACTUALES (ANTES de cambiar compras)
────────────────────────────────────────────────────────────────────────────────

  Ejecutar en Supabase SQL Editor:

    -- Exportar todos los vínculos con datos de compra para re-mapeo
    SELECT
      mv.id,
      mv.recurso_codigo,
      c.id as compra_id_antiguo,
      c.anio,
      c.componente,
      c.tipo_compra,
      c.num_compra,
      c.detalle,
      c.unidad_orig,
      c.cantidad_orig,
      c.precio_unit_orig,
      mv.usuario,
      mv.created_at
    FROM mapeo_vinculacion mv
    JOIN compras c ON mv.compra_id = c.id
    ORDER BY mv.id;

  → Guardar resultado en archivo: DATA_LAST/VINCULOS_BACKUP/vinculos_backup_$(date).csv

PASO 2️⃣: LIMPIAR TABLA COMPRAS VIEJA + INSERTAR NUEVAS COMPRAS
──────────────────────────────────────────────────────────────────────────────

  Ejecutar en Supabase SQL Editor en orden:

    -- Vaciar vínculos (sin perder datos, los tenemos en backup)
    DELETE FROM mapeo_vinculacion;

    -- Vaciar compras viejas
    DELETE FROM compras;

    -- Insertar nuevas compras desde 04_INSERT_compras.sql
    [Ejecutar archivo 04_INSERT_compras.sql]

  RESULTADO: Tabla compras tiene 1,940 registros nuevos con IDs 1-1940

PASO 3️⃣: RE-CREAR VÍNCULOS CON NUEVOS IDs
──────────────────────────────────────────────────────────────────────────────

  El script restore_vinculos.js hace:

    a) Lee el backup CSV de vínculos antiguos
    b) Para cada vínculo, busca la compra NUEVA que coincida por:
       - anio (año exacto)
       - componente (C.D. o G.G.)
       - tipo_compra (O/C, O/S, CJA.CHI, etc.)
       - num_compra (número documento)
       - detalle (descripción, búsqueda substring/fuzzy)
    c) Si encuentra coincidencia → INSERT mapeo_vinculacion con nuevo compra_id
    d) Si NO encuentra → log de error para revisión manual

  Ejecutar:
    node restore_vinculos.js

PASO 4️⃣: VERIFICACIÓN
──────────────────────────────────────────────────────────────────────────────

  Ejecutar en Supabase SQL Editor:

    SELECT COUNT(*) FROM mapeo_vinculacion;
    -- Debería ser ≈ 1,177 (el número original)

    SELECT COUNT(*) FROM compras;
    -- Debería ser 1,940

═════════════════════════════════════════════════════════════════════════════════
ORDEN CORRECTO DE EJECUCIÓN EN SUPABASE:

  1. node generar_schema_v2.js       → 00_CREATE_SCHEMA.sql
  2. Ejecutar 00_CREATE_SCHEMA.sql   (crear tablas nuevas)
  3. Ejecutar 01_INSERT_partidas.sql (433 partidas)
  4. Ejecutar 02_INSERT_recursos.sql (701 recursos)
  5. Ejecutar 03_INSERT_apu.sql      (6,140 APU)
  6. [BACKUP] Exportar vínculos antiguos (SELECT...)
  7. DELETE FROM mapeo_vinculacion   (limpiar)
  8. DELETE FROM compras             (limpiar)
  9. Ejecutar 04_INSERT_compras.sql  (1,940 nuevas compras)
  10. node restore_vinculos.js       (re-crear vínculos con nuevos IDs)
  11. [VERIFICACIÓN] Contar registros en ambas tablas

═════════════════════════════════════════════════════════════════════════════════
`;

fs.writeFileSync(path.join(backupDir, 'FLUJO_MIGRACION.txt'), documentacion, 'utf8');
console.log('✅ Documentación creada: FLUJO_MIGRACION.txt\n');

// =====================================================
// TEMPLATE DE SQL PARA EXPORTAR VÍNCULOS ACTUALES
// =====================================================

const sqlExport = `-- PASO 1: BACKUP DE VÍNCULOS ACTUALES
-- Ejecutar ANTES de cambiar la tabla compras
-- Resultado: copiar/pegar en Excel o guardar como CSV para restore_vinculos.js

SELECT
  mv.id,
  mv.recurso_codigo,
  c.id as compra_id_antiguo,
  c.anio,
  c.componente,
  c.tipo_compra,
  c.num_compra,
  c.detalle,
  c.unidad_orig,
  c.cantidad_orig,
  c.precio_unit_orig,
  mv.usuario,
  mv.created_at
FROM mapeo_vinculacion mv
JOIN compras c ON mv.compra_id = c.id
ORDER BY mv.id;
`;

fs.writeFileSync(path.join(backupDir, '01_EXPORT_VINCULOS_ACTUALES.sql'), sqlExport, 'utf8');
console.log('✅ SQL template creado: 01_EXPORT_VINCULOS_ACTUALES.sql\n');

// =====================================================
// TEMPLATE DE SQL PARA LIMPIAR Y RE-INSERTAR
// =====================================================

const sqlClean = `-- PASOS 2A-2B: LIMPIAR VÍNCULOS Y COMPRAS VIEJOS

BEGIN;

-- Limpiar vínculos (sin borrar el registro de auditoría)
DELETE FROM mapeo_vinculacion;

-- Limpiar compras viejas (sin borrar el registro de auditoría)
DELETE FROM compras;

COMMIT;

-- Después de esto, ejecutar: 04_INSERT_compras.sql
`;

fs.writeFileSync(path.join(backupDir, '02_CLEAN_OLD_DATA.sql'), sqlClean, 'utf8');
console.log('✅ SQL template creado: 02_CLEAN_OLD_DATA.sql\n');

// =====================================================
// TEMPLATE DE SQL PARA VERIFICAR
// =====================================================

const sqlVerify = `-- PASO 4: VERIFICACIÓN POST-MIGRACIÓN

-- Contar vínculos re-creados
SELECT COUNT(*) as total_vinculos
FROM mapeo_vinculacion;
-- Debería ser ≈ 1,177

-- Contar nuevas compras
SELECT COUNT(*) as total_compras
FROM compras;
-- Debería ser 1,940

-- Verificar que NO hay orfandades (vínculos a compras que no existen)
SELECT COUNT(*) as vinculos_huerfanos
FROM mapeo_vinculacion mv
LEFT JOIN compras c ON mv.compra_id = c.id
WHERE c.id IS NULL;
-- Debería ser 0

-- Sample de vínculos migrados
SELECT
  mv.id,
  mv.recurso_codigo,
  c.anio,
  c.num_compra,
  c.detalle,
  mv.usuario,
  mv.created_at
FROM mapeo_vinculacion mv
JOIN compras c ON mv.compra_id = c.id
ORDER BY mv.id
LIMIT 10;
`;

fs.writeFileSync(path.join(backupDir, '04_VERIFY_POST_MIGRATION.sql'), sqlVerify, 'utf8');
console.log('✅ SQL template creado: 04_VERIFY_POST_MIGRATION.sql\n');

// =====================================================
// RESUMEN
// =====================================================

console.log('═'.repeat(200));
console.log('\n📊 ARCHIVOS DE BACKUP/RESTORE CREADOS\n');
console.log(`📁 Carpeta: ${backupDir}/\n`);
console.log(`  1. FLUJO_MIGRACION.txt               (documentación completa)`);
console.log(`  2. 01_EXPORT_VINCULOS_ACTUALES.sql  (backup vínculos)`);
console.log(`  3. 02_CLEAN_OLD_DATA.sql            (limpiar compras viejas)`);
console.log(`  4. 04_VERIFY_POST_MIGRATION.sql     (verificación)\n`);

console.log('═'.repeat(200));
console.log('\n⚠️ PRÓXIMOS PASOS:\n');
console.log(`  1. Leer: ${backupDir}/FLUJO_MIGRACION.txt`);
console.log(`  2. En Supabase SQL Editor: ejecutar 01_EXPORT_VINCULOS_ACTUALES.sql`);
console.log(`  3. Guardar resultado como: ${backupDir}/vinculos_backup.csv`);
console.log(`  4. En Supabase SQL Editor: ejecutar 02_CLEAN_OLD_DATA.sql`);
console.log(`  5. En Supabase SQL Editor: ejecutar 04_INSERT_compras.sql`);
console.log(`  6. En Node.js: node restore_vinculos.js`);
console.log(`  7. En Supabase SQL Editor: ejecutar 04_VERIFY_POST_MIGRATION.sql\n`);

console.log('═'.repeat(200));
console.log('\n✅ LISTO PARA MIGRACIÓN DE VÍNCULOS\n');
