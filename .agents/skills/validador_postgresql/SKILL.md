# SKILL: Validador de Esquemas PostgreSQL

## Identidad del Skill
- **Nombre**: `validador_postgresql`
- **Versión**: 1.0.0
- **Autor**: Equipo Presupuestos OFI
- **Fecha**: 2026-04-21
- **Proyecto**: 7_Insumos_rado

## Propósito
Valida archivos de esquema SQL y sentencias DDL/DML antes de ejecutarlos 
contra la base de datos (PostgreSQL / Supabase). Garantiza que:
- Las tablas de presupuestos y partidas cumplan las reglas del proyecto
- No haya claves foráneas rotas
- Los tipos de dato sean correctos (especialmente NUMERIC vs TEXT para metrados)
- Las columnas obligatorias estén presentes
- Los valores numéricos tengan precisión de 4 decimales

## Cuándo Invocar este Skill
Invoca este Skill cuando el usuario diga:
- "valida este SQL"
- "revisa el esquema"
- "¿está bien este CREATE TABLE?"
- "valida antes de ejecutar"
- "verifica las tablas"
- "comprueba la migración"

## Reglas de Validación del Proyecto
Definidas en `resources/reglas_validacion.json`:

### Tablas Obligatorias
| Tabla | Descripción |
|-------|-------------|
| `catalogo_partidas` | Catálogo maestro de partidas presupuestales |
| `insumos` | Registro de insumos con cantidades |
| `adquisiciones` | Compras registradas |
| `metrados` | Planilla dinámica de metrados |

### Columnas Críticas
| Columna | Tipo Correcto | Tabla |
|---------|--------------|-------|
| `cantidad_estimada` | `NUMERIC(12,4)` | insumos |
| `cantidad_adquirida` | `NUMERIC(12,4)` | insumos |
| `cantidad_modificada` | `NUMERIC(12,4)` | insumos |
| `metrado` | `NUMERIC(12,4)` | metrados |
| `codigo_partida` | `TEXT` | catalogo_partidas |

### Restricciones de Integridad
- `cantidad_modificada` nunca puede superar `cantidad_adquirida`
- `codigo_partida` debe seguir el patrón `OE.\d+\.\d+(\.\d+)?`
- Las FK deben tener `ON DELETE RESTRICT` (no CASCADE en tablas principales)

## Parámetros de Entrada
```
Texto SQL (DDL o DML) o ruta a un archivo .sql
```

## Salida del Skill
```json
{
  "valido": false,
  "errores": [
    { "linea": 12, "tipo": "tipo_dato", "mensaje": "metrado debe ser NUMERIC(12,4), no FLOAT" },
    { "linea": 45, "tipo": "columna_faltante", "mensaje": "Falta columna 'cantidad_adquirida' en tabla 'insumos'" }
  ],
  "advertencias": [
    { "linea": 8, "tipo": "precision", "mensaje": "NUMERIC(10,2) tiene solo 2 decimales, se recomienda 4" }
  ],
  "resumen": "2 errores críticos, 1 advertencia"
}
```

## Script Principal
```
scripts/validar_esquema.py
```

## Instrucciones para el Agente
1. Recibe el texto SQL o ruta de archivo del usuario
2. Ejecuta `scripts/validar_esquema.py` con el input
3. Si hay errores críticos → muestra la lista detallada y **NO procede**
4. Si solo hay advertencias → pregunta al usuario si desea continuar
5. Si está limpio → confirma "✅ Esquema válido. Seguro para ejecutar."
6. Registra la validación en `resources/log_validaciones.txt` con timestamp
