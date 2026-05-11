const fs = require('fs');

console.log('📋 GENERANDO SCHEMA NUEVO NORMALIZADO\n');
console.log('═'.repeat(200));

const outputDir = 'DATA_LAST/SQL';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const schema = `
-- ════════════════════════════════════════════════════════════════════════════════════
-- SCHEMA NUEVO NORMALIZADO PARA BELEMPAMPA
-- Fecha: ${new Date().toISOString()}
-- ════════════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════════
-- FASE: DROP EXISTENTES (orden inverso de dependencias)
-- ═══════════════════════════════════════════════════════════════════════════════════

DROP TABLE IF EXISTS historial_cambios CASCADE;
DROP TABLE IF EXISTS mapeo_vinculacion CASCADE;
DROP TABLE IF EXISTS apu CASCADE;
DROP TABLE IF EXISTS compras CASCADE;
DROP TABLE IF EXISTS recursos CASCADE;
DROP TABLE IF EXISTS partidas CASCADE;

-- ═══════════════════════════════════════════════════════════════════════════════════
-- TABLA 1: PARTIDAS — El alcance del proyecto
-- ═══════════════════════════════════════════════════════════════════════════════════

CREATE TABLE partidas (
  codigo              VARCHAR PRIMARY KEY COMMENT 'Código de partida (ej: OE.1.1.1.1)',
  descripcion         TEXT NOT NULL COMMENT 'Nombre/descripción de la partida',
  unidad              VARCHAR COMMENT 'Unidad de medida (m², m³, GLB, etc)',
  cantidad            NUMERIC COMMENT 'Metrado presupuestado (cantidad de obra)',
  precio_unitario     NUMERIC COMMENT 'Precio unitario presupuestado',
  total_presupuestado NUMERIC COMMENT 'Cantidad × Precio unitario',
  rendimiento         VARCHAR COMMENT 'Rendimiento (ej: 40 m²/día)',
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_partidas_codigo ON partidas(codigo);

-- ═══════════════════════════════════════════════════════════════════════════════════
-- TABLA 2: RECURSOS — Catálogo maestro (reemplaza apus_detallado + insumos.descripcion)
-- ═══════════════════════════════════════════════════════════════════════════════════

CREATE TABLE recursos (
  codigo      VARCHAR PRIMARY KEY COMMENT 'Código de recurso (ej: 470020001)',
  descripcion TEXT NOT NULL COMMENT 'Nombre del recurso (OPERARIO, CEMENT0, etc)',
  unidad      VARCHAR COMMENT 'Unidad (hh, kg, m³, etc)',
  precio_base NUMERIC COMMENT 'Precio de referencia del expediente técnico',
  tipo        VARCHAR COMMENT 'MANO DE OBRA / MATERIALES / EQUIPO / SUB-CONTRATOS',
  activo      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recursos_codigo ON recursos(codigo);
CREATE INDEX idx_recursos_descripcion ON recursos(descripcion);

-- ═══════════════════════════════════════════════════════════════════════════════════
-- TABLA 3: APU — Relaciones partida↔recurso (Análisis Precios Unitarios)
-- ═══════════════════════════════════════════════════════════════════════════════════

CREATE TABLE apu (
  id                SERIAL PRIMARY KEY,
  partida_codigo    VARCHAR NOT NULL REFERENCES partidas(codigo) ON DELETE CASCADE,
  recurso_codigo    VARCHAR NOT NULL REFERENCES recursos(codigo) ON DELETE CASCADE,
  tipo              VARCHAR COMMENT 'MANO DE OBRA / MATERIALES / EQUIPO / SUB-CONTRATOS',
  aporte_unitario   NUMERIC COMMENT 'Cantidad de recurso por unidad de partida (APU1)',
  cuadrilla         NUMERIC COMMENT 'Cantidad de cuadrilla',
  rendimiento       VARCHAR COMMENT 'Rendimiento de la partida',
  precio_original   NUMERIC COMMENT 'Precio del recurso en el APU original',
  parcial_original  NUMERIC COMMENT 'Aporte unitario × precio original (APU1)',
  aporte_ajustado   NUMERIC DEFAULT NULL COMMENT 'Aporte editado por usuario (APU2)',
  es_extra          BOOLEAN DEFAULT false COMMENT 'Recurso extra fuera del expediente',
  comentario        TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(partida_codigo, recurso_codigo)
);

CREATE INDEX idx_apu_partida ON apu(partida_codigo);
CREATE INDEX idx_apu_recurso ON apu(recurso_codigo);

-- ═══════════════════════════════════════════════════════════════════════════════════
-- TABLA 4: COMPRAS — Órdenes de compra reales
-- ═══════════════════════════════════════════════════════════════════════════════════

CREATE TABLE compras (
  id              SERIAL PRIMARY KEY,
  anio            INTEGER COMMENT 'Año de la compra',
  componente      VARCHAR(5) COMMENT 'C.D. (Costo Directo) / G.G. (Gastos Generales)',
  tipo_compra     VARCHAR COMMENT 'O/C, O/S, CJA.CHI, RGR-XXX (tipo documento)',
  num_compra      VARCHAR COMMENT 'Número de orden/documento',
  detalle         TEXT COMMENT 'Descripción del ítem comprado',
  unidad_orig     VARCHAR COMMENT 'Unidad original del documento',
  cantidad_orig   NUMERIC COMMENT 'Cantidad original del documento',
  precio_unit_orig NUMERIC COMMENT 'Precio unitario original',
  unidad_norm     VARCHAR COMMENT 'Unidad normalizada (editable)',
  cantidad_norm   NUMERIC COMMENT 'Cantidad normalizada (editable)',
  precio_unit_norm NUMERIC COMMENT 'Precio unitario normalizado (editable)',
  completo        BOOLEAN DEFAULT true COMMENT 'false = sin año/precio/negativo',
  observacion     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_compras_anio ON compras(anio);
CREATE INDEX idx_compras_tipo ON compras(tipo_compra);

-- ═══════════════════════════════════════════════════════════════════════════════════
-- TABLA 5: MAPEO_VINCULACION — Vínculo explícito recurso↔compra (FK real)
-- ═══════════════════════════════════════════════════════════════════════════════════

CREATE TABLE mapeo_vinculacion (
  id             SERIAL PRIMARY KEY,
  recurso_codigo VARCHAR NOT NULL REFERENCES recursos(codigo) ON DELETE CASCADE,
  compra_id      INTEGER NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
  usuario        VARCHAR(100) COMMENT 'Usuario que realizó la vinculación',
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(recurso_codigo, compra_id)
);

CREATE INDEX idx_mapeo_recurso ON mapeo_vinculacion(recurso_codigo);
CREATE INDEX idx_mapeo_compra ON mapeo_vinculacion(compra_id);

-- ═══════════════════════════════════════════════════════════════════════════════════
-- TABLA 6: HISTORIAL_CAMBIOS — Audit trail completo
-- ═══════════════════════════════════════════════════════════════════════════════════

CREATE TABLE historial_cambios (
  id             SERIAL PRIMARY KEY,
  tabla          TEXT COMMENT 'Tabla afectada',
  registro_id    TEXT COMMENT 'ID/clave del registro',
  registro_desc  TEXT COMMENT 'Descripción legible',
  campo          TEXT COMMENT 'Campo que cambió',
  valor_anterior TEXT COMMENT 'Valor antes del cambio',
  valor_nuevo    TEXT COMMENT 'Valor después del cambio',
  usuario        TEXT COMMENT 'Usuario que hizo el cambio',
  ip_address     TEXT COMMENT 'IP del cliente',
  modulo         TEXT COMMENT 'Módulo del sistema',
  fecha          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_historial_tabla ON historial_cambios(tabla);
CREATE INDEX idx_historial_fecha ON historial_cambios(fecha);

-- ═══════════════════════════════════════════════════════════════════════════════════

COMMENT ON TABLE partidas IS 'Partidas del presupuesto (alcance del proyecto)';
COMMENT ON TABLE recursos IS 'Catálogo maestro de recursos/insumos';
COMMENT ON TABLE apu IS 'Análisis de Precios Unitarios (relaciones partida-recurso)';
COMMENT ON TABLE compras IS 'Órdenes de compra reales';
COMMENT ON TABLE mapeo_vinculacion IS 'Vínculos entre recursos y compras';
COMMENT ON TABLE historial_cambios IS 'Registro de auditoría de cambios';

-- ═══════════════════════════════════════════════════════════════════════════════════
-- FIN SCHEMA NUEVO
-- ═══════════════════════════════════════════════════════════════════════════════════
`;

fs.writeFileSync(`${outputDir}/00_CREATE_SCHEMA.sql`, '﻿' + schema, 'utf8');

console.log('\n✅ SCHEMA GENERADO\n');
console.log('Archivo: DATA_LAST/SQL/00_CREATE_SCHEMA.sql');
console.log('Tablas: 6 (partidas, recursos, apu, compras, mapeo_vinculacion, historial_cambios)');
console.log('FKs: 6 (todas con ON DELETE CASCADE)');
console.log('\n═'.repeat(200));
console.log('\n✅ LISTO PARA EJECUTAR EN SUPABASE\n');
