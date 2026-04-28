from database import get_engine
from sqlalchemy import text

def get_repetidos():
    engine = get_engine()
    with engine.connect() as conn:
        res = conn.execute(text("""
            SELECT detalle_compra, COUNT(*) as repeticiones, SUM(cant_c) as suma_total
            FROM compras
            WHERE detalle_compra IS NOT NULL
            GROUP BY detalle_compra
            HAVING COUNT(*) > 1
            ORDER BY repeticiones DESC, detalle_compra ASC
        """)).fetchall()
        
        with open('e:/00_OFI_PRESUPUESTOS_progra/7_Insumos_rado/repetidos_reporte.txt', 'w', encoding='utf-8') as f:
            f.write(f"REPORTE DE VALORES REPETIDOS PARA COMPROBACION MANUAL\n")
            f.write(f"Total de items repetidos: {len(res)}\n\n")
            for r in res:
                f.write(f"-> {r[0]}\n")
                f.write(f"   Aparece {r[1]} veces en la BD | Suma total de cantidades: {r[2]}\n\n")

if __name__ == '__main__':
    get_repetidos()
