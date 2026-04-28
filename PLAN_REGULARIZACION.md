# 📋 PLAN DE REGULARIZACIÓN - Belempampa

**Proyecto**: Obra Pública por Administración Directa  
**Fecha**: 2026-04-28  
**Responsable**: Equipo Presupuestos OFI  
**Base de Datos**: 7_insumos_rado (PostgreSQL)

---

## 🎯 OBJETIVO FINAL

Regularizar completamente la obra pública estableciendo **trazabilidad 100%** entre:
- ✅ Presupuesto Original (APU1) desde expediente técnico
- ✅ Presupuesto Modificado (APU2) con cambios documentados
- ✅ Compras Reales vinculadas a cada insumo
- ✅ Auditoría completa de quién, qué, cuándo, por qué

**Resultado esperado**: Obra certificada y auditable = No hay discrepancias sin justificar

---

## 📊 ESTADO ACTUAL

### Datos Cargados
| Elemento | Cantidad | Estado |
|----------|----------|--------|
| **Partidas** | 1,134 | ✅ Cargadas desde APUS_Extraidos_v2.xlsx |
| **Insumos** | 6,216 | ✅ Distribuidos en partidas |
| **Compras** | 1,437 | ✅ Órdenes/Facturas reales |
| **Vinculaciones** | ~1,061 | ⚠️ Parciales (~17% de insumos) |
| **Cambios Auditados** | Pendiente | Registrados en historial_cambios |

### Métricas de Progreso
- **Insumos vinculados**: 696 / 1,431 únicos = **48.6%**
- **Insumos pendientes**: 735 / 1,431 = **51.4%**
- **Compras huérfanas**: Pendiente determinar

---

## 🔧 FASES DE EJECUCIÓN

### FASE 1: Preparación de Datos (COMPLETADA)
**Fecha estimada**: 2026-04-20 a 2026-04-27

#### Tareas:
- [x] Cargar APUS_Extraidos_v2.xlsx (6,216 registros) → `apus_detallado`
- [x] Reconstruir `partidas` (1,134) desde APU detallado
- [x] Reconstruir `insumos` (6,216) con relaciones FK correctas
- [x] Actualizar descripciones de partidas con datos reales
- [x] Crear tabla `mapeo_vinculacion` para trazabilidad

#### Archivos utilizados:
```
cargar_apus_correctamente.py          → Carga APU detallado
reconstruir_desde_apus.py             → Reconstruye partidas + insumos
actualizar_descripciones_partidas.py  → Actualiza nombres
```

**Status**: ✅ COMPLETADA

---

### FASE 2: Vinculación Manual (EN PROGRESO - 48%)
**Fecha estimada**: 2026-04-28 a 2026-05-10

**Objetivo**: Vincular cada insumo presupuestado con su compra real

#### Proceso:
1. Acceder a módulo **Vinculador** en `/vinculador`
2. Panel izquierdo: Ver lista de 1,431 insumos únicos
3. Panel derecho: Ver compras disponibles para vincular
4. Marcar compras que corresponden a cada insumo
5. Guardar vinculación → Crea registro en `mapeo_vinculacion`

#### Tipos de relaciones:
- **Vinculado**: Insumo tiene compra(s) asociada(s)
- **Bloqueado**: Insumo no aparece en compras (talvez no se compró)
- **Disponible**: Compra sin vincular, posible candidata

#### Métricas a alcanzar:
- [ ] 1,431 insumos únicos vinculados = 100%
- [ ] 0 compras huérfanas (todas vinculadas)
- [ ] 0 discrepancias sin explicación

**Status**: 🟡 EN PROGRESO (696/1,431 = 48.6%)

---

### FASE 3: Control y Ajuste (SIGUIENTE)
**Fecha estimada**: 2026-05-10 a 2026-05-20

**Objetivo**: Verificar que cantidades y precios cuadren

#### Módulo: Control Insumos (`/control-insumos`)
- Seleccionar partida
- Ver insumos con cantidades originales vs. modificadas
- Editar incidencias si hay cambios respecto a presupuesto
- **Importante**: Registra en `historial_cambios` quién hizo qué cambio y cuándo

