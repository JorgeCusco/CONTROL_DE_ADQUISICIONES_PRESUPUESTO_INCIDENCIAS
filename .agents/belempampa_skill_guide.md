# 🎯 SKILL GUIDE - Belempampa Regularización de Obra Pública

## Descripción Oficial

Sistema completo de **regularización y auditoría de obra pública por administración directa** usando **APU (Análisis de Especificación Unitaria)**. Controla insumos presupuestados vs. compras reales con trazabilidad 100% auditable.

**Status**: ✅ Operacional - Phase 2 de 5 (48% completo)

---

## 🗄️ ESTRUCTURA DE BASE DE DATOS

### Base de Datos
- **Nombre**: `7_insumos_rado`
- **Motor**: PostgreSQL
- **Host**: localhost
- **Puerto**: 5432
- **Usuario**: postgres
- **Contraseña**: Jo.9839514500

### Tablas Principales (8 tablas)

#### 1️⃣ **partidas** (1,134 registros)
Líneas de presupuesto base del proyecto.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | SERIAL | PK |
| `codigo` | VARCHAR | Código único (ej: O.E.3.1.11.1) |
| `descripcion` | TEXT | Nombre de la partida |
| `unidad` | VARCHAR | Unidad de medida (m², m³, glb) |
| `metrado_fijo` | DECIMAL | Cantidad base para cálculos |
| `created_at` | TIMESTAMP | Fecha creación |
| `updated_at` | TIMESTAMP | Fecha actualización |

**Relaciones**: 1→N con `insumos`

---

#### 2️⃣ **insumos** (6,216 registros)
Componentes de cada partida (mano de obra, materiales, equipos).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | SERIAL | PK |
| `codigo_partida` | VARCHAR | FK → partidas.codigo |
| `descripcion` | TEXT | Nombre del insumo (OFICIAL, CEMENTO, ACERO) |
| `unidad` | VARCHAR | Unidad (hh, bol, kg) |
| `incidencia_original` | DECIMAL | APU1 original (NO EDITAR) |
| `parcial_original` | DECIMAL | Costo APU1 (NO EDITAR) |
| `incidencia` | DECIMAL | Cantidad APU1 (editable) |
| `cantidad_modificada` | DECIMAL | Cantidad APU2 (editable) |
| `cantidad_adquirida` | DECIMAL | Cantidad comprada real |
| `comentario` | TEXT | Notas y justificaciones |
| `es_extra` | BOOLEAN | TRUE si insumo adicional |
| `created_at` | TIMESTAMP | Fecha creación |
| `updated_at` | TIMESTAMP | Fecha actualización |

**Relaciones**: 
- N→1 con `partidas` (codigo_partida)
- 1←N con `mapeo_vinculacion`

---

#### 3️⃣ **compras** (1,437 registros)
Órdenes de compra y documentos de adquisición reales.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | SERIAL | PK |
| `orden_doc` | VARCHAR | Número de orden (2481, 3290) |
| `insumo_descripcion` | TEXT | Nombre como aparece en documento |
| `unidad_c` | VARCHAR | Unidad original del documento |
| `cant_c` | DECIMAL | Cantidad original |
| `pu_c` | DECIMAL | Precio unitario original |
| `tipo_c` | VARCHAR | Tipo (O/C, O/S, Factura) |
| `anio_c` | INTEGER | Año de compra |
| `especialidad` | VARCHAR | Categoría (Materiales, Mano Obra) |
| `unidad_und` | VARCHAR | Unidad normalizada |
| `cantidad_und` | DECIMAL | Cantidad normalizada |
| `precio_und` | DECIMAL | Precio normalizado |
| `total` | DECIMAL | cantidad_und × precio_und |
| `created_at` | TIMESTAMP | Fecha creación |
| `updated_at` | TIMESTAMP | Fecha actualización |

**Relaciones**: 
- 1←N con `mapeo_vinculacion`

---

#### 4️⃣ **mapeo_vinculacion** (696 registros)
Enlaces explícitos entre insumos presupuestados y compras reales.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | SERIAL | PK |
| `insumo_nombre` | TEXT | Descripción del insumo presupuestado |
| `compra_id` | INT | FK → compras.id |
| `usuario` | VARCHAR | Quién hizo la vinculación |
| `fecha_vinculacion` | TIMESTAMP | Cuándo se vinculó |
| `notas` | TEXT | Justificación |

**Relaciones**:
- N→1 con `compras` (compra_id)

**Status Actual**: 696/1,431 insumos únicos vinculados (48.6%)

---

