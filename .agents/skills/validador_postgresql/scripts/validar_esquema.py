"""
Script: validar_esquema.py
Skill:  validador_postgresql
Propósito: Valida archivos SQL contra las reglas del proyecto Presupuestos OFI.

Uso:
    python validar_esquema.py --archivo esquema.sql
    python validar_esquema.py --sql "CREATE TABLE ..."
    python validar_esquema.py --archivo migration.sql --json
"""

import re
import json
import argparse
import sys
from datetime import datetime
from pathlib import Path

COLUMNAS_CRITICAS = {
    "insumos": {
        "cantidad_estimada": "NUMERIC",
        "cantidad_adquirida": "NUMERIC",
        "cantidad_modificada": "NUMERIC",
    },
    "metrados": {"metrado": "NUMERIC"},
    "catalogo_partidas": {"codigo_partida": "TEXT"},
}

PRECISION_MINIMA = 4


def extraer_tablas(sql: str) -> dict:
    tablas = {}
    patron = re.compile(
        r'CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+["\']?(\w+)["\']?\s*\((.*?)\);',
        re.IGNORECASE | re.DOTALL
    )
    for match in patron.finditer(sql):
        nombre = match.group(1).lower()
        cuerpo = match.group(2)
        columnas = {}
        for linea in cuerpo.split('\n'):
            linea = linea.strip().rstrip(',')
            if not linea or linea.upper().startswith(('PRIMARY', 'FOREIGN', 'UNIQUE', 'CHECK', '--')):
                continue
            partes = linea.split()
            if len(partes) >= 2:
                col_nombre = partes[0].strip('"\'').lower()
                col_tipo = partes[1].upper()
                columnas[col_nombre] = col_tipo
        tablas[nombre] = columnas
    return tablas


def validar(sql: str) -> dict:
    errores = []
    advertencias = []
    tablas = extraer_tablas(sql)

    # Columnas criticas
    for tabla, cols in COLUMNAS_CRITICAS.items():
        if tabla not in tablas:
            continue
        for col, tipo_esp in cols.items():
            if col not in tablas[tabla]:
                errores.append({"linea": 0, "tipo": "columna_faltante",
                                "mensaje": f"Tabla '{tabla}' sin columna '{col}' ({tipo_esp})"})
            elif tipo_esp not in tablas[tabla][col]:
                errores.append({"linea": 0, "tipo": "tipo_incorrecto",
                                "mensaje": f"'{tabla}'.'{col}': esperado {tipo_esp}, encontrado {tablas[tabla][col]}"})

    # Precision NUMERIC
    for i, linea in enumerate(sql.split('\n'), 1):
        for m in re.finditer(r'(\w+)\s+NUMERIC\s*\(\s*\d+\s*,\s*(\d+)\s*\)', linea, re.IGNORECASE):
            if int(m.group(2)) < PRECISION_MINIMA:
                advertencias.append({"linea": i, "tipo": "precision_insuficiente",
                                     "mensaje": f"'{m.group(1)}': solo {m.group(2)} decimales, se recomiendan {PRECISION_MINIMA}"})

    # Cascade peligroso
    for i, linea in enumerate(sql.split('\n'), 1):
        if re.search(r'ON\s+DELETE\s+CASCADE', linea, re.IGNORECASE):
            advertencias.append({"linea": i, "tipo": "cascade_peligroso",
                                 "mensaje": "ON DELETE CASCADE detectado — usar ON DELETE RESTRICT en tablas principales"})

    return {
        "valido": len(errores) == 0,
        "timestamp": datetime.now().isoformat(),
        "tablas_detectadas": list(tablas.keys()),
        "errores": errores,
        "advertencias": advertencias,
        "resumen": f"{len(errores)} errores, {len(advertencias)} advertencia(s)"
    }


def main():
    parser = argparse.ArgumentParser(description="Validador SQL — Presupuestos OFI")
    grupo = parser.add_mutually_exclusive_group(required=True)
    grupo.add_argument("--archivo")
    grupo.add_argument("--sql")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    sql = Path(args.archivo).read_text(encoding="utf-8") if args.archivo else args.sql
    resultado = validar(sql)

    if args.json:
        print(json.dumps(resultado, ensure_ascii=False, indent=2))
        sys.exit(0 if resultado["valido"] else 1)

    print(f"\n{'='*55}")
    print(f"  VALIDADOR SQL — Presupuestos OFI")
    print(f"  {resultado['resumen']}")
    for e in resultado["errores"]:
        print(f"  ❌ {e['tipo']}: {e['mensaje']}")
    for a in resultado["advertencias"]:
        print(f"  ⚠️  {a['tipo']}: {a['mensaje']}")
    estado = "✅ VÁLIDO" if resultado["valido"] else "🚫 INVÁLIDO"
    print(f"  {estado}")
    print(f"{'='*55}\n")
    sys.exit(0 if resultado["valido"] else 1)


if __name__ == "__main__":
    main()
