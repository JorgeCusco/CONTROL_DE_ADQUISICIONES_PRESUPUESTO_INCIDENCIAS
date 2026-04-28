# 🏗️ SISTEMA DE CONTROL Y REGULARIZACIÓN DE OBRA PÚBLICA
## Proyecto: Belempampa (Administración Directa)

---

## 📋 PROPÓSITO DEL SISTEMA

Este sistema está diseñado para **regularizar y auditar una obra pública ejecutada por administración directa**, permitiendo:

✅ Controlar insumos adquiridos vs. insumos presupuestados  
✅ Cuadrar compras reales con presupuesto original (APU1)  
✅ Registrar modificaciones de presupuesto (APU2)  
✅ Vincular compras a insumos específicos  
✅ Generar reportes de auditoría y trazabilidad completa  

---

## 🏛️ ESTRUCTURA DEL SISTEMA

### Stack Tecnológico
- **Frontend**: Next.js 16.2.4 + React 19
- **Base de Datos**: PostgreSQL (7_insumos_rado)
- **ORM**: pg (node-postgres)
- **Exportación**: ExcelJS (reportes 4 hojas)

### Tablas de Base de Datos

#### `partidas` (1,134 registros)
Presupuesto base de la obra - Estructura AEU (Análisis de Especificación Unitaria)
```
- codigo: Código único (ej: O.E.3.1.11.1)
- descripcion: Nombre de la partida (ej: Mamposteria en piedra)
- unidad: Unidad de medida (m², m³, glb, etc.)
- metrado_fijo: Cantidad presupuestada / costo unitario
```

#### `insumos` (6,216 registros)
Componentes de cada partida (mano de obra, materiales, equipos, etc.)
```
- codigo_partida: FK → partidas.codigo
- descripcion: Nombre del insumo (ej: OFICIAL, CEMENTO, ACERO)
- unidad: Unidad de medida (hh, bol, kg, etc.)
- incidencia_original: Cantidad original APU1
- parcial_original: Costo original APU1
- incidencia: Cantidad actual (editable)
- cantidad_modificada: Cantidad APU2 (editable)
- cantidad_adquirida: Cantidad comprada/ejecutada
- es_extra: TRUE si es insumo adicional no presupuestado
```

#### `compras` (1,437 registros)
Documentos de compra reales (OC, facturas, etc.)
```
- orden_doc: Número de orden (ej: 2481, 3290)
- insumo_descripcion: Nombre del insumo en documento
- unidad_c / unidad_und: Unidad original vs. unificada
- cant_c / cantidad_und: Cantidad original vs. unificada
- pu_c / precio_und: Precio original vs. unificado
- tipo_c: Tipo de compra (O/C, O/S, etc.)
- anio_c: Año de la compra
- especialidad: Categoría (Materiales, Mano de obra, etc.)
```

#### `mapeo_vinculacion` (1,061 registros)
Relaciones entre insumos y compras
```
- insumo_nombre: Descripción del insumo (texto libre)
- compra_id: FK → compras.id
- usuario: Quién hizo la vinculación
- Permite auditar quién vinculó qué y cuándo
```

#### `apus_detallado` (6,216 registros)
APU completo original (fuente de verdad: APUS_Extraidos_v2.xlsx)
```
- Partida_Codigo, Partida_Descripcion
- Partida_Rendimiento, Partida_Unidad, Partida_Costo_Unitario
- Tipo_Insumo, Insumo_Codigo, Insumo_Descripcion
- Insumo_Recursos, Insumo_Cantidad, Insumo_Precio, Insumo_Parcial
```

#### `historial_cambios`
Audit trail de todas las modificaciones
```
- tabla: Qué tabla fue modificada
- registro_desc: Descripción del registro
- campo: Qué campo cambió
- valor_anterior: Valor antes
- valor_nuevo: Valor después
- usuario: Quién hizo el cambio
- fecha: Cuándo
```

---

## 🗂️ ARCHIVOS FUENTE DE DATOS

### 1. APUS_Extraidos_v2.xlsx
**Origen**: Expediente técnico original  
**Contenido**: 6,216 filas con estructura AEU completa  
**Uso**: Fuente de verdad - NO MODIFICAR  
**Carga**: Automática en tabla `apus_detallado`

