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
        SELECT i.id, i.codigo_partida, p.descripcion as partida_desc, i.unidad, 
               p.metrado_fijo, i.incidencia, i.cantidad_adquirida, i.cantidad_modificada
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
            "Cantidad Total Adquirida (Para este insumo):",
            value=float(adquirido_actual),
            min_value=0.0,
            format="%.4f",
            help="El total adquirido que debe cuadrar con la suma de las cantidades modificadas."
        )
    
    st.write("### 3. Edición de Incidencias")
    st.info("Edite la columna **INCIDENCIA (Editable)**. El sistema calculará automáticamente la Cantidad Modificada (Parcial) abajo.")
    
    # Preparamos el dataframe para el editor
    df_editor = df_impacto[['id', 'codigo_partida', 'partida_desc', 'metrado_fijo', 'incidencia']].copy()
    
    # Configuración de columnas
    column_config = {
        "id": None, # Ocultar
        "codigo_partida": st.column_config.TextColumn("Código Partida", disabled=True),
        "partida_desc": st.column_config.TextColumn("Descripción Partida", disabled=True),
        "metrado_fijo": st.column_config.NumberColumn("Metrado Fijo", disabled=True, format="%.4f"),
        "incidencia": st.column_config.NumberColumn("INCIDENCIA (Editable)", format="%.6f", required=True)
    }
    
    edited_df = st.data_editor(
        df_editor,
        column_config=column_config,
        hide_index=True,
        use_container_width=True,
        key=f"editor_manual_{insumo_seleccionado}"
    )
    
    # Calcular cantidad modificada (Parcial) = Incidencia * Metrado Fijo
    edited_df['cantidad_modificada_calc'] = edited_df['incidencia'] * edited_df['metrado_fijo']
    
    suma_metrado = edited_df['metrado_fijo'].sum()
    suma_modificada = edited_df['cantidad_modificada_calc'].sum()
    diferencia = nuevo_adquirido - suma_modificada
    
    st.write("### 4. Resultados Parciales y Totales")
    
    # Crear DataFrame de visualización con los parciales y la fila de sumas
    df_display = edited_df[['codigo_partida', 'partida_desc', 'metrado_fijo', 'incidencia', 'cantidad_modificada_calc']].copy()
    df_display.columns = ['Código Partida', 'Descripción Partida', 'Metrado Fijo', 'Incidencia', 'CANTIDAD MODIFICADA (Parcial)']
    
    # Fila de totales
    df_totales = pd.DataFrame([{
        'Código Partida': '🟢 TOTALES',
        'Descripción Partida': '',
        'Metrado Fijo': suma_metrado,
        'Incidencia': None, # No sumar incidencia
        'CANTIDAD MODIFICADA (Parcial)': suma_modificada
    }])
    
    df_final = pd.concat([df_display, df_totales], ignore_index=True)
    
    # Mostrar tabla final
    st.dataframe(
        df_final, 
        hide_index=True, 
        use_container_width=True,
        column_config={
            "Metrado Fijo": st.column_config.NumberColumn(format="%.4f"),
            "Incidencia": st.column_config.NumberColumn(format="%.6f"),
            "CANTIDAD MODIFICADA (Parcial)": st.column_config.NumberColumn(format="%.4f")
        }
    )
    
    st.write("---")
    c1, c2, c3 = st.columns(3)
    c1.metric("Total Adquirido (Dato)", f"{nuevo_adquirido:.4f} {unidad_insumo}")
    c2.metric("Suma Modificada (Calculada)", f"{suma_modificada:.4f} {unidad_insumo}")
    
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
                    nueva_incidencia = float(row['incidencia'])
                    nueva_modificada = float(row['cantidad_modificada_calc'])
                    
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
