# 🗂️ ESTRUCTURA SQL - REFERENCIA RÁPIDA

## 📊 TABLA DE TRANSFORMACIÓN DE DATOS

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CICLO DE VIDA DE LOS DATOS                      │
└─────────────────────────────────────────────────────────────────────┘

FASE 1: PRESUPUESTO BASE (Original - Inmodificable)
════════════════════════════════════════════════════
  ┌──────────────┐
  │ PARTIDAS_P   │  ← Capítulos presupuestarios
  │  1283 filas  │     (ej: "Estructuras", "Acabados")
  └──────┬───────┘
         │
         ├──→ item (PK)
         ├──→ descripcion
         ├──→ cantidad_p ✓ (FIJO)
         ├──→ precio_unitario_p ✓ (FIJO)
         └──→ total_p ✓ (FIJO)

  ┌──────────────┐
  │ INSUMOS_P    │  ← Catálogo de insumos
  │  1138 filas  │     (ej: "CEMENTO", "ACERO", "MO")
  └──────┬───────┘
         │
         ├──→ codigo (PK) ✓ (FIJO)
         ├──→ descripcion
         ├──→ cantidad_insumo_p ✓ (FIJO)
         ├──→ costo_p ✓ (FIJO)
         └──→ total_p ✓ (FIJO)


FASE 2: MATRIZ APU COMBINADA (Presupuesto vs Realidad)
═══════════════════════════════════════════════════════
  ┌────────────────────────────────────────┐
  │         ACUS (6336 filas)              │
  │  ✓ TABLA CENTRAL DEL SISTEMA           │
  └────────────────────────────────────────┘
  
  Columna                    | Origen        | Editable
  ───────────────────────────┼───────────────┼─────────
  item_partida               | PARTIDAS_P    | ✗ NO
  codigo_insumo              | INSUMOS_P     | ✗ NO
  cantidad_p (presupuesto)   | ACUS inicial  | ✗ NO
  precio_p (presupuesto)     | ACUS inicial  | ✗ NO
  parcial_p (presupuesto)    | Calculado     | ✗ NO
  ───────────────────────────────────────────────────
  cantidad_c (comprado)      | MAPEO         | ✓ SÍ
  precio_c (comprado)        | MAPEO         | ✓ SÍ
  parcial_c (comprado)       | Calculado     | ✓ SÍ


FASE 3: COMPRAS DOCUMENTADAS
═════════════════════════════
  ┌──────────────┐
  │ COMPRAS_C    │  ← Documentos de compra
  │  1921 filas  │     (Facturas, OC, etc)
  └──────┬───────┘
         │
         ├──→ id (PK)
         ├──→ detalle (descripción como viene en doc)
         ├──→ cantidad_c (dato original)
         ├──→ precio_unit_c (dato original)
         ├──→ total_c (dato original)
         ├──→ unidad_und (normalizado)
         ├──→ cantidad_und (normalizado)
         └──→ precio_und (normalizado)


FASE 4: VINCULACIÓN EXPLÍCITA
══════════════════════════════
  ┌─────────────────────────────┐
  │  MAPEO_VINCULACION          │
  │   1884 filas                │
  │  ✓ TABLA CRÍTICA            │
  └─────────────────────────────┘
  
  Operación por vinculación:
  ┌─────────────────────────────────────────────────┐
  │ 1. Usuario selecciona:                          │
  │    - Insumo (ej: "CEMENTO")                     │
  │    - Compra (ej: "Factura #105")                │
  │    - Factor de conversión (ej: 1.0)             │
  │                                                 │
  │ 2. Se crea registro:                            │
  │    codigo_insumo = "CEMENTO"                    │
  │    compra_id = 105                              │
  │    factor_conversion = 1.0                      │
  │                                                 │
  │ 3. Sistema actualiza ACUS:                      │
  │    Suma cantidad_und de COMPRAS_C por insumo    │
  │    Calcula promedio ponderado de precios        │
  │    Actualiza cantidad_c y precio_c en ACUS      │
  └─────────────────────────────────────────────────┘

  Múltiples compras → Un insumo:
  ┌──────────────────────────────────────────────────┐
  │ Insumo: CEMENTO                                  │
  │                                                  │
  │ ├─ Vinculación 1: Compra #105 → 50 bolsas       │
  │ ├─ Vinculación 2: Compra #108 → 45 bolsas       │
  │ ├─ Vinculación 3: Compra #112 → 55 bolsas       │
  │ └─ TOTAL ACUS.cantidad_c = 150 bolsas           │
  └──────────────────────────────────────────────────┘


