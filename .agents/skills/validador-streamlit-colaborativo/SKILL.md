# SKILL: Validador Streamlit Colaborativo

## Identidad del Skill
- **Nombre**: `validador-streamlit-colaborativo`
- **Versión**: 1.0.0
- **Autor**: Equipo Presupuestos OFI
- **Fecha**: 2026-04-21
- **Proyecto**: 7_Insumos_rado

## Propósito
Actúa como **interceptor de diseño UI** para la aplicación Streamlit multiusuario
(6 personas en red LAN). Garantiza que **ningún componente editable** acceda
directamente a la base de datos PostgreSQL sin pasar por un formulario de confirmación,
previniendo sobrescrituras concurrentes.

## Cuándo Invocar este Skill
Este skill se activa **automáticamente** cuando el agente va a generar o editar
código Streamlit que contenga cualquiera de estas palabras clave:
- `st.data_editor`
- `tabla interactiva`
- `editar tabla`
- `agregar una tabla para`
- `formulario de ingreso`
- `guardar en base de datos`

## Regla Central — Obligatoria
> ⚠️ **TODO `st.data_editor` debe estar envuelto en `st.form()`**

### ❌ Patrón PROHIBIDO
```python
# MALO: escritura directa sin protección de concurrencia
df_editado = st.data_editor(df_insumos, key="tabla_insumos")
if df_editado is not None:
    supabase.table("insumos").upsert(df_editado.to_dict("records")).execute()
```

### ✅ Patrón OBLIGATORIO
```python
# CORRECTO: formulario protege de sobrescrituras concurrentes (6 usuarios LAN)
with st.form("form_edicion_insumos"):
    # st.form agrupa todas las interacciones y solo envía datos
    # cuando el usuario presiona el botón de confirmación.
    # Esto previene que 6 usuarios en la red LAN sobrescriban
    # la base de datos PostgreSQL al mismo tiempo.
    df_editado = st.data_editor(
        df_insumos,
        key="tabla_insumos",
        use_container_width=True,
        num_rows="dynamic"
    )
    confirmado = st.form_submit_button(
        "💾 Guardar cambios",
        type="primary",
        use_container_width=True
    )

if confirmado:
    # Solo se ejecuta cuando el usuario presiona el botón
    supabase.table("insumos").upsert(df_editado.to_dict("records")).execute()
    st.success("✅ Cambios guardados correctamente")
    st.rerun()
```

## Reglas Adicionales

### Regla 2: Nombres de formulario únicos
- Cada `st.form()` debe tener un `key` único y descriptivo
- Formato: `"form_{accion}_{tabla}"` → ej: `"form_edicion_insumos"`, `"form_nuevo_insumo"`

### Regla 3: Mensaje de feedback siempre
- Después de cada guardado → `st.success()` o `st.error()` con mensaje claro
- Si hay error de red → `st.warning("Reintentando conexión...")` y reintentar máximo 3 veces

### Regla 4: `st.spinner` en operaciones largas
```python
with st.spinner("Guardando en base de datos..."):
    resultado = supabase.table("insumos").upsert(datos).execute()
```

### Regla 5: Confirmación para operaciones destructivas
```python
# Para DELETE o cambios masivos: pedir confirmación explícita
col1, col2 = st.columns(2)
with col1:
    if st.button("🗑️ Eliminar seleccionados", type="secondary"):
        st.session_state["confirmar_eliminar"] = True

if st.session_state.get("confirmar_eliminar"):
    st.warning("⚠️ ¿Confirmar eliminación de los registros seleccionados?")
    with col2:
        if st.button("✅ Sí, eliminar", type="primary"):
            # Ejecutar eliminación
            pass
```

## Instrucciones para el Agente
1. Detecta si el código generado contiene `st.data_editor` fuera de `st.form`
2. Si detecta el patrón prohibido → REFACTORIZA automáticamente al patrón correcto
3. Agrega el comentario de protección de concurrencia en el código
4. Verifica que cada `st.form` tenga exactamente un `st.form_submit_button`
5. Verifica que los `key` de todos los formularios en la misma página sean únicos
