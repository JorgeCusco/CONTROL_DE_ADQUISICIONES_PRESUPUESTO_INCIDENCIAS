-- ============================================================
-- EJECUTAR EN pgAdmin sobre la base: 7_insumos_rado
-- Agrega: tabla de auditoría + columna precio_unit en compras
-- ============================================================

-- 1. Tabla historial_cambios (auditoría completa de ediciones)
CREATE TABLE IF NOT EXISTS historial_cambios (
    id              SERIAL PRIMARY KEY,
    tabla           VARCHAR(50)  NOT NULL,
    registro_id     INTEGER,
    registro_desc   TEXT,
    campo           VARCHAR(100) NOT NULL,
    valor_anterior  TEXT,
    valor_nuevo     TEXT,
    usuario         VARCHAR(100) NOT NULL DEFAULT 'desconocido',
    fecha           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address      VARCHAR(50),
    modulo          VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS idx_historial_fecha    ON historial_cambios(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_historial_tabla    ON historial_cambios(tabla);
CREATE INDEX IF NOT EXISTS idx_historial_usuario  ON historial_cambios(usuario);

-- 2. Columna precio_und en compras para el precio normalizado
--    (pu_c se mantiene como precio original; precio_und es el ajustado)
ALTER TABLE compras
    ADD COLUMN IF NOT EXISTS precio_und NUMERIC(15, 4);

-- Inicializar precio_und con pu_c donde esté vacío
UPDATE compras SET precio_und = pu_c WHERE precio_und IS NULL;

-- Verificación
SELECT 'historial_cambios creada: ' || COUNT(*) FROM historial_cambios;
SELECT 'compras.precio_und disponible' FROM information_schema.columns
    WHERE table_name = 'compras' AND column_name = 'precio_und';
