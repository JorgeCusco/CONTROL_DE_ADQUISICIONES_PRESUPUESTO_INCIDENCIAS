"""
Script: calcular_distribucion.py
Skill:  optimizacion_metrados
Propósito: Distribuye proporcionalmente la cantidad adquirida de un insumo
           entre sus partidas, garantizando que la suma sea EXACTAMENTE igual
           al total adquirido (tolerancia < 0.0001).

Uso:
    python calcular_distribucion.py --insumo "PIEDRA GRANDE DE 8" \
           --adquirido 150.0 --partidas "OE.1.01:45.25,OE.2.03:80.10,OE.3.07:30.00"

    O importar como módulo:
        from calcular_distribucion import distribuir_proporcional
"""

import json
import argparse
import sys
from typing import List, Dict

try:
    import numpy as np
    from scipy.optimize import minimize
    SCIPY_AVAILABLE = True
except ImportError:
    SCIPY_AVAILABLE = False
    print("⚠️  scipy no disponible. Usando distribución proporcional simple.", file=sys.stderr)


def distribuir_proporcional(
    cantidad_adquirida: float,
    partidas: List[Dict],
    decimales: int = 4
) -> Dict:
    """
    Distribuye la cantidad_adquirida de forma proporcional entre las partidas.
    
    Args:
        cantidad_adquirida: Total que debe sumar la distribución
        partidas: Lista de dicts con {'id': str, 'estimado': float}
        decimales: Número de decimales de precisión (default: 4)
    
    Returns:
        Dict con los resultados y la lista de partidas con 'modificado' calculado
    """
    if not partidas:
        raise ValueError("La lista de partidas no puede estar vacía")
    
    if cantidad_adquirida <= 0:
        raise ValueError(f"cantidad_adquirida debe ser > 0, recibido: {cantidad_adquirida}")

    suma_estimados = sum(p['estimado'] for p in partidas)
    
    if suma_estimados == 0:
        raise ValueError("La suma de estimados es 0. No se puede distribuir proporcionalmente.")

    # ── Método 1: scipy.optimize (más preciso) ─────────────────────────────────
    if SCIPY_AVAILABLE:
        estimados = np.array([p['estimado'] for p in partidas], dtype=float)
        pesos_iniciales = estimados / suma_estimados

        def objetivo(x):
            """Minimiza la desviación respecto a los pesos proporcionales."""
            return np.sum((x - pesos_iniciales) ** 2)

        def restriccion_suma(x):
            """La suma de los modificados debe ser exactamente cantidad_adquirida."""
            return np.sum(x * cantidad_adquirida) - cantidad_adquirida

        resultado = minimize(
            objetivo,
            pesos_iniciales,
            method='SLSQP',
            constraints=[{'type': 'eq', 'fun': restriccion_suma}],
            bounds=[(0, None)] * len(partidas),
            options={'ftol': 1e-10, 'maxiter': 1000}
        )

        factores = resultado.x
        modificados_raw = factores * cantidad_adquirida

    # ── Método 2: Distribución proporcional simple (fallback sin scipy) ────────
    else:
        factores = [p['estimado'] / suma_estimados for p in partidas]
        modificados_raw = [f * cantidad_adquirida for f in factores]

    # ── Redondeo con corrección del último elemento ────────────────────────────
    modificados = [round(float(m), decimales) for m in modificados_raw]
    
    # Ajusta el último elemento para que la suma sea exacta
    diferencia = round(cantidad_adquirida - sum(modificados), decimales)
    modificados[-1] = round(modificados[-1] + diferencia, decimales)

    # ── Construir resultado ────────────────────────────────────────────────────
    partidas_resultado = []
    for i, p in enumerate(partidas):
        factor_pct = (modificados[i] / cantidad_adquirida * 100) if cantidad_adquirida else 0
        partidas_resultado.append({
            "id": p['id'],
            "estimado": p['estimado'],
            "modificado": modificados[i],
            "factor": round(factores[i] if SCIPY_AVAILABLE else factores[i], 6),
            "factor_pct": round(factor_pct, 2)
        })

    suma_final = round(sum(p['modificado'] for p in partidas_resultado), decimales)
    diferencia_final = round(cantidad_adquirida - suma_final, decimales)

    return {
        "ok": abs(diferencia_final) < (10 ** -decimales),
        "insumo": None,  # Se llena desde el caller
        "cantidad_adquirida": cantidad_adquirida,
        "suma_estimados": round(suma_estimados, decimales),
        "suma_modificados": suma_final,
        "diferencia": diferencia_final,
        "partidas": partidas_resultado,
        "metodo": "scipy_slsqp" if SCIPY_AVAILABLE else "proporcional_simple"
    }


def main():
    parser = argparse.ArgumentParser(
        description="Distribuye proporcionalmente la cantidad adquirida de un insumo"
    )
    parser.add_argument("--insumo", required=True, help="Nombre del insumo")
    parser.add_argument("--adquirido", type=float, required=True, help="Cantidad adquirida total")
    parser.add_argument(
        "--partidas", required=True,
        help="Partidas en formato 'ID:estimado,ID:estimado' ej: 'OE.1.01:45.25,OE.2.03:80.10'"
    )
    parser.add_argument("--decimales", type=int, default=4, help="Precisión decimal (default: 4)")
    parser.add_argument("--json", action="store_true", help="Salida en formato JSON puro")

    args = parser.parse_args()

    # Parsear partidas
    partidas = []
    for par in args.partidas.split(","):
        partes = par.strip().split(":")
        if len(partes) != 2:
            print(f"❌ Formato inválido en partida: '{par}'. Use 'ID:estimado'", file=sys.stderr)
            sys.exit(1)
        partidas.append({"id": partes[0].strip(), "estimado": float(partes[1].strip())})

    resultado = distribuir_proporcional(args.adquirido, partidas, args.decimales)
    resultado["insumo"] = args.insumo

    if args.json:
        print(json.dumps(resultado, ensure_ascii=False, indent=2))
    else:
        print(f"\n{'='*60}")
        print(f"  DISTRIBUCIÓN: {args.insumo}")
        print(f"{'='*60}")
        print(f"  Adquirido : {args.adquirido:>15.4f}")
        print(f"  Estimado  : {resultado['suma_estimados']:>15.4f}")
        print(f"  Método    : {resultado['metodo']}")
        print(f"{'─'*60}")
        print(f"  {'Partida':<15} {'Estimado':>12} {'Modificado':>12} {'Factor%':>8}")
        print(f"  {'─'*15} {'─'*12} {'─'*12} {'─'*8}")
        for p in resultado["partidas"]:
            print(f"  {p['id']:<15} {p['estimado']:>12.4f} {p['modificado']:>12.4f} {p['factor_pct']:>7.2f}%")
        print(f"  {'─'*15} {'─'*12} {'─'*12} {'─'*8}")
        print(f"  {'TOTAL':<15} {resultado['suma_estimados']:>12.4f} {resultado['suma_modificados']:>12.4f}")
        print(f"{'='*60}")
        estado = "✅ CUADRADO" if resultado["ok"] else f"⚠️  DIFERENCIA: {resultado['diferencia']}"
        print(f"  {estado}")
        print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
