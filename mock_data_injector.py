from database import get_engine
from sqlalchemy import text

def inject_mock_data():
    engine = get_engine()
    with engine.begin() as conn:
        # 1. Insertar Partidas de prueba
        conn.execute(text("""
            INSERT INTO partidas (codigo, descripcion, unidad, metrado_fijo) VALUES 
            ('EJ.01', 'Pintura Muros Interiores (EJEMPLO)', 'm2', 500.00),
            ('EJ.02', 'Pintura Cielo Raso (EJEMPLO)', 'm2', 300.00),
            ('EJ.03', 'Pintura Fachada Exterior (EJEMPLO)', 'm2', 400.00)
            ON CONFLICT (codigo) DO NOTHING;
        """))
        
        # 2. Eliminar insumos de ejemplo anteriores si existieran
        conn.execute(text("DELETE FROM insumos WHERE descripcion = 'Pintura Latex Blanca (EJEMPLO)';"))
        
        # 3. Insertar Insumos desbalanceados
        # El adquirido real (factura) es 60 galones, pero inicialmente el modificado está en 0
        conn.execute(text("""
            INSERT INTO insumos (
                codigo_partida, item_1, codigo_insumo, descripcion, unidad, 
                incidencia_original, parcial_original, 
                incidencia, cantidad_modificada, cantidad_adquirida
            ) VALUES
            ('EJ.01', '01.01.01', '50020001', 'Pintura Latex Blanca (EJEMPLO)', 'gal', 0.10, 50.00, 0.0, 0.0, 60.00),
            ('EJ.02', '01.01.02', '50020001', 'Pintura Latex Blanca (EJEMPLO)', 'gal', 0.05, 15.00, 0.0, 0.0, 60.00),
            ('EJ.03', '01.01.03', '50020001', 'Pintura Latex Blanca (EJEMPLO)', 'gal', 0.06, 24.00, 0.0, 0.0, 60.00);
        """))

if __name__ == '__main__':
    inject_mock_data()
    print("Datos de prueba inyectados correctamente.")
