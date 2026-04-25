import streamlit as st
import pandas as pd
from database import get_dataframe, get_engine
from sqlalchemy import text

st.set_page_config(page_title="Ajuste Manual por Insumo", page_icon="⚖️", layout="wide")

st.title("⚖️ Ajuste Manual y Cuadre de Adquisiciones")
st.markdown("---")

# 1. Selector de Insumo
@st.cache_data(ttl=10)
def load_insumos_unicos():
    return get_dataframe("SELECT DISTINCT descripcion FROM insumos ORDER BY descripcion")

df_insumos_unicos = load_insumos_unicos()

if df_insumos_unicos.empty:
    st.warning("No hay insumos registrados en la base de datos.")
    st.stop()

insumo_seleccionado = st.selectbox(
    "1. Seleccione el Insumo a Cuadrar:", 
    df_insumos_unicos['descripcion'].tolist()
)

if insumo_seleccionado:
    # 2. Cargar datos del insumo
    query = """
        SELECT i.id, p.codigo as codigo_partida, i.item_1, i.codigo_insumo, p.descripcion as partida_desc, i.unidad, 
               i.incidencia_original as cantidad_1, p.metrado_fijo, i.parcial_original as parcial_1,
               i.incidencia as cantidad_2, i.cantidad_modificada, i.cantidad_adquirida
        FROM insumos i
        JOIN partidas p ON i.codigo_partida = p.codigo
        WHERE i.descripcion = %(desc)s
        ORDER BY i.codigo_partida
    """
    df_impacto = get_dataframe(query, params={"desc": insumo_seleccionado})
    
    # Asumimos que el adquirido es igual para todas las filas de este insumo
    # 2.5 Cargar Historial de Compras de la DB
    query_compras = """
        SELECT id, orden_doc as "Orden/Doc", detalle_compra as "Detalle", 
               unidad_c as "Unidad Orig.", cant_c as "Cant. Orig.", 
               COALESCE(unidad_und, unidad_c) as "Unidad", 
               COALESCE(cantidad_und, cant_c) as "Cantidad_Und",
               pu_c as "Precio Unit.", total_c as "Total", 
               observacion as "Observación"
        FROM compras 
        WHERE insumo_descripcion = %(desc)s
        ORDER BY id
    """
    df_compras = get_dataframe(query_compras, params={"desc": insumo_seleccionado})
    
    # Obtener todas las unidades registradas para el desplegable
    df_units = get_dataframe("SELECT DISTINCT unidad FROM insumos UNION SELECT DISTINCT unidad_c FROM compras WHERE unidad_c IS NOT NULL")
    lista_unidades = df_units['unidad'].dropna().tolist() if not df_units.empty else ["und"]
    
    # Forzar que la columna sea categórica para que Streamlit muestre siempre el desplegable
    if not df_compras.empty and "Unidad" in df_compras.columns:
        df_compras['Unidad'] = pd.Categorical(df_compras['Unidad'], categories=lista_unidades)
        
    unidad_insumo = df_impacto['unidad'].iloc[0] if not df_impacto.empty else ""

    st.subheader(f"2. Cuadre Manual: {insumo_seleccionado} ({unidad_insumo})")
    
    with st.expander("🛒 Cuadre Manual de Compras (Unificar Unidades)", expanded=True):
        if df_compras.empty:
            st.info("No se encontraron compras registradas para este insumo.")
            edited_compras = df_compras
        else:
            st.write("Edita la **Unidad** y la **Cantidad_Und** para unificar y cuadrar las compras. El Precio Promedio Ponderado se calculará con estos valores.")
            
            # Configurar el editor
            compras_col_config = {
                "id": None, # Ocultar id
                "Orden/Doc": st.column_config.TextColumn("Orden/Doc", disabled=True),
                "Detalle": st.column_config.TextColumn("Detalle", disabled=True),
                "Unidad Orig.": st.column_config.TextColumn("Unidad Orig.", disabled=True),
                "Cant. Orig.": st.column_config.NumberColumn("Cant. Orig.", disabled=True, format="%.4f"),
                "Unidad": st.column_config.SelectboxColumn("Unidad (Editable)", options=lista_unidades, required=True),
                "Cantidad_Und": st.column_config.NumberColumn("Cantidad_Und (Editable)", format="%.4f", required=True),
                "Precio Unit.": st.column_config.NumberColumn("Precio Unit.", disabled=True, format="%.4f"),
                "Total": st.column_config.NumberColumn("Total", disabled=True, format="%.2f"),
                "Observación": st.column_config.TextColumn("Observación", disabled=True)
            }
            
            edited_compras = st.data_editor(
                df_compras,
                column_config=compras_col_config,
                hide_index=True,
                use_container_width=True,
                key=f"editor_compras_{insumo_seleccionado}"
            )
            
            if st.button("💾 Guardar Cuadre de Compras", type="secondary"):
                try:
                    engine = get_engine()
                    with engine.begin() as conn:
                        for _, row in edited_compras.iterrows():
                            compra_id = int(row['id'])
                            nueva_und = str(row['Unidad'])
                            nueva_cant = float(row['Cantidad_Und'])
                            
                            update_query = text("""
                                UPDATE compras 
                                SET unidad_und = :und, 
                                    cantidad_und = :cant
                                WHERE id = :id
                            """)
                            conn.execute(update_query, {
                                "und": nueva_und,
                                "cant": nueva_cant,
                                "id": compra_id
                            })
                    st.success("✅ Cuadre de compras guardado en la Base de Datos.")
                except Exception as e:
                    st.error(f"Error al guardar compras: {e}")

        # Calcular totales usando Cantidad_Und válida para los cálculos
        total_adquirido_compras = edited_compras['Cantidad_Und'].sum() if not edited_compras.empty else 0.0
        suma_importe_compras = edited_compras['Total'].sum() if not edited_compras.empty else 0.0
        precio_promedio = suma_importe_compras / total_adquirido_compras if total_adquirido_compras > 0 else 0.0
        
        ca1, ca2, ca3 = st.columns(3)
        ca1.metric("Total Adquirido Válido", f"{total_adquirido_compras:,.4f}")
        ca2.metric("Suma Total (Costo)", f"S/ {suma_importe_compras:,.2f}")
        ca3.metric("Precio Promedio Ponderado", f"S/ {precio_promedio:,.4f}")
    
    st.write("### 3. Edición de Adquisición e Incidencias (APU 2)")
    st.info(f"Distribuya los **{total_adquirido_compras:,.4f}** adquiridos válidos en la **Cant. Adquirida** de cada partida y edite la **CANTIDAD 2 (Incidencia)**.")
    
    # Preparamos el dataframe para el editor
    df_editor = df_impacto[['id', 'item_1', 'codigo_insumo', 'partida_desc', 'unidad', 'cantidad_1', 'metrado_fijo', 'parcial_1', 'cantidad_adquirida', 'cantidad_2']].copy()
    
    # Configuración de columnas
    column_config = {
        "id": None, # Ocultar
        "item_1": st.column_config.TextColumn("Item 1", disabled=True),
        "codigo_insumo": st.column_config.TextColumn("Código 1", disabled=True),
        "partida_desc": st.column_config.TextColumn("Descripción 1", disabled=True),
        "unidad": st.column_config.TextColumn("Unid. 1", disabled=True),
        "cantidad_1": st.column_config.NumberColumn("Cantidad 1 (Incid.)", disabled=True, format="%.6f"),
        "metrado_fijo": st.column_config.NumberColumn("Metrado Fijo", disabled=True, format="%.4f"),
        "parcial_1": st.column_config.NumberColumn("Parcial 1", disabled=True, format="%.4f"),
        "cantidad_adquirida": st.column_config.NumberColumn("Cant. Adquirida (Editable)", format="%.4f", required=True),
        "cantidad_2": st.column_config.NumberColumn("CANTIDAD 2 (Editable)", format="%.6f", required=True)
    }
    
    edited_df = st.data_editor(
        df_editor,
        column_config=column_config,
        hide_index=True,
        use_container_width=True,
        key=f"editor_manual_{insumo_seleccionado}"
    )
    
    # Calcular cantidad modificada (Parcial 2) = Cantidad 2 * Metrado Fijo
    edited_df['parcial_2'] = edited_df['cantidad_2'] * edited_df['metrado_fijo']
    
    suma_metrado = edited_df['metrado_fijo'].sum()
    suma_parcial_1 = edited_df['parcial_1'].sum()
    suma_adquirida = edited_df['cantidad_adquirida'].sum()
    suma_parcial_2 = edited_df['parcial_2'].sum()
    diferencia = suma_adquirida - suma_parcial_2
    
    st.write("### 4. Resultados Parciales y Totales")
    
    # Crear DataFrame de visualización con los parciales y la fila de sumas
    df_display = edited_df[['item_1', 'codigo_insumo', 'partida_desc', 'unidad', 'cantidad_1', 'metrado_fijo', 'parcial_1', 'cantidad_adquirida', 'cantidad_2', 'metrado_fijo', 'parcial_2']].copy()
    df_display.columns = ['Item 1', 'Código 1', 'Descripción', 'Unid.', 'Cantidad 1', 'Metrado Fijo 1', 'Parcial 1', 'Cant. Adquirida', 'Cantidad 2', 'Metrado Fijo 2', 'Parcial 2']
    
    # Fila de totales
    df_totales = pd.DataFrame([{
        'Item 1': '🟢 TOTALES',
        'Código 1': '',
        'Descripción': '',
        'Unid.': '',
        'Cantidad 1': None,
        'Metrado Fijo 1': suma_metrado,
        'Parcial 1': suma_parcial_1,
        'Cant. Adquirida': suma_adquirida,
        'Cantidad 2': None,
        'Metrado Fijo 2': suma_metrado,
        'Parcial 2': suma_parcial_2
    }])
    
    df_final = pd.concat([df_display, df_totales], ignore_index=True)
    
    # Mostrar tabla final
    st.dataframe(
        df_final, 
        hide_index=True, 
        use_container_width=True,
        column_config={
            "Cantidad 1": st.column_config.NumberColumn(format="%.6f"),
            "Metrado Fijo 1": st.column_config.NumberColumn(format="%.4f"),
            "Parcial 1": st.column_config.NumberColumn(format="%.4f"),
            "Cant. Adquirida": st.column_config.NumberColumn(format="%.4f"),
            "Cantidad 2": st.column_config.NumberColumn(format="%.6f"),
            "Metrado Fijo 2": st.column_config.NumberColumn(format="%.4f"),
            "Parcial 2": st.column_config.NumberColumn(format="%.4f")
        }
    )
    
    st.write("---")
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Total Compras (DB)", f"{total_adquirido_compras:.4f} {unidad_insumo}")
    
    dif_distribucion = suma_adquirida - total_adquirido_compras
    c2.metric("Total Distribuido", f"{suma_adquirida:.4f} {unidad_insumo}", 
              delta="Cuadre Perfecto" if abs(dif_distribucion) < 0.0001 else f"{dif_distribucion:.4f}", 
              delta_color="normal" if abs(dif_distribucion) < 0.0001 else "inverse")
              
    c3.metric("Suma Parcial 2 (APU)", f"{suma_parcial_2:.4f} {unidad_insumo}")
    
    if abs(diferencia) < 0.0001:
        c4.metric("Diferencia (Dist. vs APU)", f"{diferencia:.4f}", "¡Cuadre Exacto!")
    else:
        c4.metric("Diferencia (Dist. vs APU)", f"{diferencia:.4f}", f"Diferencia: {diferencia:.4f}", delta_color="inverse")
        
    # Botón de guardar
    if st.button("💾 Guardar Cambios en PostgreSQL", type="primary"):
        try:
            engine = get_engine()
            with engine.begin() as conn:
                for _, row in edited_df.iterrows():
                    insumo_id = int(row['id'])
                    nueva_adquirida = float(row['cantidad_adquirida'])
                    nueva_incidencia = float(row['cantidad_2'])
                    nueva_modificada = float(row['parcial_2'])
                    
                    update_query = text("""
                        UPDATE insumos 
                        SET cantidad_modificada = :mod, 
                            incidencia = :inc,
                            cantidad_adquirida = :adq
                        WHERE id = :id
                    """)
                    conn.execute(update_query, {
                        "mod": nueva_modificada,
                        "inc": nueva_incidencia,
                        "adq": nueva_adquirida,
                        "id": insumo_id
                    })
            st.success("✅ Cambios guardados correctamente en la Base de Datos.")
            load_insumos_unicos.clear()
            st.rerun()
        except Exception as e:
            st.error(f"Error al guardar: {e}")

    st.markdown("---")
    with st.expander("➕ Crear/Agregar Insumo a Nueva Partida"):
        st.write("Si necesitas cuadrar una diferencia y quieres agregar este insumo a otra partida existente:")
        # Obtener partidas que NO tienen este insumo
        partidas_actuales = df_impacto['codigo_partida'].tolist()
        query_partidas = "SELECT codigo, descripcion FROM partidas ORDER BY codigo"
        df_todas_partidas = get_dataframe(query_partidas)
        
        # Filtrar partidas donde no esté
        df_disponibles = df_todas_partidas[~df_todas_partidas['codigo'].isin(partidas_actuales)]
        
        if df_disponibles.empty:
            st.info("Este insumo ya está asignado a todas las partidas disponibles.")
        else:
            opciones = df_disponibles['codigo'] + " - " + df_disponibles['descripcion']
            nueva_partida = st.selectbox("Seleccione la Partida a la que desea agregar el insumo:", opciones)
            
            if st.button("Registrar Insumo en esta Partida"):
                codigo_nueva = nueva_partida.split(" - ")[0]
                
                # Obtener datos base del insumo actual
                codigo_insumo_existente = str(df_impacto['codigo_insumo'].iloc[0]) if not df_impacto.empty and pd.notna(df_impacto['codigo_insumo'].iloc[0]) else ""
                item_1_existente = str(df_impacto['item_1'].iloc[0]) if not df_impacto.empty and pd.notna(df_impacto['item_1'].iloc[0]) else ""
                
                # Insertar nuevo registro en insumos
                insert_query = text("""
                    INSERT INTO insumos (
                        codigo_partida, item_1, codigo_insumo, descripcion, unidad, 
                        incidencia_original, parcial_original, 
                        incidencia, cantidad_modificada, cantidad_adquirida
                    )
                    VALUES (:cod, :itm, :cins, :desc, :und, 0.0, 0.0, 0.0, 0.0, 0.0)
                """)
                try:
                    engine = get_engine()
                    with engine.begin() as conn:
                        conn.execute(insert_query, {
                            "cod": codigo_nueva,
                            "itm": item_1_existente,
                            "cins": codigo_insumo_existente,
                            "desc": insumo_seleccionado,
                            "und": unidad_insumo
                        })
                    st.success(f"Insumo registrado exitosamente en la partida {codigo_nueva}.")
                    load_insumos_unicos.clear()
                    st.rerun()
                except Exception as e:
                    st.error(f"Error al registrar insumo: {e}")

    st.markdown("---")
    st.write("### 📥 5. Exportar Reporte")
    st.info("Descarga el cuadro comparativo exactamente como se ve arriba (APU 1 vs APU 2), perfectamente alineado para tu informe.")
    
    # Generar Excel en memoria
    import io
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df_final.to_excel(writer, sheet_name='APU_Comparativo', index=False)
        workbook = writer.book
        worksheet = writer.sheets['APU_Comparativo']
        
        # Formato básico
        header_format = workbook.add_format({
            'bold': True,
            'text_wrap': True,
            'valign': 'top',
            'fg_color': '#1F3864',
            'font_color': 'white',
            'border': 1
        })
        
        # Aplicar anchos y formato de cabecera
        for col_num, value in enumerate(df_final.columns.values):
            worksheet.write(0, col_num, value, header_format)
            worksheet.set_column(col_num, col_num, 15)
            
        worksheet.set_column('C:C', 40) # Descripción más ancha
        
    excel_data = output.getvalue()
    
    st.download_button(
        label="📥 Descargar Cuadro Comparativo en Excel (.xlsx)",
        data=excel_data,
        file_name=f"APU_Comparativo_{insumo_seleccionado.replace(' ', '_')}.xlsx",
        mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        type="primary"
    )