### 2. NUEVA_DATA.xlsx
**Origen**: Datos del presupuesto modificado  
**Contenido**: 1,642 insumos presupuestados  
**Columnas A-H**: Insumo (código, descripción, cantidad)  
**Columnas I-R**: Compra vinculada (orden, detalle, etc.)  
**Uso**: Carga inicial en `partidas` e `insumos`

### 3. caja_chica_nuevo.xlsx
**Origen**: Gastos menores en caja chica  
**Contenido**: 376 registros de gastos pequeños  
**Código partida**: CJA.CHI (especial para caja chica)  
**Uso**: Completar insumos adicionales

---

## 🚀 FLUJO DE TRABAJO

### Fase 1: CARGA INICIAL
```
APUS_Extraidos_v2.xlsx → [partidas + insumos originales]
                    ↓
            BD presupuesto (APU1)
```

### Fase 2: CONTROL DE INSUMOS (Módulo 1)
**URL**: `/control-insumos`

```
Seleccionar Partida
        ↓
Ver insumos de esa partida
        ↓
Editar incidencias (cantidades)
        ↓
Guardar cambios (APU2)
        ↓
Registrar en historial_cambios
```

**Qué hace**: Captura modificaciones al presupuesto original

### Fase 3: VINCULADOR (Módulo Vinculador)
**URL**: `/vinculador`

```
Panel Izquierdo: Lista de insumos (1,431 únicos)
        ↓
Seleccionar un insumo
        ↓
Panel Derecho: Ver compras disponibles
        ↓
Marcar compras que corresponden
        ↓
Vincular (crear mapeo_vinculacion)
```

**Qué hace**: Liga cada insumo presupuestado con su compra real

### Fase 4: AJUSTE MANUAL (Módulo 2)
**URL**: `/ajuste-manual`

```
3. Edición de Incidencias (APU2)
        ↓
Ver todas las partidas con sus insumos
        ↓
Cantidad 1 = APU1 (presupuesto original)
Cantidad 2 = APU2 (presupuesto modificado)
Parcial 2 = Cantidad 2 × Precio
        ↓
Meta Global = Suma de Parciales
Adquirido = Suma de compras vinculadas
Resta = Diferencia a cuadrar
```

**Qué hace**: Muestra el cuadre entre presupuesto y realidad

### Fase 5: EXPORTACIÓN
**URL**: Botón "Exportar" en Dashboard

```
Genera archivo Excel con 4 hojas:
1. APU Comparativo (APU1 vs APU2)
2. Compras (orden, detalle, cantidad, precio)
3. Resumen de Partidas
4. Historial (quién cambió qué)
```

---

## ❓ PREGUNTAS CLAVE PARA REGULARIZACIÓN

### Sobre la Obra
1. ¿Cuál es el presupuesto original total de la obra?
2. ¿Cuál es el monto ejecutado hasta ahora?
3. ¿Cuál es la diferencia (ampliación vs. reducción)?

### Sobre Insumos
4. ¿Hay insumos adicionales no presupuestados (es_extra=TRUE)?
5. ¿Cuántos insumos presupuestados NO fueron adquiridos?
6. ¿Cuántas compras NO están vinculadas a ningún insumo?

### Sobre Compras
7. ¿Hay compras de insumos que no aparecen en presupuesto?
8. ¿Las cantidades compradas coinciden con las presupuestadas?
9. ¿Los precios pagados están dentro del presupuesto?

### Sobre Auditoría
10. ¿Quién hizo qué cambios? (historial_cambios)
11. ¿Cuándo se hicieron los cambios?
12. ¿Hay cambios sospechosos o sin justificación?

### Sobre Cuadre Final
13. **GRAN PREGUNTA**: ¿Suma de (Insumos Presupuestados × Cantidades Adquiridas) = Total Pagado?
14. ¿Hay discrepancias entre lo presupuestado y lo ejecutado?
15. ¿Estas discrepancias están justificadas/documentadas?

---

## 📊 CÁLCULOS CLAVE

### APU 1 (Original - NO cambiar)
```
incidencia_original × metrado_fijo = parcial_original
```