FASE 5: ESTADO Y RECONCILIACIÓN
════════════════════════════════
  ┌──────────────────────────────────────┐
  │ ESTADO_CUADRE_INSUMOS (274 filas)    │
  │ ✓ Control de calidad                 │
  └──────────────────────────────────────┘
  
  Para cada insumo:
  
  ┌─────────────────────────────────────┐
  │ Presupuesto: 2500 unidades @ $15.50 │  ← ACUS.cantidad_p, precio_p
  │ Comprado:    2520 unidades @ $15.80 │  ← ACUS.cantidad_c, precio_c
  │                                     │
  │ Variancia:   +20 unidades (+0.8%)   │
  │ Estado:      "Cuadrado ✓"           │  ← ESTADO_CUADRE_INSUMOS
  │ Comentario:  "Dentro de tolerancia" │
  └─────────────────────────────────────┘


FASE 6: RESUMEN CONSOLIDADO
═══════════════════════════
  ┌──────────────────────────────────────┐
  │ INSUMOS_RESUMEN (1145 filas)         │
  │ Vista consolidada por insumo         │
  └──────────────────────────────────────┘
  
  Agregación a nivel de insumo:
  ┌──────────────────────────────────────┐
  │ CEMENTO:                             │
  │                                      │
  │ Presupuesto Total:                   │
  │   - Qty P: 2500 (suma todas partidas)│
  │   - Precio P: $15.50 promedio        │
  │   - Total P: $38,750.00              │
  │                                      │
  │ Comprado Total:                      │
  │   - Qty C: 2520 (realidad)           │
  │   - Precio C: $15.80 promedio        │
  │   - Total C: $39,816.00              │
  │                                      │
  │ Estado Cuadre: "Cuadrado"            │
  │ Variancia: +$1,066.00 (+2.75%)       │
  └──────────────────────────────────────┘
```

---

## 🔄 FLUJO DE ACTUALIZACIÓN

```
Cambio en UI → API → Validación → Transacción BD → Audit

Ejemplo: Usuario edita cantidad_c en control-insumos

1. FRONTEND (control-insumos/page.tsx)
   └─→ Input: new quantity = 520 bolsas
       └─→ PATCH /api/apu

2. API (api/apu/route.ts)
   ├─→ Valida: 520 > 0 ✓
   ├─→ Valida: FK a INSUMOS_P existe ✓
   └─→ Procede con actualización

3. TRANSACTION (BD)
   BEGIN;
   ├─→ UPDATE ACUS SET cantidad_c = 520 WHERE codigo_insumo = 'CEM50'
   ├─→ UPDATE ACUS SET parcial_c = 520 * precio_c
   ├─→ INSERT INTO historial_cambios (...)
   COMMIT;

4. AUDIT (audit.ts)
   └─→ Registra: usuario, tabla, campo, valor_antes, valor_despues, timestamp

5. FRONTEND
   └─→ Actualiza UI, muestra: ✓ Cambio guardado
```

---

## 📋 MATRIZ DE OPERACIONES PERMITIDAS

```
┌──────────────────────┬─────────────────────┬──────────────┐
│ Tabla                │ Operación           │ Permitido    │
├──────────────────────┼─────────────────────┼──────────────┤
│ PARTIDAS_P           │ SELECT              │ ✓ Sí         │
│                      │ INSERT/UPDATE/DEL   │ ✗ NO         │
├──────────────────────┼─────────────────────┼──────────────┤
│ INSUMOS_P            │ SELECT              │ ✓ Sí         │
│                      │ INSERT/UPDATE/DEL   │ ✗ NO         │
├──────────────────────┼─────────────────────┼──────────────┤
│ ACUS                 │ SELECT              │ ✓ Sí         │
│                      │ UPDATE cantidad_c   │ ✓ Sí         │
│                      │ UPDATE precio_c     │ ✓ Sí         │
│                      │ UPDATE cantidad_p   │ ✗ NO         │
│                      │ DELETE              │ ✗ NO         │
├──────────────────────┼─────────────────────┼──────────────┤
│ COMPRAS_C            │ SELECT              │ ✓ Sí         │
│                      │ INSERT              │ ✓ Sí         │
│                      │ UPDATE (_und cols)  │ ✓ Sí         │
│                      │ DELETE              │ ⚠️ Cuidado    │
├──────────────────────┼─────────────────────┼──────────────┤
│ MAPEO_VINCULACION    │ SELECT              │ ✓ Sí         │
│                      │ INSERT              │ ✓ Sí         │
│                      │ UPDATE              │ ⚠️ Cuidado    │
│                      │ DELETE              │ ⚠️ Cuidado    │
├──────────────────────┼─────────────────────┼──────────────┤
│ ESTADO_CUADRE        │ SELECT              │ ✓ Sí         │
│                      │ UPDATE estado       │ ✓ Sí         │
│                      │ INSERT              │ ✓ Sí         │
├──────────────────────┼─────────────────────┼──────────────┤
│ INSUMOS_RESUMEN      │ SELECT              │ ✓ Sí         │
│                      │ INSERT/UPDATE/DEL   │ ✗ NO (VIEW)  │
└──────────────────────┴─────────────────────┴──────────────┘
```

---

## 🎯 CÁLCULOS Y FÓRMULAS

```
PRESUPUESTO ORIGINAL (No modificable)
═════════════════════════════════════
parcial_p = cantidad_p × precio_p
total_presupuesto = SUM(parcial_p para partida X)


