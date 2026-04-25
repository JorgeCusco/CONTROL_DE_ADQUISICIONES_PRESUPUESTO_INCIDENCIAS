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
- `item_1` (VARCHAR): Identificador de ítem.
- `codigo_insumo` (VARCHAR): Código específico del insumo.
- `descripcion` (TEXT): Nombre o descripción del insumo.
- `unidad` (VARCHAR): Unidad de medida.
- `incidencia_original` (NUMERIC): Incidencia base del Expediente.
- `parcial_original` (NUMERIC): Costo parcial original.
- `incidencia` (NUMERIC): Incidencia ajustada.
- `cantidad_modificada` (NUMERIC): Cantidad calculada por el motor matemático.
- `cantidad_adquirida` (NUMERIC): Valor objetivo a cuadrar.

#### 3. `compras`
Registro detallado de adquisiciones realizadas.
- `id` (SERIAL, PK): Identificador único.
- `insumo_descripcion` (TEXT): Descripción del insumo comprado.
- `item_c`, `anio_c`, `tipo_c` (VARCHAR): Datos de clasificación de la compra.
- `orden_doc` (VARCHAR): Documento u orden de compra.
- `detalle_compra` (TEXT): Detalles adicionales.
- `unidad_c` (VARCHAR): Unidad de medida en compra.
- `cant_c` (NUMERIC): Cantidad comprada.
- `pu_c` (NUMERIC): Precio unitario.
- `total_c` (NUMERIC): Total de la compra.
- `exp_c` (VARCHAR): Expediente relacionado.
- `opinion_comentario`, `observacion` (TEXT): Notas y revisiones.
- `especialidad` (VARCHAR): Especialidad del insumo.

#### 4. `apus_detallado`
Registro extraído y aplanado de los Análisis de Precios Unitarios (APUs).
- `Partida_Codigo` (TEXT): Código de la partida.
- `Partida_Descripcion` (TEXT): Nombre de la partida.
- `Partida_Rendimiento` (TEXT): Rendimiento diario.
- `Partida_Unidad` (TEXT): Unidad de medida.
- `Partida_Costo_Unitario` (NUMERIC): Costo presupuestado.
- `Tipo_Insumo` (TEXT): MANO DE OBRA, MATERIALES, EQUIPO.
- `Insumo_Codigo` (TEXT): Código del insumo.
- `Insumo_Descripcion` (TEXT): Nombre del insumo dentro del APU.
- `Insumo_Unidad` (TEXT): Unidad del insumo.
- `Insumo_Recursos` (TEXT): Recursos asignados.
- `Insumo_Cantidad` (NUMERIC): Cantidad base (incidencia) en el APU.
- `Insumo_Precio` (NUMERIC): Precio del insumo.
- `Insumo_Parcial` (NUMERIC): Costo parcial en el APU.
- `id` (SERIAL, PK): Agregado automáticamente.

## 3. Registro de Cambios

| Fecha | Cambio | Autor |
| :--- | :--- | :--- |
| 2026-04-21 | Inicialización del documento. Base de datos vacía. | N/A |
| 2026-04-21 | Creación de base de datos y esquema inicial. Ingesta de datos desde Excel completada. | Jorge Cusco |
| 2026-04-24 | Sincronización de arquitectura con base de datos real (Tablas: partidas, insumos, compras). | Antigravity AI |
| 2026-04-24 | Creación de la tabla `apus_detallado` con los datos aplanados del Excel APUS.xlsx. | Antigravity AI |

