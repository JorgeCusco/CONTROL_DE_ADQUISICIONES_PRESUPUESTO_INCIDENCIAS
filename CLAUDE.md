# Sistema de Control y Ajuste de Insumos — Proyecto Rado (Belempampa)

## Stack Tecnológico
- **Frontend**: Next.js 16.2.4 + React 19 (carpeta `frontend/`)
- **Base de datos**: PostgreSQL local, DB name `7_insumos_rado`, puerto 5432
- **Credenciales DB**: user=postgres, pass=Jo.9839514500 (en `.env`)
- **ORM/Driver**: `pg` (node-postgres) via pool en `frontend/src/lib/db.ts`
- **Exportación**: ExcelJS (4 hojas: APU Comparativo, Compras, Resumen, Historial)

## Estructura del Frontend
```
frontend/src/
├── app/
│   ├── page.tsx                  # Dashboard (módulos + botón exportar)
│   ├── layout.tsx                # Sidebar con navegación
│   ├── control-insumos/page.tsx  # Módulo 1: edición de incidencias/cantidades
│   ├── ajuste-manual/page.tsx    # Módulo 2: cuadre de compras + APU2
│   └── api/
│       ├── apu/route.ts          # GET/POST APU2 por insumo
│       ├── apu-full/route.ts     # GET APU completo con rendimiento
│       ├── compras/route.ts      # GET/POST compras normalizadas
│       ├── partidas/route.ts     # GET partidas, GET/POST insumos por partida
│       ├── data/route.ts         # GET insumos únicos + unidades
│       └── exportar/route.ts     # GET Excel 4 hojas
├── components/
│   ├── ApuComparative.tsx        # Comparativo APU1 vs APU2 lado a lado
│   └── SidebarUser.tsx           # User tracking (localStorage X-Usuario header)
└── lib/
    ├── db.ts                     # Pool de conexión PostgreSQL
    └── audit.ts                  # Log de cambios → historial_cambios
```

## Tablas de la Base de Datos

### `partidas`
Partidas del presupuesto base. PK: `codigo`. Tiene `metrado_fijo`.

### `insumos`
Ingredientes por partida. Cada fila = un insumo en una partida específica.
- `codigo_partida` FK → partidas
- `incidencia_original`, `parcial_original` = APU1 (del expediente técnico, NO modificar)
- `incidencia`, `cantidad_modificada`, `cantidad_adquirida` = APU2 (editable)
- El mismo insumo (ej. CEMENTO) aparece N veces, una por partida

### `compras`
Órdenes/documentos de compra.
- `insumo_descripcion` = nombre del insumo como viene en el doc (puede no coincidir exactamente)
- `unidad_c`, `cant_c`, `pu_c` = datos originales del documento
- `unidad_und`, `cantidad_und`, `precio_und` = datos normalizados por el usuario

### `apus_detallado`
APU completo con rendimiento. Source: APUS_Extraidos_v2.csv.

### `historial_cambios`
Audit trail. Todas las modificaciones registradas.

## Reglas de Desarrollo
1. **NO alterar** `incidencia_original`, `parcial_original` — son datos del expediente técnico
2. **NO alterar** `metrado_fijo` en partidas
3. Toda operación de escritura va dentro de transaction BEGIN/COMMIT/ROLLBACK
4. Todo cambio se loggea en `historial_cambios` via `audit.ts`
5. 4 decimales en todos los cálculos numéricos

## Cálculo APU
```
APU1: incidencia_original × metrado_fijo = parcial_original  (original, inmutable)
APU2: cantidad_2 × metrado_fijo = cantidad_modificada        (editable)
Meta: Suma(cantidad_2 × metrado_fijo) ≈ Total Adquirido Válido
```

## Módulo Vinculador (PENDIENTE DE IMPLEMENTAR)
Ver sección siguiente en SISTEMA_BELEMPAMPA.md.
Nueva tabla: `mapeo_vinculacion(insumo_nombre, compra_id)` para reemplazar el text-matching actual.
El Ajuste Manual debe usar vínculos explícitos en vez de coincidir por texto.
