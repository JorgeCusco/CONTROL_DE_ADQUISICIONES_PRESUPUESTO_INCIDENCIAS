# 📘 SQL Architecture Master Guide — Insumos Rado

Este documento actúa como la **fuente de verdad técnica** para la arquitectura de base de datos de **"Insumos Rado"** en PostgreSQL/Supabase, tras su migración al modelo normalizado basado en sufijos `_p` (Presupuestado/Inmutable) y `_c` (Compras/Editable), enfocado 100% en el control de **cantidades** (incidencias).

---

## 🏗️ Filosofía de Diseño: El Modelo `_p` vs `_c`

Para prevenir descuadres de importación y mantener la trazabilidad presupuestal histórica, la base de datos se divide en dos dominios semánticos:
1. **Dominio Inmutable (`_p`)**: Representa la información oficial del expediente técnico o "Delfín". Contiene el presupuesto original, los APUs oficiales, rendimientos e insumos inalterables.
2. **Dominio Transaccional (`_c`)**: Representa la ejecución real, compras e incidencias modificadas por los usuarios. Estos valores sí se pueden editar y cuadrar dinámicamente frente al almacén y las adquisiciones físicas.

---

## 📊 Diccionario de Tablas

### 1. `partidas_p` (Presupuestado - Inmutable)
Contiene las partidas oficiales del presupuesto del proyecto.
*   **`item`** `TEXT` (PK): Código de la partida (ej. `01.01`, `02.04.01`).
*   **`descripcion`** `TEXT`: Título descriptivo de la partida.
*   **`unidad`** `TEXT`: Unidad de medida (ej. `M3`, `GLN`, `UND`).
*   **`cantidad_p`** `NUMERIC`: Metrado total del expediente técnico.
*   **`total_p`** `NUMERIC`: Costo total presupuestado para la partida.

### 2. `insumos_p` (Catálogo de Insumos - Inmutable)
Catálogo unificado de todos los recursos (mano de obra, materiales, equipos) presupuestados.
*   **`codigo_insumo`** `TEXT` (PK): Código único de insumo (ej. `0101010001`).
*   **`descripcion_insumo`** `TEXT`: Nombre oficial del recurso.
*   **`unidad`** `TEXT`: Unidad de medida estándar.
*   **`cantidad_p`** `NUMERIC`: Cantidad total presupuestada para toda la obra.
*   **`costo_p`** `NUMERIC`: Precio unitario referencial del expediente.
*   **`total_p`** `NUMERIC`: Parcial total presupuestado.

### 3. `acus` (APU Desglosado - Editable)
Desglose detallado de los Análisis de Precios Unitarios (APU). Aquí se modifican las incidencias para lograr el cuadre global.
*   **`id`** `SERIAL` (PK): Identificador único interno.
*   **`item_partida`** `TEXT` (FK `partidas_p`): Enlace a la partida asociada.
*   **`codigo_insumo`** `TEXT` (FK `insumos_p`): Código del insumo componente.
*   **`descripcion_insumo`** `TEXT`: Nombre del insumo dentro del APU.
*   **`unidad`** `TEXT`: Unidad de medida.
*   **`cantidad_p`** `NUMERIC`: Cantidad/Incidencia presupuestada original.
*   **`parcial_p`** `NUMERIC`: Costo parcial original.
*   **`cantidad_c`** `NUMERIC`: **[EDITABLE]** Cantidad/Incidencia modificada por el usuario (APU 2).
*   **`rendimiento`** `NUMERIC`: Rendimiento diario de la partida.

### 4. `compras_c` (Ejecución de Compras - Transaccional)
Registro físico de las adquisiciones realizadas en obra.
*   **`id`** `SERIAL` (PK): Identificador de la compra.
*   **`num_compra`** `TEXT`: Número de orden de compra o documento.
*   **`anio`** `TEXT`: Año del ejercicio.
*   **`detalle`** `TEXT`: Descripción del recurso adquirido.
*   **`unidad`** `TEXT`: Unidad de medida de la orden de compra.
*   **`cantidad_c`** `NUMERIC`: Cantidad original facturada.
*   **`precio_unit_c`** `NUMERIC`: Precio unitario original.
*   **`total_c`** `NUMERIC`: Importe total de la compra.
*   **`origen`** `TEXT`: Almacén, caja chica, etc.
*   **`unidad_und`** `TEXT` (Editable): Unidad homologada/normalizada por el usuario para cuadrar con el presupuesto.
*   **`cantidad_und`** `TEXT` (Editable): Cantidad convertida en base a la unidad normalizada.
*   **`precio_und`** `NUMERIC` (Editable): Precio unitario recalculado.