REALIDAD COMPRADA (Modificable vía MAPEO_VINCULACION)
═════════════════════════════════════════════════════
parcial_c = cantidad_c × precio_c
total_comprado = SUM(parcial_c para partida X)


VARIANCIA
════════
variancia = parcial_c - parcial_p
variancia_% = (parcial_c - parcial_p) / parcial_p × 100

Estados posibles:
├─ Si variancia_% ≤ ±5% → "Cuadrado" ✓
├─ Si variancia_% > ±5% → "Rechazado" ✗
└─ Pendiente → "Pendiente" ⏳


RESUMEN POR INSUMO
═════════════════
cantidad_requerida_p = SUM(cantidad_p) para insumo en todas partidas
cantidad_requerida_c = SUM(cantidad_c vinculada) para insumo
total_presupuesto_insumo = SUM(parcial_p) para ese insumo
total_comprado_insumo = SUM(parcial_c) para ese insumo
```

---

## 🚨 REGLAS CRÍTICAS

```
1. INTEGRIDAD DE PARTIDAS
   ✓ PARTIDAS_P nunca se modifica
   ✓ cantidad_p en ACUS es inmutable
   ✓ Cambios en cantidad_c no afectan presupuesto original

2. VINCULACIÓN ÚNICA
   ✓ Un insumo + una compra = máximo 1 registro en MAPEO_VINCULACION
   ✓ UNIQUE constraint: (codigo_insumo, compra_id)

3. FACTOR DE CONVERSIÓN
   ✓ Permite convertir unidades entre presupuesto y compra
   ✓ Ej: presupuesto en m² pero compra en metros lineales
   ✓ cantidad_c = cantidad_und × factor_conversion

4. AUDITORÍA
   ✓ Todo cambio se registra en historial_cambios
   ✓ Incluye: usuario, tabla, campo, valor_antes, valor_después, timestamp
   ✓ No se puede eliminar histórico

5. TRANSACCIONALIDAD
   ✓ Todas las operaciones van en transacciones
   ✓ BEGIN → Validar → UPDATE → AUDIT → COMMIT/ROLLBACK
   ✓ Fallo en cualquier paso = rollback completo
```

---

## 📐 QUERIES ÚTILES

```sql
-- Total presupuestado por partida
SELECT item_partida, SUM(parcial_p) as total_presupuesto
FROM ACUS
GROUP BY item_partida
ORDER BY item_partida;

-- Total comprado vs presupuestado (por partida)
SELECT 
  item_partida,
  SUM(parcial_p) as presupuesto,
  SUM(parcial_c) as comprado,
  SUM(parcial_c) - SUM(parcial_p) as variancia,
  ROUND(100 * (SUM(parcial_c) - SUM(parcial_p)) / SUM(parcial_p), 2) as variancia_pct
FROM ACUS
GROUP BY item_partida
ORDER BY variancia_pct DESC;

-- Insumos no vinculados
SELECT DISTINCT codigo_insumo
FROM ACUS
WHERE codigo_insumo NOT IN (
  SELECT DISTINCT codigo_insumo
  FROM MAPEO_VINCULACION
)
ORDER BY codigo_insumo;

-- Compras no vinculadas
SELECT id, detalle
FROM COMPRAS_C
WHERE id NOT IN (
  SELECT DISTINCT compra_id
  FROM MAPEO_VINCULACION
  WHERE compra_id IS NOT NULL
)
ORDER BY id;

-- Estado de cuadre por partida
SELECT 
  A.item_partida,
  COUNT(DISTINCT A.codigo_insumo) as insumos_totales,
  SUM(CASE WHEN E.estado = 'Cuadrado' THEN 1 ELSE 0 END) as cuadrados,
  SUM(CASE WHEN E.estado = 'Pendiente' THEN 1 ELSE 0 END) as pendientes,
  SUM(CASE WHEN E.estado = 'Rechazado' THEN 1 ELSE 0 END) as rechazados
FROM ACUS A
LEFT JOIN ESTADO_CUADRE_INSUMOS E ON A.codigo_insumo = E.codigo_insumo
GROUP BY A.item_partida
ORDER BY A.item_partida;
```

---

**Referencia Rápida Generada:** 21/05/2026
