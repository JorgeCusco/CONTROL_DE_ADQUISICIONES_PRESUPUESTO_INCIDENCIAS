const fs = require('fs');

console.log('🏗️ FASE 2: GENERAR CREATE_SCHEMA.sql\n');
console.log('═'.repeat(150));

const schema = `-- =====================================================
-- NUEVO SCHEMA BELEMPAMPA
-- Arquitectura normalizada: 3 tablas base + operativas
-- Generado: ${new Date().toLocaleString()}
-- =====================================================

-- =====================================================
-- 1. TABLAS BASE (Datos crudos, no calculados)
-- =====================================================

DROP TABLE IF EXISTS apu CASCADE;
DROP TABLE IF EXISTS insumos_catalogo CASCADE;
DROP TABLE IF EXISTS partidas CASCADE;

-- Tabla 1: PARTIDAS (El Alcance)
CREATE TABLE public.partidas (
  codigo      VARCHAR(50) PRIMARY KEY,
  descripcion TEXT,
  unidad      VARCHAR(10),
  metrado     NUMERIC(12, 4),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE partidas IS 'Presupuesto base: partidas del proyecto con cantidades (metrado)';
COMMENT ON COLUMN partidas.codigo IS 'Código de partida (ej: OE.1.1.1.1)';
COMMENT ON COLUMN partidas.metrado IS 'Cantidad de obra física';

-- Tabla 2: INSUMOS_CATALOGO (El Diccionario Financiero)
CREATE TABLE public.insumos_catalogo (
  codigo      VARCHAR(50) PRIMARY KEY,
  descripcion TEXT NOT NULL,
  unidad      VARCHAR(10),
  precio_base NUMERIC(12, 2) DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE insumos_catalogo IS 'Catálogo maestro de insumos: cada insumo UNA SOLA VEZ con su precio de mercado';
COMMENT ON COLUMN insumos_catalogo.codigo IS 'Código del insumo (ej: 470020001)';
COMMENT ON COLUMN insumos_catalogo.precio_base IS 'Precio estático para este proyecto';

-- Tabla 3: APU (El Motor de Relación)
CREATE TABLE public.apu (
  id                SERIAL PRIMARY KEY,
  partida_codigo    VARCHAR(50) NOT NULL REFERENCES partidas(codigo) ON DELETE CASCADE,
  insumo_codigo     VARCHAR(50) NOT NULL REFERENCES insumos_catalogo(codigo) ON DELETE CASCADE,
  tipo_insumo       VARCHAR(50),
  aporte_unitario   NUMERIC(10, 4),
  cuadrilla         NUMERIC(10, 2),
  rendimiento       NUMERIC(10, 4),
  aporte_ajustado   NUMERIC(10, 4),
  cantidad_adquirida NUMERIC(12, 4) DEFAULT 0,
  comentario        TEXT,
  es_extra          BOOLEAN DEFAULT false,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(partida_codigo, insumo_codigo)
);

COMMENT ON TABLE apu IS 'Relaciones partida↔insumo: la receta que conecta alcance con precios';
COMMENT ON COLUMN apu.aporte_unitario IS 'Cantidad de insumo por unidad de partida (inmutable)';
COMMENT ON COLUMN apu.aporte_ajustado IS 'Ajuste del usuario para cuadrar compras';
COMMENT ON COLUMN apu.tipo_insumo IS 'MANO DE OBRA, MATERIALES, EQUIPO, SUBCONTRATOS';

CREATE INDEX idx_apu_partida ON apu(partida_codigo);
CREATE INDEX idx_apu_insumo ON apu(insumo_codigo);
CREATE INDEX idx_apu_tipo ON apu(tipo_insumo);

-- =====================================================
-- 2. TABLAS OPERATIVAS (Workflow diario)
-- =====================================================

DROP TABLE IF EXISTS mapeo_vinculacion CASCADE;
DROP TABLE IF EXISTS compras CASCADE;
DROP TABLE IF EXISTS historial_cambios CASCADE;

-- Tabla: COMPRAS (Órdenes de compra)
CREATE TABLE public.compras (
  id                  SERIAL PRIMARY KEY,
  insumo_descripcion  TEXT,
  origen_compra       VARCHAR(100),
  numero_doc          VARCHAR(50),
  tipo_c              VARCHAR(50),
  anio_c              INTEGER,
  orden_doc           VARCHAR(50),
  detalle_compra      TEXT,
  unidad_c            VARCHAR(10),
  cant_c              NUMERIC(12, 4),
  pu_c                NUMERIC(12, 2),
  total_c             NUMERIC(12, 2),
  unidad_und          VARCHAR(10),
  cantidad_und        NUMERIC(12, 4),
  precio_und          NUMERIC(12, 2),
  unidad              VARCHAR(10),
  precio_unit         NUMERIC(12, 2),
  observacion         TEXT,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE compras IS 'Órdenes de compra: documentos de adquisición con datos originales y normalizados';
COMMENT ON COLUMN compras.unidad_und IS 'Unidad normalizada';
COMMENT ON COLUMN compras.cantidad_und IS 'Cantidad normalizada';
COMMENT ON COLUMN compras.precio_und IS 'Precio normalizado';

-- Tabla: MAPEO_VINCULACION (Vínculos insumo↔compra)
CREATE TABLE public.mapeo_vinculacion (
  id             SERIAL PRIMARY KEY,
  insumo_nombre  TEXT NOT NULL,
  compra_id      INTEGER NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
  usuario        VARCHAR(100),
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(insumo_nombre, compra_id)
);

COMMENT ON TABLE mapeo_vinculacion IS 'Vínculos explícitos entre insumos (por descripción) y compras (por id)';

CREATE INDEX idx_mapeo_insumo ON mapeo_vinculacion(insumo_nombre);
CREATE INDEX idx_mapeo_compra ON mapeo_vinculacion(compra_id);

-- Tabla: HISTORIAL_CAMBIOS (Audit trail)
CREATE TABLE public.historial_cambios (
  id              SERIAL PRIMARY KEY,
  tabla           VARCHAR(50),
  registro_id     VARCHAR(100),
  registro_desc   TEXT,
  campo           VARCHAR(100),
  valor_anterior  TEXT,
  valor_nuevo     TEXT,
  usuario         VARCHAR(100),
  ip_address      INET,
  modulo          VARCHAR(100),
  fecha           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE historial_cambios IS 'Registro de cambios: quién, qué, cuándo, por qué';

CREATE INDEX idx_historial_tabla ON historial_cambios(tabla);
CREATE INDEX idx_historial_registro ON historial_cambios(registro_id);
CREATE INDEX idx_historial_fecha ON historial_cambios(fecha);

-- =====================================================
-- 3. VISTAS ÚTILES (Cálculos sin redundancia)
-- =====================================================

-- Vista: APU con precios y cálculos
CREATE OR REPLACE VIEW v_apu_con_calculos AS
SELECT
  a.id,
  a.partida_codigo,
  p.descripcion AS partida_descripcion,
  p.metrado,
  p.unidad AS unidad_partida,
  a.insumo_codigo,
  ic.descripcion AS insumo_descripcion,
  ic.unidad AS unidad_insumo,
  ic.precio_base,
  a.tipo_insumo,
  a.aporte_unitario,
  a.aporte_ajustado,
  a.cuadrilla,
  a.rendimiento,
  -- Cálculos
  (a.aporte_unitario * ic.precio_base)::NUMERIC(12, 2) AS costo_unitario_orig,
  (a.aporte_ajustado * ic.precio_base)::NUMERIC(12, 2) AS costo_unitario_ajust,
  (a.aporte_unitario * ic.precio_base * p.metrado)::NUMERIC(12, 2) AS costo_total_orig,
  (a.aporte_ajustado * ic.precio_base * p.metrado)::NUMERIC(12, 2) AS costo_total_ajust,
  a.cantidad_adquirida,
  a.comentario,
  a.es_extra
FROM apu a
JOIN partidas p ON a.partida_codigo = p.codigo
JOIN insumos_catalogo ic ON a.insumo_codigo = ic.codigo;

COMMENT ON VIEW v_apu_con_calculos IS 'Vista completa con todos los cálculos de costos (sin almacenarlos)';

-- =====================================================
-- 4. GRANTS (Permisos Supabase)
-- =====================================================

GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- =====================================================
-- FIN DE SCRIPT
-- =====================================================
`;