### 5. `mapeo_vinculacion` (Vinculación - Transaccional)
Tabla pivote que enlaza las compras reales con los insumos del presupuesto oficial.
*   **`id`** `SERIAL` (PK).
*   **`compra_id`** `INTEGER` (FK `compras_c`, ON DELETE CASCADE).
*   **`codigo_insumo`** `TEXT` (FK `insumos_p`).
*   **`creado_en`** `TIMESTAMP`.

### 6. `estado_cuadre_insumos` (Flujo Colaborativo - Transaccional)
Tabla independiente para gestionar el estado de cuadre por insumo. Evita alterar las tablas inmutables `_p`.
*   **`codigo_insumo`** `TEXT` (PK).
*   **`estado`** `TEXT`: `Pendiente`, `En Revisión`, `Cuadre Parcial`, `Excedente`, `Terminado`.
*   **`comentario`** `TEXT`: Justificación del analista.
*   **`updated_at`** `TIMESTAMP`.

---

## 👁️ Vistas de Base de Datos (Views)

### `insumos_resumen`
Une el catálogo de `insumos_p` con los totales de compras vinculadas en `mapeo_vinculacion` para entregar balances y saldos en tiempo real:

```sql
CREATE OR REPLACE VIEW insumos_resumen AS
SELECT 
    i.codigo_insumo,
    i.descripcion_insumo,
    i.unidad,
    i.cantidad_p,
    i.costo_p,
    i.total_p,
    COALESCE(e.estado, 'Pendiente') AS estado,
    e.comentario,
    COALESCE(SUM(COALESCE(c.cantidad_und, c.cantidad_c)), 0) AS total_adquirido,
    (i.cantidad_p - COALESCE(SUM(COALESCE(c.cantidad_und, c.cantidad_c)), 0)) AS saldo
FROM insumos_p i
LEFT JOIN mapeo_vinculacion m ON i.codigo_insumo = m.codigo_insumo
LEFT JOIN compras_c c ON m.compra_id = c.id
LEFT JOIN estado_cuadre_insumos e ON i.codigo_insumo = e.codigo_insumo
GROUP BY i.codigo_insumo, i.descripcion_insumo, i.unidad, i.cantidad_p, i.costo_p, i.total_p, e.estado, e.comentario;
```

---

## 🎯 Regla Operativa de Cuadre por Cantidad (Incidencia)

En este sistema, **el precio unitario no es el factor de ajuste**. Las operaciones y decisiones se basan en **CANTIDADES (Incidencias)**:

1. El usuario selecciona un Insumo y normaliza sus compras (`compras_c`), modificando `unidad_und` y `cantidad_und`.
2. La suma de todas las `cantidad_und` vinculadas a este insumo se convierte en la **Meta de Cuadre Global** (`total_adquirido`).
3. El usuario distribuye este `total_adquirido` en la tabla de APU, modificando `cantidad_c` (la incidencia de uso del insumo en cada partida).
4. **Fórmula de Consistencia:**
   $$\text{Meta de Cuadre Global} = \sum (\text{cantidad\_c} \times \text{metrado\_fijo})$$
5. **Cierre de Flujo (Guardado Colaborativo):**
   * Ya no existe el botón global "Guardar Cuadre". Todas las celdas se auto-guardan por fila (`onBlur`).
   * El cierre se realiza marcando el `estado_c` del insumo (ej. `Terminado` o `Cuadre Parcial`) y adjuntando un `comentario_c` si existe diferencia matemática o excedente.

---

## 🔄 Procedimiento para Actualizaciones Futuras
Cuando se requiera modificar o extender este esquema:
1. Escribir los cambios DDL en un script SQL transaccional.
2. Ejecutar la validación local con Git.
3. Actualizar la sección correspondiente en esta guía.
