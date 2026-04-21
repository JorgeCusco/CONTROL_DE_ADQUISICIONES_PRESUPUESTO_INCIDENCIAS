# SKILL: Exportador Cuadro OSCE (Nivel 2)

## Identidad del Skill
- **Nombre**: `exportador-cuadro-osce`
- **Versión**: 1.0.0
- **Nivel**: 2 (avanzado — requiere pandas + XlsxWriter)
- **Autor**: Equipo Presupuestos OFI
- **Fecha**: 2026-04-21
- **Proyecto**: 7_Insumos_rado

## Propósito
Enseña al agente cómo exportar el **Cuadro Comparativo de Metrados** desde
Streamlit a Excel usando `pandas` + `XlsxWriter`, descargable directamente
desde el navegador via `st.download_button` sin crear archivos temporales en disco.

Sigue el formato requerido por OSCE para sustentación de adquisiciones.

## Cuándo Invocar este Skill
- "exporta el cuadro OSCE"
- "genera el comparativo en Excel"
- "descarga el Excel con el expediente y modificado"
- "quiero el cuadro comparativo para sustentar"
- "exportar con formato OSCE"

## Arquitectura de la Exportación

### Posicionamiento de columnas (`startcol`)
El cuadro comparativo tiene **dos bloques** de columnas separados:

| Bloque IZQUIERDO (Expediente Original) | | Bloque DERECHO (Datos Modificados) |
|---|---|---|
| Código | Descripción | Unidad | Metrado Orig. | Precio | Parcial | ← `startcol=0` |
| | | | Metrado Mod. | Incidencia | Adquirido | ← `startcol=6` |

```python
# Columnas del expediente original — van a la IZQUIERDA
df_original = df[["codigo", "descripcion", "unidad", "metrado_original", "precio_unitario", "parcial_original"]]
df_original.to_excel(writer, sheet_name="Cuadro Comparativo", startrow=3, startcol=0, index=False)

# Columnas modificadas — van a la DERECHA
df_modificado = df[["metrado_modificado", "incidencia", "cant_adquirida"]]
df_modificado.to_excel(writer, sheet_name="Cuadro Comparativo", startrow=3, startcol=6, index=False)
```

## Colores de Formato Condicional OSCE

| Sección | Color de Cabecera | Código Hex |
|---------|------------------|-----------|
| **Metrado** (Expediente) | 🟢 Verde | `#70AD47` |
| **Modificado** (Ajustado) | 🟡 Amarillo | `#FFD966` |
| **Adquirido** (Comprado) | 🔵 Azul | `#BDD7EE` |
| Cabecera general | Azul oscuro | `#1F3864` |

## Patrón de Código Completo para Streamlit

```python
import io
import pandas as pd
import streamlit as st

def exportar_cuadro_osce(df: pd.DataFrame, titulo: str) -> bytes:
    """
    Genera el Cuadro Comparativo OSCE en memoria (BytesIO).
    NUNCA crea archivos temporales en disco.
    Compatible con Streamlit Cloud y servidores Linux.
    """
    output = io.BytesIO()  # ← Exporta a memoria, no a disco

    with pd.ExcelWriter(output, engine="xlsxwriter") as writer:
        wb = writer.book
        ws = wb.add_worksheet("Cuadro Comparativo")
        writer.sheets["Cuadro Comparativo"] = ws

        # ── Formatos ─────────────────────────────────────────────
        fmt_titulo = wb.add_format({
            "bold": True, "font_size": 13,
            "bg_color": "#1F3864", "font_color": "#FFFFFF",
            "align": "center", "valign": "vcenter"
        })
        fmt_verde   = wb.add_format({"bold": True, "bg_color": "#70AD47",
                                      "font_color": "#FFFFFF", "border": 1})
        fmt_amarillo = wb.add_format({"bold": True, "bg_color": "#FFD966",
                                       "font_color": "#000000", "border": 1})
        fmt_azul    = wb.add_format({"bold": True, "bg_color": "#BDD7EE",
                                      "font_color": "#000000", "border": 1})
        fmt_num4    = wb.add_format({"num_format": "#,##0.0000", "border": 1})
        fmt_texto   = wb.add_format({"border": 1})
        fmt_total   = wb.add_format({
            "bold": True, "bg_color": "#FFD966",
            "num_format": "#,##0.0000", "border": 1
        })

        # ── Título ────────────────────────────────────────────────
        ws.merge_range(0, 0, 0, 8, titulo, fmt_titulo)
        ws.set_row(0, 30)

        # ── Cabeceras con colores diferenciados ───────────────────
        cabeceras_verde   = ["Código", "Descripción", "Unidad", "Metrado Orig."]
        cabeceras_amarillo = ["Incidencia", "Metrado Mod."]
        cabeceras_azul    = ["Adquirido"]

        for j, cab in enumerate(cabeceras_verde):
            ws.write(2, j, cab, fmt_verde)
        for j, cab in enumerate(cabeceras_amarillo, start=4):
            ws.write(2, j, cab, fmt_amarillo)
        for j, cab in enumerate(cabeceras_azul, start=6):
            ws.write(2, j, cab, fmt_azul)

        # ── Datos: bloque izquierdo (expediente original) ─────────
        cols_orig = ["codigo", "descripcion", "unidad", "metrado_original"]
        df_orig = df[cols_orig] if all(c in df.columns for c in cols_orig) else df.iloc[:, :4]
        df_orig.to_excel(writer, sheet_name="Cuadro Comparativo",
                         startrow=3, startcol=0, index=False, header=False)

        # ── Datos: bloque derecho (modificado + adquirido) ────────
        cols_mod = ["incidencia", "metrado_modificado", "cant_adquirida"]
        df_mod = df[cols_mod] if all(c in df.columns for c in cols_mod) else df.iloc[:, 4:7]
        df_mod.to_excel(writer, sheet_name="Cuadro Comparativo",
                        startrow=3, startcol=4, index=False, header=False)

        # ── Anchos de columnas ────────────────────────────────────
        ws.set_column(0, 0, 14)   # Código
        ws.set_column(1, 1, 40)   # Descripción
        ws.set_column(2, 2, 8)    # Unidad
        ws.set_column(3, 6, 16)   # Columnas numéricas

    output.seek(0)
    return output.getvalue()


# ── Integración en Streamlit ──────────────────────────────────────────────────
# Usar así en tu app.py:
#
# excel_bytes = exportar_cuadro_osce(df_insumos, "Cuadro Comparativo - Abril 2026")
# st.download_button(
#     label="⬇️ Descargar Cuadro OSCE (.xlsx)",
#     data=excel_bytes,
#     file_name=f"Cuadro_OSCE_{datetime.now().strftime('%Y%m%d')}.xlsx",
#     mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
# )
```

## Reglas del Agente
1. **Siempre usar `io.BytesIO()`** — nunca `open("archivo.xlsx", "wb")`
2. **Siempre usar `engine="xlsxwriter"`** — no openpyxl (incompatible con Streamlit Cloud)
3. **Cabeceras verde=Metrado, amarillo=Modificado, azul=Adquirido** — sin excepción
4. **Precisión 4 decimales** en todas las columnas numéricas → `"#,##0.0000"`
5. **`startcol`**: expediente a la izquierda (col 0), modificado a la derecha (col 4+)

## Script de referencia
```
scripts/exportar_cuadro_osce.py
```
