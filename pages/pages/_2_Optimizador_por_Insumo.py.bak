import streamlit as st
import pandas as pd
import sys
import os
from database import get_dataframe, get_engine
from sqlalchemy import text

# --- IMPORTACIÓN DEL SKILL 1 (Motor Matemático) ---
skill_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".agents", "skills", "optimizacion_metrados", "scripts")
if skill_path not in sys.path:
    sys.path.append(skill_path)

from calcular_distribucion import distribuir_proporcional

st.set_page_config(page_title="Optimizador de Insumos", page_icon="🧮", layout="wide")

st.title("🧮 Motor Matemático Global por Insumo")
st.markdown("---")
st.info("💡 **Objetivo:** Ajustar automáticamente la *Incidencia* de un insumo en múltiples partidas para que el cuadre matemático del total adquirido sea exacto a 4 decimales, usando `scipy.optimize`.")

# 1. Filtro Global por Insumo
@st.cache_data(ttl=10) # Un ttl bajo para refrescar, o se puede quitar
def load_insumos_unicos():
    return get_dataframe("SELECT DISTINCT descripcion FROM insumos ORDER BY descripcion")

df_insumos_unicos = load_insumos_unicos()

if df_insumos_unicos.empty:
    st.warning("No hay insumos registrados en la base de datos.")
    st.stop()

insumo_seleccionado = st.selectbox(
    "Seleccione el Insumo a Cuadrar Globalmente:", 
    df_insumos_unicos['descripcion'].tolist()
)

if insumo_seleccionado:
    # Obtener todas las apariciones de este insumo cruzando con la tabla partidas
    query = """
        SELECT i.id, i.codigo_partida, p.descripcion as partida_desc, i.unidad, 
               i.incidencia, p.metrado_fijo, i.cantidad_adquirida, i.cantidad_modificada
        FROM insumos i
        JOIN partidas p ON i.codigo_partida = p.codigo
        WHERE i.descripcion = %(desc)s
        ORDER BY i.codigo_partida
    """
    df_impacto = get_dataframe(query, params={"desc": insumo_seleccionado})
    
    # Calculamos el 'estimado' actual que es lo que el motor matemático necesita
    df_impacto['estimado_actual'] = df_impacto['incidencia'] * df_impacto['metrado_fijo']
    suma_estimada = df_impacto['estimado_actual'].sum()
    
    st.write(f"### Estado actual de **{insumo_seleccionado}**")
    
    col1, col2 = st.columns(2)
    col1.metric("Cantidad de Partidas que lo usan", len(df_impacto))
    col2.metric("Suma Estimada Actual", f"{suma_estimada:.4f} {df_impacto['unidad'].iloc[0]}")
    
    st.dataframe(df_impacto[['codigo_partida', 'partida_desc', 'metrado_fijo', 'incidencia', 'estimado_actual', 'cantidad_modificada']], use_container_width=True)

    st.markdown("---")
    st.subheader("⚙️ Ejecutar Distribución Proporcional")
    
    # 2. Formulario de ejecución (Para seguridad concurrente)
    with st.form('form_optimizador'):
        cantidad_nueva_adquirida = st.number_input(
            "Ingrese el TOTAL ADQUIRIDO (El sistema distribuirá esta cantidad exactamente):", 
            min_value=0.0001, 
            value=float(suma_estimada if suma_estimada > 0 else 1.0), 
            format="%.4f"
        )
        
        submitted = st.form_submit_button('🚀 Ejecutar Cuadre y Guardar en PostgreSQL')
        
        if submitted:
            # Preparar datos para el skill
            partidas_para_skill = []
            for _, row in df_impacto.iterrows():
                # Pasamos el 'id' de la tabla insumos para saber exactamente qué fila actualizar
                partidas_para_skill.append({
                    "id": str(row['id']), 
                    "estimado": float(row['estimado_actual'])
                })
            
            try:
                # Llamada al Motor Matemático
                resultado = distribuir_proporcional(cantidad_nueva_adquirida, partidas_para_skill, decimales=4)
                
                if resultado['ok']:
                    # Actualizar Base de Datos
                    engine = get_engine()
                    with engine.begin() as conn:
                        for item in resultado['partidas']:
                            insumo_id = int(item['id'])
                            nueva_modificada = item['modificado']
                            
                            # Recuperamos el metrado_fijo para recalcular la incidencia (metrado nunca se toca)
                            metrado_fijo = df_impacto[df_impacto['id'] == insumo_id]['metrado_fijo'].iloc[0]
                            nueva_incidencia = nueva_modificada / metrado_fijo if metrado_fijo > 0 else 0
                            
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
                                "adq": cantidad_nueva_adquirida, # Actualizamos el adquirido total por referencia
                                "id": insumo_id
                            })
                    
                    st.success(f"✅ ¡Cuadre Exacto Exitoso! Método usado: {resultado['metodo']}")
                    st.info(f"El total fue repartido: Suma Modificados = {resultado['suma_modificados']:.4f} | Error/Diferencia = {resultado['diferencia']:.4f}")
                    
                    # Limpiar cache forzado y recargar para ver cambios
                    load_insumos_unicos.clear()
                    st.rerun()
                else:
                    st.error(f"⚠️ El motor matemático dejó una diferencia de {resultado['diferencia']}. Verifica los datos.")
            
            except Exception as e:
                st.error(f"Error en el cálculo: {e}")
