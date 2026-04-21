# SKILL: Exportador de Reportes Excel

## Identidad del Skill
- **Nombre**: `exportador_reportes`
- **Versión**: 1.0.0
- **Autor**: Equipo Presupuestos OFI
- **Fecha**: 2026-04-21
- **Proyecto**: 7_Insumos_rado

## Propósito
Exporta el **"Cuadro Comparativo de Metrados"** desde la interfaz Streamlit 
a un archivo Excel (.xlsx) con formato profesional:
- Números con **4 decimales** en todas las columnas cuantitativas
- Cabeceras con **color corporativo** (azul oscuro `#1F3864`, texto blanco)
- Filas alternadas en gris claro para legibilidad
- Totales y subtotales resaltados en amarillo `#FFD966`
- Nombre del archivo con timestamp automático

## Cuándo Invocar este Skill
Invoca este Skill cuando el usuario diga:
- "exporta el reporte"
- "descarga el Excel"
- "genera el comparativo"
- "exporta el cuadro de metrados"
- "quiero el Excel de insumos"
- "exporta con formato"

## Estructura del Reporte Excel Generado

### Hoja 1: "Cuadro Comparativo"
| Columna | Formato | Ancho |
|---------|---------|-------|
| Código | TEXT | 15 |
| Descripción del Insumo | TEXT | 45 |
| Unidad | TEXT | 8 |
| Cantidad Estimada | `#,##0.0000` | 18 |
| Cantidad Adquirida | `#,##0.0000` | 18 |
| Cantidad Modificada | `#,##0.0000` | 18 |
| Diferencia | `#,##0.0000` | 15 |
| % Avance | `0.00%` | 12 |

### Hoja 2: "Resumen por Partida"
Tabla pivote agrupando insumos por código de partida con subtotales.

### Hoja 3: "Log de Ajustes"
Historial de modificaciones registradas durante la sesión.

## Parámetros de Entrada
```json
{
  "datos": "DataFrame de pandas o lista de dicts",
  "titulo": "Cuadro Comparativo de Metrados - Abril 2026",
  "filtro_especialidad": "ESTRUCTURAS",
  "incluir_hoja_resumen": true,
  "incluir_log": true,
  "nombre_archivo": "auto"  
}
```
> Si `nombre_archivo = "auto"`, se genera como: `Comparativo_Metrados_YYYYMMDD_HHMMSS.xlsx`

## Colores Corporativos
Definidos en `resources/estilos_excel.json`:
```json
{
  "cabecera_bg": "#1F3864",
  "cabecera_fg": "#FFFFFF",
  "fila_par": "#D9E1F2",
  "fila_impar": "#FFFFFF",
  "total_bg": "#FFD966",
  "total_fg": "#000000",
  "alerta_rojo": "#FF0000",
  "alerta_verde": "#70AD47"
}
```

## Script Principal
```
scripts/exportar_excel.py
```

## Instrucciones para el Agente
1. Recibe los datos del DataFrame activo en Streamlit
2. Aplica filtros si el usuario los especificó (especialidad, fecha, partida)
3. Ejecuta `scripts/exportar_excel.py` generando el archivo .xlsx
4. Valida que el archivo fue creado correctamente (tamaño > 0)
5. Informa al usuario: nombre del archivo, ruta, número de filas exportadas
6. Ofrece abrir el archivo automáticamente si está en Windows