### APU 2 (Modificado - Editable)
```
cantidad_modificada × metrado_fijo = parcial_modificado
```

### Meta Global (Suma para auditar)
```
∑(parcial_modificado) = Meta que debe cuadrar
```

### Adquirido (Compras vinculadas)
```
∑(cantidad_adquirida donde vinculado=TRUE) = Total comprado
```

### Cuadre (Resultado de auditoría)
```
Meta Global - Adquirido = Diferencia a regularizar
```

---

## 🔍 AUDITORÍA PASO A PASO

### 1. Verificar Integridad de Datos
```sql
SELECT COUNT(*) FROM partidas;           -- Debe ser 1,134
SELECT COUNT(*) FROM insumos;            -- Debe ser 6,216
SELECT COUNT(*) FROM compras;            -- Debe ser 1,437
SELECT COUNT(*) FROM mapeo_vinculacion;  -- Debe ser ~1,061
```

### 2. Detectar Insumos Sin Compra
```sql
SELECT i.descripcion, SUM(i.cantidad_modificada)
FROM insumos i
LEFT JOIN mapeo_vinculacion mv ON mv.insumo_nombre = i.descripcion
WHERE mv.id IS NULL AND i.es_extra = FALSE
GROUP BY i.descripcion;
```

### 3. Detectar Compras Sin Insumo
```sql
SELECT c.insumo_descripcion, COUNT(*)
FROM compras c
LEFT JOIN mapeo_vinculacion mv ON mv.compra_id = c.id
WHERE mv.id IS NULL
GROUP BY c.insumo_descripcion;
```

### 4. Calcular Discrepancias
```sql
SELECT 
    i.codigo_partida,
    i.descripcion,
    SUM(i.cantidad_modificada) as presupuestado,
    COALESCE(SUM(c.cantidad_und), 0) as adquirido,
    SUM(i.cantidad_modificada) - COALESCE(SUM(c.cantidad_und), 0) as diferencia
FROM insumos i
LEFT JOIN mapeo_vinculacion mv ON mv.insumo_nombre = i.descripcion
LEFT JOIN compras c ON c.id = mv.compra_id
WHERE i.es_extra = FALSE
GROUP BY i.codigo_partida, i.descripcion
HAVING SUM(i.cantidad_modificada) != COALESCE(SUM(c.cantidad_und), 0)
ORDER BY diferencia DESC;
```

---

## ✅ CHECKLIST DE REGULARIZACIÓN

- [ ] Todas las partidas tienen descripción correcta
- [ ] Todos los insumos están vinculados a compras (o justificadamente sin compra)
- [ ] Todas las compras están vinculadas a insumos
- [ ] Las cantidades presupuestadas coinciden con adquiridas
- [ ] Los precios son razonables y dentro de presupuesto
- [ ] El historial documenta todos los cambios
- [ ] Los cambios de APU1 a APU2 están justificados
- [ ] No hay insumos duplicados
- [ ] No hay compras duplicadas
- [ ] El cuadre final es cero (o justificado)

---

## 🎯 OBJETIVO FINAL

**La obra pública está regularizada cuando:**

1. ✅ Cada insumo presupuestado tiene su compra documentada
2. ✅ Cada compra realizada está vinculada a un insumo presupuestado
3. ✅ Las cantidades y precios cuadran
4. ✅ Hay trazabilidad completa (quién, qué, cuándo, por qué)
5. ✅ Cualquier discrepancia está justificada y documentada
6. ✅ El dinero ejecutado se explica en el presupuesto

---

## 📞 CONTACTO Y SOPORTE

**Sistema desarrollado para**: Proyecto Rado - Belempampa  
**Base de datos**: 7_insumos_rado (PostgreSQL)  
**Usuario responsable**: Equipo Presupuestos OFI  
**Fecha de setup**: 2025-04-28

---

## 🔒 INTEGRIDAD DE DATOS

- ✅ Backups automáticos después de cada cambio
- ✅ Historial completo en historial_cambios
- ✅ Validación de FK en todas las relaciones
- ✅ Transacciones ACID en operaciones críticas
- ✅ Auditoría de usuarios en cada cambio

---

**¡El sistema está listo para regularizar tu obra pública!**
