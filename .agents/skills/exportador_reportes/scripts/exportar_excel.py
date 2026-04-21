"""
Script: exportar_excel.py
Skill:  exportador_reportes
Propósito: Exporta el Cuadro Comparativo de Metrados a Excel (.xlsx)
           con formato profesional para sustentar adquisiciones OSCE.

Uso como módulo en Streamlit:
    from exportar_excel import generar_excel_bytes
    excel_bytes = generar_excel_bytes(df, titulo="Comparativo Abril 2026")
    st.download_button("⬇️ Descargar Excel", excel_bytes, "reporte.xlsx")

Uso CLI:
    python exportar_excel.py --csv datos.csv --salida reporte.xlsx
"""

import io
import json
import sys
import argparse
from datetime import datetime
from pathlib import Path

try:
    import pandas as pd
    PANDAS_OK = True
except ImportError:
    PANDAS_OK = False
    print("❌ pandas no instalado. Ejecuta: pip install pandas xlsxwriter", file=sys.stderr)
    sys.exit(1)

# ── Colores corporativos ──────────────────────────────────────────────────────
ESTILOS = {
    "cabecera_bg": "#1F3864", "cabecera_fg": "#FFFFFF",
    "fila_par":    "#D9E1F2", "fila_impar":  "#FFFFFF",
    "total_bg":    "#FFD966", "total_fg":    "#000000",
    "verde":       "#70AD47", "amarillo":    "#FFD966",
    "azul_claro":  "#BDD7EE",
}


