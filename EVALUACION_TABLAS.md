# Evaluación de Estructura de Tablas - Proyecto Belempampa

## Tablas Actuales (5 Tablas)

### 1. **partidas** ✅ CARGADA
- **Propósito**: Almacenar partidas del presupuesto base
- **Registros**: 1,135
- **Campos**: código, descripcion, unidad, metrado_fijo, cantidad_presupuestada, precio_unitario_presupuestado, total_presupuestado
- **Estado**: Completada desde PRESUPUESTO.xlsx
- **Clave Primaria**: código (PK)

### 2. **insumos** ⏳ PENDIENTE
- **Propósito**: Insumos desagregados por partida
- **Registros esperados**: ~6,056 (del APU)
- **Campos**: id (PK), codigo_partida (FK), codigo_insumo, descripcion, unidad, incidencia_original, parcial_original, incidencia, cantidad_modificada, cantidad_adquirida, comentario, es_extra
- **Relación**: FK a partidas(codigo)
- **Estado**: Vacía (lista para cargar desde APU_PRESUPUESTO_LIMPIO.csv)

### 3. **apus_detallado** ⏳ PENDIENTE
- **Propósito**: APU completo con rendimiento y desglose de costos
- **Registros**: 6,056 
- **Campos**: partida_codigo, partida_descripcion, partida_rendimiento, partida_unidad, partida_costo_unitario, tipo_insumo, insumo_codigo, insumo_descripcion, insumo_unidad, insumo_recursos, insumo_cantidad, insumo_precio, insumo_parcial
- **Estado**: SQL listo → INSERT_APUS_DETALLADO.sql
- **Nota**: Tabla de referencia, contiene toda la información del APU original

### 4. **compras** ⏳ PENDIENTE
- **Propósito**: Órdenes y documentos de compra normalizados
- **Campos**: id (PK), insumo_descripcion, unidad_c, cant_c, pu_c, unidad_und, cantidad_und, precio_und, ...
- **Estado**: Vacía (lista para carga manual o importación de documentos)

### 5. **mapeo_vinculacion** ⏳ PENDIENTE
- **Propósito**: Vincular insumos con compras (insumo ↔ compra)
- **Campos**: id (PK), insumo_codigo (FK), compra_id (FK), ...
- **Relación**: FK a insumos(codigo_insumo) y compras(id)
- **Estado**: Vacía (se completa después de cargar compras)

---

## Tabla Adicional Recomendada (Existe pero no mencionada)

### 6. **historial_cambios** 📋 AUDITORÍA
- **Propósito**: Audit trail - registrar todos los cambios en datos
- **Campos**: id, tabla, operacion (INSERT/UPDATE/DELETE), usuario, fecha, cambios_json
- **Estado**: Probablemente existe, sirve para tracking

---

## Análisis y Recomendaciones

### ✅ Estructura Actual CORRECTA
Tu estructura de 5 tablas es **adecuada** para el sistema. No necesitas crear más tablas principales.

### 📊 Datos a Cargar (Prioridad)

**FASE 1 - COMPLETAR (AHORA)**
1. ✅ `partidas` → YA CARGADA (1,135 registros)
2. ⏳ `apus_detallado` → USAR: `INSERT_APUS_DETALLADO.sql` (6,056 registros)

**FASE 2 - MANUAL**
3. ⏳ `compras` → Debes cargar desde tus documentos de compra
4. ⏳ `mapeo_vinculacion` → Se crea después de tener compras (opcional/manual)

---

## Archivos Listos en DATA_LAST/

```
DATA_LAST/
├── PARTIDAS.csv ............................ (92K) - Backup de partidas
├── INSERT_PARTIDAS.sql ..................... (108K) - SQL ejecutado ✅
├── APU_PRESUPUESTO_LIMPIO.csv .............. (841K) - APU limpio
├── INSERT_APUS_DETALLADO.sql ............... (1.0M) - SQL para apus_detallado (PENDIENTE)
├── APUS_DETALLADO.csv ...................... (888K) - Alternativo APUS_Extraidos_v2.xlsx
└── [Otros archivos de respaldo]
```

---

## Próximos Pasos

### 1️⃣ Ejecutar INSERT_APUS_DETALLADO.sql en Supabase
```sql
-- Abrir tu conexión Supabase y ejecutar:
-- INSERT_APUS_DETALLADO.sql
```
Esto cargará los 6,056 registros de APUs detallados.

### 2️⃣ Cargar Compras
Necesitas documentos/datos de órdenes de compra para la tabla `compras`.

### 3️⃣ Crear Vinculación (Opcional)
Una vez con compras, puedes crear los mappeos en `mapeo_vinculacion`.

---

## Conclusión

**No necesitas crear más tablas.** Tu estructura es óptima:
- 5 tablas cobertura todo el sistema
- Relaciones claras (FK correctas)
- Soporta auditoría con `historial_cambios`

**Próximo paso**: Ejecuta `INSERT_APUS_DETALLADO.sql` en Supabase.
