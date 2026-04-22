# Guía Maestra de Arquitectura SQL - Proyecto 7_Insumos_rado

> **REGLA GLOBAL:** Este documento debe actualizarse **SIEMPRE** que se realice cualquier modificación estructural (DDL), creación de tablas, alteración de columnas, o cambios en la base de datos PostgreSQL.

## 1. Conexión a Base de Datos
- **Motor:** PostgreSQL
- **Host:** localhost
- **Puerto:** 5432
- **Protocolo de Agentes:** MCP (Model Context Protocol) configurado en `.agents/mcp_config.json`

## 2. Esquema Actual
*(Las tablas se documentarán aquí a medida que se vayan creando durante el desarrollo).*

### Tablas Creadas (Fase 1)

#### 1. `partidas`
Almacena la jerarquía y detalles principales del Expediente Técnico.
- `codigo` (VARCHAR 50, PK): Código de la partida.
- `descripcion` (TEXT): Descripción de la partida.
- `unidad` (VARCHAR 20): Unidad de medida.
- `metrado_fijo` (NUMERIC 15,4): Metrado inamovible (fijo) con 4 decimales.

#### 2. `insumos`
Almacena los insumos relacionados a cada partida para el control y cuadre.
- `id` (SERIAL, PK): Identificador único del registro.
- `codigo_partida` (VARCHAR 50, FK): Llave foránea hacia `partidas(codigo)`.
- `descripcion` (TEXT): Nombre o descripción del insumo.
- `unidad` (VARCHAR 20): Unidad de medida.
- `incidencia` (NUMERIC 15,4): Incidencia del insumo con 4 decimales.
- `cantidad_adquirida` (NUMERIC 15,4): Valor objetivo a cuadrar.
- `cantidad_modificada` (NUMERIC 15,4): Cantidad calculada por el motor matemático.
| 2026-04-21 | Inicialización del documento. Base de datos vacía. | N/A |
| 2026-04-21 | Creación de base de datos y esquema inicial. Ingesta de datos desde Excel completada. | Jorge Cusco |