#### Módulo: Ajuste Manual (`/ajuste-manual`)
- Vista total de todas las partidas
- Columnas: Cantidad 1 (APU1), Cantidad 2 (APU2), Parcial 2, Precio
- **Meta Global** = Suma de todos los parciales presupuestados
- **Adquirido** = Suma de compras vinculadas
- **Resta** = Diferencia a explicar

**Cálculos esperados**:
```
Meta Global - Adquirido = Diferencia aceptable
```

Si diferencia ≠ 0: Debe estar justificada y documentada

**Status**: ⏳ PENDIENTE

---

### FASE 4: Auditoría Final (ÚLTIMA)
**Fecha estimada**: 2026-05-20 a 2026-05-25

#### Verificaciones:
1. **Integridad de datos**
   ```sql
   SELECT COUNT(*) FROM partidas              -- Debe ser 1,134
   SELECT COUNT(*) FROM insumos               -- Debe ser 6,216
   SELECT COUNT(*) FROM compras               -- Debe ser 1,437
   SELECT COUNT(*) FROM mapeo_vinculacion     -- Debe ser >= 1,200
   ```

2. **Validación de vinculaciones**
   ```sql
   -- Insumos sin compra (justificado o pendiente)
   SELECT i.descripcion, COUNT(*) qty
   FROM insumos i
   LEFT JOIN mapeo_vinculacion mv ON mv.insumo_nombre = i.descripcion
   WHERE mv.id IS NULL AND i.es_extra = FALSE
   GROUP BY i.descripcion
   ```

3. **Compras sin insumo (inesperado)**
   ```sql
   SELECT c.insumo_descripcion, COUNT(*) qty
   FROM compras c
   LEFT JOIN mapeo_vinculacion mv ON mv.compra_id = c.id
   WHERE mv.id IS NULL
   GROUP BY c.insumo_descripcion
   ```

4. **Cuadre de cantidades**
   ```sql
   SELECT 
       i.descripcion,
       SUM(i.cantidad_modificada) presupuestado,
       SUM(c.cantidad_und) adquirido,
       SUM(i.cantidad_modificada) - SUM(c.cantidad_und) diferencia
   FROM insumos i
   LEFT JOIN mapeo_vinculacion mv ON mv.insumo_nombre = i.descripcion
   LEFT JOIN compras c ON c.id = mv.compra_id
   GROUP BY i.descripcion
   HAVING SUM(i.cantidad_modificada) != SUM(c.cantidad_und)
   ```

#### Checklist de Cumplimiento:
- [ ] 100% insumos vinculados o justificadamente sin compra
- [ ] 100% compras vinculadas a insumo presupuestado
- [ ] Cantidades presupuestadas ≈ Cantidades adquiridas (±5% tolerancia)
- [ ] Todos los cambios registrados en `historial_cambios`
- [ ] Ningún cambio sin usuario/fecha/justificación
- [ ] Meta Global vs. Adquirido: diferencia ≤ 2% o documentada

**Status**: ⏳ PENDIENTE

---

### FASE 5: Certificación y Exportación (FINAL)
**Fecha estimada**: 2026-05-25

#### Productos:
1. **Excel Comparativo** (4 hojas)
   - Hoja 1: APU1 vs APU2 comparado
   - Hoja 2: Listado de compras vinculadas
   - Hoja 3: Resumen por partida (presupuestado vs. adquirido)
   - Hoja 4: Historial de cambios (auditoría completa)

2. **Informe de Regularización**
   - Monto presupuestado original: $X
   - Monto ejecutado: $Y
   - Discrepancia: $(X-Y)
   - Justificación: [pendiente análisis]

3. **Certificado de Auditoría**
   - "Obra regularizada y auditable"
   - O "Discrepancias pendientes de resolver"

#### Responsable: Verificar datos antes de exportar
```
1. Clic en botón "Exportar" en Dashboard
2. Se genera automaticamente Excel con 4 hojas
3. Descargar y archivar como documento oficial
```

**Status**: ⏳ PENDIENTE

---