#### 5️⃣ **apus_detallado** (6,216 registros)
APU completo desde expediente técnico (FUENTE DE VERDAD).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | SERIAL | PK |
| `partida_codigo` | VARCHAR | Código partida |
| `partida_descripcion` | TEXT | Nombre partida |
| `partida_rendimiento` | DECIMAL | Rendimiento |
| `partida_unidad` | VARCHAR | Unidad partida |
| `partida_costo_unitario` | DECIMAL | Costo unitario |
| `tipo_insumo` | VARCHAR | Tipo (MO, MT, EQ) |
| `insumo_codigo` | VARCHAR | Código insumo |
| `insumo_descripcion` | TEXT | Nombre insumo |
| `insumo_unidad` | VARCHAR | Unidad insumo |
| `insumo_recursos` | DECIMAL | Recursos |
| `insumo_cantidad` | DECIMAL | Cantidad APU1 |
| `insumo_precio` | DECIMAL | Precio APU1 |
| `insumo_parcial` | DECIMAL | Parcial APU1 |

**Origen**: APUS_Extraidos_v2.xlsx (6,216 filas)  
**Uso**: Referencia de verdad - NO EDITAR

---

#### 6️⃣ **historial_cambios** (Creciente)
Audit trail de todas las modificaciones.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | SERIAL | PK |
| `tabla` | VARCHAR | Tabla modificada |
| `registro_desc` | TEXT | Descripción del registro |
| `campo` | VARCHAR | Campo que cambió |
| `valor_anterior` | TEXT | Valor antes |
| `valor_nuevo` | TEXT | Valor después |
| `usuario` | VARCHAR | Quién hizo el cambio |
| `fecha` | TIMESTAMP | Cuándo |
| `razon` | TEXT | Por qué cambió |

**Uso**: Trazabilidad completa para auditoría

---

#### 7️⃣ **usuarios** (Opcional)
Información de usuarios del sistema.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | SERIAL | PK |
| `nombre` | VARCHAR | Nombre completo |
| `email` | VARCHAR | Email |
| `rol` | VARCHAR | Rol (admin, auditor, operador) |

---

#### 8️⃣ **meta_global** (1 registro)
Suma acumulada de presupuesto modificado.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | SERIAL | PK |
| `suma_total` | DECIMAL | Σ(cantidad_modificada) |
| `fecha_actualizacion` | TIMESTAMP | Última actualización |

---

## 📊 Diagrama de Relaciones

```
┌─────────────┐
│  partidas   │ (1,134)
│  codigo (PK)│
└──────┬──────┘
       │1
       │
       │N
┌──────▼──────────────────┐
│  insumos               │ (6,216)
│  codigo_partida (FK) ──┘
│  descripcion          │
│  cantidad_modificada  │
└──────┬────────────────┬┘
       │                │
       │N               │1
       │                │
    ┌──┴─────────────┐  │
    │                │  │
┌───▼────────────┐   │  │
│mapeo_vincul    │───┤  │
│insumo_nombre   │   │  │
│compra_id (FK)──┐   │  │
└────────────────┘   │  │
                     │  │
                  ┌──▼──▼─────────┐
                  │ compras       │ (1,437)
                  │ orden_doc     │
                  │ insumo_desc   │
                  └───────────────┘

apus_detallado    (6,216 - MASTER DATA, NO EDITAR)
historial_cambios (AUDIT TRAIL)
```

---

## 🔢 Estadísticas Actuales

| Tabla | Registros | Estado |
|-------|-----------|--------|
| partidas | 1,134 | ✅ Completo |
| insumos | 6,216 | ✅ Completo |
| compras | 1,437 | ✅ Completo |
| mapeo_vinculacion | 696 | 🟡 48.6% (735 pendientes) |
| apus_detallado | 6,216 | ✅ Referencia |
| historial_cambios | Creciente | ✅ Audit |

**Total datos**: ~17,699 registros

---

## 🔐 Reglas de Integridad

1. **insumos.incidencia_original y parcial_original**: INMUTABLES (expediente técnico)
2. **insumos.cantidad_modificada**: Editable solo en módulo Control Insumos
3. **compras**: Solo lectura (datos históricos)
4. **mapeo_vinculacion**: Creciente (crear/leer/borrar, no editar)
5. **apus_detallado**: Referencia de verdad - NO MODIFICAR

---

## 🔄 Cálculos Principales

### APU1 (Original - Inmutable)
```
Parcial Original = Incidencia Original × Metrado Fijo
```

### APU2 (Modificado - Editable)
```
Cantidad Modificada = Nuevos Insumos (editable por usuario)
Parcial Modificado = Cantidad Modificada × Metrado Fijo
```

### Meta Global (Suma de Presupuesto)
```
Meta Global = Σ(Parcial Modificado) para TODOS los insumos
```

