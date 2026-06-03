import os
import zipfile

def create_backup():
    zip_filename = 'backup_codigo_2026_06_02.zip'
    ignore_dirs = {'node_modules', '.next', '__pycache__', '.git', 'venv311'}
    ignore_files = {zip_filename, 'CONTINGENCIA.sqlite', '.env'}
    
    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk('.'):
            # Remove ignored directories to not traverse them
            dirs[:] = [d for d in dirs if d not in ignore_dirs]
            
            for file in files:
                if file in ignore_files or file.endswith('.zip') or file.endswith('.sqlite'):
                    continue
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, '.')
                zipf.write(file_path, arcname)

    print(f"Backup creado exitosamente: {zip_filename}")

if __name__ == '__main__':
    create_backup()