## 📝 DOCUMENTACIÓN DISPONIBLE

### Guía Principal
- **GUIA_SISTEMA_BELEMPAMPA.md**: Explicación completa del sistema, tablas, cálculos, auditoría

### Scripts de Setup
```bash
# 1. Cargar APU detallado desde fuente de verdad
python3 cargar_apus_correctamente.py

# 2. Reconstruir estructura partidas + insumos
python3 reconstruir_desde_apus.py

# 3. Actualizar nombres de partidas
python3 actualizar_descripciones_partidas.py
```

### APIs Disponibles
- `GET /api/apu` — Obtener APU de un insumo
- `GET /api/apu-full` — APU completo con rendimiento
- `GET /api/compras` — Listado de compras
- `GET /api/partidas` — Partidas e insumos
- `POST /api/vinculacion` — Vincular insumo a compra
- `GET /api/exportar` — Generar Excel de exportación

---

## 🚨 CASOS ESPECIALES

### Insumo Extra (es_extra=TRUE)
Insumo adicional no presupuestado originalmente. Se permite, pero debe estar documentado en `comentario`.

### Caja Chica (codigo_partida='CJA.CHI')
Gastos menores de $X. Agrupados en partida especial con 376 registros.

### Compra sin Insumo
Posible: Compra realizada pero no presupuestada. Debe analizarse si es extra o error.

---

## 📞 PREGUNTAS CLAVE POR RESPONDER

Antes de dar por completada la regularización:

1. **¿Cuál fue el presupuesto original total?**
2. **¿Cuál fue el monto ejecutado?**
3. **¿Hay ampliación de presupuesto entre APU1 y APU2?**
4. **¿Se cumplió con cantidad de horas-hombre planeadas?**
5. **¿Hay materiales no utilizados que deben justificarse?**
6. **¿Las modificaciones (APU2) tienen aprobación?**
7. **¿Quién autorizó cada cambio importante?**
8. **¿Hay saldos sin explicación?**
9. **¿El 100% de compras está documentado?**
10. **¿El 100% de los documentos tiene fecha y responsable?**

---

## ⏰ TIMELINE

| Fase | Inicio | Fin | % Completado |
|------|--------|-----|-------------|
| Preparación Datos | 2026-04-20 | 2026-04-27 | **100%** ✅ |
| Vinculación Manual | 2026-04-28 | 2026-05-10 | **48%** 🟡 |
| Control y Ajuste | 2026-05-10 | 2026-05-20 | **0%** ⏳ |
| Auditoría Final | 2026-05-20 | 2026-05-25 | **0%** ⏳ |
| Certificación | 2026-05-25 | 2026-05-25 | **0%** ⏳ |

**Estimado Total**: ~4 semanas

---

## 💡 RECOMENDACIONES

1. **Prioridad ALTA**: Completar vinculación manual (fase 2)
   - 735 insumos pendientes
   - Dedicar 2-3 horas diarias al módulo Vinculador

2. **Prioridad ALTA**: Una vez vinculados, ejecutar Ajuste Manual
   - Verificar que cantidades cuadren
   - Documentar cualquier discrepancia

3. **Prioridad MEDIA**: Revisar insumos "bloqueados"
   - Si insumo no tiene compra, verificar si es válido
   - Si debe tener compra, buscarla con descripción diferente

4. **Prioridad MEDIA**: Documentar todas las excepciones
   - Cada discrepancia debe tener `comentario` explicativo
   - Registrar en `historial_cambios` quién justifica qué

---

## 📋 CHECKLIST FINAL

Antes de dar por completa la regularización:

- [ ] 100% insumos (6,216) ubicados en partidas
- [ ] 100% insumos únicos (1,431) vinculados a compra o justificado
- [ ] 100% compras (1,437) vinculadas a insumo o explicado
- [ ] Meta Global cuadra ±2% con Adquirido
- [ ] Historial de cambios completo (usuario, fecha, campo, antes/después)
- [ ] Todas las excepciones documentadas
- [ ] Excel exportado y archivado
- [ ] Informe de regularización firmado

---

**¡Sistema listo para regularización completa!**