def generar_excel_bytes(
    df: "pd.DataFrame",
    titulo: str = "Cuadro Comparativo de Metrados",
    filtro_especialidad: str = None,
    incluir_resumen: bool = True,
) -> bytes:
    """
    Genera un archivo Excel en memoria y retorna los bytes para Streamlit.

    Args:
        df: DataFrame con los datos. Columnas esperadas:
            codigo, descripcion, unidad,
            cant_estimada, cant_adquirida, cant_modificada
        titulo: Título del reporte (aparece en celda A1)
        filtro_especialidad: Si se provee, filtra antes de exportar
        incluir_resumen: Si True, agrega hoja de resumen por partida

    Returns:
        bytes del archivo .xlsx listo para st.download_button
    """
    if filtro_especialidad:
        if "especialidad" in df.columns:
            df = df[df["especialidad"] == filtro_especialidad].copy()

    output = io.BytesIO()

    with pd.ExcelWriter(output, engine="xlsxwriter") as writer:
        wb = writer.book

        # ── Formatos ─────────────────────────────────────────────────────────
        fmt_titulo = wb.add_format({
            "bold": True, "font_size": 14, "font_color": ESTILOS["cabecera_fg"],
            "bg_color": ESTILOS["cabecera_bg"], "align": "center", "valign": "vcenter"
        })
        fmt_cabecera = wb.add_format({
            "bold": True, "font_color": ESTILOS["cabecera_fg"],
            "bg_color": ESTILOS["cabecera_bg"], "align": "center",
            "border": 1, "text_wrap": True
        })
        fmt_num4 = wb.add_format({"num_format": "#,##0.0000", "border": 1})
        fmt_num4_par = wb.add_format({
            "num_format": "#,##0.0000", "border": 1,
            "bg_color": ESTILOS["fila_par"]
        })
        fmt_texto = wb.add_format({"border": 1})
        fmt_texto_par = wb.add_format({"border": 1, "bg_color": ESTILOS["fila_par"]})
        fmt_total = wb.add_format({
            "bold": True, "num_format": "#,##0.0000",
            "bg_color": ESTILOS["total_bg"], "border": 1
        })

        # ── Hoja 1: Cuadro Comparativo ────────────────────────────────────────
        cols_exportar = [
            "codigo", "descripcion", "unidad",
            "cant_estimada", "cant_adquirida", "cant_modificada"
        ]
        cols_presentes = [c for c in cols_exportar if c in df.columns]
        df_export = df[cols_presentes].copy()

        df_export.to_excel(writer, sheet_name="Cuadro Comparativo",
                           startrow=2, index=False)
        ws = writer.sheets["Cuadro Comparativo"]

        # Título en fila 1
        ws.merge_range(0, 0, 0, len(cols_presentes) - 1, titulo, fmt_titulo)
        ws.set_row(0, 30)
        ws.set_row(1, 6)  # espacio

        # Cabeceras y anchos
        anchos = {"codigo": 15, "descripcion": 45, "unidad": 8,
                  "cant_estimada": 18, "cant_adquirida": 18, "cant_modificada": 18}
        nombres_col = {
            "codigo": "Código", "descripcion": "Descripción",
            "unidad": "Unidad", "cant_estimada": "Cant. Estimada",
            "cant_adquirida": "Cant. Adquirida", "cant_modificada": "Cant. Modificada"
        }
        for j, col in enumerate(cols_presentes):
            ws.write(2, j, nombres_col.get(col, col), fmt_cabecera)
            ws.set_column(j, j, anchos.get(col, 14))

        # Filas con formato alternado
        cols_num = {"cant_estimada", "cant_adquirida", "cant_modificada"}
        for i, (_, fila) in enumerate(df_export.iterrows()):
            par = i % 2 == 0
            for j, col in enumerate(cols_presentes):
                val = fila[col]
                if col in cols_num:
                    ws.write_number(i + 3, j, float(val) if val else 0,
                                    fmt_num4_par if par else fmt_num4)
                else:
                    ws.write(i + 3, j, str(val) if val else "",
                             fmt_texto_par if par else fmt_texto)

        # Fila de totales
        fila_total = len(df_export) + 3
        ws.write(fila_total, 0, "TOTAL", fmt_total)
        for j, col in enumerate(cols_presentes):
            if col in cols_num:
                ws.write_formula(
                    fila_total, j,
                    f"=SUM({chr(65+j)}4:{chr(65+j)}{fila_total})",
                    fmt_total
                )

        # ── Hoja 2: Resumen por Partida (opcional) ────────────────────────────
        if incluir_resumen and "codigo_partida" in df.columns:
            resumen = df.groupby("codigo_partida").agg(
                cant_estimada=("cant_estimada", "sum"),
                cant_adquirida=("cant_adquirida", "sum"),
                cant_modificada=("cant_modificada", "sum"),
            ).reset_index()
            resumen.to_excel(writer, sheet_name="Resumen Partidas",
                             startrow=1, index=False)

        # ── Hoja 3: Metadata ──────────────────────────────────────────────────
        ws_meta = wb.add_worksheet("Metadata")
        ws_meta.write(0, 0, "Generado", fmt_cabecera)
        ws_meta.write(0, 1, datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        ws_meta.write(1, 0, "Registros", fmt_cabecera)
        ws_meta.write(1, 1, len(df_export))
        ws_meta.write(2, 0, "Especialidad", fmt_cabecera)
        ws_meta.write(2, 1, filtro_especialidad or "Todas")

    output.seek(0)
    return output.getvalue()


def main():
    parser = argparse.ArgumentParser(description="Exportador Excel — Presupuestos OFI")
    parser.add_argument("--csv", required=True, help="Archivo CSV de entrada")
    parser.add_argument("--salida", default=None, help="Nombre del archivo .xlsx de salida")
    parser.add_argument("--titulo", default="Cuadro Comparativo de Metrados")
    args = parser.parse_args()

    df = pd.read_csv(args.csv)
    excel_bytes = generar_excel_bytes(df, titulo=args.titulo)

    nombre_salida = args.salida or f"Comparativo_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    Path(nombre_salida).write_bytes(excel_bytes)
    print(f"✅ Exportado: {nombre_salida} ({len(df)} registros)")


if __name__ == "__main__":
    main()