const outputPath = 'DATA_LAST/NUEVA_BD/CREATE_SCHEMA.sql';
fs.writeFileSync(outputPath, schema);

console.log('\n✅ CREATE_SCHEMA.sql generado\n');
console.log(`📁 Archivo: ${outputPath}`);
console.log(`📊 Tamaño: ${(schema.length / 1024).toFixed(2)} KB\n`);

console.log('Contenido:\n');
console.log('✓ 3 TABLAS BASE:');
console.log('  - partidas (El Alcance)');
console.log('  - insumos_catalogo (El Diccionario Financiero)');
console.log('  - apu (El Motor de Relación)\n');

console.log('✓ 3 TABLAS OPERATIVAS:');
console.log('  - compras (Órdenes de compra)');
console.log('  - mapeo_vinculacion (Vínculos insumo↔compra)');
console.log('  - historial_cambios (Audit trail)\n');

console.log('✓ 1 VISTA:');
console.log('  - v_apu_con_calculos (APU con todos los cálculos en tiempo real)\n');

console.log('✓ Índices para optimizar queries');
console.log('✓ Comentarios en español para documentación\n');

console.log('═'.repeat(150));
console.log('\n✅ FASE 2 COMPLETADA\n');
console.log('Próximo paso: FASE 3 — Generar INSERT SQL\n');
