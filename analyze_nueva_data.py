import pandas as pd

def analyze_excel(file_path):
    print(f"Analizando: {file_path}")
    try:
        df = pd.read_excel(file_path)
        print(f"Total de filas: {len(df)}")
        print("\n--- COLUMNAS ENCONTRADAS ---")
        for i, col in enumerate(df.columns):
            print(f"{i}: {col}")
            
        print("\n--- EJEMPLO DE LA PRIMERA FILA ---")
        first_row = df.iloc[0].to_dict()
        for key, value in first_row.items():
            print(f"{key}: {value}")
            
    except Exception as e:
        print(f"Error al leer el archivo: {e}")

if __name__ == '__main__':
    analyze_excel('e:/00_OFI_PRESUPUESTOS_progra/7_Insumos_rado/NUEVA_DATA.xlsx')
