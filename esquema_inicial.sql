-- Esquema Inicial para el Proyecto 7_Insumos_rado
-- Ejecutar en la base de datos: 7_insumos_rado

-- 1. Tabla Partidas
CREATE TABLE IF NOT EXISTS partidas (
    codigo VARCHAR(50) PRIMARY KEY,
    descripcion TEXT NOT NULL,
    unidad VARCHAR(20) NOT NULL,
    metrado_fijo NUMERIC(15, 4) NOT NULL DEFAULT 0.0000
);

-- 2. Tabla Insumos
CREATE TABLE IF NOT EXISTS insumos (
    id SERIAL PRIMARY KEY,
    codigo_partida VARCHAR(50) NOT NULL,
    
    -- Datos de Identificación del Insumo
    item_1 VARCHAR(20),
    codigo_insumo VARCHAR(50),
    descripcion TEXT NOT NULL,
    unidad VARCHAR(20) NOT NULL,
    
    -- APU 1 (Original del Expediente)
    incidencia_original NUMERIC(15, 4) NOT NULL DEFAULT 0.0000,
    parcial_original NUMERIC(15, 4) NOT NULL DEFAULT 0.0000,
    
    -- APU 2 (Modificado / Cuadre Real)
    incidencia NUMERIC(15, 4) NOT NULL DEFAULT 0.0000,
    cantidad_modificada NUMERIC(15, 4) NOT NULL DEFAULT 0.0000,
    
    -- Control Logístico Global
    cantidad_adquirida NUMERIC(15, 4) NOT NULL DEFAULT 0.0000,
    
    CONSTRAINT fk_partida FOREIGN KEY (codigo_partida) REFERENCES partidas(codigo) ON DELETE CASCADE
);

-- Crear índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_insumos_codigo_partida ON insumos(codigo_partida);

-- 3. Tabla Compras (Logística)
CREATE TABLE IF NOT EXISTS compras (
    id SERIAL PRIMARY KEY,
    insumo_descripcion TEXT NOT NULL, -- Columna D: DESCRIPCION (P)
    item_c VARCHAR(50),
    anio_c VARCHAR(20),
    tipo_c VARCHAR(50),
    orden_doc VARCHAR(100),
    detalle_compra TEXT,
    unidad_c VARCHAR(20),
    cant_c NUMERIC(15, 4) NOT NULL DEFAULT 0.0000,
    pu_c NUMERIC(15, 4) NOT NULL DEFAULT 0.0000,
    total_c NUMERIC(15, 4) NOT NULL DEFAULT 0.0000,
    exp_c VARCHAR(100),
    opinion_comentario TEXT,
    observacion TEXT,
    especialidad VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS idx_compras_insumo_descripcion ON compras(insumo_descripcion);
