import streamlit as st
import pandas as pd
from database import get_dataframe, get_engine
from sqlalchemy import text

st.set_page_config(page_title="Control de Insumos", page_icon="⚙️", layout="wide")

st.title("⚙️ Control de Insumos Colaborativo")
st.markdown("---")

# Obtener lista de partidas para el filtro
def load_partidas():
    return get_dataframe("SELECT codigo, descripcion FROM partidas ORDER BY codigo")

df_partidas = load_partidas()

if df_partidas.empty:
    st.warning("⚠️ No hay partidas registradas en la base de datos.")
    st.stop()

# Filtro Inicial por Partida
st.subheader("1. Selección de Partida")
opciones_partidas = df_partidas['codigo'] + " - " + df_partidas['descripcion']
partida_seleccionada = st.selectbox("Seleccione la partida a editar:", opciones_partidas)

if partida_seleccionada:
    codigo_partida = partida_seleccionada.split(" - ")[0]
    
    # Cargar insumos de la partida seleccionada
    query = "SELECT id, descripcion, unidad, incidencia, cantidad_adquirida, cantidad_modificada FROM insumos WHERE codigo_partida = %(codigo_partida)s ORDER BY id"
    df_insumos = get_dataframe(query, params={"codigo_partida": codigo_partida})
    
    if df_insumos.empty:
        st.info("No hay insumos registrados para esta partida.")
    else:
        st.subheader("2. Edición de Insumos")
        
        # OBLIGATORIO: Implementación del Skill validador-streamlit-colaborativo
        # Se envuelve st.data_editor en un formulario para evitar sobreescrituras simultáneas de los 6 usuarios en LAN
        with st.form('form_edicion_insumos'):
            st.write("Modifique las cantidades según corresponda:")
            
            # Configuración de columnas para el editor
            column_config = {
                "id": st.column_config.NumberColumn("ID", disabled=True),
                "descripcion": st.column_config.TextColumn("Descripción", disabled=True),
                "unidad": st.column_config.TextColumn("Unidad", disabled=True),
                "incidencia": st.column_config.NumberColumn("Incidencia", format="%.4f"),
                "cantidad_adquirida": st.column_config.NumberColumn("C. Adquirida", format="%.4f"),
                "cantidad_modificada": st.column_config.NumberColumn("C. Modificada", format="%.4f")
            }
            
            # El data editor permite modificar las cantidades
            edited_df = st.data_editor(
                df_insumos,
                column_config=column_config,
                hide_index=True,
                use_container_width=True,
                key=f"editor_{codigo_partida}"
            )
            
            # OBLIGATORIO: Botón de envío explícito requerido por el Skill
            submitted = st.form_submit_button('💾 Guardar Cambios en PostgreSQL')
            
            if submitted:
                # Comparamos el dataframe original con el editado para encontrar cambios
                changes_made = False
                engine = get_engine()
                
                with engine.begin() as conn:
                    for i, row in edited_df.iterrows():
                        original_row = df_insumos.iloc[i]
                        # Si hubo algún cambio en estas 3 columnas editables
                        if (row['incidencia'] != original_row['incidencia'] or 
                            row['cantidad_adquirida'] != original_row['cantidad_adquirida'] or 
                            row['cantidad_modificada'] != original_row['cantidad_modificada']):
                            
                            update_query = text("""
                                UPDATE insumos 
                                SET incidencia = :incidencia, 
                                    cantidad_adquirida = :cantidad_adquirida, 
                                    cantidad_modificada = :cantidad_modificada
                                WHERE id = :id
                            """)
                            conn.execute(update_query, {
                                "incidencia": row['incidencia'],
                                "cantidad_adquirida": row['cantidad_adquirida'],
                                "cantidad_modificada": row['cantidad_modificada'],
                                "id": row['id']
                            })
                            changes_made = True
                
                if changes_made:
                    st.success("✅ ¡Cambios guardados exitosamente en la base de datos!")
                    # Limpiar caché si es necesario, o recargar
                    st.rerun()
                else:
                    st.info("No se detectaron cambios para guardar.")
