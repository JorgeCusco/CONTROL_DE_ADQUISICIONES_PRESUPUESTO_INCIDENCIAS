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
    adquirido_actual = df_impacto['cantidad_adquirida'].iloc[0] if not df_impacto.empty else 0.0
    unidad_insumo = df_impacto['unidad'].iloc[0] if not df_impacto.empty else ""

    st.subheader(f"2. Cuadre Manual: {insumo_seleccionado} ({unidad_insumo})")
    
    # Input para el adquirido global
    col1, col2 = st.columns([1, 2])
    with col1:
        nuevo_adquirido = st.number_input(
            "Cantidad Total Adquirida (Dato):",
            value=float(adquirido_actual),
            min_value=0.0,
            format="%.4f",
            help="El total adquirido que debe cuadrar con la suma de las cantidades modificadas (APU 2)."
        )
    
    st.write("### 3. Edición de Incidencias (APU 2)")
    st.info("Edite la columna **CANTIDAD 2 (Incidencia)**. El sistema calculará automáticamente el Parcial 2 abajo.")
    
    # Preparamos el dataframe para el editor
    df_editor = df_impacto[['id', 'item_1', 'codigo_insumo', 'partida_desc', 'unidad', 'cantidad_1', 'metrado_fijo', 'parcial_1', 'cantidad_2']].copy()
    
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
    suma_parcial_2 = edited_df['parcial_2'].sum()
    diferencia = nuevo_adquirido - suma_parcial_2
    
    st.write("### 4. Resultados Parciales y Totales")
    
    # Crear DataFrame de visualización con los parciales y la fila de sumas
    # Replicando el metrado fijo de nuevo como pidió el usuario para el APU 2
    df_display = edited_df[['item_1', 'codigo_insumo', 'partida_desc', 'unidad', 'cantidad_1', 'metrado_fijo', 'parcial_1', 'cantidad_2', 'metrado_fijo', 'parcial_2']].copy()
    # Para poder tener dos columnas iguales en pandas, las nombramos distinto
    df_display.columns = ['Item 1', 'Código 1', 'Descripción', 'Unid.', 'Cantidad 1', 'Metrado Fijo 1', 'Parcial 1', 'Cantidad 2', 'Metrado Fijo 2', 'Parcial 2']
    
    # Fila de totales
    df_totales = pd.DataFrame([{
        'Item 1': '🟢 TOTALES',
        'Código 1': '',
        'Descripción': '',
        'Unid.': '',
        'Cantidad 1': None,
        'Metrado Fijo 1': suma_metrado,
        'Parcial 1': suma_parcial_1,
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
            "Cantidad 2": st.column_config.NumberColumn(format="%.6f"),
            "Metrado Fijo 2": st.column_config.NumberColumn(format="%.4f"),
            "Parcial 2": st.column_config.NumberColumn(format="%.4f")
        }
    )
    
    st.write("---")
    c1, c2, c3 = st.columns(3)
    c1.metric("Total Adquirido (Dato)", f"{nuevo_adquirido:.4f} {unidad_insumo}")
    c2.metric("Suma Parcial 2 (APU Nuevo)", f"{suma_parcial_2:.4f} {unidad_insumo}")
    
    if abs(diferencia) < 0.0001:
        c3.metric("Diferencia", f"{diferencia:.4f}", "¡Cuadre Exacto!")
    else:
        c3.metric("Diferencia", f"{diferencia:.4f}", f"Faltan/Sobran {diferencia:.4f}" if diferencia > 0 else f"Sobran {abs(diferencia):.4f}", delta_color="inverse")
        
    # Botón de guardar
    if st.button("💾 Guardar Cambios en PostgreSQL", type="primary"):
        try:
            engine = get_engine()
            with engine.begin() as conn:
                for _, row in edited_df.iterrows():
                    insumo_id = int(row['id'])
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
                        "adq": nuevo_adquirido,
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
            
            if st.button("Añadir a esta Partida"):
                codigo_nueva = nueva_partida.split(" - ")[0]
                
                # Insertar nuevo registro en insumos
                insert_query = text("""
                    INSERT INTO insumos (codigo_partida, descripcion, unidad, incidencia, cantidad_adquirida, cantidad_modificada)
                    VALUES (:cod, :desc, :und, 0.0, :adq, 0.0)
                """)
                try:
                    engine = get_engine()
                    with engine.begin() as conn:
                        conn.execute(insert_query, {
                            "cod": codigo_nueva,
                            "desc": insumo_seleccionado,
                            "und": unidad_insumo,
                            "adq": nuevo_adquirido
                        })
                    st.success(f"Insumo agregado exitosamente a la partida {codigo_nueva}.")
                    load_insumos_unicos.clear()
                    st.rerun()
                except Exception as e:
                    st.error(f"Error al agregar insumo: {e}")