### Flujo de Cuadre Colaborativo (State Tracking)
Para soportar el trabajo simultáneo de 10 analistas, se utiliza una máquina de estados almacenada en `estado_cuadre_insumos`:
1. **Auto-guardado celular**: Las compras y los APUs se guardan por fila (onBlur), sin requerir botón global.
2. **Selección de Estado**: El analista marca el cierre de un insumo mediante los siguientes estados:
   - `Pendiente`: Estado inicial.
   - `En Revisión`: Alguien está analizándolo.
   - `Cuadre Parcial`: Tiene saldo sobrante pero requiere acción futura (ej. crear partida).
   - `Excedente`: Incidencia asignada supera la compra física (alerta gerencial).
   - `Terminado`: Cuadre finalizado satisfactoriamente.
3. **Notas de Justificación**: Obligatorias para cuadres parciales o excedentes. Documentan el razonamiento para el Status Gerencial.

### Cuadre (Auditoría)
```
Diferencia = Meta Global - Adquirido
% Ejecución = (Adquirido / Meta Global) × 100
```

---

## 📡 APIs Disponibles

```
GET  /api/schema              - Obtener estructura completa de BD
GET  /api/partidas            - Listar partidas
GET  /api/partidas?cod=X      - Insumos de partida X
GET  /api/insumos             - Listar insumos únicos
GET  /api/compras             - Listar compras
GET  /api/vinculacion?mode=insumos  - Listar insumos con estado vinculación
GET  /api/vinculacion?insumo=X      - Compras disponibles para insumo X
POST /api/vinculacion               - Crear vinculación
DELETE /api/vinculacion?id=X        - Eliminar vinculación
GET  /api/exportar            - Generar Excel 4 hojas
```

---

## 🔧 Scripts de Setup Disponibles

```bash
# 1. Cargar APU detallado desde expediente técnico
python3 cargar_apus_correctamente.py

# 2. Reconstruir partidas + insumos desde APU
python3 reconstruir_desde_apus.py

# 3. Actualizar nombres de partidas a valores reales
python3 actualizar_descripciones_partidas.py

# 4. Cargar datos de NUEVA_DATA.xlsx y caja chica
python3 cargar_datos_correctamente.py

# 5. Diagnosticar estado actual
python3 diagnostico_regularizacion.py
```

---

## 📚 Documentación Relacionada

- **GUIA_SISTEMA_BELEMPAMPA.md** - Guía técnica completa
- **PLAN_REGULARIZACION.md** - Plan de 5 fases (timeline)
- **CUESTIONARIO_REGULARIZACION.md** - 70+ preguntas de validación
- **SCHEMA_BD.md** - Esquema detallado de BD
- **schema_bd_completo.json** - Schema en JSON

---

## 🎯 Próximos Pasos (Phase 2)

1. **Completar vinculaciones** (735 pendientes)
   - Usar módulo `/vinculador`
   - Vincular insumos a compras manualmente
   - Target: 100% by 2026-05-10

2. **Validar Ajuste Manual** (`/ajuste-manual`)
   - Meta Global vs. Adquirido deben cuadrar ±2%
   - Documentar discrepancias

3. **Exportar Certificación**
   - Generar Excel de 4 hojas
   - Archivar como documento oficial

---

## 💡 Tips de Uso

### Ver Schema de BD
```bash
# Opción 1: Via API (requiere servidor corriendo)
curl http://localhost:3000/api/schema | jq

# Opción 2: Ver archivo JSON
cat schema_bd_completo.json | jq

# Opción 3: Ver documentación Markdown
cat SCHEMA_BD.md
```

### Consultas SQL Útiles

```sql
-- Ver todas las partidas con sus insumos
SELECT p.codigo, p.descripcion, COUNT(i.id) as qty
FROM partidas p
LEFT JOIN insumos i ON i.codigo_partida = p.codigo
GROUP BY p.codigo, p.descripcion
ORDER BY qty DESC;

-- Ver insumos sin vinculación
SELECT DISTINCT i.descripcion
FROM insumos i
LEFT JOIN mapeo_vinculacion mv ON mv.insumo_nombre = i.descripcion
WHERE mv.id IS NULL AND i.es_extra = FALSE;

-- Ver cuadre Meta vs. Adquirido
SELECT
    SUM(i.cantidad_modificada) as meta_total,
    (SELECT SUM(cantidad_und) FROM compras) as adquirido,
    SUM(i.cantidad_modificada) - (SELECT SUM(cantidad_und) FROM compras) as diferencia
FROM insumos i;

-- Ver historial de cambios de un usuario
SELECT * FROM historial_cambios
WHERE usuario = 'JorgeCusco'
ORDER BY fecha DESC;
```

---

**¡Sistema Belempampa Listo para Regularización! 🎯**
