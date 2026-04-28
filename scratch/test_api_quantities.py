import requests
import json

r = requests.get('http://localhost:3000/api/partidas?partida=OE.2.2.4.3')
data = r.json()
for item in data:
    print(f"{item['descripcion']}: Adquirida={item['cantidad_adquirida']}, Real={item['cantidad_real']}")
