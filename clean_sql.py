import os

input_file = 'DATA_LAST/INSERT_AA.apus_detallado.sql'
output_file = 'DATA_LAST/INSERT_AA.apus_detallado_cleaned.sql'

if not os.path.exists(input_file):
    print(f"Error: {input_file} not found")
    exit(1)

print(f"Reading {input_file}...")
with open(input_file, 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("Cleaning lines...")
# Added 3 (partida_rendimiento) to numeric_offsets
numeric_offsets = [3, 5, 10, 11, 12, 13] 
cleaned_lines = []

i = 0
while i < len(lines):
    line = lines[i]
    cleaned_lines.append(line)
    if 'VALUES (' in line:
        for offset in range(1, 14):
            val_line = lines[i + offset]
            if offset in numeric_offsets:
                stripped = val_line.strip()
                if stripped in ["'-',", "'-'", "'',", "''"]:
                    indent = val_line[:val_line.find("'")]
                    comma = "," if stripped.endswith(",") else ""
                    val_line = f"{indent}0{comma}\n"
            cleaned_lines.append(val_line)
        i += 13
    i += 1

print(f"Writing to {output_file}...")
with open(output_file, 'w', encoding='utf-8') as f:
    f.writelines(cleaned_lines)

print("Done.")
