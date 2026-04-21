# SKILL: Optimización Matemática de Metrados

## Identidad del Skill
- **Nombre**: `optimizacion_metrados`
- **Versión**: 1.0.0
- **Autor**: Equipo Presupuestos OFI
- **Fecha**: 2026-04-21
- **Proyecto**: 7_Insumos_rado

## Propósito
Este Skill resuelve el problema de cuadrar la columna **"modificado"** de los insumos 
para que la suma de todos los parciales sea **exactamente igual** a la cantidad **"adquirida"** 
registrada en el sistema.

Ejemplo real: La "PIEDRA GRANDE DE 8" tiene una cantidad adquirida de X unidades distribuida 
entre múltiples partidas. Cada partida tiene un valor "estimado". El Skill calcula los valores 
"modificados" de forma proporcional, sin redondeo arbitrario, garantizando que la sumatoria 
sea exactamente igual al total adquirido.

## Cuándo Invocar este Skill
Invoca este Skill cuando el usuario diga frases como:
- "cuadrar los metrados"
- "ajustar los modificados"
- "distribuir proporcionalmente"
- "la suma no cierra"
- "cuadrar el insumo con lo adquirido"
- "ajustar [nombre del insumo] para que sume [cantidad]"

## Parámetros de Entrada
```json
{
  "insumo": "nombre del insumo (ej: PIEDRA GRANDE DE 8)",
  "cantidad_adquirida": 150.0,
  "partidas": [
    { "id": "OE.1.01", "estimado": 45.25 },
    { "id": "OE.2.03", "estimado": 80.10 },
    { "id": "OE.3.07", "estimado": 30.00 }
  ],
  "decimales": 4
}
```

## Parámetros de Salida
```json
{
  "insumo": "PIEDRA GRANDE DE 8",
  "cantidad_adquirida": 150.0,
  "suma_modificados": 150.0,
  "diferencia": 0.0,
  "partidas": [
    { "id": "OE.1.01", "estimado": 45.25, "modificado": 43.8920, "factor": 0.2924 },
    { "id": "OE.2.03", "estimado": 80.10, "modificado": 77.7143, "factor": 0.5174 },
    { "id": "OE.3.07", "estimado": 30.00, "modificado": 29.0937, "factor": 0.1940 }
  ],
  "metodo": "distribucion_proporcional_scipy"
}
```

## Algoritmo Principal
1. Calcula la suma total de los valores estimados → `suma_estimados`
2. Calcula el factor de escala → `factor = cantidad_adquirida / suma_estimados`
3. Aplica el factor a cada partida → `modificado_i = estimado_i * factor`
4. Usa `scipy.optimize.minimize` para minimizar el error de redondeo garantizando que `Σ modificado_i == cantidad_adquirida` exactamente
5. Valida que la diferencia sea `< 0.0001` (tolerancia de 4 decimales)

## Script Principal
```
scripts/calcular_distribucion.py
```

## Ejemplos de Uso
```
examples/ejemplo_piedra_grande.json
examples/ejemplo_cemento_portland.json
```

## Instrucciones para el Agente
1. Lee los parámetros de entrada del usuario
2. Ejecuta el script `scripts/calcular_distribucion.py` con los datos
3. Valida que `suma_modificados == cantidad_adquirida` (tolerancia 0.0001)
4. Presenta el resultado en tabla con columnas: Partida | Estimado | Modificado | Factor%
5. Si el usuario confirma, actualiza la base de datos o genera el SQL de UPDATE
6. Registra el ajuste en `resources/log_ajustes.txt`
