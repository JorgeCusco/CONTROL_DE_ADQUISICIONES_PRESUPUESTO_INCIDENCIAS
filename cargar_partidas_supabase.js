const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.lwuhsendnfwxenoryuzs:Jo.9839514500@aws-1-us-east-1.pooler.supabase.com:6543/postgres'
});

async function insertarPartidas() {
  const client = await pool.connect();
  try {
    console.log('📥 INSERTANDO PARTIDAS A SUPABASE\n');
    console.log('═'.repeat(150));

    const partidas = [
  {
    "codigo": "OE.1.1.1.1",
    "descripcion": "Almacén Oficina y Caseta de Guardiania",
    "unidad": "m²",
    "metrado_fijo": 270,
    "cantidad_presupuestada": 270,
    "precio_unitario_presupuestado": 107.55,
    "total_presupuestado": 29038.5
  },
  {
    "codigo": "OE.1.1.1.6",
    "descripcion": "Servicios higienicos",
    "unidad": "m²",
    "metrado_fijo": 66,
    "cantidad_presupuestada": 66,
    "precio_unitario_presupuestado": 193.63,
    "total_presupuestado": 12779.58
  },
  {
    "codigo": "OE.1.1.1.8",
    "descripcion": "Cartel de Obra de  2.40X3.60",
    "unidad": "und",
    "metrado_fijo": 2,
    "cantidad_presupuestada": 2,
    "precio_unitario_presupuestado": 673.17,
    "total_presupuestado": 1346.34
  },
  {
    "codigo": "OE.1.1.2.3",
    "descripcion": "Energia Electrica Provisional",
    "unidad": "glb",
    "metrado_fijo": 2,
    "cantidad_presupuestada": 2,
    "precio_unitario_presupuestado": 2837.67,
    "total_presupuestado": 5675.34
  },
  {
    "codigo": "OE.1.1.2.4",
    "descripcion": "Abastecimiento Provisional de agua",
    "unidad": "glb",
    "metrado_fijo": 2,
    "cantidad_presupuestada": 2,
    "precio_unitario_presupuestado": 1467.2,
    "total_presupuestado": 2934.4
  },
  {
    "codigo": "OE.1.1.3.1.1",
    "descripcion": "Eliminación de maleza y arbustos de fácil extracción",
    "unidad": "m²",
    "metrado_fijo": 3197.42,
    "cantidad_presupuestada": 3197.42,
    "precio_unitario_presupuestado": 13.45,
    "total_presupuestado": 43005.3
  },
  {
    "codigo": "OE.1.1.3.1.2",
    "descripcion": "Traslado de material en desuso",
    "unidad": "m³",
    "metrado_fijo": 2164,
    "cantidad_presupuestada": 2164,
    "precio_unitario_presupuestado": 42.1,
    "total_presupuestado": 91104.4
  },
  {
    "codigo": "OE.1.1.3.1.3",
    "descripcion": "Limpieza del terreno",
    "unidad": "m²",
    "metrado_fijo": 4991,
    "cantidad_presupuestada": 4991,
    "precio_unitario_presupuestado": 2.75,
    "total_presupuestado": 13725.25
  },
  {
    "codigo": "OE.1.1.3.1.4",
    "descripcion": "Acarreo de material excavado a punto de carguio",
    "unidad": "m³",
    "metrado_fijo": 867,
    "cantidad_presupuestada": 867,
    "precio_unitario_presupuestado": 26.17,
    "total_presupuestado": 22689.39
  },
  {
    "codigo": "OE.1.1.3.1.5",
    "descripcion": "Eliminacion de desmonte con maquinaria",
    "unidad": "m³",
    "metrado_fijo": 802,
    "cantidad_presupuestada": 802,
    "precio_unitario_presupuestado": 34.26,
    "total_presupuestado": 27476.52
  },
  {
    "codigo": "OE.1.1.7.1",
    "descripcion": "Movilización y desmovilización de equipos",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1868.65,
    "total_presupuestado": 1868.65
  },
  {
    "codigo": "OE.1.1.7.2",
    "descripcion": "Flete Terrestre",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 59200,
    "total_presupuestado": 59200
  },
  {
    "codigo": "OE.1.1.9.1",
    "descripcion": "Trazo, niveles y replanteo preliminar",
    "unidad": "m²",
    "metrado_fijo": 3081.95,
    "cantidad_presupuestada": 3081.95,
    "precio_unitario_presupuestado": 1.21,
    "total_presupuestado": 3729.16
  },
  {
    "codigo": "OE.1.1.9.2",
    "descripcion": "Trazo y Replanteo durante el proceso",
    "unidad": "m²",
    "metrado_fijo": 5931.95,
    "cantidad_presupuestada": 5931.95,
    "precio_unitario_presupuestado": 3.92,
    "total_presupuestado": 23253.24
  },
  {
    "codigo": "OE.1.2.1.1",
    "descripcion": "Elaboracion, Implementacion y administracion del Plan de Seguridad y Salud en el Trabajo",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 3000,
    "total_presupuestado": 3000
  },
  {
    "codigo": "OE.1.2.1.2",
    "descripcion": "Equipos de Proteccion Individual",
    "unidad": "und",
    "metrado_fijo": 60,
    "cantidad_presupuestada": 60,
    "precio_unitario_presupuestado": 377.81,
    "total_presupuestado": 22668.6
  },
  {
    "codigo": "OE.1.2.1.3",
    "descripcion": "Equipos de Proteccion Colectiva",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 4497.38,
    "total_presupuestado": 4497.38
  },
  {
    "codigo": "OE.1.2.1.4",
    "descripcion": "Señalizacion Temporal de Seguridad",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 4414,
    "total_presupuestado": 4414
  },
  {
    "codigo": "OE.1.2.1.5",
    "descripcion": "Capacitacion en Seguridad y Salud",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1160.99,
    "total_presupuestado": 1160.99
  },
  {
    "codigo": "OE.1.2.1.6",
    "descripcion": "Implementos de seguridad",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 90390.5,
    "total_presupuestado": 90390.5
  },
  {
    "codigo": "OE.1.2.2.1",
    "descripcion": "Equipos de Primeros Auxilios y de Socorro",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1590.01,
    "total_presupuestado": 1590.01
  },
  {
    "codigo": "OE.1.2.2.2",
    "descripcion": "Equipos contra incendios",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 2987.35,
    "total_presupuestado": 2987.35
  },
  {
    "codigo": "OE.1.2.3.1",
    "descripcion": "Plan para la vigilancia prevención y control de COVID en el trabajo",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 2499.99,
    "total_presupuestado": 2499.99
  },
  {
    "codigo": "OE.1.2.3.2",
    "descripcion": "Equipos de Proteccion Individual -Covid19",
    "unidad": "und",
    "metrado_fijo": 60,
    "cantidad_presupuestada": 60,
    "precio_unitario_presupuestado": 71.42,
    "total_presupuestado": 4285.2
  },
  {
    "codigo": "OE.1.2.3.3",
    "descripcion": "Equipos de Proteccion Colectivo ante el COVID-19",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 2936.72,
    "total_presupuestado": 2936.72
  },
  {
    "codigo": "OE.1.2.3.4",
    "descripcion": "Señalización temporal de seguridad ante el COVID-19",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 660.8,
    "total_presupuestado": 660.8
  },
  {
    "codigo": "OE.1.2.3.5",
    "descripcion": "Servicio de Pruebas COVID - 19",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 175,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.1.2.3.6",
    "descripcion": "Implementos COVID - 19",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 4650.1,
    "total_presupuestado": 4650.1
  },
  {
    "codigo": "OE.2.1.1.1",
    "descripcion": "Excavacion con maquinaria",
    "unidad": "m³",
    "metrado_fijo": 485,
    "cantidad_presupuestada": 485,
    "precio_unitario_presupuestado": 4.75,
    "total_presupuestado": 2303.75
  },
  {
    "codigo": "OE.2.1.2.1.1",
    "descripcion": "Excavacion manual de zanjas para Zapatas",
    "unidad": "m³",
    "metrado_fijo": 133.9,
    "cantidad_presupuestada": 133.9,
    "precio_unitario_presupuestado": 43.62,
    "total_presupuestado": 5840.72
  },
  {
    "codigo": "OE.2.1.2.1.2",
    "descripcion": "Excavacion manual de zanjas para Vigas de Cimentación",
    "unidad": "m³",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 43.62,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.1.4.1",
    "descripcion": "Relleno compactado con material de prestamo",
    "unidad": "m³",
    "metrado_fijo": 2025,
    "cantidad_presupuestada": 2025,
    "precio_unitario_presupuestado": 65.58,
    "total_presupuestado": 132799.5
  },
  {
    "codigo": "OE.2.1.4.2",
    "descripcion": "Relleno compactado c/equipo con material de afirmado e=0.15m",
    "unidad": "m²",
    "metrado_fijo": 3313.3,
    "cantidad_presupuestada": 3313.3,
    "precio_unitario_presupuestado": 14.2,
    "total_presupuestado": 47048.86
  },
  {
    "codigo": "OE.2.1.5.1",
    "descripcion": "Nivelacion interior y apisonado para f.piso,patio y veredas",
    "unidad": "m²",
    "metrado_fijo": 2951.35,
    "cantidad_presupuestada": 2951.35,
    "precio_unitario_presupuestado": 4.57,
    "total_presupuestado": 13487.67
  },
  {
    "codigo": "OE.2.1.5.2",
    "descripcion": "Nivelación y compactación en área(fondo) de cimentación",
    "unidad": "m²",
    "metrado_fijo": 221.02,
    "cantidad_presupuestada": 221.02,
    "precio_unitario_presupuestado": 4.57,
    "total_presupuestado": 1010.06
  },
  {
    "codigo": "OE.2.1.6.1",
    "descripcion": "Acarreo de material excavado a punto de carguio",
    "unidad": "m³",
    "metrado_fijo": 396.58,
    "cantidad_presupuestada": 396.58,
    "precio_unitario_presupuestado": 21.81,
    "total_presupuestado": 8649.41
  },
  {
    "codigo": "OE.2.1.6.2",
    "descripcion": "Eliminacion de material excedente con maquinaria",
    "unidad": "m³",
    "metrado_fijo": 2298.76,
    "cantidad_presupuestada": 2298.76,
    "precio_unitario_presupuestado": 44.28,
    "total_presupuestado": 101789.09
  },
  {
    "codigo": "OE.2.2.2.1",
    "descripcion": "Falsa zapata, concreto=100kg/cm2 + 50% P.G",
    "unidad": "m³",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 226.92,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.2.3.1",
    "descripcion": "Solado para zapata e=0.10m, f'c=100kg/cm2",
    "unidad": "m²",
    "metrado_fijo": 113.05,
    "cantidad_presupuestada": 113.05,
    "precio_unitario_presupuestado": 45.86,
    "total_presupuestado": 5184.47
  },
  {
    "codigo": "OE.2.2.4.1",
    "descripcion": "Dado de anclaje f'c= 210 kg/cm2",
    "unidad": "und",
    "metrado_fijo": 314,
    "cantidad_presupuestada": 314,
    "precio_unitario_presupuestado": 73.62,
    "total_presupuestado": 23116.68
  },
  {
    "codigo": "OE.2.2.4.2",
    "descripcion": "Acero en dado de anclaje para cimientos de columna",
    "unidad": "kg",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 36.88,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.2.4.3",
    "descripcion": "Dado de anclaje - Acero f'y=4200 kg/cm2",
    "unidad": "kg",
    "metrado_fijo": 1217.25,
    "cantidad_presupuestada": 1217.25,
    "precio_unitario_presupuestado": 7.82,
    "total_presupuestado": 9518.9
  },
  {
    "codigo": "OE.2.3.2.1",
    "descripcion": "Zapatas - Concreto f'c=210 kg/cm2",
    "unidad": "m³",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 455.06,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.3.2.2",
    "descripcion": "Zapatas - Acero f'y=4200 kg/cm2",
    "unidad": "kg",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 7.47,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.3.3.1",
    "descripcion": "Vigas de Conexión - Concreto f'c= 210 kg/cm2",
    "unidad": "m³",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 472.79,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.3.3.2",
    "descripcion": "Vigas de Conexión  - Encofrado y desencofrado",
    "unidad": "m²",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 95.08,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.3.3.3",
    "descripcion": "Vigas de Conexión - Acero f'y=4200 kg/cm2",
    "unidad": "kg",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 7.47,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.3.7.1",
    "descripcion": "Pedestales - Concreto f'c=210 kg/cm2",
    "unidad": "m³",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 561.37,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.3.7.2",
    "descripcion": "Pedestales -  Encofrado y desencofrado",
    "unidad": "m²",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 80.89,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.3.7.3",
    "descripcion": "Pedestales - Acero f'y=4200 kg/cm2",
    "unidad": "kg",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 7.47,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.3.9.7.1",
    "descripcion": "Losa Colaborante - Concreto f'c=210 kg/cm2",
    "unidad": "m³",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 491.37,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.3.9.7.2",
    "descripcion": "Losa colaborante.- PLANCHA AD-900 calibre 22 ó equivalente",
    "unidad": "m²",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 121.64,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.3.9.7.3",
    "descripcion": "Losa Colaborante - Acero Fy=4,200 kg/cm2",
    "unidad": "kg",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 7.22,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.3.9.8.1",
    "descripcion": "Concreto f'c=210 kg/cm2 en losa",
    "unidad": "m³",
    "metrado_fijo": 205.1,
    "cantidad_presupuestada": 205.1,
    "precio_unitario_presupuestado": 472.13,
    "total_presupuestado": 96833.86
  },
  {
    "codigo": "OE.2.3.9.8.2",
    "descripcion": "Encofrado y desencofrado en losa de concreto",
    "unidad": "m²",
    "metrado_fijo": 118.54,
    "cantidad_presupuestada": 118.54,
    "precio_unitario_presupuestado": 67.78,
    "total_presupuestado": 8034.64
  },
  {
    "codigo": "OE.2.3.9.8.3",
    "descripcion": "Acero f'y=4200 kg/cm2 en losa de concreto",
    "unidad": "kg",
    "metrado_fijo": 9084.38,
    "cantidad_presupuestada": 9084.38,
    "precio_unitario_presupuestado": 7.72,
    "total_presupuestado": 70131.41
  },
  {
    "codigo": "OE.2.3.9.8.4",
    "descripcion": "Losas - Concreto Premezclado f'c=210Kg/cm2",
    "unidad": "m³",
    "metrado_fijo": 89.85,
    "cantidad_presupuestada": 89.85,
    "precio_unitario_presupuestado": 476.88,
    "total_presupuestado": 42847.67
  },
  {
    "codigo": "OE.2.3.12.1",
    "descripcion": "Cisternas -Concreto f´c=280kg/cm2",
    "unidad": "m³",
    "metrado_fijo": 4.09,
    "cantidad_presupuestada": 4.09,
    "precio_unitario_presupuestado": 683.13,
    "total_presupuestado": 2794
  },
  {
    "codigo": "OE.2.3.12.2",
    "descripcion": "Cisternas -encofrado y desencofrado",
    "unidad": "m²",
    "metrado_fijo": 116.61,
    "cantidad_presupuestada": 116.61,
    "precio_unitario_presupuestado": 105.43,
    "total_presupuestado": 12294.19
  },
  {
    "codigo": "OE.2.3.12.3",
    "descripcion": "Cisternas -Acero fy=4200 kg/cm2",
    "unidad": "kg",
    "metrado_fijo": 3877.31,
    "cantidad_presupuestada": 3877.31,
    "precio_unitario_presupuestado": 7.47,
    "total_presupuestado": 28963.51
  },
  {
    "codigo": "OE.2.3.12.4",
    "descripcion": "Cisternas -Concreto Premezclado f'c=280Kg/cm2 con impermeabilizante",
    "unidad": "m³",
    "metrado_fijo": 23.32,
    "cantidad_presupuestada": 23.32,
    "precio_unitario_presupuestado": 496.32,
    "total_presupuestado": 11574.18
  },
  {
    "codigo": "OE.2.3.13.1",
    "descripcion": "Sobrecimiento concreto 1:8+25%PM",
    "unidad": "m³",
    "metrado_fijo": 5.07,
    "cantidad_presupuestada": 5.07,
    "precio_unitario_presupuestado": 305.97,
    "total_presupuestado": 1551.27
  },
  {
    "codigo": "OE.2.3.13.2",
    "descripcion": "Encofrado y desencofrado en sobrecimiento",
    "unidad": "m²",
    "metrado_fijo": 339.5,
    "cantidad_presupuestada": 339.5,
    "precio_unitario_presupuestado": 70.35,
    "total_presupuestado": 23883.83
  },
  {
    "codigo": "OE.2.3.13.3",
    "descripcion": "Acero f'y=4200 kg/cm2 en sobrecimientos",
    "unidad": "kg",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 3.37,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.3.13.4",
    "descripcion": "Sobrecimiento Armado - Acero f'y=4200 kg/cm2",
    "unidad": "kg",
    "metrado_fijo": 413.11,
    "cantidad_presupuestada": 413.11,
    "precio_unitario_presupuestado": 7.82,
    "total_presupuestado": 3230.52
  },
  {
    "codigo": "OE.2.3.13.5",
    "descripcion": "Concreto f'c= 175 kg/cm2 en sobrecimiento armado en bloques",
    "unidad": "m³",
    "metrado_fijo": 13.6,
    "cantidad_presupuestada": 13.6,
    "precio_unitario_presupuestado": 485.28,
    "total_presupuestado": 6599.81
  },
  {
    "codigo": "OE.2.3.14.1",
    "descripcion": "Concreto f'c= 175 kg/cm2 en cimiento",
    "unidad": "m³",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 359.5,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.3.14.2",
    "descripcion": "Encofrado y desencofrado en cimiento",
    "unidad": "m²",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 296.54,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.3.14.3",
    "descripcion": "Encofrado y desencofrado en cimiento corrido",
    "unidad": "m²",
    "metrado_fijo": 354.66,
    "cantidad_presupuestada": 354.66,
    "precio_unitario_presupuestado": 51.84,
    "total_presupuestado": 18385.57
  },
  {
    "codigo": "OE.2.3.14.4",
    "descripcion": "Concreto f'c= 175 kg/cm2 + 30% P.M. en cimiento corrido",
    "unidad": "m³",
    "metrado_fijo": 97.39,
    "cantidad_presupuestada": 97.39,
    "precio_unitario_presupuestado": 495.03,
    "total_presupuestado": 48210.97
  },
  {
    "codigo": "OE.2.3.15.1",
    "descripcion": "Empedrado e= 20 cm para acceso vehicular",
    "unidad": "m²",
    "metrado_fijo": 86.11,
    "cantidad_presupuestada": 86.11,
    "precio_unitario_presupuestado": 27.53,
    "total_presupuestado": 2370.61
  },
  {
    "codigo": "OE.2.3.15.2",
    "descripcion": "Concreto de f'c=210kg/cm2 en acceso vehicular",
    "unidad": "m³",
    "metrado_fijo": 8.61,
    "cantidad_presupuestada": 8.61,
    "precio_unitario_presupuestado": 473.1,
    "total_presupuestado": 4073.39
  },
  {
    "codigo": "OE.2.3.15.3",
    "descripcion": "Encofrado y desencofrado para circulación vehicular",
    "unidad": "m²",
    "metrado_fijo": 16.02,
    "cantidad_presupuestada": 16.02,
    "precio_unitario_presupuestado": 51.84,
    "total_presupuestado": 830.48
  },
  {
    "codigo": "OE.2.3.15.4",
    "descripcion": "Acero f'y=4200 kg/cm2  en losa de circulación vehicular",
    "unidad": "kg",
    "metrado_fijo": 382.36,
    "cantidad_presupuestada": 382.36,
    "precio_unitario_presupuestado": 7.82,
    "total_presupuestado": 2990.06
  },
  {
    "codigo": "OE.2.4.1.1.1",
    "descripcion": "Columnas metalicas",
    "unidad": "kg",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 11.71,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.4.1.1.2",
    "descripcion": "Placa Base",
    "unidad": "kg",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 9,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.4.1.1.3",
    "descripcion": "Pernos 1\" (L=450mm) en placa base columnas",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 106.38,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.4.1.1.4",
    "descripcion": "Pernos 3/4\" (L=450mm) en placa base columnas",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 40.98,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.4.1.1.5",
    "descripcion": "Pernos 5/8\" (L=450mm) en placa base columnas",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 36.96,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.4.1.1.6",
    "descripcion": "Pernos ØM16 A490  (L=400mm) en placa base columnas",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 42.62,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.4.1.1.7",
    "descripcion": "Placa Base Inc. Pernos de anclaje",
    "unidad": "und",
    "metrado_fijo": 348,
    "cantidad_presupuestada": 348,
    "precio_unitario_presupuestado": 161.35,
    "total_presupuestado": 56149.8
  },
  {
    "codigo": "OE.2.4.1.1.8",
    "descripcion": "Armado Columnas metálicas 150x100x4mm (L=6m)",
    "unidad": "kg",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 11.24,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.4.1.1.9",
    "descripcion": "Montaje de Columnas metálicas 3mm (L=6m)",
    "unidad": "kg",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 3.85,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.4.1.1.10",
    "descripcion": "Armado de Columnas metálicas 100x100x3mm",
    "unidad": "m",
    "metrado_fijo": 1322.4,
    "cantidad_presupuestada": 1322.4,
    "precio_unitario_presupuestado": 65.83,
    "total_presupuestado": 87053.59
  },
  {
    "codigo": "OE.2.4.1.1.11",
    "descripcion": "Montaje de Columnas metálicas 100x100x3mm",
    "unidad": "m",
    "metrado_fijo": 1322.4,
    "cantidad_presupuestada": 1322.4,
    "precio_unitario_presupuestado": 23.59,
    "total_presupuestado": 31195.42
  },
  {
    "codigo": "OE.2.4.2.1.1",
    "descripcion": "Vigas Metalicas",
    "unidad": "kg",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 10.99,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.4.2.2.1",
    "descripcion": "Plancha Metalica",
    "unidad": "kg",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 6.87,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.4.2.2.2.1",
    "descripcion": "Pernos 1/2\"",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 4.51,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.4.2.2.2.2",
    "descripcion": "Pernos 5/8\"",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 7.69,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.4.2.2.2.3",
    "descripcion": "Pernos 3/4\"",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 11.15,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.4.2.2.2.4",
    "descripcion": "Pernos 7/8\"",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 15.45,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.4.2.2.2.5",
    "descripcion": "Plancha Metalica Inc.Pernos de sujeción",
    "unidad": "und",
    "metrado_fijo": 348,
    "cantidad_presupuestada": 348,
    "precio_unitario_presupuestado": 82.04,
    "total_presupuestado": 28549.92
  },
  {
    "codigo": "OE.2.4.2.2.2.6",
    "descripcion": "Armado vigas metálicas e= 3mm",
    "unidad": "m",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 205.78,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.4.2.2.2.7",
    "descripcion": "Montaje vigas metálicas e=3mm",
    "unidad": "m",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 75.26,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.4.2.2.2.8",
    "descripcion": "Armado vigas metálicas de 100x50x3mm",
    "unidad": "m",
    "metrado_fijo": 926.33,
    "cantidad_presupuestada": 926.33,
    "precio_unitario_presupuestado": 209.84,
    "total_presupuestado": 194381.09
  },
  {
    "codigo": "OE.2.4.2.2.2.9",
    "descripcion": "Montaje vigas metálicas de 100x50x3mm",
    "unidad": "m",
    "metrado_fijo": 926.33,
    "cantidad_presupuestada": 926.33,
    "precio_unitario_presupuestado": 42.47,
    "total_presupuestado": 39341.24
  },
  {
    "codigo": "OE.2.4.3.1",
    "descripcion": "Tijeral Metalico - caseta TM-Ca",
    "unidad": "kg",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 8.65,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.4.3.1.1.1",
    "descripcion": "Plancha Metalica-Espesor de 6mm",
    "unidad": "kg",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 6.87,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.4.4.1.1",
    "descripcion": "Armado de Tijeral metalico Tipo 01 L=7.00 m",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 2189.96,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.4.4.1.2",
    "descripcion": "Armado de Tijeral metalico Tipo 02 L=6.00 m",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 2124.76,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.4.4.1.3",
    "descripcion": "Armado de Tijeral metalico Tipo 03 L=3.50 m",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 1328.25,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.4.4.1.4",
    "descripcion": "Armado de Tijeral metalico Tipo 04 L=3.10 m",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 1305.58,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.4.4.1.5",
    "descripcion": "Armado de Tijeral metalico Tipo 05 L=3.00 m",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 1342.39,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.4.4.1.6",
    "descripcion": "Armado de Tijeral metalico Tipo 06 L=2.60 m",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 1264.39,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.4.4.1.7",
    "descripcion": "Armado de Tijeral metalico Tipo 07 L=1.90 m",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 1227.58,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.4.4.1.8",
    "descripcion": "Armado de Tijeral metalico Tipo 08 L=1.30 m",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 1114.76,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.4.4.1.9",
    "descripcion": "Armado de Tijeral metálico Tipo 09 L=3.70 m",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 1354.87,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.4.4.1.10",
    "descripcion": "Armado de Tijeral metálico Tipo 10",
    "unidad": "und",
    "metrado_fijo": 14,
    "cantidad_presupuestada": 14,
    "precio_unitario_presupuestado": 1175.64,
    "total_presupuestado": 16458.96
  },
  {
    "codigo": "OE.2.4.4.1.11",
    "descripcion": "Armado de Tijeral metálico Tipo 11",
    "unidad": "und",
    "metrado_fijo": 14,
    "cantidad_presupuestada": 14,
    "precio_unitario_presupuestado": 1120.67,
    "total_presupuestado": 15689.38
  },
  {
    "codigo": "OE.2.4.4.1.12",
    "descripcion": "Armado de Tijeral metálico Tipo 12",
    "unidad": "und",
    "metrado_fijo": 42,
    "cantidad_presupuestada": 42,
    "precio_unitario_presupuestado": 1096.75,
    "total_presupuestado": 46063.5
  },
  {
    "codigo": "OE.2.4.4.1.13",
    "descripcion": "Armado de Tijeral metálico Tipo 13",
    "unidad": "und",
    "metrado_fijo": 14,
    "cantidad_presupuestada": 14,
    "precio_unitario_presupuestado": 1084.13,
    "total_presupuestado": 15177.82
  },
  {
    "codigo": "OE.2.4.4.1.14",
    "descripcion": "Armado de Tijeral metálico Tipo 14",
    "unidad": "und",
    "metrado_fijo": 12,
    "cantidad_presupuestada": 12,
    "precio_unitario_presupuestado": 1160.96,
    "total_presupuestado": 13931.52
  },
  {
    "codigo": "OE.2.4.4.1.15",
    "descripcion": "Armado de Tijeral metálico Tipo 15",
    "unidad": "und",
    "metrado_fijo": 3,
    "cantidad_presupuestada": 3,
    "precio_unitario_presupuestado": 611.35,
    "total_presupuestado": 1834.05
  },
  {
    "codigo": "OE.2.4.4.1.16",
    "descripcion": "Armado de Tijeral metálico Tipo 16",
    "unidad": "und",
    "metrado_fijo": 2,
    "cantidad_presupuestada": 2,
    "precio_unitario_presupuestado": 610.27,
    "total_presupuestado": 1220.54
  },
  {
    "codigo": "OE.2.4.4.1.17",
    "descripcion": "Armado de Tijeral metálico Tipo 17",
    "unidad": "und",
    "metrado_fijo": 3,
    "cantidad_presupuestada": 3,
    "precio_unitario_presupuestado": 1322.46,
    "total_presupuestado": 3967.38
  },
  {
    "codigo": "OE.2.4.4.1.18",
    "descripcion": "Armado de Tijeral metálico Tipo 18",
    "unidad": "und",
    "metrado_fijo": 4,
    "cantidad_presupuestada": 4,
    "precio_unitario_presupuestado": 1355.28,
    "total_presupuestado": 5421.12
  },
  {
    "codigo": "OE.2.4.4.1.19",
    "descripcion": "Armado de Tijeral metálico Tipo 19",
    "unidad": "und",
    "metrado_fijo": 12,
    "cantidad_presupuestada": 12,
    "precio_unitario_presupuestado": 339.34,
    "total_presupuestado": 4072.08
  },
  {
    "codigo": "OE.2.4.4.1.20",
    "descripcion": "Armado de Tijeral metálico Tipo 20",
    "unidad": "und",
    "metrado_fijo": 21,
    "cantidad_presupuestada": 21,
    "precio_unitario_presupuestado": 379.02,
    "total_presupuestado": 7959.42
  },
  {
    "codigo": "OE.2.4.4.1.21",
    "descripcion": "Armado de Tijeral metálico Tipo 21",
    "unidad": "und",
    "metrado_fijo": 13,
    "cantidad_presupuestada": 13,
    "precio_unitario_presupuestado": 407.6,
    "total_presupuestado": 5298.8
  },
  {
    "codigo": "OE.2.4.4.1.22",
    "descripcion": "Armado de Tijeral metálico Tipo 22",
    "unidad": "und",
    "metrado_fijo": 5,
    "cantidad_presupuestada": 5,
    "precio_unitario_presupuestado": 1267.17,
    "total_presupuestado": 6335.85
  },
  {
    "codigo": "OE.2.4.4.1.23",
    "descripcion": "Armado de Tijeral metálico Tipo 23",
    "unidad": "und",
    "metrado_fijo": 2,
    "cantidad_presupuestada": 2,
    "precio_unitario_presupuestado": 843.1,
    "total_presupuestado": 1686.2
  },
  {
    "codigo": "OE.2.4.4.1.24",
    "descripcion": "Armado de Tijeral metálico Tipo 24",
    "unidad": "und",
    "metrado_fijo": 4,
    "cantidad_presupuestada": 4,
    "precio_unitario_presupuestado": 1756.24,
    "total_presupuestado": 7024.96
  },
  {
    "codigo": "OE.2.4.4.1.25",
    "descripcion": "Armado de Tijeral metálico Tipo 25",
    "unidad": "und",
    "metrado_fijo": 5,
    "cantidad_presupuestada": 5,
    "precio_unitario_presupuestado": 475.22,
    "total_presupuestado": 2376.1
  },
  {
    "codigo": "OE.2.4.4.1.26",
    "descripcion": "Armado de Tijeral metálico Tipo 26",
    "unidad": "und",
    "metrado_fijo": 3,
    "cantidad_presupuestada": 3,
    "precio_unitario_presupuestado": 622.39,
    "total_presupuestado": 1867.17
  },
  {
    "codigo": "OE.2.4.4.1.27",
    "descripcion": "Armado de Tijeral metálico Tipo 27",
    "unidad": "und",
    "metrado_fijo": 2,
    "cantidad_presupuestada": 2,
    "precio_unitario_presupuestado": 800.59,
    "total_presupuestado": 1601.18
  },
  {
    "codigo": "OE.2.4.4.1.28",
    "descripcion": "Armado de estructura metálica para cobertura de muro existente",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 3149.41,
    "total_presupuestado": 3149.41
  },
  {
    "codigo": "OE.2.4.4.1.29",
    "descripcion": "Armado de Tijeral metálico puerta - techo",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 991.81,
    "total_presupuestado": 991.81
  },
  {
    "codigo": "OE.2.4.4.2.1",
    "descripcion": "Montaje de Tijerales metálicos Tipo 01 L=7.00 m",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 493.89,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.4.4.2.2",
    "descripcion": "Montaje de Tijerales metálicos Tipo 02 L=6.00 m",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 483.71,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.4.4.2.3",
    "descripcion": "Montaje de Tijerales metálicos Tipo 03 L=3.50 m",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 306.21,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.4.4.2.4",
    "descripcion": "Montaje de Tijerales metálicos Tipo 04 L=3.10 m",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 342.26,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.4.4.2.5",
    "descripcion": "Montaje de Tijerales metálicos Tipo 05 L=3.00 m",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 342.26,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.4.4.2.6",
    "descripcion": "Montaje de Tijerales metálicos Tipo 06 L=2.60 m",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 225.02,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.4.4.2.7",
    "descripcion": "Montaje de Tijerales metálicos Tipo 07 L=1.90 m",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 225.02,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.4.4.2.8",
    "descripcion": "Montaje de Tijerales metálicos Tipo 08 L=1.30 m",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 194.7,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.4.4.2.9",
    "descripcion": "Montaje de Tijeral metálico Tipo 09 L=3.70 m",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 283.74,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.4.4.2.10",
    "descripcion": "Montaje de Tijeral metálico Tipo 10",
    "unidad": "und",
    "metrado_fijo": 14,
    "cantidad_presupuestada": 14,
    "precio_unitario_presupuestado": 418.39,
    "total_presupuestado": 5857.46
  },
  {
    "codigo": "OE.2.4.4.2.11",
    "descripcion": "Montaje de Tijeral metálico Tipo 11",
    "unidad": "und",
    "metrado_fijo": 14,
    "cantidad_presupuestada": 14,
    "precio_unitario_presupuestado": 415.68,
    "total_presupuestado": 5819.52
  },
  {
    "codigo": "OE.2.4.4.2.12",
    "descripcion": "Montaje de Tijeral metálico Tipo 12",
    "unidad": "und",
    "metrado_fijo": 42,
    "cantidad_presupuestada": 42,
    "precio_unitario_presupuestado": 413.09,
    "total_presupuestado": 17349.78
  },
  {
    "codigo": "OE.2.4.4.2.13",
    "descripcion": "Montaje de Tijeral metálico Tipo 13",
    "unidad": "und",
    "metrado_fijo": 14,
    "cantidad_presupuestada": 14,
    "precio_unitario_presupuestado": 413.12,
    "total_presupuestado": 5783.68
  },
  {
    "codigo": "OE.2.4.4.2.14",
    "descripcion": "Montaje de Tijeral metálico Tipo 14",
    "unidad": "und",
    "metrado_fijo": 12,
    "cantidad_presupuestada": 12,
    "precio_unitario_presupuestado": 420.68,
    "total_presupuestado": 5048.16
  },
  {
    "codigo": "OE.2.4.4.2.15",
    "descripcion": "Montaje de Tijeral metálico Tipo 15",
    "unidad": "und",
    "metrado_fijo": 3,
    "cantidad_presupuestada": 3,
    "precio_unitario_presupuestado": 248.13,
    "total_presupuestado": 744.39
  },
  {
    "codigo": "OE.2.4.4.2.16",
    "descripcion": "Montaje de Tijeral metálico Tipo 16",
    "unidad": "und",
    "metrado_fijo": 2,
    "cantidad_presupuestada": 2,
    "precio_unitario_presupuestado": 248.04,
    "total_presupuestado": 496.08
  },
  {
    "codigo": "OE.2.4.4.2.17",
    "descripcion": "Montaje de Tijeral metálico Tipo 17",
    "unidad": "und",
    "metrado_fijo": 3,
    "cantidad_presupuestada": 3,
    "precio_unitario_presupuestado": 602.29,
    "total_presupuestado": 1806.87
  },
  {
    "codigo": "OE.2.4.4.2.18",
    "descripcion": "Montaje de Tijeral metálico Tipo 18",
    "unidad": "und",
    "metrado_fijo": 4,
    "cantidad_presupuestada": 4,
    "precio_unitario_presupuestado": 605.62,
    "total_presupuestado": 2422.48
  },
  {
    "codigo": "OE.2.4.4.2.19",
    "descripcion": "Montaje de Tijeral metálico Tipo 19",
    "unidad": "und",
    "metrado_fijo": 12,
    "cantidad_presupuestada": 12,
    "precio_unitario_presupuestado": 264,
    "total_presupuestado": 3168
  },
  {
    "codigo": "OE.2.4.4.2.20",
    "descripcion": "Montaje de Tijeral metálico Tipo 20",
    "unidad": "und",
    "metrado_fijo": 21,
    "cantidad_presupuestada": 21,
    "precio_unitario_presupuestado": 225.88,
    "total_presupuestado": 4743.48
  },
  {
    "codigo": "OE.2.4.4.2.21",
    "descripcion": "Montaje de Tijeral metálico Tipo 21",
    "unidad": "und",
    "metrado_fijo": 13,
    "cantidad_presupuestada": 13,
    "precio_unitario_presupuestado": 229.32,
    "total_presupuestado": 2981.16
  },
  {
    "codigo": "OE.2.4.4.2.22",
    "descripcion": "Montaje de Tijeral metálico Tipo 22",
    "unidad": "und",
    "metrado_fijo": 5,
    "cantidad_presupuestada": 5,
    "precio_unitario_presupuestado": 432.21,
    "total_presupuestado": 2161.05
  },
  {
    "codigo": "OE.2.4.4.2.23",
    "descripcion": "Montaje de Tijeral metálico Tipo 23",
    "unidad": "und",
    "metrado_fijo": 2,
    "cantidad_presupuestada": 2,
    "precio_unitario_presupuestado": 397.77,
    "total_presupuestado": 795.54
  },
  {
    "codigo": "OE.2.4.4.2.24",
    "descripcion": "Montaje de Tijeral metálico Tipo 24",
    "unidad": "und",
    "metrado_fijo": 4,
    "cantidad_presupuestada": 4,
    "precio_unitario_presupuestado": 629.58,
    "total_presupuestado": 2518.32
  },
  {
    "codigo": "OE.2.4.4.2.25",
    "descripcion": "Montaje de Tijeral metálico Tipo 25",
    "unidad": "und",
    "metrado_fijo": 5,
    "cantidad_presupuestada": 5,
    "precio_unitario_presupuestado": 236.75,
    "total_presupuestado": 1183.75
  },
  {
    "codigo": "OE.2.4.4.2.26",
    "descripcion": "Montaje de Tijeral metálico Tipo 26",
    "unidad": "und",
    "metrado_fijo": 3,
    "cantidad_presupuestada": 3,
    "precio_unitario_presupuestado": 248.95,
    "total_presupuestado": 746.85
  },
  {
    "codigo": "OE.2.4.4.2.27",
    "descripcion": "Montaje de Tijeral metálico Tipo 27",
    "unidad": "und",
    "metrado_fijo": 2,
    "cantidad_presupuestada": 2,
    "precio_unitario_presupuestado": 278.25,
    "total_presupuestado": 556.5
  },
  {
    "codigo": "OE.2.4.4.2.28",
    "descripcion": "Montaje de estructura metálica para cobertura de muro existente",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 728.91,
    "total_presupuestado": 728.91
  },
  {
    "codigo": "OE.2.4.4.2.29",
    "descripcion": "Montaje de tijeral metalico puerta - techo",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 438.6,
    "total_presupuestado": 438.6
  },
  {
    "codigo": "OE.2.4.4.1",
    "descripcion": "Correas metalicas de 75x75x3mm",
    "unidad": "kg",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 8.27,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.4.4.2",
    "descripcion": "Correas metalicas de 50x50x3mm",
    "unidad": "m",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 54.48,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.4.4.3",
    "descripcion": "Correas metalicas de 50x50x2mm",
    "unidad": "m",
    "metrado_fijo": 3163.07,
    "cantidad_presupuestada": 3163.07,
    "precio_unitario_presupuestado": 37.96,
    "total_presupuestado": 120070.14
  },
  {
    "codigo": "OE.2.6.1.1",
    "descripcion": "Arriostramiento metalico",
    "unidad": "kg",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 12.4,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.6.1.2",
    "descripcion": "Plancha estriada de 1.20x2.40, e=1/8\"",
    "unidad": "und",
    "metrado_fijo": 18,
    "cantidad_presupuestada": 18,
    "precio_unitario_presupuestado": 1142.47,
    "total_presupuestado": 20564.46
  },
  {
    "codigo": "OE.2.6.1.3",
    "descripcion": "Parantes metalicos para contramarcos perfil 50x50x3.00mm",
    "unidad": "und",
    "metrado_fijo": 140,
    "cantidad_presupuestada": 140,
    "precio_unitario_presupuestado": 130.9,
    "total_presupuestado": 18326
  },
  {
    "codigo": "OE.2.6.2.1",
    "descripcion": "Perfiles",
    "unidad": "kg",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 8.5,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.6.2.2",
    "descripcion": "Placa Base e=16mm",
    "unidad": "kg",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 10.42,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.6.2.3",
    "descripcion": "Refuerzo en la base e=6mm",
    "unidad": "kg",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 8.71,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.6.3.1",
    "descripcion": "Acero Ø 1/2\" LISO",
    "unidad": "m",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 14.79,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.6.3.2",
    "descripcion": "Conexión de tirantes  L64x64x7.9",
    "unidad": "m",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 53.37,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.6.3.3",
    "descripcion": "Angulo 2.5X2.5X3/16\"",
    "unidad": "m",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 50.34,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.6.4.1",
    "descripcion": "Pintura a base de resinas epoxi para protección anticorrosión",
    "unidad": "m²",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 16.18,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.6.5.1",
    "descripcion": "Verificación de Capacidad Portante",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 737.77,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.6.5.2",
    "descripcion": "Diseño de Mezclas",
    "unidad": "und",
    "metrado_fijo": 2,
    "cantidad_presupuestada": 2,
    "precio_unitario_presupuestado": 450,
    "total_presupuestado": 900
  },
  {
    "codigo": "OE.2.6.5.3",
    "descripcion": "Ensayos de Compactación de Suelos",
    "unidad": "und",
    "metrado_fijo": 6,
    "cantidad_presupuestada": 6,
    "precio_unitario_presupuestado": 65,
    "total_presupuestado": 390
  },
  {
    "codigo": "OE.2.6.5.4",
    "descripcion": "Rotura de Briquetas de concreto",
    "unidad": "und",
    "metrado_fijo": 24,
    "cantidad_presupuestada": 24,
    "precio_unitario_presupuestado": 50,
    "total_presupuestado": 1200
  },
  {
    "codigo": "OE.2.6.5.5",
    "descripcion": "Pruebas de soldadura",
    "unidad": "und",
    "metrado_fijo": 52,
    "cantidad_presupuestada": 52,
    "precio_unitario_presupuestado": 29.77,
    "total_presupuestado": 1548.04
  },
  {
    "codigo": "OE.2.6.6.1",
    "descripcion": "Curado y Protección de Concreto en Obra con Plástico",
    "unidad": "mes",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 655.85,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.6.6.2",
    "descripcion": "Curado y Protección de Concreto",
    "unidad": "m²",
    "metrado_fijo": 2658.38,
    "cantidad_presupuestada": 2658.38,
    "precio_unitario_presupuestado": 3.61,
    "total_presupuestado": 9596.75
  },
  {
    "codigo": "OE.2.6.7.1",
    "descripcion": "Cerco perimetricos de rejas metalicas",
    "unidad": "m",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 554.69,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.2.6.7.2",
    "descripcion": "Cerco de reja metálica",
    "unidad": "m",
    "metrado_fijo": 60.2,
    "cantidad_presupuestada": 60.2,
    "precio_unitario_presupuestado": 349.13,
    "total_presupuestado": 21017.63
  },
  {
    "codigo": "OE.3.1.10.1",
    "descripcion": "MURO CON EL SISTEMA DRYWALL DOS CARAS",
    "unidad": "m²",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 141.45,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.1.10.2",
    "descripcion": "CERCO PREFABRICADO DE CONCRETO TIPO PLACA H=3.00M.",
    "unidad": "m",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 287,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.1.10.3",
    "descripcion": "MURO SISTEMA DRYWALL CON LAMINA DE PLOMO e=2mm",
    "unidad": "m²",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 754.11,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.1.10.4",
    "descripcion": "TABIQUE DE DOS CARAS CON UNA PLANCHA DE FIBROCEMENTO SUPERBOARD PRO 12.7 mm",
    "unidad": "m²",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 110.95,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.1.10.5",
    "descripcion": "Tabique de Fibrocemento de 6mm (Interiores) Y Fibrocemento de 12 MM( Exterior) perfil 65 mm E=9.04 PN-MODO 02",
    "unidad": "m²",
    "metrado_fijo": 2092.08,
    "cantidad_presupuestada": 2092.08,
    "precio_unitario_presupuestado": 145.81,
    "total_presupuestado": 305046.18
  },
  {
    "codigo": "OE.3.1.10.6",
    "descripcion": "Tabique de Fibrocemento dos caras de 6 mm (interiores)",
    "unidad": "m²",
    "metrado_fijo": 1690.24,
    "cantidad_presupuestada": 1690.24,
    "precio_unitario_presupuestado": 159.52,
    "total_presupuestado": 269627.08
  },
  {
    "codigo": "OE.3.1.10.7",
    "descripcion": "Recubrimiento de elementos estructurales con fibrocemento de 6mm",
    "unidad": "m²",
    "metrado_fijo": 163.24,
    "cantidad_presupuestada": 163.24,
    "precio_unitario_presupuestado": 48.5,
    "total_presupuestado": 7917.14
  },
  {
    "codigo": "OE.3.1.10.8",
    "descripcion": "Muro sistema de fibrocemento con lamina de plomo e=3mm",
    "unidad": "m²",
    "metrado_fijo": 51.97,
    "cantidad_presupuestada": 51.97,
    "precio_unitario_presupuestado": 1267.69,
    "total_presupuestado": 65881.85
  },
  {
    "codigo": "OE.3.1.10.9",
    "descripcion": "Recubrimiento de elementos estructurales con fibrocemento de 12mm",
    "unidad": "m²",
    "metrado_fijo": 330.16,
    "cantidad_presupuestada": 330.16,
    "precio_unitario_presupuestado": 169.27,
    "total_presupuestado": 55886.18
  },
  {
    "codigo": "OE.3.1.10.10",
    "descripcion": "Recubrimiento de derrames con fibrocemento de 12mm e=12cm",
    "unidad": "m",
    "metrado_fijo": 1604.76,
    "cantidad_presupuestada": 1604.76,
    "precio_unitario_presupuestado": 10.76,
    "total_presupuestado": 17267.22
  },
  {
    "codigo": "O.E.3.1.11.1",
    "descripcion": "Mamposteria en piedra",
    "unidad": "m²",
    "metrado_fijo": 8.24,
    "cantidad_presupuestada": 8.24,
    "precio_unitario_presupuestado": 136.04,
    "total_presupuestado": 1120.97
  },
  {
    "codigo": "OE.3.3.6.1",
    "descripcion": "FALSO CIELORRASO (BALDOSA DE FIBRA MINERAL BIOSOLUBLE 0.61 x 0.61m, E=14mm.)",
    "unidad": "m²",
    "metrado_fijo": 1364.73,
    "cantidad_presupuestada": 1364.73,
    "precio_unitario_presupuestado": 111.18,
    "total_presupuestado": 151730.68
  },
  {
    "codigo": "OE.3.3.6.2",
    "descripcion": "FALSO CIELO RASO CON PLACA DE SUPERBOARD (6mm.)",
    "unidad": "m²",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 66.02,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.3.6.3",
    "descripcion": "FALSO CIELO RASO CON PLACA DE SUPERBOARD CON LAMINA DE PLOMO e=2mm",
    "unidad": "m²",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 732.13,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.3.6.4",
    "descripcion": "FALSO CIELORRASO (BALDOSA TRANSLUCIDA 0.61 x 0.61m)",
    "unidad": "m²",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 381.44,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.3.6.5",
    "descripcion": "Falso cielo raso con placa superboard 6mm incluye estructuras",
    "unidad": "m²",
    "metrado_fijo": 86.05,
    "cantidad_presupuestada": 86.05,
    "precio_unitario_presupuestado": 211.77,
    "total_presupuestado": 18222.81
  },
  {
    "codigo": "OE.3.3.6.6",
    "descripcion": "Falso cielo raso con placa superboard 12mm incluye estructuras",
    "unidad": "und",
    "metrado_fijo": 289.72,
    "cantidad_presupuestada": 289.72,
    "precio_unitario_presupuestado": 177.27,
    "total_presupuestado": 51358.66
  },
  {
    "codigo": "OE.3.4.1.1",
    "descripcion": "Contrapiso de concreto f'c=175 kg/cm2 e =4 cm",
    "unidad": "m²",
    "metrado_fijo": 1960.33,
    "cantidad_presupuestada": 1960.33,
    "precio_unitario_presupuestado": 31.23,
    "total_presupuestado": 61221.11
  },
  {
    "codigo": "OE.3.4.2.20",
    "descripcion": "Piso Porcelanato de 60x60 antideslizante de alto transito",
    "unidad": "m²",
    "metrado_fijo": 1103.64,
    "cantidad_presupuestada": 1103.64,
    "precio_unitario_presupuestado": 56.83,
    "total_presupuestado": 62719.86
  },
  {
    "codigo": "OE.3.4.2.21",
    "descripcion": "Piso Ceramico de 45x45 antideslizante de alto transito",
    "unidad": "m²",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 50.65,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.4.2.25",
    "descripcion": "Piso de cemento pulido",
    "unidad": "m²",
    "metrado_fijo": 183.12,
    "cantidad_presupuestada": 183.12,
    "precio_unitario_presupuestado": 40.2,
    "total_presupuestado": 7361.42
  },
  {
    "codigo": "OE.3.4.2.26",
    "descripcion": "Piso Vinílico Conductivo",
    "unidad": "m²",
    "metrado_fijo": 50.28,
    "cantidad_presupuestada": 50.28,
    "precio_unitario_presupuestado": 192.01,
    "total_presupuestado": 9654.26
  },
  {
    "codigo": "OE.3.4.2.27",
    "descripcion": "Piso de Terrazo",
    "unidad": "m²",
    "metrado_fijo": 451.91,
    "cantidad_presupuestada": 451.91,
    "precio_unitario_presupuestado": 114.36,
    "total_presupuestado": 51680.43
  },
  {
    "codigo": "OE.3.4.2.6",
    "descripcion": "Base de concreto para muebles fijos H=10cm",
    "unidad": "m²",
    "metrado_fijo": 21.93,
    "cantidad_presupuestada": 21.93,
    "precio_unitario_presupuestado": 214.63,
    "total_presupuestado": 4706.84
  },
  {
    "codigo": "OE.3.4.2.23.2",
    "descripcion": "EXTERIORES- AGREGADO ESTABILIZADO",
    "unidad": "m²",
    "metrado_fijo": 541.37,
    "cantidad_presupuestada": 541.37,
    "precio_unitario_presupuestado": 8.26,
    "total_presupuestado": 4471.72
  },
  {
    "codigo": "OE.3.4.3.1.1",
    "descripcion": "Afirmado y Compactado de  4\" con Material Propio",
    "unidad": "m²",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 3.79,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.4.3.1.2",
    "descripcion": "Encofrado y desencofrado",
    "unidad": "m²",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 54.93,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.4.3.1.3",
    "descripcion": "Concreto f'c=175 kg/cm², e=0.15m",
    "unidad": "m²",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 59.94,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.4.3.1.4",
    "descripcion": "Junta Flexible en concreto",
    "unidad": "m",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 4.43,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.4.3.2.1",
    "descripcion": "Afirmado y Compactado de  4\" con Material Propio",
    "unidad": "m²",
    "metrado_fijo": 327.14,
    "cantidad_presupuestada": 327.14,
    "precio_unitario_presupuestado": 3.79,
    "total_presupuestado": 1239.86
  },
  {
    "codigo": "OE.3.4.3.2.2",
    "descripcion": "Encofrado y desencofrado",
    "unidad": "m²",
    "metrado_fijo": 131.18,
    "cantidad_presupuestada": 131.18,
    "precio_unitario_presupuestado": 54.93,
    "total_presupuestado": 7205.72
  },
  {
    "codigo": "OE.3.4.3.2.3",
    "descripcion": "Concreto f'c=175 kg/cm², e=0.15m",
    "unidad": "m²",
    "metrado_fijo": 327.14,
    "cantidad_presupuestada": 327.14,
    "precio_unitario_presupuestado": 59.94,
    "total_presupuestado": 19608.77
  },
  {
    "codigo": "OE.3.4.3.2.4",
    "descripcion": "Bruñas en veredas",
    "unidad": "m",
    "metrado_fijo": 472.64,
    "cantidad_presupuestada": 472.64,
    "precio_unitario_presupuestado": 8.93,
    "total_presupuestado": 4220.68
  },
  {
    "codigo": "OE.3.4.3.2.5",
    "descripcion": "Junta Flexible en concreto",
    "unidad": "m",
    "metrado_fijo": 50.28,
    "cantidad_presupuestada": 50.28,
    "precio_unitario_presupuestado": 4.43,
    "total_presupuestado": 222.74
  },
  {
    "codigo": "OE.3.4.3.3.1",
    "descripcion": "Empedrado en patio e=10cm",
    "unidad": "m²",
    "metrado_fijo": 84.08,
    "cantidad_presupuestada": 84.08,
    "precio_unitario_presupuestado": 26.61,
    "total_presupuestado": 2237.37
  },
  {
    "codigo": "OE.3.4.3.3.2",
    "descripcion": "Falso Piso - Concreto f'c=175 kg/cm²",
    "unidad": "m³",
    "metrado_fijo": 84.08,
    "cantidad_presupuestada": 84.08,
    "precio_unitario_presupuestado": 561.01,
    "total_presupuestado": 47169.72
  },
  {
    "codigo": "OE.3.5.1.1",
    "descripcion": "Zocalo de cerámico de 45 X 45 cm",
    "unidad": "m²",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 81.07,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.5.1.12",
    "descripcion": "Zocalo de cerámico de 60 X 60 cm",
    "unidad": "m²",
    "metrado_fijo": 930.05,
    "cantidad_presupuestada": 930.05,
    "precio_unitario_presupuestado": 61.23,
    "total_presupuestado": 56946.96
  },
  {
    "codigo": "OE.3.5.1.13",
    "descripcion": "Revestimiento Vinilico Conductivo",
    "unidad": "m²",
    "metrado_fijo": 67.37,
    "cantidad_presupuestada": 67.37,
    "precio_unitario_presupuestado": 248.45,
    "total_presupuestado": 16738.08
  },
  {
    "codigo": "OE.3.5.2.3.2",
    "descripcion": "Contrazocalo de cerámico de 45x10 cm (H=10cm)",
    "unidad": "m",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 24.37,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.5.2.3.3",
    "descripcion": "Contrazocalo de cerámico (H=10cm)",
    "unidad": "m",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 31.29,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.5.2.3.4",
    "descripcion": "Contrazocalo Terrazo (H=10cm)",
    "unidad": "m",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 96.74,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.5.2.3.5",
    "descripcion": "Contrazocalo de cemento cemento pulido (H=10 cm)",
    "unidad": "m",
    "metrado_fijo": 53.86,
    "cantidad_presupuestada": 53.86,
    "precio_unitario_presupuestado": 19.43,
    "total_presupuestado": 1046.5
  },
  {
    "codigo": "OE.3.5.2.3.6",
    "descripcion": "Contrazocalo de porcelanato H=10cm",
    "unidad": "m",
    "metrado_fijo": 919.53,
    "cantidad_presupuestada": 919.53,
    "precio_unitario_presupuestado": 22.56,
    "total_presupuestado": 20744.6
  },
  {
    "codigo": "OE.3.5.2.3.7",
    "descripcion": "Contrazocalo de Terrazo (H=12cm)",
    "unidad": "m",
    "metrado_fijo": 600.68,
    "cantidad_presupuestada": 600.68,
    "precio_unitario_presupuestado": 99.14,
    "total_presupuestado": 59551.42
  },
  {
    "codigo": "OE.3.5.2.3.8",
    "descripcion": "Contrazocalo de Terrazo (H=20cm)",
    "unidad": "m",
    "metrado_fijo": 7.94,
    "cantidad_presupuestada": 7.94,
    "precio_unitario_presupuestado": 162.41,
    "total_presupuestado": 1289.54
  },
  {
    "codigo": "OE.3.5.2.2.1",
    "descripcion": "CONTRAZOCALO SANITARIO COVER FORMER H=0.10 M.",
    "unidad": "m",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 31.49,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.6.7.1",
    "descripcion": "COBERTURA. PANEL COMPUESTA POR 5 CAPAS, PREPINTADO ESTANDAR E=2.25 mm",
    "unidad": "m²",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 94.79,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.6.7.2",
    "descripcion": "COBERTURA. TEJA  POLICARBONATO E=1.0 mm.",
    "unidad": "m²",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 101.73,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.6.7.3",
    "descripcion": "CUMBRERA LISA, E= 0.5mm",
    "unidad": "m",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 39.16,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.6.7.4",
    "descripcion": "Cobertura con panel termoacustico relleno de poliuretano",
    "unidad": "m²",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 278.69,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.6.7.5",
    "descripcion": "Cumbrera para panel termoacustico",
    "unidad": "m",
    "metrado_fijo": 297.79,
    "cantidad_presupuestada": 297.79,
    "precio_unitario_presupuestado": 31.53,
    "total_presupuestado": 9389.32
  },
  {
    "codigo": "OE.3.6.7.6",
    "descripcion": "Cobertura con policarbonato E=10 mm",
    "unidad": "m²",
    "metrado_fijo": 287.28,
    "cantidad_presupuestada": 287.28,
    "precio_unitario_presupuestado": 78.1,
    "total_presupuestado": 22436.57
  },
  {
    "codigo": "OE.3.6.7.7",
    "descripcion": "Cobertura con termopaneles acusticos",
    "unidad": "m²",
    "metrado_fijo": 2472.69,
    "cantidad_presupuestada": 2472.69,
    "precio_unitario_presupuestado": 214.8,
    "total_presupuestado": 531133.81
  },
  {
    "codigo": "OE.3.6.2.1",
    "descripcion": "CERRAMIENTO CON POLICARBONATO SOLIDO E=6 mm.",
    "unidad": "m²",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 279.68,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.6.9.2",
    "descripcion": "Cerramiento con policarbonato e=10 mm",
    "unidad": "m²",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 62.08,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.7.1.1",
    "descripcion": "PUERTA DE MDF CONTRAPLACADA DE 6 mm. DE 01 HOJA RECUBIERTA CON FORMICA BLANCA, MARCOS CON BARNIZ INCOLORO; PLANCHAS DE METAL Y REJILLA DE VENTILACION  EN LA PARTE INFERIOR. TIPO P-7 (1.00 x 2.20) CORREDIZA",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 2278.11,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.7.1.2",
    "descripcion": "PUERTA DE MDF CONTRAPLACADA DE 6 mm. DE 01 HOJA RECUBIERTA CON FORMICA BLANCA, MARCOS CON BARNIZ INCOLORO; PLANCHAS DE METAL Y REJILLA DE VENTILACION  EN LA PARTE INFERIORA TIPO P-8 (1.05 x 2.20) DOBLE CORREDIZA",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 2392,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.7.1.3",
    "descripcion": "PUERTA DE MDF CONTRAPLACADA DE 6 mm. DE 01 HOJA RECUBIERTA CON FORMICA BLANCA, MARCOS CON BARNIZ INCOLORO. TIPO P-11 (1.05 x 2.20)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 2358.17,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.7.1.4",
    "descripcion": "PUERTA DE MDF CONTRAPLACADA DE 6 mm. DE 01 HOJA RECUBIERTA CON FORMICA BLANCA, MARCOS CON BARNIZ INCOLORO. TIPO P-12 (0.85 x 2.20)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 1988.94,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.7.1.5",
    "descripcion": "PUERTA DE MADERA CONTRAPLACADA CON PROTECCION DE LAMINAS DE PLOMO DE 01 HOJA RECUBIERTA CON FORMICA BLANCA. TIPO P-14 (1.05 x 2.20)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 1980,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.7.1.6",
    "descripcion": "PUERTA DE MADERA CONTRAPLACADA CON PROTECCION DE LAMINAS DE PLOMO DE 01 HOJA RECUBIERTA CON FORMICA BLANCA. TIPO P-15 (0.85 x 2.20)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 1700,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.7.1.7",
    "descripcion": "Puerta de 2 hojas vaiven contraplacada con plancha de acero (P-02) 1.40X2.70 m",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 1840.92,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.7.1.8",
    "descripcion": "Puerta de 2 hojas contraplacada (P-03) 1.80X2.70 m, según detalle",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 2325.92,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.7.1.9",
    "descripcion": "Puerta de 1 hoja contraplacada (P-05) 1.20X2.70 m, según detalle",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 1123.61,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.7.1.10",
    "descripcion": "Puerta de 1 hoja contraplacada (P-06) 1.20X2.70 m, según detalle",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 1123.61,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.7.1.11",
    "descripcion": "Puerta de 2 hojas vaiven contraplacada con plancha de acero (P-07) 1.80X2.70 m",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 2325.92,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.7.1.12",
    "descripcion": "Puerta de 1 hoja contraplacada (P-08) 0.90X2.70 m, según detalle",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 866.61,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.7.1.13",
    "descripcion": "Puerta de 1 hoja contraplacada (P-09) 0.90X2.70 m, según detalle",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 866.61,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.7.1.14",
    "descripcion": "Puerta de 1 hoja contraplacada con plancha de acero (P-10) 1.20X2.70 m, según detalle",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 1323.61,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.7.1.15",
    "descripcion": "Puerta de 1 hoja contraplacada (P-11) 0.80X2.70 m, según detalle",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 773.61,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.7.1.16",
    "descripcion": "Puerta de 1 hoja contraplacada (P-12) 1.00X2.70 m, según detalle",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 1030.61,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.7.1.17",
    "descripcion": "Puerta de 1 hoja contraplacada (P-13) 1.00X2.70 m, según detalle",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 1030.61,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.7.1.18",
    "descripcion": "Puerta de 1 hoja contraplacada (P-14) 0.90X2.70 m, según detalle",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 966.61,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.7.1.19",
    "descripcion": "Puerta de 1 hoja contraplacada (P-15) 1.00X2.70 m, según detalle",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 1030.61,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.7.1.20",
    "descripcion": "Puerta de melamine (PM-01) 0.70X1.60 m, incluye accesorios",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 247.96,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.7.1.21",
    "descripcion": "Puerta de 1 hoja contraplacada con alma de plomo (P-01) 1.20X2.15m, según detalle",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 4373.85,
    "total_presupuestado": 4373.85
  },
  {
    "codigo": "OE.3.7.1.22",
    "descripcion": "Puerta de 1 hoja contraplacada con alma de plomo (P-04) 1.00X2.15m, según detalle",
    "unidad": "und",
    "metrado_fijo": 2,
    "cantidad_presupuestada": 2,
    "precio_unitario_presupuestado": 3613.85,
    "total_presupuestado": 7227.7
  },
  {
    "codigo": "OE.3.7.1.23",
    "descripcion": "Acondicionamiento de puertas y cerraduras e instalación",
    "unidad": "und",
    "metrado_fijo": 132,
    "cantidad_presupuestada": 132,
    "precio_unitario_presupuestado": 81.32,
    "total_presupuestado": 10734.24
  },
  {
    "codigo": "OE.3.7.1.24",
    "descripcion": "Puerta  acondicionada de 2 hojas vaiven contraplacada con plancha de acero (P-02) 1.40X2.70 m",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 82.74,
    "total_presupuestado": 82.74
  },
  {
    "codigo": "OE.3.7.1.25",
    "descripcion": "Puerta  acondicionada de 2 hojas contraplacada (P-03) 1.80X2.70 m, según detalle",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 82.74,
    "total_presupuestado": 82.74
  },
  {
    "codigo": "OE.3.7.1.26",
    "descripcion": "Puerta acondicionada de 1 hoja contraplacada (P-06) 1.20X2.70 m, según detalle",
    "unidad": "und",
    "metrado_fijo": 9,
    "cantidad_presupuestada": 9,
    "precio_unitario_presupuestado": 82.74,
    "total_presupuestado": 744.66
  },
  {
    "codigo": "OE.3.7.1.27",
    "descripcion": "Puerta  acondicionada de 2 hojas vaiven contraplacada con plancha de acero (P-07) 1.80X2.70 m",
    "unidad": "und",
    "metrado_fijo": 3,
    "cantidad_presupuestada": 3,
    "precio_unitario_presupuestado": 82.74,
    "total_presupuestado": 248.22
  },
  {
    "codigo": "OE.3.7.1.28",
    "descripcion": "Puerta  acondicionada de 1 hoja contraplacada (P-08) 0.90X2.70 m, según detalle",
    "unidad": "und",
    "metrado_fijo": 4,
    "cantidad_presupuestada": 4,
    "precio_unitario_presupuestado": 82.74,
    "total_presupuestado": 330.96
  },
  {
    "codigo": "OE.3.7.1.29",
    "descripcion": "Puerta  acondicionada de 1 hoja contraplacada (P-09) 0.90X2.70 m, según detalle",
    "unidad": "und",
    "metrado_fijo": 6,
    "cantidad_presupuestada": 6,
    "precio_unitario_presupuestado": 82.74,
    "total_presupuestado": 496.44
  },
  {
    "codigo": "OE.3.7.1.30",
    "descripcion": "Puerta  acondicionada de 1 hoja contraplacada con plancha de acero (P-10) 1.20X2.70 m, según detalle",
    "unidad": "und",
    "metrado_fijo": 10,
    "cantidad_presupuestada": 10,
    "precio_unitario_presupuestado": 82.74,
    "total_presupuestado": 827.4
  },
  {
    "codigo": "OE.3.7.1.31",
    "descripcion": "Puerta  acondicionada de 1 hoja contraplacada (P-11) 0.80X2.70 m, según detalle",
    "unidad": "und",
    "metrado_fijo": 20,
    "cantidad_presupuestada": 20,
    "precio_unitario_presupuestado": 82.74,
    "total_presupuestado": 1654.8
  },
  {
    "codigo": "OE.3.7.1.32",
    "descripcion": "Puerta  acondicionada de 1 hoja contraplacada (P-12) 1.00X2.70 m, según detalle",
    "unidad": "und",
    "metrado_fijo": 39,
    "cantidad_presupuestada": 39,
    "precio_unitario_presupuestado": 82.74,
    "total_presupuestado": 3226.86
  },
  {
    "codigo": "OE.3.7.1.33",
    "descripcion": "Puerta  acondicionada de 1 hoja contraplacada (P-13) 1.00X2.70 m, según detalle",
    "unidad": "und",
    "metrado_fijo": 20,
    "cantidad_presupuestada": 20,
    "precio_unitario_presupuestado": 82.74,
    "total_presupuestado": 1654.8
  },
  {
    "codigo": "OE.3.7.1.34",
    "descripcion": "Puerta  acondicionada de 1 hoja contraplacada (P-14) 0.90X2.70 m, según detalle",
    "unidad": "und",
    "metrado_fijo": 6,
    "cantidad_presupuestada": 6,
    "precio_unitario_presupuestado": 82.74,
    "total_presupuestado": 496.44
  },
  {
    "codigo": "OE.3.7.1.35",
    "descripcion": "Puerta  acondicionada de 1 hoja contraplacada (P-15) 1.00X2.70 m, según detalle",
    "unidad": "und",
    "metrado_fijo": 10,
    "cantidad_presupuestada": 10,
    "precio_unitario_presupuestado": 82.74,
    "total_presupuestado": 827.4
  },
  {
    "codigo": "OE.3.7.1.36",
    "descripcion": "Puerta de melamine (PM-02) 0.70X2.00 m, incluye accesorios",
    "unidad": "und",
    "metrado_fijo": 8,
    "cantidad_presupuestada": 8,
    "precio_unitario_presupuestado": 82.74,
    "total_presupuestado": 661.92
  },
  {
    "codigo": "OE.3.7.2.1",
    "descripcion": "MUEBLE TIPO 01 ADMISION - CITAS - INFORMES",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 740,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.7.2.2",
    "descripcion": "MUEBLE TIPO 02 ENTREGA  Y RECEPCION",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 59,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.7.2.3",
    "descripcion": "MUEBLE TIPO 03 ESTACION DE ENFERMERAS",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 663.5,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.7.2.4",
    "descripcion": "MUEBLE TIPO 04 TOMA DE MUESTRAS",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 560,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.7.2.5",
    "descripcion": "MUEBLE TIPO 05 TRABAJOS LIMPIO - SUCIO",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 540,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.7.2.6",
    "descripcion": "MUEBLE TIPO 06 ESTAR DE PERSONAL",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 525.01,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.7.2.7",
    "descripcion": "MUEBLE TIPO 07 ESTERILIZACION",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 3575,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.7.2.8",
    "descripcion": "MUEBLE TIPO 08 LIMPIEZA",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 438,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.7.2.9",
    "descripcion": "MUEBLE TIPO 09 LABORATORIO",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 1922,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.7.2.10",
    "descripcion": "MUEBLE TIPO 10 CONSULTORIOS Y TOPICO ATENCION RECIEN NACIDO",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 570.01,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.7.2.11",
    "descripcion": "MUEBLE TIPO 11 LAVADO DE PERSONAL ASISTENCIAL",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 530,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.7.2.12",
    "descripcion": "Muebles Bajos de  Melamina de 18mm inc. Accesorios",
    "unidad": "m",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 629.75,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.7.2.13",
    "descripcion": "Servicio de armado e instalación de muebles altos y bajos de Melamina de 18mm inc. Accesorios",
    "unidad": "serv",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 35000,
    "total_presupuestado": 35000
  },
  {
    "codigo": "OE.3.8.1.1",
    "descripcion": "VENTANA ALTA FIJA PERFILES DE Fe 2\" x 1 1/2 y/o MALLA DE ACERO GALVANIZADO. V-2 (2.45 X 1.23)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 615.79,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.8.1.2",
    "descripcion": "VENTANA ALTA FIJA PERFILES DE Fe 2\" x 1 1/2 y/o MALLA DE ACERO GALVANIZADO. V-3 (2.15 X 1.23)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 500,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.8.1.3",
    "descripcion": "VENTANA ALTA FIJA PERFILES DE Fe 2\" x 1 1/2 y/o MALLA DE ACERO GALVANIZADO. V-4 (5.40 X 1.23)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 1000,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.8.1.4",
    "descripcion": "VENTANA METALICA DE Fe CON MALLA DE ACERO GALVANIZADO. VM-1 (2.84 X 1.00)",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 851.76,
    "total_presupuestado": 851.76
  },
  {
    "codigo": "OE.3.8.1.5",
    "descripcion": "VENTANA METALICA DE Fe CON MALLA DE ACERO GALVANIZADO. VM-2 (3.09 X 1.00)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 891.76,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.8.1.6",
    "descripcion": "VENTANA METALICA DE Fe CON MALLA DE ACERO GALVANIZADO. VM-3 (2.50 X 1.00)",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 811.76,
    "total_presupuestado": 811.76
  },
  {
    "codigo": "OE.3.8.1.7",
    "descripcion": "VENTANA METALICA DE Fe CON MALLA DE ACERO GALVANIZADO. VM-4 (2.60 X 1.00)",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 831.76,
    "total_presupuestado": 831.76
  },
  {
    "codigo": "OE.3.8.1.8",
    "descripcion": "Ventana metálica de fe con malla de acero galvanizado Vm-5 (1.30 x 1.00)",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 586.76,
    "total_presupuestado": 586.76
  },
  {
    "codigo": "OE.3.8.1.9",
    "descripcion": "Ventana metálica de fe con malla de acero galvanizado Vm-6 (4.40 x 1.50)",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1585.61,
    "total_presupuestado": 1585.61
  },
  {
    "codigo": "OE.3.8.1.10",
    "descripcion": "Ventana metálica de fe con malla de acero galvanizado Vm-7 (2.40 x 1.00)",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 794.07,
    "total_presupuestado": 794.07
  },
  {
    "codigo": "OE.3.8.2.1",
    "descripcion": "PUERTA METALICA TIPO PJ-01 (3.20 X 2.80M) DOBLE HOJA",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 2920,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.8.2.2",
    "descripcion": "PUERTA METALICA TIPO PJ-02 (1.30 X 2.80M) UNA HOJA",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 998,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.8.2.3",
    "descripcion": "PUERTA METALICA TIPO REJA DE DOBLE HOJA CON TUBO CUADRADO DE 2\" x 2\" e= 1 mm. P-9 ( 2.40 X 2.80)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 1120,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.8.2.4",
    "descripcion": "PUERTA METALICA TIPO REJA DE DOBLE HOJA CON TUBO CUADRADO DE 2\" x 2\" e= 1 mm. P-10 ( 1.40 X 2.80)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 1120,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.8.2.5",
    "descripcion": "PUERTA METALICA DE Fe CON PLANCHA METALICA Y MALLA ELECTROSOLDADA PJ-01 ( 1.00 X 2.70)",
    "unidad": "und",
    "metrado_fijo": 2,
    "cantidad_presupuestada": 2,
    "precio_unitario_presupuestado": 2175.97,
    "total_presupuestado": 4351.94
  },
  {
    "codigo": "OE.3.8.2.6",
    "descripcion": "PUERTA METALICA DE TUBO CUADRADO DE 2\" CON PLANCHA METALICA PJ-02 ( 1.45 X 2.70)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 2445.97,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.8.2.7",
    "descripcion": "PUERTA METALICA CON PLANCHA METALICA PJ-03 ( 2.85 X 2.70)",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 3236.18,
    "total_presupuestado": 3236.18
  },
  {
    "codigo": "OE.3.8.2.8",
    "descripcion": "PUERTA METALICA CON PLANCHA METALICA PJ-04 ( 3.06 X 2.90)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 3860.89,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.8.2.9",
    "descripcion": "PUERTA METALICA CON PLANCHA METALICA PJ-05 ( 4.90 X 3.30)",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 4164.37,
    "total_presupuestado": 4164.37
  },
  {
    "codigo": "OE.3.8.2.10",
    "descripcion": "PUERTA METALICA CORREDIZA CON MALLA ELECTROSOLDADA PJ-06 ( 1.25 X 2.70)",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 2175.97,
    "total_presupuestado": 2175.97
  },
  {
    "codigo": "OE.3.8.2.11",
    "descripcion": "PUERTA METALICA CON MALLA ELECTROSOLDADA Y PLANCHA METALICA PJ-07 ( 1.00 X 1.80)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 2045.97,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.8.2.12",
    "descripcion": "PUERTA METALICA PJ-08 ( 1.40 X 2.90)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 2435.97,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.8.2.13",
    "descripcion": "PUERTA METALICA PJ-09 ( 1.94 X 2.90)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 2675.97,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.8.2.14",
    "descripcion": "Puerta metálica pj-10 (1.30 x 2.40)",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1673.75,
    "total_presupuestado": 1673.75
  },
  {
    "codigo": "OE.3.8.2.15",
    "descripcion": "Puerta metálica pj-11 (1.68 x 2.40)",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 2038.48,
    "total_presupuestado": 2038.48
  },
  {
    "codigo": "OE.3.8.2.16",
    "descripcion": "Puerta metálica pj-12 (1.40 x 2.66)",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1915.31,
    "total_presupuestado": 1915.31
  },
  {
    "codigo": "OE.3.8.2.17",
    "descripcion": "Puerta metálica pj-13 (3.38 x 2.95)",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 4413.66,
    "total_presupuestado": 4413.66
  },
  {
    "codigo": "OE.3.8.2.18",
    "descripcion": "Puerta metálica pj-14 (0.90 x 2.67)",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1387,
    "total_presupuestado": 1387
  },
  {
    "codigo": "OE.3.8.2.19",
    "descripcion": "Puerta metálica pj-15 (1.20 x 2.10)",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1433.79,
    "total_presupuestado": 1433.79
  },
  {
    "codigo": "OE.3.8.2.20",
    "descripcion": "Puerta metálica pj-16 (1.55 x 0.97)",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1027.26,
    "total_presupuestado": 1027.26
  },
  {
    "codigo": "OE.3.8.2.21",
    "descripcion": "Puerta metálica pj-17 (1.31 x 2.07)",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1510.46,
    "total_presupuestado": 1510.46
  },
  {
    "codigo": "OE.3.8.4.1",
    "descripcion": "VENTANA DE ALUMINIO SISTEMA CORREDERAS CON VIDRIO TEMPLADO DE 6MM. INCOLORO V-5 (1.00 X 1.00)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 100.61,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.8.4.2",
    "descripcion": "VENTANA DE ALUMINIO SISTEMA PROYECTANTE CON VIDRIO LAMINADO DE 6MM.  V-1 (0.50 X 0.70) SUMINISTRO E INSTALACION",
    "unidad": "und",
    "metrado_fijo": 8,
    "cantidad_presupuestada": 8,
    "precio_unitario_presupuestado": 206.96,
    "total_presupuestado": 1655.68
  },
  {
    "codigo": "OE.3.8.4.3",
    "descripcion": "VENTANA DE ALUMINIO SISTEMA PROYECTANTE CON VIDRIO LAMINADO DE 6MM.  V-2 (0.45 X 0.70) SUMINISTRO E INSTALACION",
    "unidad": "und",
    "metrado_fijo": 2,
    "cantidad_presupuestada": 2,
    "precio_unitario_presupuestado": 186.56,
    "total_presupuestado": 373.12
  },
  {
    "codigo": "OE.3.8.4.4",
    "descripcion": "VENTANA DE ALUMINIO SISTEMA PROYECTANTE CON VIDRIO LAMINADO DE 6MM.  V-3 (0.70 X 0.70) SUMINISTRO E INSTALACION",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 241.31,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.8.4.5",
    "descripcion": "VENTANA DE ALUMINIO SISTEMA PROYECTANTE CON VIDRIO LAMINADO DE 6MM PAVONADO.  V-3b (0.70 X 0.70) SUMINISTRO E INSTALACION",
    "unidad": "und",
    "metrado_fijo": 44,
    "cantidad_presupuestada": 44,
    "precio_unitario_presupuestado": 251.31,
    "total_presupuestado": 11057.64
  },
  {
    "codigo": "OE.3.8.4.6",
    "descripcion": "VENTANA DE ALUMINIO SISTEMA CORREDERAS CON VIDRIO LAMINADO DE 6MM.  V-4 (0.60 X 1.80) SUMINISTRO E INSTALACION",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 364.96,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.8.4.7",
    "descripcion": "VENTANA DE ALUMINIO SISTEMA CORREDERAS CON VIDRIO LAMINADO DE 6MM.  V-5 (1.00 X 1.80) SUMINISTRO E INSTALACION",
    "unidad": "und",
    "metrado_fijo": 63,
    "cantidad_presupuestada": 63,
    "precio_unitario_presupuestado": 556.96,
    "total_presupuestado": 35088.48
  },
  {
    "codigo": "OE.3.8.4.8",
    "descripcion": "VENTANA DE ALUMINIO SISTEMA CORREDERAS CON VIDRIO LAMINADO DE 6MM.  V-6 (1.20 X 1.80) SUMINISTRO E INSTALACION",
    "unidad": "und",
    "metrado_fijo": 21,
    "cantidad_presupuestada": 21,
    "precio_unitario_presupuestado": 652.96,
    "total_presupuestado": 13712.16
  },
  {
    "codigo": "OE.3.8.4.9",
    "descripcion": "VENTANA DE ALUMINIO SISTEMA CORREDERAS CON VIDRIO LAMINADO DE 6MM.  V-8 (0.70 X 1.80) SUMINISTRO E INSTALACION",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 526.96,
    "total_presupuestado": 526.96
  },
  {
    "codigo": "OE.3.8.4.10",
    "descripcion": "VENTANA DE ALUMINIO SISTEMA CORREDERAS CON VIDRIO LAMINADO DE 6MM.  V-9 (1.00 X 1.80) SUMINISTRO E INSTALACION",
    "unidad": "und",
    "metrado_fijo": 9,
    "cantidad_presupuestada": 9,
    "precio_unitario_presupuestado": 556.96,
    "total_presupuestado": 5012.64
  },
  {
    "codigo": "OE.3.8.4.11",
    "descripcion": "Ventana de aluminio sistema correderas con vidrio laminado de 6mm V-10 (2.25 x 0.75) suministro e instalación",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 526.96,
    "total_presupuestado": 526.96
  },
  {
    "codigo": "OE.3.8.4.12",
    "descripcion": "Ventana de aluminio sistema correderas con vidrio laminado de 6mm V-11 (2.40 x 0.75) suministro e instalación",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 556.96,
    "total_presupuestado": 556.96
  },
  {
    "codigo": "OE.3.8.4.13",
    "descripcion": "Ventana de aluminio sistema correderas con vidrio laminado de 6mm V-12 (3.10 x 0.75) suministro e instalación",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 696.96,
    "total_presupuestado": 696.96
  },
  {
    "codigo": "OE.3.8.4.14",
    "descripcion": "Ventana de aluminio sistema correderas con vidrio laminado de 6mm V-13 (2.00 x 0.75) suministro e instalación",
    "unidad": "und",
    "metrado_fijo": 3,
    "cantidad_presupuestada": 3,
    "precio_unitario_presupuestado": 476.96,
    "total_presupuestado": 1430.88
  },
  {
    "codigo": "OE.3.8.4.15",
    "descripcion": "Ventana de aluminio sistema correderas con vidrio laminado de 6mm V-14 (1.90 x 1.50) suministro e instalación",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 836.96,
    "total_presupuestado": 836.96
  },
  {
    "codigo": "OE.3.8.5.1",
    "descripcion": "PUERTA DE MELAMINE CON MARCOS DE ALUMINIO DE 01 HOJA,COLOR CLARO.P-6 (0.65 x 2.00)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 235,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.8.13.1",
    "descripcion": "SEPARADOR CON PERFILES DE ALUMINIO Y TABLEROS DE MELAMINA PARA BAÑOS",
    "unidad": "m",
    "metrado_fijo": 6.76,
    "cantidad_presupuestada": 6.76,
    "precio_unitario_presupuestado": 168,
    "total_presupuestado": 1135.68
  },
  {
    "codigo": "OE.3.8.14.1",
    "descripcion": "BARANDAS METALICA  EN ESCALERA PRINCIPAL H=1.17 m",
    "unidad": "m",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 266.11,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.8.14.2",
    "descripcion": "Baranda metalica, H=1.00m. según diseño",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 544.53,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.8.14.3",
    "descripcion": "Colocación de barandas TIPO I (incluye pintura), H=1.00m",
    "unidad": "m",
    "metrado_fijo": 23.7,
    "cantidad_presupuestada": 23.7,
    "precio_unitario_presupuestado": 312.83,
    "total_presupuestado": 7414.07
  },
  {
    "codigo": "OE.3.8.14.4",
    "descripcion": "Colocación de barandas TIPO II (incluye pintura), H=1.05m",
    "unidad": "m",
    "metrado_fijo": 19.53,
    "cantidad_presupuestada": 19.53,
    "precio_unitario_presupuestado": 378.3,
    "total_presupuestado": 7388.2
  },
  {
    "codigo": "OE.3.8.14.5",
    "descripcion": "Colocación de barandas TIPO III (incluye pintura), H=.090m",
    "unidad": "m",
    "metrado_fijo": 92.87,
    "cantidad_presupuestada": 92.87,
    "precio_unitario_presupuestado": 367.57,
    "total_presupuestado": 34136.23
  },
  {
    "codigo": "OE.3.8.14.6",
    "descripcion": "Colocación de barandas TIPO IV (incluye pintura), H=1.05m",
    "unidad": "m",
    "metrado_fijo": 18.93,
    "cantidad_presupuestada": 18.93,
    "precio_unitario_presupuestado": 341.63,
    "total_presupuestado": 6467.06
  },
  {
    "codigo": "OE.3.8.14.7",
    "descripcion": "Colocación de barandas TIPO V (incluye pintura), H=0.90m",
    "unidad": "m",
    "metrado_fijo": 2.4,
    "cantidad_presupuestada": 2.4,
    "precio_unitario_presupuestado": 193.42,
    "total_presupuestado": 464.21
  },
  {
    "codigo": "OE.3.8.14.8",
    "descripcion": "Colocación de barandas TIPO VI (incluye pintura), H=1.05m",
    "unidad": "m",
    "metrado_fijo": 9.24,
    "cantidad_presupuestada": 9.24,
    "precio_unitario_presupuestado": 259.43,
    "total_presupuestado": 2397.13
  },
  {
    "codigo": "OE.3.8.15.1",
    "descripcion": "AGARRADERA PARA MINUSVALIDOS EN SSHH; Ø 2\" L=0.60M.",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 343.41,
    "total_presupuestado": 343.41
  },
  {
    "codigo": "OE.3.8.15.2",
    "descripcion": "AGARRADERA PARA MINUSVALIDOS EN SSHH; Ø 2\" L=0.90M.",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 343.41,
    "total_presupuestado": 343.41
  },
  {
    "codigo": "OE.3.8.15.3",
    "descripcion": "Pasamano metálico; ⌀ 2\"",
    "unidad": "m",
    "metrado_fijo": 20.27,
    "cantidad_presupuestada": 20.27,
    "precio_unitario_presupuestado": 110.74,
    "total_presupuestado": 2244.7
  },
  {
    "codigo": "OE.3.8.18.1",
    "descripcion": "TOPE DE ACERO CROMADO PARA PUERTAS.",
    "unidad": "und",
    "metrado_fijo": 108,
    "cantidad_presupuestada": 108,
    "precio_unitario_presupuestado": 15.11,
    "total_presupuestado": 1631.88
  },
  {
    "codigo": "OE.3.8.18.2",
    "descripcion": "Protector de camillas",
    "unidad": "m",
    "metrado_fijo": 33,
    "cantidad_presupuestada": 33,
    "precio_unitario_presupuestado": 111.54,
    "total_presupuestado": 3680.82
  },
  {
    "codigo": "OE.3.8.18.3",
    "descripcion": "Burlete adhesivo para puertas",
    "unidad": "m",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 49.79,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.8.18.4",
    "descripcion": "Escalera de gato de fierro, según diseño",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 725.16,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.8.18.5",
    "descripcion": "Tapajunta de acero galvanizado en pisos y muros",
    "unidad": "m",
    "metrado_fijo": 39.28,
    "cantidad_presupuestada": 39.28,
    "precio_unitario_presupuestado": 59.23,
    "total_presupuestado": 2326.55
  },
  {
    "codigo": "OE.3.8.18.6",
    "descripcion": "Escalera metálica para sala de equipos (h=3.2m)",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 867.31,
    "total_presupuestado": 867.31
  },
  {
    "codigo": "OE.3.8.18.7",
    "descripcion": "Escalera metálica para sala de equipos (h=1.67m)",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 585.36,
    "total_presupuestado": 585.36
  },
  {
    "codigo": "OE.3.9.1.1",
    "descripcion": "BISAGRA  ALUMINIZADA CAPUCHINA PESADA 4\"x4\"",
    "unidad": "und",
    "metrado_fijo": 446,
    "cantidad_presupuestada": 446,
    "precio_unitario_presupuestado": 23.84,
    "total_presupuestado": 10632.64
  },
  {
    "codigo": "OE.3.9.1.2",
    "descripcion": "Bisagra vaiven de acero grado 2 satinadas",
    "unidad": "und",
    "metrado_fijo": 16,
    "cantidad_presupuestada": 16,
    "precio_unitario_presupuestado": 190.58,
    "total_presupuestado": 3049.28
  },
  {
    "codigo": "OE.3.9.2.1",
    "descripcion": "CERRADURA TIPO A",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 137.43,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.9.2.2",
    "descripcion": "CERRADURA TIPO G",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 102.48,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.9.2.3",
    "descripcion": "CERRADURA TIPO H",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 56.55,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.9.2.4",
    "descripcion": "CERRADURA TIPO I",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 132.45,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.9.2.5",
    "descripcion": "CERRADURA TIPO J",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 95.95,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.9.2.6",
    "descripcion": "Cerradura embutida tipo palanca",
    "unidad": "und",
    "metrado_fijo": 25,
    "cantidad_presupuestada": 25,
    "precio_unitario_presupuestado": 123.94,
    "total_presupuestado": 3098.5
  },
  {
    "codigo": "OE.3.9.2.7",
    "descripcion": "Cerradura embutida tipo pomo",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 133.94,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.9.2.8",
    "descripcion": "Cerradura de tres golpes",
    "unidad": "und",
    "metrado_fijo": 9,
    "cantidad_presupuestada": 9,
    "precio_unitario_presupuestado": 163.94,
    "total_presupuestado": 1475.46
  },
  {
    "codigo": "OE.3.9.2.9",
    "descripcion": "Cerradura tipo picaporte",
    "unidad": "und",
    "metrado_fijo": 4,
    "cantidad_presupuestada": 4,
    "precio_unitario_presupuestado": 8.68,
    "total_presupuestado": 34.72
  },
  {
    "codigo": "OE.3.9.2.10",
    "descripcion": "Servicio de reparacion de cerraduras",
    "unidad": "serv",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 350,
    "total_presupuestado": 350
  },
  {
    "codigo": "OE.3.9.3.1",
    "descripcion": "TIRADOR DE ACERO INOX. PARA PUERTA DE VIDRIO",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 28.24,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.10.1.1",
    "descripcion": "ESPEJO INCOLORO  e=6mm BISELADO (EMPOTRADO) (0.60 x 0.90) SOBRE LAVATORIO EN TODOS LOS SSHH",
    "unidad": "und",
    "metrado_fijo": 31,
    "cantidad_presupuestada": 31,
    "precio_unitario_presupuestado": 110.65,
    "total_presupuestado": 3430.15
  },
  {
    "codigo": "OE.3.10.2.1",
    "descripcion": "(P-13) PUERTA AUTOPORTANTE DE CRISTAL TEMPLADO 10mm, PUERTA BATIENTE CON CINTA DE SEGURIDAD DE 10 cm DE ANCHO A 1.00 m DE ALTURA (1.95 X 2.20)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 1285,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.10.3.1",
    "descripcion": "VIDRIO EMPLOMADO (0.40 x 0.40)",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 30.38,
    "total_presupuestado": 30.38
  },
  {
    "codigo": "OE.3.10.4.1",
    "descripcion": "Vidrio laminado fijo de 6mm en mirillas y sobre luz de puertas",
    "unidad": "m²",
    "metrado_fijo": 74.51,
    "cantidad_presupuestada": 74.51,
    "precio_unitario_presupuestado": 119.13,
    "total_presupuestado": 8876.38
  },
  {
    "codigo": "OE.3.11.1.1",
    "descripcion": "PINTURA CIELORASO C/LATEX SATINADO (2MANOS), C/IMPRIMANTE",
    "unidad": "m²",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 19.12,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.11.1.2",
    "descripcion": "PINTURA MUROS INTERIORES C/ LATEX (2 MANOS). C/ IMPRIMANTE",
    "unidad": "m²",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 19.12,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.11.1.3",
    "descripcion": "PINTURA MUROS EXTERIORES C/ LATEX (2 MANOS). C/ IMPRIMANTE",
    "unidad": "m²",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 19.12,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.11.1.4",
    "descripcion": "Pintura muros interiores c/ latex antibacterial (2 MANOS). C/ IMPRIMANTE",
    "unidad": "m²",
    "metrado_fijo": 4930.71,
    "cantidad_presupuestada": 4930.71,
    "precio_unitario_presupuestado": 28.39,
    "total_presupuestado": 139982.86
  },
  {
    "codigo": "OE.3.11.1.5",
    "descripcion": "Pintura muros exteriores c/ latex satinado (2 manos). c/ imprimante",
    "unidad": "m²",
    "metrado_fijo": 1710.69,
    "cantidad_presupuestada": 1710.69,
    "precio_unitario_presupuestado": 26.59,
    "total_presupuestado": 45487.25
  },
  {
    "codigo": "OE.3.11.1.6",
    "descripcion": "EMPASTADO Y LIJADO DE MUROS INTERIORES",
    "unidad": "m²",
    "metrado_fijo": 4930.71,
    "cantidad_presupuestada": 4930.71,
    "precio_unitario_presupuestado": 33.5,
    "total_presupuestado": 165178.79
  },
  {
    "codigo": "OE.3.11.1.7",
    "descripcion": "EMPASTADO Y LIJADO DE MUROS EXTERIORES",
    "unidad": "m²",
    "metrado_fijo": 1710.69,
    "cantidad_presupuestada": 1710.69,
    "precio_unitario_presupuestado": 33.5,
    "total_presupuestado": 57308.12
  },
  {
    "codigo": "OE.3.11.1.8",
    "descripcion": "Pintura en marcos de madera, 02 manos",
    "unidad": "m²",
    "metrado_fijo": 336.76,
    "cantidad_presupuestada": 336.76,
    "precio_unitario_presupuestado": 35.58,
    "total_presupuestado": 11981.92
  },
  {
    "codigo": "OE.3.11.1.9",
    "descripcion": "Pintura en puertas de madera, 02 manos",
    "unidad": "m²",
    "metrado_fijo": 702.64,
    "cantidad_presupuestada": 702.64,
    "precio_unitario_presupuestado": 31.64,
    "total_presupuestado": 22231.53
  },
  {
    "codigo": "OE.3.11.1.10",
    "descripcion": "Pintura en sardineles 02 manos",
    "unidad": "m²",
    "metrado_fijo": 266.34,
    "cantidad_presupuestada": 266.34,
    "precio_unitario_presupuestado": 27.94,
    "total_presupuestado": 7441.54
  },
  {
    "codigo": "OE.3.11.1.11",
    "descripcion": "Diseño y pintado de murales",
    "unidad": "m²",
    "metrado_fijo": 39.16,
    "cantidad_presupuestada": 39.16,
    "precio_unitario_presupuestado": 293.61,
    "total_presupuestado": 11497.77
  },
  {
    "codigo": "OE.3.11.1.12",
    "descripcion": "Pintura falso cielo raso c/ latex antibacterial (2 MANOS). C/ IMPRIMANTE",
    "unidad": "und",
    "metrado_fijo": 32.01,
    "cantidad_presupuestada": 32.01,
    "precio_unitario_presupuestado": 28.39,
    "total_presupuestado": 908.76
  },
  {
    "codigo": "OE.3.11.1.13",
    "descripcion": "Pintura falso cielo raso c/ latex satinado (2 manos). c/ imprimante",
    "unidad": "und",
    "metrado_fijo": 310.85,
    "cantidad_presupuestada": 310.85,
    "precio_unitario_presupuestado": 26.59,
    "total_presupuestado": 8265.5
  },
  {
    "codigo": "OE.3.11.1.14",
    "descripcion": "Empastado y lijado de falso cielo raso interior",
    "unidad": "und",
    "metrado_fijo": 32.01,
    "cantidad_presupuestada": 32.01,
    "precio_unitario_presupuestado": 33.5,
    "total_presupuestado": 1072.34
  },
  {
    "codigo": "OE.3.11.1.15",
    "descripcion": "Empastado y lijado de falso cielo raso exterior",
    "unidad": "und",
    "metrado_fijo": 310.85,
    "cantidad_presupuestada": 310.85,
    "precio_unitario_presupuestado": 33.5,
    "total_presupuestado": 10413.48
  },
  {
    "codigo": "OE.3.12.1",
    "descripcion": "LIMPIEZA PERMANENTE DE OBRA",
    "unidad": "glb",
    "metrado_fijo": 2,
    "cantidad_presupuestada": 2,
    "precio_unitario_presupuestado": 6542.56,
    "total_presupuestado": 13085.12
  },
  {
    "codigo": "OE.3.12.2",
    "descripcion": "LIMPIEZA FINAL DE OBRA",
    "unidad": "glb",
    "metrado_fijo": 2,
    "cantidad_presupuestada": 2,
    "precio_unitario_presupuestado": 3653.73,
    "total_presupuestado": 7307.46
  },
  {
    "codigo": "OE.3.12.3.1",
    "descripcion": "SEMBRIO DE GRASS",
    "unidad": "m²",
    "metrado_fijo": 785.17,
    "cantidad_presupuestada": 785.17,
    "precio_unitario_presupuestado": 32.82,
    "total_presupuestado": 25769.28
  },
  {
    "codigo": "OE.3.12.3.2",
    "descripcion": "PLANTACION DE ARBUSTOS",
    "unidad": "und",
    "metrado_fijo": 30,
    "cantidad_presupuestada": 30,
    "precio_unitario_presupuestado": 10.78,
    "total_presupuestado": 323.4
  },
  {
    "codigo": "OE.3.13.1.1",
    "descripcion": "MODULO TIPO A, B, C",
    "unidad": "m²",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 3728.75,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.13.2.1",
    "descripcion": "LOGOTIPO DE \"CENTRO DE SALUD DE BELENPAMPA - CONTINGENCIA 0.40X 0.40M. 37 LETRAS",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 769.36,
    "total_presupuestado": 769.36
  },
  {
    "codigo": "OE.3.13.3.1",
    "descripcion": "MTB SEÑALES MODULO TIPO BANDERA 0.30 X 0.40M",
    "unidad": "und",
    "metrado_fijo": 80,
    "cantidad_presupuestada": 80,
    "precio_unitario_presupuestado": 19.05,
    "total_presupuestado": 1524
  },
  {
    "codigo": "OE.3.13.3.2",
    "descripcion": "MTP  SEÑALES MODULO TIPO PARED 0.30 X 0.40M",
    "unidad": "und",
    "metrado_fijo": 30,
    "cantidad_presupuestada": 30,
    "precio_unitario_presupuestado": 19,
    "total_presupuestado": 570
  },
  {
    "codigo": "OE.3.13.3.3",
    "descripcion": "SEÑALES P/NUMERACION DE AMBIENTES 0.06 X 0.12M. LAMINA ACRILICA 4MM.",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 19.07,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.13.3.4",
    "descripcion": "Cartel principal tipo directorio",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 841.7,
    "total_presupuestado": 841.7
  },
  {
    "codigo": "OE.3.13.3.5",
    "descripcion": "Señales identificativas de servicio tipo bandera de 30x30 cm",
    "unidad": "und",
    "metrado_fijo": 10,
    "cantidad_presupuestada": 10,
    "precio_unitario_presupuestado": 31.7,
    "total_presupuestado": 317
  },
  {
    "codigo": "OE.3.13.3.6",
    "descripcion": "Señales identificativas de servicio tipo adosado de 30x30 cm",
    "unidad": "und",
    "metrado_fijo": 20,
    "cantidad_presupuestada": 20,
    "precio_unitario_presupuestado": 31.7,
    "total_presupuestado": 634
  },
  {
    "codigo": "OE.3.13.3.7",
    "descripcion": "Señales indicativas de servicio tipo colgante de 1.20x30 cm",
    "unidad": "und",
    "metrado_fijo": 15,
    "cantidad_presupuestada": 15,
    "precio_unitario_presupuestado": 91.7,
    "total_presupuestado": 1375.5
  },
  {
    "codigo": "OE.3.13.3.8",
    "descripcion": "Señalización de evacuación y emergencia",
    "unidad": "und",
    "metrado_fijo": 60,
    "cantidad_presupuestada": 60,
    "precio_unitario_presupuestado": 29.7,
    "total_presupuestado": 1782
  },
  {
    "codigo": "OE.3.13.3.9",
    "descripcion": "Señalización de advertencia",
    "unidad": "und",
    "metrado_fijo": 35,
    "cantidad_presupuestada": 35,
    "precio_unitario_presupuestado": 29.7,
    "total_presupuestado": 1039.5
  },
  {
    "codigo": "OE.3.13.4.1",
    "descripcion": "INDICA UBICACIÓN DE PELIGRO ALTO VOLTAJE 0.30 X 0.30 PLASTICO 500 MICRAS",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 7.89,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.13.4.2",
    "descripcion": "INDICA UBICACIÓN ACCESO PARA DISCAPACITADOS 0.20 X 0.30 PLASTICO 500 MICRAS",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 7.42,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.13.4.3",
    "descripcion": "INDICA UBICACIÓN PUESTA A TIERRA 0.30 X 0.30 PLASTICO 500 MICRAS",
    "unidad": "und",
    "metrado_fijo": 7,
    "cantidad_presupuestada": 7,
    "precio_unitario_presupuestado": 8.6,
    "total_presupuestado": 60.2
  },
  {
    "codigo": "OE.3.13.4.4",
    "descripcion": "UBICACIÓN DE EXTINTOR 0.20 X 0.20 PVC AUTOADHESIVO",
    "unidad": "und",
    "metrado_fijo": 10,
    "cantidad_presupuestada": 10,
    "precio_unitario_presupuestado": 7.42,
    "total_presupuestado": 74.2
  },
  {
    "codigo": "OE.3.13.4.5",
    "descripcion": "ZONA DE EVACUACIÓN CÍRCULO PINTADO EN PISO COLOR BLANCO (LINEA=0.10 M, RADIO= VARIABLE)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 66.91,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.13.5.1",
    "descripcion": "EXTINTOR DE CO2-ABC X 5 KG",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 355.65,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.3.13.5.2",
    "descripcion": "EXTINTOR CO2-ABC X 6 KG",
    "unidad": "und",
    "metrado_fijo": 10,
    "cantidad_presupuestada": 10,
    "precio_unitario_presupuestado": 355.65,
    "total_presupuestado": 3556.5
  },
  {
    "codigo": "OE.3.13.5.3",
    "descripcion": "EXTINTOR PQS-ABC X 6 KG",
    "unidad": "und",
    "metrado_fijo": 10,
    "cantidad_presupuestada": 10,
    "precio_unitario_presupuestado": 144.15,
    "total_presupuestado": 1441.5
  },
  {
    "codigo": "OE.3.13.6.1",
    "descripcion": "Mesa de concreto e=0.10",
    "unidad": "m²",
    "metrado_fijo": 39.43,
    "cantidad_presupuestada": 39.43,
    "precio_unitario_presupuestado": 314.31,
    "total_presupuestado": 12393.24
  },
  {
    "codigo": "OE.3.13.6.2",
    "descripcion": "Enchape de porcelanato de 60x60 en mesas de concreto",
    "unidad": "m²",
    "metrado_fijo": 131.67,
    "cantidad_presupuestada": 131.67,
    "precio_unitario_presupuestado": 90.29,
    "total_presupuestado": 11888.48
  },
  {
    "codigo": "OE.3.13.7.1",
    "descripcion": "BANCA DE ASIENTOS MULTIPLES  2 CUERPOS",
    "unidad": "und",
    "metrado_fijo": 18,
    "cantidad_presupuestada": 18,
    "precio_unitario_presupuestado": 360,
    "total_presupuestado": 6480
  },
  {
    "codigo": "OE.3.13.7.2",
    "descripcion": "BANCA DE ASIENTOS MULTIPLES  3 CUERPOS",
    "unidad": "und",
    "metrado_fijo": 12,
    "cantidad_presupuestada": 12,
    "precio_unitario_presupuestado": 455,
    "total_presupuestado": 5460
  },
  {
    "codigo": "OE.3.13.7.3",
    "descripcion": "BANCA DE ASIENTOS MULTIPLES  4 CUERPOS",
    "unidad": "und",
    "metrado_fijo": 10,
    "cantidad_presupuestada": 10,
    "precio_unitario_presupuestado": 565,
    "total_presupuestado": 5650
  },
  {
    "codigo": "OE.3.13.1",
    "descripcion": "Tarrajeo primario (rayado) con mezcla C:A - 1:5",
    "unidad": "m²",
    "metrado_fijo": 86.24,
    "cantidad_presupuestada": 86.24,
    "precio_unitario_presupuestado": 26.85,
    "total_presupuestado": 2315.54
  },
  {
    "codigo": "OE.3.13.2",
    "descripcion": "Tarrajeo en  interiores con impermeabilizante  mezcla C:A - 1:5",
    "unidad": "m²",
    "metrado_fijo": 38.4,
    "cantidad_presupuestada": 38.4,
    "precio_unitario_presupuestado": 29.3,
    "total_presupuestado": 1125.12
  },
  {
    "codigo": "OE.3.13.3",
    "descripcion": "Tarrajeo en muros exteriores mezcla C:A - 1:5",
    "unidad": "m²",
    "metrado_fijo": 47.84,
    "cantidad_presupuestada": 47.84,
    "precio_unitario_presupuestado": 27.28,
    "total_presupuestado": 1305.08
  },
  {
    "codigo": "OE.3.13.4",
    "descripcion": "Bruñas en reservorio",
    "unidad": "m",
    "metrado_fijo": 62.96,
    "cantidad_presupuestada": 62.96,
    "precio_unitario_presupuestado": 0.88,
    "total_presupuestado": 55.4
  },
  {
    "codigo": "OE.3.13.5",
    "descripcion": "Concreto f'c=210 kg/cm², en piso cuarto de bombas",
    "unidad": "m³",
    "metrado_fijo": 2.3,
    "cantidad_presupuestada": 2.3,
    "precio_unitario_presupuestado": 552.43,
    "total_presupuestado": 1270.59
  },
  {
    "codigo": "OE.3.13.6",
    "descripcion": "Encofrado y desencofrado en pisos",
    "unidad": "m²",
    "metrado_fijo": 3.4,
    "cantidad_presupuestada": 3.4,
    "precio_unitario_presupuestado": 112.51,
    "total_presupuestado": 382.53
  },
  {
    "codigo": "OE.3.15.1",
    "descripcion": "Encofrado y desencofrado",
    "unidad": "m²",
    "metrado_fijo": 148.36,
    "cantidad_presupuestada": 148.36,
    "precio_unitario_presupuestado": 51.84,
    "total_presupuestado": 7690.98
  },
  {
    "codigo": "OE.3.15.2",
    "descripcion": "Concreto f'c=210 kg/cm2",
    "unidad": "m³",
    "metrado_fijo": 10.81,
    "cantidad_presupuestada": 10.81,
    "precio_unitario_presupuestado": 485.28,
    "total_presupuestado": 5245.88
  },
  {
    "codigo": "OE.4.1.1.1.1",
    "descripcion": "Urinario de loza tipo C-9",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 220,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.1.1.1.2",
    "descripcion": "Urinario de loza",
    "unidad": "und",
    "metrado_fijo": 4,
    "cantidad_presupuestada": 4,
    "precio_unitario_presupuestado": 7.94,
    "total_presupuestado": 31.76
  },
  {
    "codigo": "OE.4.1.1.2.1",
    "descripcion": "Inodoro estandar de loza",
    "unidad": "und",
    "metrado_fijo": 12,
    "cantidad_presupuestada": 12,
    "precio_unitario_presupuestado": 306,
    "total_presupuestado": 3672
  },
  {
    "codigo": "OE.4.1.1.2.2",
    "descripcion": "Inodoro tipo C-1",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 700,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.1.1.2.3",
    "descripcion": "Inodoro tipo C-1 de losa",
    "unidad": "und",
    "metrado_fijo": 17,
    "cantidad_presupuestada": 17,
    "precio_unitario_presupuestado": 15.88,
    "total_presupuestado": 269.96
  },
  {
    "codigo": "OE.4.1.1.3.1",
    "descripcion": "Lavatorio de Loza Tipo Ovalin 60x50",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 147.81,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.1.1.3.2",
    "descripcion": "Lavatorio de Loza Tipo Ovalin 45x40",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 127,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.1.1.3.3",
    "descripcion": "Lavadero de acero Inox. de 1 poza de 50x50",
    "unidad": "und",
    "metrado_fijo": 11,
    "cantidad_presupuestada": 11,
    "precio_unitario_presupuestado": 538.74,
    "total_presupuestado": 5926.14
  },
  {
    "codigo": "OE.4.1.1.3.4",
    "descripcion": "Lavadero de acero Inox. de 80 x 50 CM de una poza con escurridor",
    "unidad": "und",
    "metrado_fijo": 2,
    "cantidad_presupuestada": 2,
    "precio_unitario_presupuestado": 1499.44,
    "total_presupuestado": 2998.88
  },
  {
    "codigo": "OE.4.1.1.3.5",
    "descripcion": "Lavatorio de Loza",
    "unidad": "und",
    "metrado_fijo": 56,
    "cantidad_presupuestada": 56,
    "precio_unitario_presupuestado": 7.94,
    "total_presupuestado": 444.64
  },
  {
    "codigo": "OE.4.1.1.3.6",
    "descripcion": "Lavatorio de Loza tipo ovalín con pedestal",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 290,
    "total_presupuestado": 290
  },
  {
    "codigo": "OE.4.1.2.1.1",
    "descripcion": "Accesorios para urinario de loza",
    "unidad": "und",
    "metrado_fijo": 4,
    "cantidad_presupuestada": 4,
    "precio_unitario_presupuestado": 95.04,
    "total_presupuestado": 380.16
  },
  {
    "codigo": "OE.4.1.2.2.1",
    "descripcion": "Accesorios para inodoro estandar de loza",
    "unidad": "und",
    "metrado_fijo": 12,
    "cantidad_presupuestada": 12,
    "precio_unitario_presupuestado": 67.64,
    "total_presupuestado": 811.68
  },
  {
    "codigo": "OE.4.1.2.2.2",
    "descripcion": "Accesorios para inodoro tipo C -1",
    "unidad": "und",
    "metrado_fijo": 17,
    "cantidad_presupuestada": 17,
    "precio_unitario_presupuestado": 49.11,
    "total_presupuestado": 834.87
  },
  {
    "codigo": "OE.4.1.2.3.1",
    "descripcion": "Accesorios para lavatorio de loza",
    "unidad": "und",
    "metrado_fijo": 57,
    "cantidad_presupuestada": 57,
    "precio_unitario_presupuestado": 94.28,
    "total_presupuestado": 5373.96
  },
  {
    "codigo": "OE.4.1.2.3.2",
    "descripcion": "Accesorios para lavadero de acero inoxidable",
    "unidad": "und",
    "metrado_fijo": 13,
    "cantidad_presupuestada": 13,
    "precio_unitario_presupuestado": 86.76,
    "total_presupuestado": 1127.88
  },
  {
    "codigo": "OE.4.1.2.4.1",
    "descripcion": "Grifo para lavatorio de una llave",
    "unidad": "und",
    "metrado_fijo": 57,
    "cantidad_presupuestada": 57,
    "precio_unitario_presupuestado": 80.53,
    "total_presupuestado": 4590.21
  },
  {
    "codigo": "OE.4.1.2.4.2",
    "descripcion": "Grifo cromado tipo cuello de ganso de una llave",
    "unidad": "und",
    "metrado_fijo": 13,
    "cantidad_presupuestada": 13,
    "precio_unitario_presupuestado": 123.9,
    "total_presupuestado": 1610.7
  },
  {
    "codigo": "OE.4.1.2.4.3",
    "descripcion": "Ducha electrica de una llave",
    "unidad": "und",
    "metrado_fijo": 9,
    "cantidad_presupuestada": 9,
    "precio_unitario_presupuestado": 159.77,
    "total_presupuestado": 1437.93
  },
  {
    "codigo": "OE.4.1.2.5.1",
    "descripcion": "Porta rollo de loza blanca",
    "unidad": "und",
    "metrado_fijo": 29,
    "cantidad_presupuestada": 29,
    "precio_unitario_presupuestado": 37.51,
    "total_presupuestado": 1087.79
  },
  {
    "codigo": "OE.4.1.2.5.2",
    "descripcion": "Toallero de gancho",
    "unidad": "und",
    "metrado_fijo": 9,
    "cantidad_presupuestada": 9,
    "precio_unitario_presupuestado": 28.28,
    "total_presupuestado": 254.52
  },
  {
    "codigo": "OE.4.1.2.5.3",
    "descripcion": "Jabonera de loza blanca",
    "unidad": "und",
    "metrado_fijo": 9,
    "cantidad_presupuestada": 9,
    "precio_unitario_presupuestado": 31.54,
    "total_presupuestado": 283.86
  },
  {
    "codigo": "OE.4.1.3.1.1",
    "descripcion": "Instalación de Urinario de loza",
    "unidad": "und",
    "metrado_fijo": 4,
    "cantidad_presupuestada": 4,
    "precio_unitario_presupuestado": 14.74,
    "total_presupuestado": 58.96
  },
  {
    "codigo": "OE.4.1.3.2.1",
    "descripcion": "Instalación de Inodoro estandar de loza",
    "unidad": "und",
    "metrado_fijo": 12,
    "cantidad_presupuestada": 12,
    "precio_unitario_presupuestado": 23.58,
    "total_presupuestado": 282.96
  },
  {
    "codigo": "OE.4.1.3.2.2",
    "descripcion": "Instalacion de Inodoro tipo C-1",
    "unidad": "und",
    "metrado_fijo": 17,
    "cantidad_presupuestada": 17,
    "precio_unitario_presupuestado": 47.14,
    "total_presupuestado": 801.38
  },
  {
    "codigo": "OE.4.1.3.3.1",
    "descripcion": "Instalacion de lavatorio de loza tipo ovalin 60x50",
    "unidad": "und",
    "metrado_fijo": 57,
    "cantidad_presupuestada": 57,
    "precio_unitario_presupuestado": 23.58,
    "total_presupuestado": 1344.06
  },
  {
    "codigo": "OE.4.1.3.3.2",
    "descripcion": "Instalacion de lavatorio de loza tipo ovalin 45x40",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 23.58,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.1.3.3.3",
    "descripcion": "Instalacion de lavadero de acero inos. de 01 poza de 50x50cm",
    "unidad": "und",
    "metrado_fijo": 11,
    "cantidad_presupuestada": 11,
    "precio_unitario_presupuestado": 23.58,
    "total_presupuestado": 259.38
  },
  {
    "codigo": "OE.4.1.3.3.4",
    "descripcion": "Instalacion de lavadero de acero inos.  de 80x50cm de 01 poza con escurridor",
    "unidad": "und",
    "metrado_fijo": 2,
    "cantidad_presupuestada": 2,
    "precio_unitario_presupuestado": 23.58,
    "total_presupuestado": 47.16
  },
  {
    "codigo": "OE.4.1.4.1.1",
    "descripcion": "Instalacion de accesorios para urinario de loza",
    "unidad": "und",
    "metrado_fijo": 4,
    "cantidad_presupuestada": 4,
    "precio_unitario_presupuestado": 21.29,
    "total_presupuestado": 85.16
  },
  {
    "codigo": "OE.4.1.4.2.1",
    "descripcion": "Instalacion de accesorios para inodoro",
    "unidad": "und",
    "metrado_fijo": 12,
    "cantidad_presupuestada": 12,
    "precio_unitario_presupuestado": 21.29,
    "total_presupuestado": 255.48
  },
  {
    "codigo": "OE.4.1.4.2.2",
    "descripcion": "Instalacion de accesorios para inodoro tipo C-1",
    "unidad": "und",
    "metrado_fijo": 17,
    "cantidad_presupuestada": 17,
    "precio_unitario_presupuestado": 24.33,
    "total_presupuestado": 413.61
  },
  {
    "codigo": "OE.4.1.4.3.1",
    "descripcion": "Instalacion de accesorios para lavatorios de loza",
    "unidad": "und",
    "metrado_fijo": 57,
    "cantidad_presupuestada": 57,
    "precio_unitario_presupuestado": 21.29,
    "total_presupuestado": 1213.53
  },
  {
    "codigo": "OE.4.1.4.3.2",
    "descripcion": "Instalacion de accesorios para lavadero de acero inoxidable",
    "unidad": "und",
    "metrado_fijo": 13,
    "cantidad_presupuestada": 13,
    "precio_unitario_presupuestado": 21.29,
    "total_presupuestado": 276.77
  },
  {
    "codigo": "OE.4.1.4.4.1",
    "descripcion": "Instalacion de Grifo para lavatorio de una llave",
    "unidad": "und",
    "metrado_fijo": 57,
    "cantidad_presupuestada": 57,
    "precio_unitario_presupuestado": 10.65,
    "total_presupuestado": 607.05
  },
  {
    "codigo": "OE.4.1.4.4.2",
    "descripcion": "Instalacion de Grifo cromado tipo cuello de ganso de una llave",
    "unidad": "und",
    "metrado_fijo": 13,
    "cantidad_presupuestada": 13,
    "precio_unitario_presupuestado": 10.65,
    "total_presupuestado": 138.45
  },
  {
    "codigo": "OE.4.1.4.4.3",
    "descripcion": "Instalacion de ducha electrica de una llave",
    "unidad": "und",
    "metrado_fijo": 9,
    "cantidad_presupuestada": 9,
    "precio_unitario_presupuestado": 14.19,
    "total_presupuestado": 127.71
  },
  {
    "codigo": "OE.4.1.4.5.1",
    "descripcion": "Instalacion de Porta rollo de loza blanca",
    "unidad": "und",
    "metrado_fijo": 29,
    "cantidad_presupuestada": 29,
    "precio_unitario_presupuestado": 5.33,
    "total_presupuestado": 154.57
  },
  {
    "codigo": "OE.4.1.4.5.2",
    "descripcion": "Instalacion de toallero de gancho",
    "unidad": "und",
    "metrado_fijo": 9,
    "cantidad_presupuestada": 9,
    "precio_unitario_presupuestado": 5.33,
    "total_presupuestado": 47.97
  },
  {
    "codigo": "OE.4.1.4.5.3",
    "descripcion": "Instalacion de jabonera de loza blanca",
    "unidad": "und",
    "metrado_fijo": 9,
    "cantidad_presupuestada": 9,
    "precio_unitario_presupuestado": 5.33,
    "total_presupuestado": 47.97
  },
  {
    "codigo": "OE.4.2.1.2",
    "descripcion": "SALIDA DE AGUA FRIA-PVC SAP 1/2\"",
    "unidad": "pto",
    "metrado_fijo": 105,
    "cantidad_presupuestada": 105,
    "precio_unitario_presupuestado": 41.49,
    "total_presupuestado": 4356.45
  },
  {
    "codigo": "OE.4.2.1.3",
    "descripcion": "EMPALME A RED INTERIOR DE AGUA FRIA",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 31.92,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.2.1.4",
    "descripcion": "SALIDA DE AGUA FRIA-PVC SAP 1 1/2\"",
    "unidad": "pto",
    "metrado_fijo": 17,
    "cantidad_presupuestada": 17,
    "precio_unitario_presupuestado": 115.54,
    "total_presupuestado": 1964.18
  },
  {
    "codigo": "OE.4.2.2.1",
    "descripcion": "CONEXION DOMICIARIA DE AGUA FRIA DE 3/4\"",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 2891,
    "total_presupuestado": 2891
  },
  {
    "codigo": "OE.4.2.2.2",
    "descripcion": "RED DE DISTRIBUCIÓN TUBERÍA PVC CLASE 10 C/R DE 1\"",
    "unidad": "m",
    "metrado_fijo": 75.92,
    "cantidad_presupuestada": 75.92,
    "precio_unitario_presupuestado": 10.85,
    "total_presupuestado": 823.73
  },
  {
    "codigo": "OE.4.2.2.3",
    "descripcion": "RED DE DISTRIBUCIÓN TUBERÍA PVC CLASE 10 C/R DE 1 1/2\"",
    "unidad": "m",
    "metrado_fijo": 237.46,
    "cantidad_presupuestada": 237.46,
    "precio_unitario_presupuestado": 19.06,
    "total_presupuestado": 4525.99
  },
  {
    "codigo": "OE.4.2.2.4",
    "descripcion": "RED DE DISTRIBUCIÓN TUBERÍA PVC CLASE 10 C/R DE 3/4\"",
    "unidad": "m",
    "metrado_fijo": 61.2,
    "cantidad_presupuestada": 61.2,
    "precio_unitario_presupuestado": 41.51,
    "total_presupuestado": 2540.41
  },
  {
    "codigo": "OE.4.2.2.5",
    "descripcion": "RED DE DISTRIBUCIÓN TUBERÍA PVC CLASE 10 C/R DE 1/2\"",
    "unidad": "m",
    "metrado_fijo": 195.05,
    "cantidad_presupuestada": 195.05,
    "precio_unitario_presupuestado": 6.77,
    "total_presupuestado": 1320.49
  },
  {
    "codigo": "OE.4.2.3.1.1",
    "descripcion": "TRAZO Y REPLANTEO",
    "unidad": "m",
    "metrado_fijo": 954,
    "cantidad_presupuestada": 954,
    "precio_unitario_presupuestado": 3.34,
    "total_presupuestado": 3186.36
  },
  {
    "codigo": "OE.4.2.3.1.2",
    "descripcion": "EXCAVACIÓN Y PICADO DE ZANJA PARA TUBERÍA SECCIÓN A",
    "unidad": "m³",
    "metrado_fijo": 60.55,
    "cantidad_presupuestada": 60.55,
    "precio_unitario_presupuestado": 37.39,
    "total_presupuestado": 2263.96
  },
  {
    "codigo": "OE.4.2.3.1.3",
    "descripcion": "REFINE Y NIVELACION DE ZANJA PARA TUBERIA SECCIÓN A",
    "unidad": "m",
    "metrado_fijo": 72.73,
    "cantidad_presupuestada": 72.73,
    "precio_unitario_presupuestado": 5.23,
    "total_presupuestado": 380.38
  },
  {
    "codigo": "OE.4.2.3.1.4",
    "descripcion": "CAMA DE ARENA EN ZANJA P/TUB SECCIÓN A",
    "unidad": "m",
    "metrado_fijo": 72.73,
    "cantidad_presupuestada": 72.73,
    "precio_unitario_presupuestado": 15.38,
    "total_presupuestado": 1118.59
  },
  {
    "codigo": "OE.4.2.3.1.5",
    "descripcion": "RELLENO Y COMPACTACION CON EQUIPO Y MAT. SEGÚN SECCIÓN A",
    "unidad": "m",
    "metrado_fijo": 72.73,
    "cantidad_presupuestada": 72.73,
    "precio_unitario_presupuestado": 20.32,
    "total_presupuestado": 1477.87
  },
  {
    "codigo": "OE.4.2.3.1.6",
    "descripcion": "EXCAVACIÓN Y PICADO DE ZANJA PARA TUBERÍA SECCIÓN C",
    "unidad": "m³",
    "metrado_fijo": 59.39,
    "cantidad_presupuestada": 59.39,
    "precio_unitario_presupuestado": 37.39,
    "total_presupuestado": 2220.59
  },
  {
    "codigo": "OE.4.2.3.1.7",
    "descripcion": "REFINE Y NIVELACION DE ZANJA PARA TUBERIA SECCIÓN C",
    "unidad": "m",
    "metrado_fijo": 129.63,
    "cantidad_presupuestada": 129.63,
    "precio_unitario_presupuestado": 5.23,
    "total_presupuestado": 677.96
  },
  {
    "codigo": "OE.4.2.3.1.8",
    "descripcion": "CAMA DE ARENA EN ZANJA P/TUB SECCIÓN C",
    "unidad": "m",
    "metrado_fijo": 129.63,
    "cantidad_presupuestada": 129.63,
    "precio_unitario_presupuestado": 18.28,
    "total_presupuestado": 2369.64
  },
  {
    "codigo": "OE.4.2.3.1.9",
    "descripcion": "RELLENO Y COMPACTACION CON EQUIPO Y MAT. SEGÚN SECCIÓN C",
    "unidad": "m",
    "metrado_fijo": 129.63,
    "cantidad_presupuestada": 129.63,
    "precio_unitario_presupuestado": 27.28,
    "total_presupuestado": 3536.31
  },
  {
    "codigo": "OE.4.2.3.1.10",
    "descripcion": "EXCAVACIÓN Y PICADO DE ZANJA PARA TUBERÍA SECCIÓN D",
    "unidad": "m³",
    "metrado_fijo": 24.69,
    "cantidad_presupuestada": 24.69,
    "precio_unitario_presupuestado": 37.39,
    "total_presupuestado": 923.16
  },
  {
    "codigo": "OE.4.2.3.1.11",
    "descripcion": "REFINE Y NIVELACION DE ZANJA PARA TUBERIA SECCIÓN D",
    "unidad": "m",
    "metrado_fijo": 39.5,
    "cantidad_presupuestada": 39.5,
    "precio_unitario_presupuestado": 5.23,
    "total_presupuestado": 206.59
  },
  {
    "codigo": "OE.4.2.3.1.12",
    "descripcion": "CAMA DE ARENA EN ZANJA P/TUB SECCIÓN D",
    "unidad": "m",
    "metrado_fijo": 39.5,
    "cantidad_presupuestada": 39.5,
    "precio_unitario_presupuestado": 18.28,
    "total_presupuestado": 722.06
  },
  {
    "codigo": "OE.4.2.3.1.13",
    "descripcion": "RELLENO Y COMPACTACION CON EQUIPO Y MAT. SEGÚN SECCIÓN D",
    "unidad": "m",
    "metrado_fijo": 39.5,
    "cantidad_presupuestada": 39.5,
    "precio_unitario_presupuestado": 27.28,
    "total_presupuestado": 1077.56
  },
  {
    "codigo": "OE.4.2.3.1.14",
    "descripcion": "ELIMINACION MATERIAL EXCEDENTE C/MAQUINA SECCIÓN A + C + D",
    "unidad": "m³",
    "metrado_fijo": 228.12,
    "cantidad_presupuestada": 228.12,
    "precio_unitario_presupuestado": 47.45,
    "total_presupuestado": 10824.29
  },
  {
    "codigo": "OE.4.2.3.2.1",
    "descripcion": "RED DE ALIMENTACION TUBERIA PVC CLASE 10 C/R DE 1/2\" NTP 399.166",
    "unidad": "m",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 6.94,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.2.3.2.2",
    "descripcion": "RED DE ALIMENTACION TUBERIA PVC CLASE 10 C/R DE 1\" NTP 399.166",
    "unidad": "m",
    "metrado_fijo": 1.31,
    "cantidad_presupuestada": 1.31,
    "precio_unitario_presupuestado": 10.85,
    "total_presupuestado": 14.21
  },
  {
    "codigo": "OE.4.2.3.2.3",
    "descripcion": "RED DE ALIMENTACION TUBERIA PVC CLASE 10 C/R DE 1 1/2\" NTP 399.166",
    "unidad": "m",
    "metrado_fijo": 138.05,
    "cantidad_presupuestada": 138.05,
    "precio_unitario_presupuestado": 20.79,
    "total_presupuestado": 2870.06
  },
  {
    "codigo": "OE.4.2.3.2.4",
    "descripcion": "RED DE ALIMENTACION TUBERIA PVC CLASE 10 CON ROSCA DE 2\" NTP 399.166",
    "unidad": "m",
    "metrado_fijo": 69.12,
    "cantidad_presupuestada": 69.12,
    "precio_unitario_presupuestado": 25.5,
    "total_presupuestado": 1762.56
  },
  {
    "codigo": "OE.4.2.3.2.5",
    "descripcion": "RED DE ALIMENTACION TUBERIA PVC CLASE 10 CON EMBONE DE 2 1/2\" NTP 399.002",
    "unidad": "m",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 21.05,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.2.3.2.6",
    "descripcion": "MONTANTE CON TUBERÍA PVC CLASE 10 CON ROSCA DE 1 1/2\" NTP 399.166 INC ABRAZADERAS DE 2\"",
    "unidad": "m",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 45.64,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.2.3.2.7",
    "descripcion": "RED DE ALIMENTACION TUBERIA PVC CLASE 10 CON ROSCA DE 3/4\" NTP 399.166",
    "unidad": "m",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 42.01,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.2.4.1",
    "descripcion": "CODO PVC SAP C-10 DE 1/2\" CON ROSCA",
    "unidad": "und",
    "metrado_fijo": 400,
    "cantidad_presupuestada": 400,
    "precio_unitario_presupuestado": 13.07,
    "total_presupuestado": 5228
  },
  {
    "codigo": "OE.4.2.4.2",
    "descripcion": "CODO PVC SAP C-10 DE 1 1/2\" CON  ROSCA",
    "unidad": "und",
    "metrado_fijo": 95,
    "cantidad_presupuestada": 95,
    "precio_unitario_presupuestado": 19.48,
    "total_presupuestado": 1850.6
  },
  {
    "codigo": "OE.4.2.4.3",
    "descripcion": "CODO PVC SAP C-10 DE 2\" CON ROSCA",
    "unidad": "und",
    "metrado_fijo": 6,
    "cantidad_presupuestada": 6,
    "precio_unitario_presupuestado": 24.08,
    "total_presupuestado": 144.48
  },
  {
    "codigo": "OE.4.2.4.4",
    "descripcion": "CODO PVC SAP C-10 DE 2 1/2\" CON EMBONE",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 21.44,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.2.4.5",
    "descripcion": "TEE PVC-SAP C-10 DE Ø 1/2\" CON ROSCA",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 18.08,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.2.4.6",
    "descripcion": "TEE PVC-SAP C-10 DE Ø 2\" CON ROSCA",
    "unidad": "und",
    "metrado_fijo": 6,
    "cantidad_presupuestada": 6,
    "precio_unitario_presupuestado": 34.29,
    "total_presupuestado": 205.74
  },
  {
    "codigo": "OE.4.2.4.7",
    "descripcion": "TEE PVC SAP C-10 DE 2\" CON REDUCCIÓN A 1/2\"  CON ROSCA",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 45.1,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.2.4.8",
    "descripcion": "TEE PVC SAP C-10 DE 2\" CON REDUCCIÓN A 1 1/2\"  CON ROSCA",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 45.89,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.2.4.9",
    "descripcion": "TEE PVC SAP C-10 DE 2 1/2\" CON REDUCCIÓN A 1/2\"  CON ROSCA",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 86.98,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.2.4.10",
    "descripcion": "TEE PVC SAP C-10 DE 2 1/2\" CON REDUCCIÓN A 2\"  CON ROSCA",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 90.61,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.2.4.11",
    "descripcion": "TAPÓN DE 1/2\"  Ø",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 9.88,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.2.4.12",
    "descripcion": "TAPÓN DE  1-1/4\"  Ø",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 14.15,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.2.4.13",
    "descripcion": "TAPÓN DE  1-1/2\"  Ø",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 16.07,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.2.4.14",
    "descripcion": "TAPÓN DE  2\" Ø",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 21.68,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.2.4.15",
    "descripcion": "COLGADORES TIPO GOTA PARA TUBERIA",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 21.84,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.2.4.16",
    "descripcion": "CODO PVC SAP C-10 DE 1\" X 90° CON ROSCA",
    "unidad": "und",
    "metrado_fijo": 30,
    "cantidad_presupuestada": 30,
    "precio_unitario_presupuestado": 17.18,
    "total_presupuestado": 515.4
  },
  {
    "codigo": "OE.4.2.4.17",
    "descripcion": "CODO CON ROSCA PVC 1/2\" X 90° CON INSERTO METALICO HEMBRA",
    "unidad": "und",
    "metrado_fijo": 200,
    "cantidad_presupuestada": 200,
    "precio_unitario_presupuestado": 20.68,
    "total_presupuestado": 4136
  },
  {
    "codigo": "OE.4.2.4.18",
    "descripcion": "CODO PVC SAP C-10 DE 3/4\" CON ROSCA",
    "unidad": "und",
    "metrado_fijo": 55,
    "cantidad_presupuestada": 55,
    "precio_unitario_presupuestado": 19.02,
    "total_presupuestado": 1046.1
  },
  {
    "codigo": "OE.4.2.4.19",
    "descripcion": "NIPLE DE PVC 1 1/2\" X 1/2\"",
    "unidad": "und",
    "metrado_fijo": 80,
    "cantidad_presupuestada": 80,
    "precio_unitario_presupuestado": 15.68,
    "total_presupuestado": 1254.4
  },
  {
    "codigo": "OE.4.2.4.20",
    "descripcion": "NIPLE DE PVC 1\" X  1 1/2\"",
    "unidad": "und",
    "metrado_fijo": 20,
    "cantidad_presupuestada": 20,
    "precio_unitario_presupuestado": 13.75,
    "total_presupuestado": 275
  },
  {
    "codigo": "OE.4.2.4.21",
    "descripcion": "NIPLE DE PVC 1/2\" X 1 1/2\"",
    "unidad": "und",
    "metrado_fijo": 200,
    "cantidad_presupuestada": 200,
    "precio_unitario_presupuestado": 15.68,
    "total_presupuestado": 3136
  },
  {
    "codigo": "OE.4.2.4.22",
    "descripcion": "NIPLE DE PVC 2\" X 2\"",
    "unidad": "und",
    "metrado_fijo": 16,
    "cantidad_presupuestada": 16,
    "precio_unitario_presupuestado": 16.63,
    "total_presupuestado": 266.08
  },
  {
    "codigo": "OE.4.2.4.23",
    "descripcion": "NIPLE DE PVC 3/4\" X  1 1/2\"",
    "unidad": "und",
    "metrado_fijo": 80,
    "cantidad_presupuestada": 80,
    "precio_unitario_presupuestado": 13.33,
    "total_presupuestado": 1066.4
  },
  {
    "codigo": "OE.4.2.4.24",
    "descripcion": "REDUCCION BUSHING PVC C/R DE 3/4\" A 1/2\"",
    "unidad": "und",
    "metrado_fijo": 90,
    "cantidad_presupuestada": 90,
    "precio_unitario_presupuestado": 13.68,
    "total_presupuestado": 1231.2
  },
  {
    "codigo": "OE.4.2.4.25",
    "descripcion": "REDUCCION BUSHING PVC C/R DE 1 1/2\" A 1\"",
    "unidad": "und",
    "metrado_fijo": 30,
    "cantidad_presupuestada": 30,
    "precio_unitario_presupuestado": 20.23,
    "total_presupuestado": 606.9
  },
  {
    "codigo": "OE.4.2.4.26",
    "descripcion": "REDUCCION BUSHING PVC C/R DE 1 1/2\" A 3/4\"",
    "unidad": "und",
    "metrado_fijo": 20,
    "cantidad_presupuestada": 20,
    "precio_unitario_presupuestado": 20.23,
    "total_presupuestado": 404.6
  },
  {
    "codigo": "OE.4.2.4.27",
    "descripcion": "REDUCCION BUSHING PVC C/R DE 1\" A 3/4\"",
    "unidad": "und",
    "metrado_fijo": 30,
    "cantidad_presupuestada": 30,
    "precio_unitario_presupuestado": 20.23,
    "total_presupuestado": 606.9
  },
  {
    "codigo": "OE.4.2.4.28",
    "descripcion": "REDUCCION BUSHING F° G° C/R DE 1 1/2\" A 1\"",
    "unidad": "und",
    "metrado_fijo": 20,
    "cantidad_presupuestada": 20,
    "precio_unitario_presupuestado": 19.48,
    "total_presupuestado": 389.6
  },
  {
    "codigo": "OE.4.2.4.29",
    "descripcion": "REDUCCION BUSHING PVC C/R DE 2\" A 1\"",
    "unidad": "und",
    "metrado_fijo": 6,
    "cantidad_presupuestada": 6,
    "precio_unitario_presupuestado": 18.73,
    "total_presupuestado": 112.38
  },
  {
    "codigo": "OE.4.2.4.30",
    "descripcion": "REDUCCION BUSHING PVC C/R DE 2\" A 1 1/2\"",
    "unidad": "und",
    "metrado_fijo": 8,
    "cantidad_presupuestada": 8,
    "precio_unitario_presupuestado": 18.73,
    "total_presupuestado": 149.84
  },
  {
    "codigo": "OE.4.2.4.31",
    "descripcion": "REDUCCION BUSHING PVC C/R DE 1 1/2\" A 1/2\"",
    "unidad": "und",
    "metrado_fijo": 50,
    "cantidad_presupuestada": 50,
    "precio_unitario_presupuestado": 16.18,
    "total_presupuestado": 809
  },
  {
    "codigo": "OE.4.2.4.32",
    "descripcion": "REDUCCION BUSHING PVC C/R DE 1\" A 1/2\"",
    "unidad": "und",
    "metrado_fijo": 30,
    "cantidad_presupuestada": 30,
    "precio_unitario_presupuestado": 13.18,
    "total_presupuestado": 395.4
  },
  {
    "codigo": "OE.4.2.4.33",
    "descripcion": "TAPON HEMBRA DE F°G° C/R DE 1 1/2\"",
    "unidad": "und",
    "metrado_fijo": 25,
    "cantidad_presupuestada": 25,
    "precio_unitario_presupuestado": 19.03,
    "total_presupuestado": 475.75
  },
  {
    "codigo": "OE.4.2.4.34",
    "descripcion": "TAPON MACHO DE F°G° C/R DE 1/2\"",
    "unidad": "und",
    "metrado_fijo": 150,
    "cantidad_presupuestada": 150,
    "precio_unitario_presupuestado": 13.33,
    "total_presupuestado": 1999.5
  },
  {
    "codigo": "OE.4.2.4.35",
    "descripcion": "TAPON MACHO DE F°G° C/R DE 3/4\"",
    "unidad": "und",
    "metrado_fijo": 20,
    "cantidad_presupuestada": 20,
    "precio_unitario_presupuestado": 13.48,
    "total_presupuestado": 269.6
  },
  {
    "codigo": "OE.4.2.4.36",
    "descripcion": "TAPON MACHO DE F°G° C/R DE 1\"",
    "unidad": "und",
    "metrado_fijo": 20,
    "cantidad_presupuestada": 20,
    "precio_unitario_presupuestado": 13.87,
    "total_presupuestado": 277.4
  },
  {
    "codigo": "OE.4.2.4.37",
    "descripcion": "TEE PVC-SAP C-10 DE Ø 1\" CON ROSCA",
    "unidad": "und",
    "metrado_fijo": 40,
    "cantidad_presupuestada": 40,
    "precio_unitario_presupuestado": 21.38,
    "total_presupuestado": 855.2
  },
  {
    "codigo": "OE.4.2.4.38",
    "descripcion": "TEE PVC-SAP C-10 DE Ø 3/4\" CON ROSCA",
    "unidad": "und",
    "metrado_fijo": 50,
    "cantidad_presupuestada": 50,
    "precio_unitario_presupuestado": 21.38,
    "total_presupuestado": 1069
  },
  {
    "codigo": "OE.4.2.4.39",
    "descripcion": "TEE PVC C/R, INSERTO METALICO DE 1/2\"",
    "unidad": "und",
    "metrado_fijo": 50,
    "cantidad_presupuestada": 50,
    "precio_unitario_presupuestado": 34.38,
    "total_presupuestado": 1719
  },
  {
    "codigo": "OE.4.2.4.40",
    "descripcion": "UNION SIMPLE PVC C/R 1\", C-10",
    "unidad": "und",
    "metrado_fijo": 20,
    "cantidad_presupuestada": 20,
    "precio_unitario_presupuestado": 25.38,
    "total_presupuestado": 507.6
  },
  {
    "codigo": "OE.4.2.4.41",
    "descripcion": "UNION UNIVERSAL F°G° C/R, 1 1/2\"",
    "unidad": "und",
    "metrado_fijo": 46,
    "cantidad_presupuestada": 46,
    "precio_unitario_presupuestado": 50.38,
    "total_presupuestado": 2317.48
  },
  {
    "codigo": "OE.4.2.4.42",
    "descripcion": "UNION UNIVERSAL F°G° C/R, 1\"",
    "unidad": "und",
    "metrado_fijo": 16,
    "cantidad_presupuestada": 16,
    "precio_unitario_presupuestado": 35.58,
    "total_presupuestado": 569.28
  },
  {
    "codigo": "OE.4.2.4.43",
    "descripcion": "UNION UNIVERSAL F°G° C/R, 1/2\"",
    "unidad": "und",
    "metrado_fijo": 110,
    "cantidad_presupuestada": 110,
    "precio_unitario_presupuestado": 29.88,
    "total_presupuestado": 3286.8
  },
  {
    "codigo": "OE.4.2.4.44",
    "descripcion": "UNION UNIVERSAL F°G° C/R, 2\"",
    "unidad": "und",
    "metrado_fijo": 8,
    "cantidad_presupuestada": 8,
    "precio_unitario_presupuestado": 67.38,
    "total_presupuestado": 539.04
  },
  {
    "codigo": "OE.4.2.4.45",
    "descripcion": "UNION UNIVERSAL F°G° C/R, 3/4\"",
    "unidad": "und",
    "metrado_fijo": 48,
    "cantidad_presupuestada": 48,
    "precio_unitario_presupuestado": 32.73,
    "total_presupuestado": 1571.04
  },
  {
    "codigo": "OE.4.2.4.46",
    "descripcion": "UNION SIMPLE PVC C/R 1 1/2\", C-10",
    "unidad": "und",
    "metrado_fijo": 54,
    "cantidad_presupuestada": 54,
    "precio_unitario_presupuestado": 25.53,
    "total_presupuestado": 1378.62
  },
  {
    "codigo": "OE.4.2.4.47",
    "descripcion": "UNION SIMPLE PVC C/R 1/2\", C-10",
    "unidad": "und",
    "metrado_fijo": 50,
    "cantidad_presupuestada": 50,
    "precio_unitario_presupuestado": 18.78,
    "total_presupuestado": 939
  },
  {
    "codigo": "OE.4.2.4.48",
    "descripcion": "UNION SIMPLE PVC C/R, 3/4\", C-10",
    "unidad": "und",
    "metrado_fijo": 30,
    "cantidad_presupuestada": 30,
    "precio_unitario_presupuestado": 19.53,
    "total_presupuestado": 585.9
  },
  {
    "codigo": "OE.4.2.4.49",
    "descripcion": "UNION SIMPLE PVC C/R, 2\", C-10",
    "unidad": "und",
    "metrado_fijo": 20,
    "cantidad_presupuestada": 20,
    "precio_unitario_presupuestado": 26.73,
    "total_presupuestado": 534.6
  },
  {
    "codigo": "OE.4.2.4.50",
    "descripcion": "CODO F°G° C/R, 1\"",
    "unidad": "und",
    "metrado_fijo": 20,
    "cantidad_presupuestada": 20,
    "precio_unitario_presupuestado": 18.38,
    "total_presupuestado": 367.6
  },
  {
    "codigo": "OE.4.2.4.51",
    "descripcion": "TEE PVC-SAP C-10, Ø 1 1/2\", C/R",
    "unidad": "und",
    "metrado_fijo": 90,
    "cantidad_presupuestada": 90,
    "precio_unitario_presupuestado": 24.38,
    "total_presupuestado": 2194.2
  },
  {
    "codigo": "OE.4.2.5.1",
    "descripcion": "VÁLVULA ESFÉRICA 2\" Ø BRONCE C-10",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 295.59,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.2.5.2",
    "descripcion": "LLAVE D/RIEGO C/GRIFO DE 1/2\" A 0.60m S.N.P. INC. VALVULA 1/2\" Y MURO CONCRETO",
    "unidad": "und",
    "metrado_fijo": 10,
    "cantidad_presupuestada": 10,
    "precio_unitario_presupuestado": 167.67,
    "total_presupuestado": 1676.7
  },
  {
    "codigo": "OE.4.2.5.3",
    "descripcion": "VÁLVULA ESFÉRICA 3/4\" Ø BRONCE C-10",
    "unidad": "und",
    "metrado_fijo": 13,
    "cantidad_presupuestada": 13,
    "precio_unitario_presupuestado": 108.35,
    "total_presupuestado": 1408.55
  },
  {
    "codigo": "OE.4.2.5.4",
    "descripcion": "VALVULA ESFERICA DE 1\"",
    "unidad": "und",
    "metrado_fijo": 5,
    "cantidad_presupuestada": 5,
    "precio_unitario_presupuestado": 78.02,
    "total_presupuestado": 390.1
  },
  {
    "codigo": "OE.4.2.5.5",
    "descripcion": "VALVULA ESFERICA DE 1 1/2\"",
    "unidad": "und",
    "metrado_fijo": 18,
    "cantidad_presupuestada": 18,
    "precio_unitario_presupuestado": 185.17,
    "total_presupuestado": 3333.06
  },
  {
    "codigo": "OE.4.2.5.6",
    "descripcion": "VALVULA ESFERICA DE 1/2\"",
    "unidad": "und",
    "metrado_fijo": 42,
    "cantidad_presupuestada": 42,
    "precio_unitario_presupuestado": 61.02,
    "total_presupuestado": 2562.84
  },
  {
    "codigo": "OE.4.2.5.7",
    "descripcion": "NICHO DE VALVULAS",
    "unidad": "und",
    "metrado_fijo": 67,
    "cantidad_presupuestada": 67,
    "precio_unitario_presupuestado": 195.35,
    "total_presupuestado": 13088.45
  },
  {
    "codigo": "OE.4.2.6.1.1",
    "descripcion": "TUBO DE FIERRO GALVANIZADO DE Ø 1\" ROSCADA INC SOPORTERÍA Y COLGADORES",
    "unidad": "m",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 54.24,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.2.6.1.2",
    "descripcion": "TUBO DE FIERRO GALVANIZADO DE Ø 1 1/2\" ROSCADA INC SOPORTERÍA Y COLGADORES",
    "unidad": "m",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 59.49,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.2.6.1.3",
    "descripcion": "TUBO DE FIERRO GALVANIZADO DE Ø 2\" ROSCADA INC SOPORTERÍA Y COLGADORES",
    "unidad": "m",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 63.86,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.2.6.1.4",
    "descripcion": "TUBO DE FIERRO GALVANIZADO DE Ø 2 1/2\" ROSCADA INC SOPORTERÍA Y COLGADORES",
    "unidad": "m",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 68.23,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.2.6.1.5",
    "descripcion": "TUBO DE FIERRO GALVANIZADO DE Ø 4\" ROSCADA INC SOPORTERÍA Y COLGADORES",
    "unidad": "m",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 91.28,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.2.6.1.6",
    "descripcion": "CODO DE FIERRO GALVANIZADO Ø 1\"",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 15.63,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.2.6.1.7",
    "descripcion": "CODO DE FIERRO GALVANIZADO Ø 1 1/2\"",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 18.52,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.2.6.1.8",
    "descripcion": "CODO DE FIERRO GALVANIZADO Ø 2\"",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 22.92,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.2.6.1.9",
    "descripcion": "CODO DE FIERRO GALVANIZADO Ø 2 1/2\"",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 27.94,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.2.6.1.10",
    "descripcion": "CODO DE FIERRO GALVANIZADO Ø 4\"",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 53.92,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.2.6.1.11",
    "descripcion": "TEE DE FIERRO GALVANIZADO Ø 2 1/2\"",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 35.79,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.2.6.1.12",
    "descripcion": "TRAMPA DE PVC DE Ø 4\" NTP 399.003",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 52.02,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.2.6.1.13",
    "descripcion": "TEE DE FIERRO GALVANIZADO Ø 4\"",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 47.43,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.2.6.2.1",
    "descripcion": "VALVULA CHECK DE BRONCE Ø  1 1/2 C-10",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 168.03,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.2.6.2.2",
    "descripcion": "VALVULA TIPO BOLA Ø 2\"",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 226.38,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.2.6.2.3",
    "descripcion": "VALVULA TIPO BOLA Ø 1 1/2\"",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 156.73,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.2.6.2.4",
    "descripcion": "VALVULA TIPO BOLA Ø 1\"",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 134.32,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.2.6.2.5",
    "descripcion": "VALVULA FLOTADORA Ø 1\"",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 105.22,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.2.6.2.6",
    "descripcion": "VÁLVULA PIE DE SUCCIÓN Ø 2\" CON REGILLA C-10",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 193.92,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.2.6.3.1",
    "descripcion": "BRIDA DE ACERO PARA SOLDAR ROMPE AGUA DE 4\"",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 142.79,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.2.6.3.2",
    "descripcion": "UNIÓN UNIVERSAL 2\" (FIERRO GALVANIZADO)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 34.57,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.2.6.3.3",
    "descripcion": "UNIÓN UNIVERSAL 1 1/2\" (FIERRO GALVANIZADO)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 26.36,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.2.6.3.4",
    "descripcion": "UNIÓN UNIVERSAL 1\" (FIERRO GALVANIZADO)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 19.53,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.2.6.3.5",
    "descripcion": "TAPÓN DE 1\" C/R C-10",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 11.35,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.2.6.3.6",
    "descripcion": "TAPÓN DE 2 1/2\" EMBONE C-10",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 20.37,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.2.6.3.7",
    "descripcion": "REJILLA METÁLICA CON PLATINAS DE F° DE 1\" x 1/8\"",
    "unidad": "m²",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 337.89,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.2.6.3.8",
    "descripcion": "TAPA DE REGISTRO DE CUARTO DE BOMBAS",
    "unidad": "m²",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 229.92,
    "total_presupuestado": 229.92
  },
  {
    "codigo": "OE.4.2.6.3.9",
    "descripcion": "ESCALERA METÁLICA",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 336.61,
    "total_presupuestado": 336.61
  },
  {
    "codigo": "OE.4.2.6.3.10",
    "descripcion": "BRIDA DE ACERO ROMPE AGUA DE 1\"",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 115.82,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.2.6.3.11",
    "descripcion": "BRIDA DE ACERO ROMPE AGUA DE 1 1/2\"",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 125.82,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.2.6.3.12",
    "descripcion": "REJILLA METÁLICA PARA EVACUACIÓN DEL REBOSE DE TANQUE CISTERNA",
    "unidad": "m",
    "metrado_fijo": 2.92,
    "cantidad_presupuestada": 2.92,
    "precio_unitario_presupuestado": 215.66,
    "total_presupuestado": 629.73
  },
  {
    "codigo": "OE.4.2.6.4.1",
    "descripcion": "PRUEBA HIDRÁULICA Y DESINFECCIÓN A ZANJA TAPADA PARA CISTERNA",
    "unidad": "m",
    "metrado_fijo": 93,
    "cantidad_presupuestada": 93,
    "precio_unitario_presupuestado": 2.28,
    "total_presupuestado": 212.04
  },
  {
    "codigo": "OE.4.2.7.2",
    "descripcion": "PRUEBA HIDRAULICA Y DESINFECCION A ZANJA TAPADA",
    "unidad": "m",
    "metrado_fijo": 446.8,
    "cantidad_presupuestada": 446.8,
    "precio_unitario_presupuestado": 2.55,
    "total_presupuestado": 1139.34
  },
  {
    "codigo": "OE.4.2.7.3",
    "descripcion": "PRUEBA HIDRAULICA Y DESINFECCION A ZANJA ABIERTA",
    "unidad": "m",
    "metrado_fijo": 170.72,
    "cantidad_presupuestada": 170.72,
    "precio_unitario_presupuestado": 2.55,
    "total_presupuestado": 435.34
  },
  {
    "codigo": "OE.4.5.1.1",
    "descripcion": "MONTANTES Y/O BAJADAS PLUVIALES CON TUB. PVC -SAP DE  Ø 4\" INC ACCESORIOS DE PVC, PINTURA Y REJILLAS",
    "unidad": "m",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 87.81,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.5.1.2",
    "descripcion": "CANALETA EVAC AGUAS PLUVIALES DE ALUZINC e=1mm, SECCIÓN RECTANGULAR BASE 200mm CON SOPORTERIA CADA 1.50m",
    "unidad": "m",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 127.84,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.5.1.3",
    "descripcion": "MONTANTES Y/O BAJADAS PLUVIALES CON TUB, PVC SAL PESADA Ø 4\"",
    "unidad": "und",
    "metrado_fijo": 67,
    "cantidad_presupuestada": 67,
    "precio_unitario_presupuestado": 123.47,
    "total_presupuestado": 8272.49
  },
  {
    "codigo": "OE.4.5.1.4",
    "descripcion": "CODO PVC SAL PESADA Ø 4\" X 45°",
    "unidad": "und",
    "metrado_fijo": 228,
    "cantidad_presupuestada": 228,
    "precio_unitario_presupuestado": 20.33,
    "total_presupuestado": 4635.24
  },
  {
    "codigo": "OE.4.5.1.5",
    "descripcion": "CODO PVC SAL PESADA Ø 4\" X 90°",
    "unidad": "und",
    "metrado_fijo": 80,
    "cantidad_presupuestada": 80,
    "precio_unitario_presupuestado": 20.33,
    "total_presupuestado": 1626.4
  },
  {
    "codigo": "OE.4.5.1.6",
    "descripcion": "SOPORTE METALICO PARA MONTANTE Ø 4\"",
    "unidad": "und",
    "metrado_fijo": 225,
    "cantidad_presupuestada": 225,
    "precio_unitario_presupuestado": 12.05,
    "total_presupuestado": 2711.25
  },
  {
    "codigo": "OE.4.5.1.7",
    "descripcion": "CANALETA F° G° E=0.85 mm, 0.35X0.20X0.20, CON SOPORTES CADA 1.00 m.",
    "unidad": "m",
    "metrado_fijo": 560,
    "cantidad_presupuestada": 560,
    "precio_unitario_presupuestado": 117.64,
    "total_presupuestado": 65878.4
  },
  {
    "codigo": "OE.4.5.1.8",
    "descripcion": "TUBERIA PVC TIPO U, DESAGUE Ø6\" X 5 MTS, EMPALME SIMPLE.",
    "unidad": "m",
    "metrado_fijo": 100,
    "cantidad_presupuestada": 100,
    "precio_unitario_presupuestado": 39.53,
    "total_presupuestado": 3953
  },
  {
    "codigo": "OE.4.5.1.9",
    "descripcion": "COLGADORES TIPO GOTA O SIMILAR PARA TUBERIA DE  Ø4\"",
    "unidad": "pza",
    "metrado_fijo": 100,
    "cantidad_presupuestada": 100,
    "precio_unitario_presupuestado": 29.91,
    "total_presupuestado": 2991
  },
  {
    "codigo": "OE.4.5.1.10",
    "descripcion": "TABIQUE DE DOS CARAS CON UNA PLANCHA DE FIBROCEMENTO SUPERBOARD PRO 12.7 mm",
    "unidad": "und",
    "metrado_fijo": 20.25,
    "cantidad_presupuestada": 20.25,
    "precio_unitario_presupuestado": 197.7,
    "total_presupuestado": 4003.43
  },
  {
    "codigo": "OE.4.5.2.1",
    "descripcion": "PRUEBA HIDRÁULICA DE RED PLUVIAL",
    "unidad": "m",
    "metrado_fijo": 65.09,
    "cantidad_presupuestada": 65.09,
    "precio_unitario_presupuestado": 9.99,
    "total_presupuestado": 650.25
  },
  {
    "codigo": "OE.4.5.2.2",
    "descripcion": "TRAZO Y REPLANTEO",
    "unidad": "m",
    "metrado_fijo": 149.9,
    "cantidad_presupuestada": 149.9,
    "precio_unitario_presupuestado": 3.34,
    "total_presupuestado": 500.67
  },
  {
    "codigo": "OE.4.5.2.3",
    "descripcion": "EXCAVACION EN CANALES",
    "unidad": "m³",
    "metrado_fijo": 16.89,
    "cantidad_presupuestada": 16.89,
    "precio_unitario_presupuestado": 32.71,
    "total_presupuestado": 552.47
  },
  {
    "codigo": "OE.4.5.2.4",
    "descripcion": "REFINE Y NIVELACION DE ZANJAS",
    "unidad": "m",
    "metrado_fijo": 149.9,
    "cantidad_presupuestada": 149.9,
    "precio_unitario_presupuestado": 5.23,
    "total_presupuestado": 783.98
  },
  {
    "codigo": "OE.4.5.2.5",
    "descripcion": "ENCOFRADO Y DESENCOFRADO EN CANALES",
    "unidad": "m²",
    "metrado_fijo": 75.9,
    "cantidad_presupuestada": 75.9,
    "precio_unitario_presupuestado": 75.43,
    "total_presupuestado": 5725.14
  },
  {
    "codigo": "OE.4.5.2.6",
    "descripcion": "CONCRETO f'c= 175 KG/CM2 EN CANALES",
    "unidad": "m³",
    "metrado_fijo": 17.8,
    "cantidad_presupuestada": 17.8,
    "precio_unitario_presupuestado": 477.63,
    "total_presupuestado": 8501.81
  },
  {
    "codigo": "OE.4.5.2.7",
    "descripcion": "EMPEDRADO DE 0.1m A 0.2 m",
    "unidad": "m²",
    "metrado_fijo": 29.98,
    "cantidad_presupuestada": 29.98,
    "precio_unitario_presupuestado": 28.59,
    "total_presupuestado": 857.13
  },
  {
    "codigo": "OE.4.5.2.8",
    "descripcion": "REJILLA METALICA",
    "unidad": "m",
    "metrado_fijo": 109.02,
    "cantidad_presupuestada": 109.02,
    "precio_unitario_presupuestado": 273.8,
    "total_presupuestado": 29849.68
  },
  {
    "codigo": "OE.4.5.2.9",
    "descripcion": "REJILLA METALICA TIPO 2",
    "unidad": "m",
    "metrado_fijo": 33.48,
    "cantidad_presupuestada": 33.48,
    "precio_unitario_presupuestado": 227.52,
    "total_presupuestado": 7617.37
  },
  {
    "codigo": "OE.4.5.2.10",
    "descripcion": "REJILLA METALICA TIPO 3",
    "unidad": "m",
    "metrado_fijo": 7.4,
    "cantidad_presupuestada": 7.4,
    "precio_unitario_presupuestado": 176.85,
    "total_presupuestado": 1308.69
  },
  {
    "codigo": "OE.4.6.1.1",
    "descripcion": "SALIDA DE DESAGÜE - PVC CP 2\"",
    "unidad": "pto",
    "metrado_fijo": 128,
    "cantidad_presupuestada": 128,
    "precio_unitario_presupuestado": 52.42,
    "total_presupuestado": 6709.76
  },
  {
    "codigo": "OE.4.6.1.2",
    "descripcion": "SALIDA DE DESAGÜE - PVC CP 4\"",
    "unidad": "pto",
    "metrado_fijo": 65,
    "cantidad_presupuestada": 65,
    "precio_unitario_presupuestado": 70.03,
    "total_presupuestado": 4551.95
  },
  {
    "codigo": "OE.4.6.2.1",
    "descripcion": "CONEXIÓN A REDES DE DERIVACIÓN DE DESAGÜE",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 2153.77,
    "total_presupuestado": 2153.77
  },
  {
    "codigo": "OE.4.6.2.2",
    "descripcion": "RED VENTILACION CON TUBERIA DE PVC SAP Ø DE 2\" NTP 399.033",
    "unidad": "m",
    "metrado_fijo": 235.79,
    "cantidad_presupuestada": 235.79,
    "precio_unitario_presupuestado": 23.86,
    "total_presupuestado": 5625.95
  },
  {
    "codigo": "OE.4.6.2.3",
    "descripcion": "SALIDA TUBERIA DE VENTILACION PVC Ø  2\"",
    "unidad": "und",
    "metrado_fijo": 57,
    "cantidad_presupuestada": 57,
    "precio_unitario_presupuestado": 47.34,
    "total_presupuestado": 2698.38
  },
  {
    "codigo": "OE.4.6.2.4",
    "descripcion": "SOMBRERO EN SALIDA TUBERIA VENTILACION Ø  2\"",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 22.59,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.6.2.5",
    "descripcion": "SUMIDERO DE VENTILACION INCLUYE CODO PVC Ø 2\"",
    "unidad": "und",
    "metrado_fijo": 57,
    "cantidad_presupuestada": 57,
    "precio_unitario_presupuestado": 21.11,
    "total_presupuestado": 1203.27
  },
  {
    "codigo": "OE.4.6.3.1.1",
    "descripcion": "TRAZO Y REPLANTEO",
    "unidad": "m",
    "metrado_fijo": 707.95,
    "cantidad_presupuestada": 707.95,
    "precio_unitario_presupuestado": 3.34,
    "total_presupuestado": 2364.55
  },
  {
    "codigo": "OE.4.6.3.1.2",
    "descripcion": "EXCAVACION DE ZANJA PARA TUBERIA SECCIÓN B",
    "unidad": "m³",
    "metrado_fijo": 141.64,
    "cantidad_presupuestada": 141.64,
    "precio_unitario_presupuestado": 32.71,
    "total_presupuestado": 4633.04
  },
  {
    "codigo": "OE.4.6.3.1.3",
    "descripcion": "REFINE Y NIVELACION DE ZANJA PARA TUBERIA SECCIÓN B",
    "unidad": "m",
    "metrado_fijo": 412.75,
    "cantidad_presupuestada": 412.75,
    "precio_unitario_presupuestado": 5.23,
    "total_presupuestado": 2158.68
  },
  {
    "codigo": "OE.4.6.3.1.4",
    "descripcion": "CAMA DE ARENA EN ZANJA P/TUB SECCIÓN B",
    "unidad": "m",
    "metrado_fijo": 412.75,
    "cantidad_presupuestada": 412.75,
    "precio_unitario_presupuestado": 15.38,
    "total_presupuestado": 6348.1
  },
  {
    "codigo": "OE.4.6.3.1.5",
    "descripcion": "RELLENO Y COMPACTACION CON EQUIPO Y MAT. SEGÚN SECCIÓN B",
    "unidad": "m",
    "metrado_fijo": 412.75,
    "cantidad_presupuestada": 412.75,
    "precio_unitario_presupuestado": 21.42,
    "total_presupuestado": 8841.11
  },
  {
    "codigo": "OE.4.6.3.1.6",
    "descripcion": "ELIMINACION MATERIAL EXCEDENTE C/MAQUINA SECCIÓN B",
    "unidad": "m³",
    "metrado_fijo": 148.62,
    "cantidad_presupuestada": 148.62,
    "precio_unitario_presupuestado": 47.45,
    "total_presupuestado": 7052.02
  },
  {
    "codigo": "OE.4.6.3.2.1",
    "descripcion": "RED COLECTORA CON TUBERÍA DE PVC SAP Ø DE 3\" NTP 399.003.",
    "unidad": "m",
    "metrado_fijo": 3.74,
    "cantidad_presupuestada": 3.74,
    "precio_unitario_presupuestado": 19.83,
    "total_presupuestado": 74.16
  },
  {
    "codigo": "OE.4.6.3.2.2",
    "descripcion": "RED COLECTORA CON TUBERÍA DE PVC SAP Ø DE 4\" NTP 399.003.",
    "unidad": "m",
    "metrado_fijo": 280.31,
    "cantidad_presupuestada": 280.31,
    "precio_unitario_presupuestado": 28.15,
    "total_presupuestado": 7890.73
  },
  {
    "codigo": "OE.4.6.3.2.3",
    "descripcion": "RED COLECTORA CON TUBERÍA DE PVC SAP Ø DE 6\" NTP 399.003.",
    "unidad": "m",
    "metrado_fijo": 52.54,
    "cantidad_presupuestada": 52.54,
    "precio_unitario_presupuestado": 58.91,
    "total_presupuestado": 3095.13
  },
  {
    "codigo": "OE.4.6.3.2.4",
    "descripcion": "MONTANTE Y/O VENTILACION CON TUBERIA PVC - SAP Ø DE 4\" NTP 399.003. INC ABRAZADERAS",
    "unidad": "m",
    "metrado_fijo": 3,
    "cantidad_presupuestada": 3,
    "precio_unitario_presupuestado": 93.07,
    "total_presupuestado": 279.21
  },
  {
    "codigo": "OE.4.6.3.2.5",
    "descripcion": "RED COLECTORA CON TUBERIA DE PVC SAP Ø DE 2\"  NTP 399.003",
    "unidad": "m",
    "metrado_fijo": 191.45,
    "cantidad_presupuestada": 191.45,
    "precio_unitario_presupuestado": 15.17,
    "total_presupuestado": 2904.3
  },
  {
    "codigo": "OE.4.6.4.1",
    "descripcion": "YEE PVC SAP DE 4\" X 4\"",
    "unidad": "und",
    "metrado_fijo": 20,
    "cantidad_presupuestada": 20,
    "precio_unitario_presupuestado": 19.74,
    "total_presupuestado": 394.8
  },
  {
    "codigo": "OE.4.6.4.2",
    "descripcion": "CODO PVC SAP DE 45° X 2 1/2\"",
    "unidad": "und",
    "metrado_fijo": 2,
    "cantidad_presupuestada": 2,
    "precio_unitario_presupuestado": 23.51,
    "total_presupuestado": 47.02
  },
  {
    "codigo": "OE.4.6.4.3",
    "descripcion": "CODO PVC SAP DE 90° X 2 1/2\"",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 23.51,
    "total_presupuestado": 23.51
  },
  {
    "codigo": "OE.4.6.4.4",
    "descripcion": "YEE PVC DESAGUE DE 4\" X 2\"",
    "unidad": "und",
    "metrado_fijo": 75,
    "cantidad_presupuestada": 75,
    "precio_unitario_presupuestado": 23.35,
    "total_presupuestado": 1751.25
  },
  {
    "codigo": "OE.4.6.4.5",
    "descripcion": "YEE PVC DESAGUE DE 2\" X 2\"",
    "unidad": "und",
    "metrado_fijo": 40,
    "cantidad_presupuestada": 40,
    "precio_unitario_presupuestado": 18.42,
    "total_presupuestado": 736.8
  },
  {
    "codigo": "OE.4.6.4.6",
    "descripcion": "CODO PVC DESAGUE DE 45° X 2\"",
    "unidad": "und",
    "metrado_fijo": 27,
    "cantidad_presupuestada": 27,
    "precio_unitario_presupuestado": 17.4,
    "total_presupuestado": 469.8
  },
  {
    "codigo": "OE.4.6.4.7",
    "descripcion": "CODO PVC DESAGUE DE 45° X 4\"",
    "unidad": "und",
    "metrado_fijo": 10,
    "cantidad_presupuestada": 10,
    "precio_unitario_presupuestado": 17.5,
    "total_presupuestado": 175
  },
  {
    "codigo": "OE.4.6.4.8",
    "descripcion": "CODO PVC DESAGUE DE 90° X 2\"",
    "unidad": "und",
    "metrado_fijo": 120,
    "cantidad_presupuestada": 120,
    "precio_unitario_presupuestado": 16.27,
    "total_presupuestado": 1952.4
  },
  {
    "codigo": "OE.4.6.4.9",
    "descripcion": "CODO PVC DESAGUE DE 90° X 4\"",
    "unidad": "und",
    "metrado_fijo": 32,
    "cantidad_presupuestada": 32,
    "precio_unitario_presupuestado": 17.5,
    "total_presupuestado": 560
  },
  {
    "codigo": "OE.4.6.4.10",
    "descripcion": "TEE DESAGUE PVC 4\"",
    "unidad": "und",
    "metrado_fijo": 35,
    "cantidad_presupuestada": 35,
    "precio_unitario_presupuestado": 18.87,
    "total_presupuestado": 660.45
  },
  {
    "codigo": "OE.4.6.4.11",
    "descripcion": "TEE DESAGUE PVC 2\"",
    "unidad": "und",
    "metrado_fijo": 50,
    "cantidad_presupuestada": 50,
    "precio_unitario_presupuestado": 15.92,
    "total_presupuestado": 796
  },
  {
    "codigo": "OE.4.6.4.12.1",
    "descripcion": "SUMIDERO DE BRONCE DE 3\" PROVISIÓN Y COLOCACIÓN",
    "unidad": "und",
    "metrado_fijo": 7,
    "cantidad_presupuestada": 7,
    "precio_unitario_presupuestado": 26.22,
    "total_presupuestado": 183.54
  },
  {
    "codigo": "OE.4.6.4.12.2",
    "descripcion": "REGISTRO ROSCADO DE BRONCE DE 4\" PROVISIÓN Y COLOCACIÓN",
    "unidad": "und",
    "metrado_fijo": 34,
    "cantidad_presupuestada": 34,
    "precio_unitario_presupuestado": 53.07,
    "total_presupuestado": 1804.38
  },
  {
    "codigo": "OE.4.6.4.12.3",
    "descripcion": "REGISTRO ROSCADO DE BRONCE DE 4\" TIPO DADO, SUMINISTRO E INSTALACION",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 53.07,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.6.4.12.4",
    "descripcion": "SUMIDERO DE BRONCE DE 2\" PROVISION Y COLOCACION",
    "unidad": "und",
    "metrado_fijo": 43,
    "cantidad_presupuestada": 43,
    "precio_unitario_presupuestado": 31.26,
    "total_presupuestado": 1344.18
  },
  {
    "codigo": "OE.4.6.4.12.5",
    "descripcion": "COLGADORES TIPO GOTA PARA TUBERIA",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 21.84,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.6.5.1.1",
    "descripcion": "CAJA DE REG.PREFAB. 0.30x0.60m C/TAPA CONC., Incl R-6\"",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 243.86,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.6.5.1.2",
    "descripcion": "CAJA DE REG.PREFAB. 0.60x0.60m C/TAPA CONC.",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 217.21,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.6.5.1.3",
    "descripcion": "BUZÓN D=1.20m, PORF. PROM. 1.35m",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 870.08,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.6.5.1.4",
    "descripcion": "CAJUELA DE CONCRETO DE 0.30X0.30m CON REJILLA METÁLICA - IN SITU",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 279.58,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.6.5.1.5.2",
    "descripcion": "PRUEBA HIDRÁULICA DE ESCORRENTÍA DE TUB. DESAGÜE",
    "unidad": "m",
    "metrado_fijo": 270.69,
    "cantidad_presupuestada": 270.69,
    "precio_unitario_presupuestado": 3.27,
    "total_presupuestado": 885.16
  },
  {
    "codigo": "OE.4.6.5.1.6",
    "descripcion": "Concreto F'c=175 kg/cm² para cajas de registro",
    "unidad": "und",
    "metrado_fijo": 9.5,
    "cantidad_presupuestada": 9.5,
    "precio_unitario_presupuestado": 485.28,
    "total_presupuestado": 4610.16
  },
  {
    "codigo": "OE.4.6.5.1.7",
    "descripcion": "Encofrado y desencofrado",
    "unidad": "und",
    "metrado_fijo": 110.1,
    "cantidad_presupuestada": 110.1,
    "precio_unitario_presupuestado": 51.84,
    "total_presupuestado": 5707.58
  },
  {
    "codigo": "OE.4.6.5.1.8",
    "descripcion": "Acero corrugado Fý=4200 Kg/cm2 grado 60",
    "unidad": "und",
    "metrado_fijo": 1367.56,
    "cantidad_presupuestada": 1367.56,
    "precio_unitario_presupuestado": 7.82,
    "total_presupuestado": 10694.32
  },
  {
    "codigo": "OE.4.6.7.1.1",
    "descripcion": "SUMINISTRO E INSTALACIÓN DE EQUIPO DE BOMBEO DE AGUA FRIA DURA, VELOCIDAD VARIABLE, PRESION CONSTANTE Q= 4 LPS, ADT=38 M, MULTIETAPICA P=2.5 HP, INCL, TABLEROS Y CABLEADO ELECTRICO",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 10531.39,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.4.6.7.1.2",
    "descripcion": "SUMINISTRO,INSTALACION,PRUEBAS Y PUESTA EN FUNCIONAMIENTO DEL SISTEMA DE PRESION CONSTANTE",
    "unidad": "gbl",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 37000,
    "total_presupuestado": 37000
  },
  {
    "codigo": "OE.4.6.8.1",
    "descripcion": "LIMPIEZA DE TERRENO MANUAL",
    "unidad": "m²",
    "metrado_fijo": 2.99,
    "cantidad_presupuestada": 2.99,
    "precio_unitario_presupuestado": 1.33,
    "total_presupuestado": 3.98
  },
  {
    "codigo": "OE.4.6.8.2",
    "descripcion": "TRAZO, NIVELES Y REPLANTEO",
    "unidad": "m²",
    "metrado_fijo": 2.99,
    "cantidad_presupuestada": 2.99,
    "precio_unitario_presupuestado": 3.65,
    "total_presupuestado": 10.91
  },
  {
    "codigo": "OE.4.6.8.3",
    "descripcion": "NIVELACION DE TERRENO",
    "unidad": "m²",
    "metrado_fijo": 2.99,
    "cantidad_presupuestada": 2.99,
    "precio_unitario_presupuestado": 7.44,
    "total_presupuestado": 22.25
  },
  {
    "codigo": "OE.4.6.8.4",
    "descripcion": "EXCAVACION MANUAL MATERIAL SUELTO",
    "unidad": "m³",
    "metrado_fijo": 4.36,
    "cantidad_presupuestada": 4.36,
    "precio_unitario_presupuestado": 53.36,
    "total_presupuestado": 232.65
  },
  {
    "codigo": "OE.4.6.8.5",
    "descripcion": "ELIMINACION DE MATERIAL EXCEDENTE MANUAL",
    "unidad": "m³",
    "metrado_fijo": 5.24,
    "cantidad_presupuestada": 5.24,
    "precio_unitario_presupuestado": 8.89,
    "total_presupuestado": 46.58
  },
  {
    "codigo": "OE.4.6.8.6",
    "descripcion": "SUMINISTRO DE BIODIGESTOR",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 3134.43,
    "total_presupuestado": 3134.43
  },
  {
    "codigo": "OE.4.6.8.7",
    "descripcion": "INSTALACION DE BIODIGESTOR",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 173.63,
    "total_presupuestado": 173.63
  },
  {
    "codigo": "OE.4.6.8.8.1",
    "descripcion": "LIMPIEZA DE TERRENO MANUAL",
    "unidad": "m²",
    "metrado_fijo": 5.16,
    "cantidad_presupuestada": 5.16,
    "precio_unitario_presupuestado": 1.33,
    "total_presupuestado": 6.86
  },
  {
    "codigo": "OE.4.6.8.8.2",
    "descripcion": "TRAZO, NIVELES Y REPLANTEO",
    "unidad": "m²",
    "metrado_fijo": 5.16,
    "cantidad_presupuestada": 5.16,
    "precio_unitario_presupuestado": 3.65,
    "total_presupuestado": 18.83
  },
  {
    "codigo": "OE.4.6.8.8.3",
    "descripcion": "EXCAVACION MANUAL MATERIAL SUELTO",
    "unidad": "m³",
    "metrado_fijo": 2.58,
    "cantidad_presupuestada": 2.58,
    "precio_unitario_presupuestado": 53.36,
    "total_presupuestado": 137.67
  },
  {
    "codigo": "OE.4.6.8.8.4",
    "descripcion": "ELIMINACION DE MATERIAL EXCEDENTE MANUAL",
    "unidad": "m³",
    "metrado_fijo": 3.1,
    "cantidad_presupuestada": 3.1,
    "precio_unitario_presupuestado": 8.89,
    "total_presupuestado": 27.56
  },
  {
    "codigo": "OE.4.6.8.8.5",
    "descripcion": "SUMINISTRO E INSTALACIÓN TUBERIA PVC SAL Ø4\"",
    "unidad": "m",
    "metrado_fijo": 8.6,
    "cantidad_presupuestada": 8.6,
    "precio_unitario_presupuestado": 25.2,
    "total_presupuestado": 216.72
  },
  {
    "codigo": "OE.4.6.8.9.1",
    "descripcion": "CONCRETO F’C=175 KG/CM2",
    "unidad": "m³",
    "metrado_fijo": 1.09,
    "cantidad_presupuestada": 1.09,
    "precio_unitario_presupuestado": 485.28,
    "total_presupuestado": 528.96
  },
  {
    "codigo": "OE.4.6.8.10.1",
    "descripcion": "CONCRETO F’C=210 KG/CM2",
    "unidad": "m³",
    "metrado_fijo": 0.05,
    "cantidad_presupuestada": 0.05,
    "precio_unitario_presupuestado": 473.1,
    "total_presupuestado": 23.66
  },
  {
    "codigo": "OE.4.6.8.10.2",
    "descripcion": "ENCOFRADO Y DESENCOFRADO",
    "unidad": "m²",
    "metrado_fijo": 0.28,
    "cantidad_presupuestada": 0.28,
    "precio_unitario_presupuestado": 51.84,
    "total_presupuestado": 14.52
  },
  {
    "codigo": "OE.4.6.8.10.3",
    "descripcion": "ACERO CORRUGADO FY=4200 KG/CM2, GRADO 60",
    "unidad": "kg",
    "metrado_fijo": 2.18,
    "cantidad_presupuestada": 2.18,
    "precio_unitario_presupuestado": 7.82,
    "total_presupuestado": 17.05
  },
  {
    "codigo": "OE.4.6.8.11.1",
    "descripcion": "TAPA INSPECCIÓN DE BIODIGESTOR",
    "unidad": "gbl",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1586.4,
    "total_presupuestado": 1586.4
  },
  {
    "codigo": "OE.4.6.9.1.1",
    "descripcion": "LIMPIEZA DE TERRENO MANUAL",
    "unidad": "m²",
    "metrado_fijo": 9,
    "cantidad_presupuestada": 9,
    "precio_unitario_presupuestado": 1.33,
    "total_presupuestado": 11.97
  },
  {
    "codigo": "OE.4.6.9.1.2",
    "descripcion": "TRAZO Y REPLANTEO PRELIMINAR",
    "unidad": "m²",
    "metrado_fijo": 9,
    "cantidad_presupuestada": 9,
    "precio_unitario_presupuestado": 3.65,
    "total_presupuestado": 32.85
  },
  {
    "codigo": "OE.4.6.9.2.1",
    "descripcion": "EXCAVACION MANUAL EN TERRENO NATURAL",
    "unidad": "m³",
    "metrado_fijo": 17.48,
    "cantidad_presupuestada": 17.48,
    "precio_unitario_presupuestado": 53.36,
    "total_presupuestado": 932.73
  },
  {
    "codigo": "OE.4.6.9.2.2",
    "descripcion": "RELLENO CON MATERIAL GRANULAR",
    "unidad": "m³",
    "metrado_fijo": 7.26,
    "cantidad_presupuestada": 7.26,
    "precio_unitario_presupuestado": 119.85,
    "total_presupuestado": 870.11
  },
  {
    "codigo": "OE.4.6.9.2.3",
    "descripcion": "ELIMINACIÓN DE MATERIAL EXCEDENTE",
    "unidad": "m³",
    "metrado_fijo": 20.98,
    "cantidad_presupuestada": 20.98,
    "precio_unitario_presupuestado": 8.89,
    "total_presupuestado": 186.51
  },
  {
    "codigo": "OE.4.6.9.3.1",
    "descripcion": "CONCRETO F’C=175 KG/CM2",
    "unidad": "m³",
    "metrado_fijo": 2.36,
    "cantidad_presupuestada": 2.36,
    "precio_unitario_presupuestado": 485.28,
    "total_presupuestado": 1145.26
  },
  {
    "codigo": "OE.4.6.9.4.1",
    "descripcion": "CONCRETO F’C=210 KG/CM2",
    "unidad": "m³",
    "metrado_fijo": 0.59,
    "cantidad_presupuestada": 0.59,
    "precio_unitario_presupuestado": 473.1,
    "total_presupuestado": 279.13
  },
  {
    "codigo": "OE.4.6.9.4.2",
    "descripcion": "ENCOFRADO Y DESENCOFRADO",
    "unidad": "m²",
    "metrado_fijo": 9.32,
    "cantidad_presupuestada": 9.32,
    "precio_unitario_presupuestado": 51.84,
    "total_presupuestado": 483.15
  },
  {
    "codigo": "OE.4.6.9.4.3",
    "descripcion": "ACERO CORRUGADO FY=4200 KG/CM2, GRADO 60",
    "unidad": "kg",
    "metrado_fijo": 29.77,
    "cantidad_presupuestada": 29.77,
    "precio_unitario_presupuestado": 7.82,
    "total_presupuestado": 232.8
  },
  {
    "codigo": "OE.4.6.9.5.1",
    "descripcion": "SUMINISTRO E INSTALACIÓN DE TUBERÍA PVC SAL Ø2\"",
    "unidad": "m",
    "metrado_fijo": 6,
    "cantidad_presupuestada": 6,
    "precio_unitario_presupuestado": 12.99,
    "total_presupuestado": 77.94
  },
  {
    "codigo": "OE.4.6.9.6.1",
    "descripcion": "MAMPOSTERIA CON LADRILLO KK CABEZA",
    "unidad": "m²",
    "metrado_fijo": 16.59,
    "cantidad_presupuestada": 16.59,
    "precio_unitario_presupuestado": 156.95,
    "total_presupuestado": 2603.8
  },
  {
    "codigo": "OE.4.7.6",
    "descripcion": "REGISTRO ROSCADO DE BRONCE DE 2\" PROVISIÓN Y COLOCACIÓN",
    "unidad": "und",
    "metrado_fijo": 6,
    "cantidad_presupuestada": 6,
    "precio_unitario_presupuestado": 35.39,
    "total_presupuestado": 212.34
  },
  {
    "codigo": "OE.5.1.1",
    "descripcion": "Sistema de Utilización en Media Tensión Subestación Tipo Seco Compacto  de 150 KVA.",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 251785.97,
    "total_presupuestado": 251785.97
  },
  {
    "codigo": "OE.5.2.1.1.1",
    "descripcion": "Salida para Alumbrado",
    "unidad": "pto",
    "metrado_fijo": 425,
    "cantidad_presupuestada": 425,
    "precio_unitario_presupuestado": 34.25,
    "total_presupuestado": 14556.25
  },
  {
    "codigo": "OE.5.2.1.1.2",
    "descripcion": "Salida para alumbrado exterior en poste tipo alumbrado público",
    "unidad": "pto",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 34.25,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.1.1.3",
    "descripcion": "Salida para Alumbrado de Emergencia",
    "unidad": "pto",
    "metrado_fijo": 42,
    "cantidad_presupuestada": 42,
    "precio_unitario_presupuestado": 34.25,
    "total_presupuestado": 1438.5
  },
  {
    "codigo": "OE.5.2.1.2.1",
    "descripcion": "Salida para tomacorriente Bipolar Doble con linea a tierra (F+ N+T), 16 A. 250 V. GRADO HOSPITALARIO DADOS COLOR BLANCO PARA USO GENERAL (SISTEMA NORMAL).",
    "unidad": "pto",
    "metrado_fijo": 350,
    "cantidad_presupuestada": 350,
    "precio_unitario_presupuestado": 93.66,
    "total_presupuestado": 32781
  },
  {
    "codigo": "OE.5.2.1.2.2",
    "descripcion": "Salida para tomacorriente Bipolar Doble  Tipo Mixto tres en linea  y  tipo Schuko  (F+N+T), 16 A. 250 V. EN PARA USO GENERAL (NO ESTABILIZADO) (EQUIP. MEDICO). EMPOTRADO EN MURO",
    "unidad": "pto",
    "metrado_fijo": 7,
    "cantidad_presupuestada": 7,
    "precio_unitario_presupuestado": 119.14,
    "total_presupuestado": 833.98
  },
  {
    "codigo": "OE.5.2.1.2.3",
    "descripcion": "Salida para tomacorriente Bipolar Doble con linea a tierra  tipo Schuko (F+N+T), 16A. 250 V. GRADO HOSPITALARIO DADOS C",
    "unidad": "pto",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 122.67,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.1.2.4",
    "descripcion": "Tomacorriente doble para empotrar con puesta a tierra 15A/220v/60Hz estabilizado",
    "unidad": "pto",
    "metrado_fijo": 26,
    "cantidad_presupuestada": 26,
    "precio_unitario_presupuestado": 63.53,
    "total_presupuestado": 1651.78
  },
  {
    "codigo": "OE.5.2.1.3.1",
    "descripcion": "Salida de Fuerza con Caja y tapa Biselada de 100 x 100 x 100 mm( Duchas, equipos biomedicos, etc)",
    "unidad": "pto",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 41.46,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.1.3.2",
    "descripcion": "Salida de Fuerza para electrobomba a prueba de agua",
    "unidad": "pto",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 38.91,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.1.3.3",
    "descripcion": "Salida de fuerza con tomacorriente 25A/220v/60Hz salvo indicacion en plano",
    "unidad": "pto",
    "metrado_fijo": 11,
    "cantidad_presupuestada": 11,
    "precio_unitario_presupuestado": 54.23,
    "total_presupuestado": 596.53
  },
  {
    "codigo": "OE.5.2.1.3.4",
    "descripcion": "Salida de fuerza para rapiducha electrica, calota o tablero de PVC 4 polos/ ITM 2x25A",
    "unidad": "pto",
    "metrado_fijo": 9,
    "cantidad_presupuestada": 9,
    "precio_unitario_presupuestado": 128.59,
    "total_presupuestado": 1157.31
  },
  {
    "codigo": "OE.5.2.1.3.5",
    "descripcion": "Salida de fuerza para aire acondicionado tipo SPLIT",
    "unidad": "pto",
    "metrado_fijo": 6,
    "cantidad_presupuestada": 6,
    "precio_unitario_presupuestado": 54.23,
    "total_presupuestado": 325.38
  },
  {
    "codigo": "OE.5.2.1.3.6",
    "descripcion": "Salida de fuerza para compresora de odontologia, calota o tablero de PVC 4 polos/ ITM 2x25A",
    "unidad": "pto",
    "metrado_fijo": 3,
    "cantidad_presupuestada": 3,
    "precio_unitario_presupuestado": 128.59,
    "total_presupuestado": 385.77
  },
  {
    "codigo": "OE.5.2.1.3.7",
    "descripcion": "Salida de fuerza para sillon odontologico, caja de paso de 100x55x50 mm",
    "unidad": "pto",
    "metrado_fijo": 3,
    "cantidad_presupuestada": 3,
    "precio_unitario_presupuestado": 25.53,
    "total_presupuestado": 76.59
  },
  {
    "codigo": "OE.5.2.1.3.8",
    "descripcion": "Salida de fueza para comunicaciones",
    "unidad": "pto",
    "metrado_fijo": 3,
    "cantidad_presupuestada": 3,
    "precio_unitario_presupuestado": 128.59,
    "total_presupuestado": 385.77
  },
  {
    "codigo": "OE.5.2.1.4.1",
    "descripcion": "Salida para Interruptor Simple con placa de acero inoxidable Tipo Balancin  grado Hospitalario",
    "unidad": "pto",
    "metrado_fijo": 88,
    "cantidad_presupuestada": 88,
    "precio_unitario_presupuestado": 60.65,
    "total_presupuestado": 5337.2
  },
  {
    "codigo": "OE.5.2.1.4.2",
    "descripcion": "Salida para Interruptor doble con placa de acero inoxidable Tipo Balancin  grado Hospitalario",
    "unidad": "pto",
    "metrado_fijo": 52,
    "cantidad_presupuestada": 52,
    "precio_unitario_presupuestado": 94.66,
    "total_presupuestado": 4922.32
  },
  {
    "codigo": "OE.5.2.1.4.3",
    "descripcion": "Salida para Interruptor triple con placa de acero inoxidable Tipo Balancin  grado Hospitalario",
    "unidad": "pto",
    "metrado_fijo": 18,
    "cantidad_presupuestada": 18,
    "precio_unitario_presupuestado": 101.29,
    "total_presupuestado": 1823.22
  },
  {
    "codigo": "OE.5.2.1.4.4",
    "descripcion": "Salida para Interruptor Simple de tres vías  con placa de acero  (Conmutación) Tipo Balancin  grado Hospitalario",
    "unidad": "pto",
    "metrado_fijo": 2,
    "cantidad_presupuestada": 2,
    "precio_unitario_presupuestado": 92.04,
    "total_presupuestado": 184.08
  },
  {
    "codigo": "OE.5.2.1.4.5",
    "descripcion": "Interruptor Simple suspendido cabecera de cama (colgado) Tipo Balancin  grado Hospitalario",
    "unidad": "pto",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 62.64,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.1.5.1",
    "descripcion": "Caja de pase F°G° 400x400x75mm",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 100.44,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.1.5.2",
    "descripcion": "Caja de pase F°G° 200x200x75mm",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 55.33,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.1.5.3",
    "descripcion": "Caja de pase F°G° 150x150x75mm",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 43,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.1.5.4",
    "descripcion": "Caja de pase F°G° 100x100x75mm",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 36.82,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.1.5.5",
    "descripcion": "Caja de pase F°G° 100x55x55mm",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 31.32,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.1.5.6",
    "descripcion": "Caja de pase F°G° 150X150X100mm",
    "unidad": "und",
    "metrado_fijo": 56,
    "cantidad_presupuestada": 56,
    "precio_unitario_presupuestado": 38.91,
    "total_presupuestado": 2178.96
  },
  {
    "codigo": "OE.5.2.1.5.7",
    "descripcion": "Caja de pase F°G° 300X300X100mm",
    "unidad": "und",
    "metrado_fijo": 12,
    "cantidad_presupuestada": 12,
    "precio_unitario_presupuestado": 74.47,
    "total_presupuestado": 893.64
  },
  {
    "codigo": "OE.5.2.1.5.8",
    "descripcion": "Caja de pase F°G° 200X200X100mm",
    "unidad": "und",
    "metrado_fijo": 46,
    "cantidad_presupuestada": 46,
    "precio_unitario_presupuestado": 49.29,
    "total_presupuestado": 2267.34
  },
  {
    "codigo": "OE.5.2.1.5.9",
    "descripcion": "Caja de pase F°G° 100x100x100mm",
    "unidad": "und",
    "metrado_fijo": 120,
    "cantidad_presupuestada": 120,
    "precio_unitario_presupuestado": 41.46,
    "total_presupuestado": 4975.2
  },
  {
    "codigo": "OE.5.2.2.1",
    "descripcion": "Tubería para Alimentadores  PVC SAP NTP 399.006 DE 100 mm",
    "unidad": "m",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 34.33,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.2.2",
    "descripcion": "Tubería para Alimentadores  PVC SAP NTP 399.006 DE 35 mm",
    "unidad": "m",
    "metrado_fijo": 88,
    "cantidad_presupuestada": 88,
    "precio_unitario_presupuestado": 10.06,
    "total_presupuestado": 885.28
  },
  {
    "codigo": "OE.5.2.2.3",
    "descripcion": "Tubería para Alimentadores  PVC SAP NTP 399.006 DE 25 mm",
    "unidad": "m",
    "metrado_fijo": 230,
    "cantidad_presupuestada": 230,
    "precio_unitario_presupuestado": 8.64,
    "total_presupuestado": 1987.2
  },
  {
    "codigo": "OE.5.2.2.4",
    "descripcion": "Tubería alumbrado y tomacorrientes PVC SAP NTP 399.006 DE 20 mm",
    "unidad": "m",
    "metrado_fijo": 1836,
    "cantidad_presupuestada": 1836,
    "precio_unitario_presupuestado": 7.84,
    "total_presupuestado": 14394.24
  },
  {
    "codigo": "OE.5.2.2.5",
    "descripcion": "Unión PVC SAP NTP 399.006 DE 100 mm",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 11.63,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.2.6",
    "descripcion": "Unión PVC SAP NTP 399.006 DE 35 mm",
    "unidad": "und",
    "metrado_fijo": 12,
    "cantidad_presupuestada": 12,
    "precio_unitario_presupuestado": 4.63,
    "total_presupuestado": 55.56
  },
  {
    "codigo": "OE.5.2.2.7",
    "descripcion": "Unión PVC SAP NTP 399.006 DE 25 mm",
    "unidad": "und",
    "metrado_fijo": 112,
    "cantidad_presupuestada": 112,
    "precio_unitario_presupuestado": 4.2,
    "total_presupuestado": 470.4
  },
  {
    "codigo": "OE.5.2.2.8",
    "descripcion": "Unión PVC SAP NTP 399.006 DE 20 mm",
    "unidad": "und",
    "metrado_fijo": 1226,
    "cantidad_presupuestada": 1226,
    "precio_unitario_presupuestado": 3.45,
    "total_presupuestado": 4229.7
  },
  {
    "codigo": "OE.5.2.2.9",
    "descripcion": "Curva PVC SAP NTP 399.006 DE 100 mm",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 19.85,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.2.10",
    "descripcion": "Curva PVC SAP NTP 399.006 DE 35mm",
    "unidad": "und",
    "metrado_fijo": 12,
    "cantidad_presupuestada": 12,
    "precio_unitario_presupuestado": 17.9,
    "total_presupuestado": 214.8
  },
  {
    "codigo": "OE.5.2.2.11",
    "descripcion": "Curva PVC SAP NTP 399.006 DE 25mm",
    "unidad": "und",
    "metrado_fijo": 122,
    "cantidad_presupuestada": 122,
    "precio_unitario_presupuestado": 6.99,
    "total_presupuestado": 852.78
  },
  {
    "codigo": "OE.5.2.2.12",
    "descripcion": "Curva PVC SAP NTP 399.006 DE 20 mm",
    "unidad": "und",
    "metrado_fijo": 1226,
    "cantidad_presupuestada": 1226,
    "precio_unitario_presupuestado": 4.51,
    "total_presupuestado": 5529.26
  },
  {
    "codigo": "OE.5.2.2.13",
    "descripcion": "Conector PVC SAP NTP 399.006 DE 100mm",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 9.6,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.2.14",
    "descripcion": "Conector PVC SAP NTP 399.006 DE 35mm",
    "unidad": "und",
    "metrado_fijo": 12,
    "cantidad_presupuestada": 12,
    "precio_unitario_presupuestado": 5.58,
    "total_presupuestado": 66.96
  },
  {
    "codigo": "OE.5.2.2.15",
    "descripcion": "Conector PVC SAP NTP 399.006 DE 25 mm",
    "unidad": "und",
    "metrado_fijo": 112,
    "cantidad_presupuestada": 112,
    "precio_unitario_presupuestado": 5.58,
    "total_presupuestado": 624.96
  },
  {
    "codigo": "OE.5.2.2.16",
    "descripcion": "Conector PVC SAP NTP 399.006 DE 20 mm",
    "unidad": "und",
    "metrado_fijo": 1226,
    "cantidad_presupuestada": 1226,
    "precio_unitario_presupuestado": 4.07,
    "total_presupuestado": 4989.82
  },
  {
    "codigo": "OE.5.2.2.17",
    "descripcion": "Tubería para Alimentadores PVC SAP NTP 399.006 DE 50 mm",
    "unidad": "m",
    "metrado_fijo": 426,
    "cantidad_presupuestada": 426,
    "precio_unitario_presupuestado": 15.31,
    "total_presupuestado": 6522.06
  },
  {
    "codigo": "OE.5.2.2.18",
    "descripcion": "Tubería para Alimentadores PVC SAP NTP 399.006 DE 65 mm",
    "unidad": "m",
    "metrado_fijo": 86,
    "cantidad_presupuestada": 86,
    "precio_unitario_presupuestado": 20.72,
    "total_presupuestado": 1781.92
  },
  {
    "codigo": "OE.5.2.2.19",
    "descripcion": "Tubería para Alimentadores PVC SAP NTP 399.006 DE 80 mm",
    "unidad": "m",
    "metrado_fijo": 176,
    "cantidad_presupuestada": 176,
    "precio_unitario_presupuestado": 31.18,
    "total_presupuestado": 5487.68
  },
  {
    "codigo": "OE.5.2.2.20",
    "descripcion": "Unión PVC SAP NTP 399.006 DE 50 mm",
    "unidad": "und",
    "metrado_fijo": 86,
    "cantidad_presupuestada": 86,
    "precio_unitario_presupuestado": 7.25,
    "total_presupuestado": 623.5
  },
  {
    "codigo": "OE.5.2.2.21",
    "descripcion": "Unión PVC SAP NTP 399.006 DE 65 mm",
    "unidad": "und",
    "metrado_fijo": 12,
    "cantidad_presupuestada": 12,
    "precio_unitario_presupuestado": 9.85,
    "total_presupuestado": 118.2
  },
  {
    "codigo": "OE.5.2.2.22",
    "descripcion": "Unión PVC SAP NTP 399.006 DE 80 mm",
    "unidad": "und",
    "metrado_fijo": 16,
    "cantidad_presupuestada": 16,
    "precio_unitario_presupuestado": 11.35,
    "total_presupuestado": 181.6
  },
  {
    "codigo": "OE.5.2.2.23",
    "descripcion": "Curva PVC SAP NTP 399.006 DE 50 mm",
    "unidad": "und",
    "metrado_fijo": 106,
    "cantidad_presupuestada": 106,
    "precio_unitario_presupuestado": 21.95,
    "total_presupuestado": 2326.7
  },
  {
    "codigo": "OE.5.2.2.24",
    "descripcion": "Curva PVC SAP NTP 399.006 DE 65 mm",
    "unidad": "und",
    "metrado_fijo": 12,
    "cantidad_presupuestada": 12,
    "precio_unitario_presupuestado": 24.15,
    "total_presupuestado": 289.8
  },
  {
    "codigo": "OE.5.2.2.25",
    "descripcion": "Curva PVC SAP NTP 399.006 DE 80 mm",
    "unidad": "und",
    "metrado_fijo": 6,
    "cantidad_presupuestada": 6,
    "precio_unitario_presupuestado": 28.65,
    "total_presupuestado": 171.9
  },
  {
    "codigo": "OE.5.2.2.26",
    "descripcion": "Conector PVC SAP NTP 399.006 DE 50 mm",
    "unidad": "und",
    "metrado_fijo": 78,
    "cantidad_presupuestada": 78,
    "precio_unitario_presupuestado": 8.25,
    "total_presupuestado": 643.5
  },
  {
    "codigo": "OE.5.2.2.27",
    "descripcion": "Conector PVC SAP NTP 399.006 DE 65 mm",
    "unidad": "und",
    "metrado_fijo": 12,
    "cantidad_presupuestada": 12,
    "precio_unitario_presupuestado": 8.85,
    "total_presupuestado": 106.2
  },
  {
    "codigo": "OE.5.2.2.28",
    "descripcion": "Conector PVC SAP NTP 399.006 DE 80 mm",
    "unidad": "und",
    "metrado_fijo": 15,
    "cantidad_presupuestada": 15,
    "precio_unitario_presupuestado": 10.65,
    "total_presupuestado": 159.75
  },
  {
    "codigo": "OE.5.2.2.29",
    "descripcion": "Tubería Conduit EMT de 20 mm",
    "unidad": "m",
    "metrado_fijo": 1860,
    "cantidad_presupuestada": 1860,
    "precio_unitario_presupuestado": 11.81,
    "total_presupuestado": 21966.6
  },
  {
    "codigo": "OE.5.2.2.30",
    "descripcion": "Tubería Conduit EMT de 25 mm",
    "unidad": "m",
    "metrado_fijo": 168,
    "cantidad_presupuestada": 168,
    "precio_unitario_presupuestado": 17.23,
    "total_presupuestado": 2894.64
  },
  {
    "codigo": "OE.5.2.2.31",
    "descripcion": "Union Conduit EMT de 20 mm",
    "unidad": "und",
    "metrado_fijo": 837,
    "cantidad_presupuestada": 837,
    "precio_unitario_presupuestado": 5.52,
    "total_presupuestado": 4620.24
  },
  {
    "codigo": "OE.5.2.2.32",
    "descripcion": "Union Conduit ETM de 25 mm",
    "unidad": "und",
    "metrado_fijo": 88,
    "cantidad_presupuestada": 88,
    "precio_unitario_presupuestado": 6.55,
    "total_presupuestado": 576.4
  },
  {
    "codigo": "OE.5.2.2.33",
    "descripcion": "Curva Conduit EMT de 20 mm",
    "unidad": "und",
    "metrado_fijo": 383,
    "cantidad_presupuestada": 383,
    "precio_unitario_presupuestado": 5.84,
    "total_presupuestado": 2236.72
  },
  {
    "codigo": "OE.5.2.2.34",
    "descripcion": "Curva Conduit ETM de 25 mm",
    "unidad": "und",
    "metrado_fijo": 31,
    "cantidad_presupuestada": 31,
    "precio_unitario_presupuestado": 9.66,
    "total_presupuestado": 299.46
  },
  {
    "codigo": "OE.5.2.2.35",
    "descripcion": "Conector Conduit EMT de 20 mm",
    "unidad": "und",
    "metrado_fijo": 909,
    "cantidad_presupuestada": 909,
    "precio_unitario_presupuestado": 4.14,
    "total_presupuestado": 3763.26
  },
  {
    "codigo": "OE.5.2.2.36",
    "descripcion": "Conector Conduit EMT de 25 mm",
    "unidad": "und",
    "metrado_fijo": 88,
    "cantidad_presupuestada": 88,
    "precio_unitario_presupuestado": 7.93,
    "total_presupuestado": 697.84
  },
  {
    "codigo": "OE.5.2.3.1",
    "descripcion": "Cable NH-80 DE 4 mm2 ALUMBRADO + TOMACORRIENTES",
    "unidad": "m",
    "metrado_fijo": 12830,
    "cantidad_presupuestada": 12830,
    "precio_unitario_presupuestado": 5.07,
    "total_presupuestado": 65048.1
  },
  {
    "codigo": "OE.5.2.3.2",
    "descripcion": "Cable Cu NH-80  1 x 6 mm2 Alimentadores Fuerza",
    "unidad": "m",
    "metrado_fijo": 1440,
    "cantidad_presupuestada": 1440,
    "precio_unitario_presupuestado": 5.34,
    "total_presupuestado": 7689.6
  },
  {
    "codigo": "OE.5.2.3.3",
    "descripcion": "Cable N2XOH  de 1 x 6 mm2 Alimentadores",
    "unidad": "m",
    "metrado_fijo": 1816.46,
    "cantidad_presupuestada": 1816.46,
    "precio_unitario_presupuestado": 6.44,
    "total_presupuestado": 11698
  },
  {
    "codigo": "OE.5.2.3.4",
    "descripcion": "Cable N2XOH  de 1 x 10 mm2 Alimentadores",
    "unidad": "m",
    "metrado_fijo": 1279.03,
    "cantidad_presupuestada": 1279.03,
    "precio_unitario_presupuestado": 11.77,
    "total_presupuestado": 15054.18
  },
  {
    "codigo": "OE.5.2.3.5",
    "descripcion": "Cable N2XOH  de 1 x 16 mm2 Alimentadores",
    "unidad": "m",
    "metrado_fijo": 181.85,
    "cantidad_presupuestada": 181.85,
    "precio_unitario_presupuestado": 16.27,
    "total_presupuestado": 2958.7
  },
  {
    "codigo": "OE.5.2.3.6",
    "descripcion": "Cable N2XOH  de 1 x 25 mm2 Alimentadores",
    "unidad": "m",
    "metrado_fijo": 92.8,
    "cantidad_presupuestada": 92.8,
    "precio_unitario_presupuestado": 21.27,
    "total_presupuestado": 1973.86
  },
  {
    "codigo": "OE.5.2.3.7",
    "descripcion": "Cable N2XOH  de 1 x 70 mm2 Alimentadores",
    "unidad": "m",
    "metrado_fijo": 124.08,
    "cantidad_presupuestada": 124.08,
    "precio_unitario_presupuestado": 59.13,
    "total_presupuestado": 7336.85
  },
  {
    "codigo": "OE.5.2.3.8",
    "descripcion": "Cable N2XOH  de 1 x 120 mm2 Alimentadores",
    "unidad": "m",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 69.27,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.3.9",
    "descripcion": "Cable Cu Desnudo Cableado 1 x 25 mm2",
    "unidad": "m",
    "metrado_fijo": 64,
    "cantidad_presupuestada": 64,
    "precio_unitario_presupuestado": 23.91,
    "total_presupuestado": 1530.24
  },
  {
    "codigo": "OE.5.2.3.10",
    "descripcion": "Cable Cu Desnudo Cableado  1 x 50 mm2",
    "unidad": "m",
    "metrado_fijo": 28,
    "cantidad_presupuestada": 28,
    "precio_unitario_presupuestado": 46.51,
    "total_presupuestado": 1302.28
  },
  {
    "codigo": "OE.5.2.3.11",
    "descripcion": "Pruebas Eléctricas ( Aislamiento y Continuidad). DE CIRCUITOS DE ALUMBRADO, TOMACORRIENTES Y ALIMENTADORES",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1918.5,
    "total_presupuestado": 1918.5
  },
  {
    "codigo": "OE.5.2.3.12",
    "descripcion": "Cable N2XOH  de 1 x 95 mm2 Alimentadores",
    "unidad": "m",
    "metrado_fijo": 13.5,
    "cantidad_presupuestada": 13.5,
    "precio_unitario_presupuestado": 82.11,
    "total_presupuestado": 1108.49
  },
  {
    "codigo": "OE.5.2.3.13",
    "descripcion": "Cable N2XOH  de 1 x 50 mm2 Alimentadores",
    "unidad": "m",
    "metrado_fijo": 154.31,
    "cantidad_presupuestada": 154.31,
    "precio_unitario_presupuestado": 37.85,
    "total_presupuestado": 5840.63
  },
  {
    "codigo": "OE.5.2.3.14",
    "descripcion": "Cable N2XOH  de 1 x 35 mm2 Alimentadores",
    "unidad": "m",
    "metrado_fijo": 525.79,
    "cantidad_presupuestada": 525.79,
    "precio_unitario_presupuestado": 27.27,
    "total_presupuestado": 14338.29
  },
  {
    "codigo": "OE.5.2.4.1",
    "descripcion": "Canaleta para conductor enterrado 0.40 x 0.60 m",
    "unidad": "m",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 69.1,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.4.2",
    "descripcion": "Buzon Electroducto de Concreto Armado con tapa 0.60 x0.60 x 0.60m",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 614.86,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.4.3",
    "descripcion": "Canal para tubería enterrada de 0.50X0.60m",
    "unidad": "m",
    "metrado_fijo": 214.51,
    "cantidad_presupuestada": 214.51,
    "precio_unitario_presupuestado": 27.56,
    "total_presupuestado": 5911.9
  },
  {
    "codigo": "OE.5.2.4.4",
    "descripcion": "Buzón electroducto de concreto con tapa 0.80x0.80x1.10",
    "unidad": "und",
    "metrado_fijo": 8,
    "cantidad_presupuestada": 8,
    "precio_unitario_presupuestado": 560.42,
    "total_presupuestado": 4483.36
  },
  {
    "codigo": "OE.5.2.4.5",
    "descripcion": "Buzón electroducto de concreto con tapa 0.80x0.60x0.80",
    "unidad": "und",
    "metrado_fijo": 5,
    "cantidad_presupuestada": 5,
    "precio_unitario_presupuestado": 560.42,
    "total_presupuestado": 2802.1
  },
  {
    "codigo": "OE.5.2.6.1",
    "descripcion": "TABLERO PRINCIPAL DE F°G° AUTOSOPORTADO TRIFASICO ( 380 / 220 VOLTIOS), PARA 15 PROTECCIONES DE CAJA MOLDEADA TIPO TETRA",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 2579.88,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.6.2",
    "descripcion": "TABLERO AUTOSOPORTADO GENERAL TG",
    "unidad": "gbl",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 23885.75,
    "total_presupuestado": 23885.75
  },
  {
    "codigo": "OE.5.2.7.1",
    "descripcion": "TABLERO DE DISTRIBUCIÓN TD-01 (36 polos)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 750.64,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.7.2",
    "descripcion": "TABLERO DE DISTRIBUCIÓN TD-02 (48 polos)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 877.24,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.7.3",
    "descripcion": "TABLERO DE DISTRIBUCIÓN TD-03 (48 polos)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 877.24,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.7.4",
    "descripcion": "TABLERO DE DISTRIBUCIÓN TD-04 (42 polos)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 848.94,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.7.5",
    "descripcion": "TABLERO DE DISTRIBUCIÓN TD-05 ( 42 polos)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 848.94,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.7.6",
    "descripcion": "TABLERO DE DISTRIBUCIÓN TD-06 (36 polos)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 750.64,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.7.7",
    "descripcion": "TABLERO DE DISTRIBUCIÓN TD-07 ( 8 polos)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 507.09,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.7.8",
    "descripcion": "TABLERO DE DISTRIBUCIÓN T- AE ( AREAS EXTERNAS) ( 12 polos)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 507.09,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.7.9",
    "descripcion": "TABLERO DE DISTRIBUCIÓN T- AL ( ALMACENES) ( 12 polos)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 507.09,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.7.10",
    "descripcion": "TABLERO DE DISTRIBUCIÓN TD-AC ( 60 polos) (TD08 AREAS COMUNES)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 2697.76,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.7.11",
    "descripcion": "TABLERO DE DISTRIBUCIÓN T- CA ( CONSULTA ADMISION) ( 8 polos)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 507.09,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.7.12",
    "descripcion": "TABLERO DE DISTRIBUCIÓN T- CG ( CASETA DE GRUPO Y SED) ( 12 polos)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 566.02,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.7.13",
    "descripcion": "TABLERO DE DISTRIBUCIÓN T- E ( ESTABILIZADO) ( 18 polos)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 613.13,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.7.14",
    "descripcion": "TABLERO DE DISTRIBUCIÓN T- BOM  ( 24 polos)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 656.25,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.7.15",
    "descripcion": "TABLERO DE DISTRIBUCIÓN TD-CF1 ( 48 polos)( CARGAS DE FUERZAS 01)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 877.24,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.7.16",
    "descripcion": "TABLERO DE DISTRIBUCIÓN TD-CF2 ( 60 polos)( CARGAS DE FUERZAS 02)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 2933.5,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.7.17",
    "descripcion": "Termimales Para Termomagnéticos Para Conductores De 4, 6 10, 16,25, 35, 50, 70  y 120 mm2",
    "unidad": "und",
    "metrado_fijo": 480,
    "cantidad_presupuestada": 480,
    "precio_unitario_presupuestado": 7.46,
    "total_presupuestado": 3580.8
  },
  {
    "codigo": "OE.5.2.7.18",
    "descripcion": "Marcadores de Fase Para Conductores",
    "unidad": "und",
    "metrado_fijo": 480,
    "cantidad_presupuestada": 480,
    "precio_unitario_presupuestado": 4.63,
    "total_presupuestado": 2222.4
  },
  {
    "codigo": "OE.5.2.7.19",
    "descripcion": "Tapas de Reserva para Tableros",
    "unidad": "und",
    "metrado_fijo": 41,
    "cantidad_presupuestada": 41,
    "precio_unitario_presupuestado": 6.82,
    "total_presupuestado": 279.62
  },
  {
    "codigo": "OE.5.2.7.20",
    "descripcion": "Prueba de aislamiento de tableros",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 3538.09,
    "total_presupuestado": 3538.09
  },
  {
    "codigo": "OE.5.2.7.21",
    "descripcion": "Laminas de señalizacion contra riesgo electrico para tableros",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 11.3,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.7.22",
    "descripcion": "Tablero de Distribucion TD-01",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1901.17,
    "total_presupuestado": 1901.17
  },
  {
    "codigo": "OE.5.2.7.23",
    "descripcion": "Tablero de Distribucion TD-02",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 2035.75,
    "total_presupuestado": 2035.75
  },
  {
    "codigo": "OE.5.2.7.24",
    "descripcion": "Tablero de Distribucion TD-03",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 2035.75,
    "total_presupuestado": 2035.75
  },
  {
    "codigo": "OE.5.2.7.25",
    "descripcion": "Tablero de Distribucion TD-04",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1835.75,
    "total_presupuestado": 1835.75
  },
  {
    "codigo": "OE.5.2.7.26",
    "descripcion": "Tablero de Distribucion TD-05",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1185.75,
    "total_presupuestado": 1185.75
  },
  {
    "codigo": "OE.5.2.7.27",
    "descripcion": "Tablero de Distribucion TD-06",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 367.87,
    "total_presupuestado": 367.87
  },
  {
    "codigo": "OE.5.2.7.28",
    "descripcion": "Tablero de Distribucion TD-07",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1835.75,
    "total_presupuestado": 1835.75
  },
  {
    "codigo": "OE.5.2.7.29",
    "descripcion": "Tablero de Distribucion TD-08",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1185.75,
    "total_presupuestado": 1185.75
  },
  {
    "codigo": "OE.5.2.7.30",
    "descripcion": "Tablero de Distribucion TD-09",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1835.75,
    "total_presupuestado": 1835.75
  },
  {
    "codigo": "OE.5.2.7.31",
    "descripcion": "Tablero de Distribucion TD-10",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1055.75,
    "total_presupuestado": 1055.75
  },
  {
    "codigo": "OE.5.2.7.32",
    "descripcion": "Tablero de Distribucion TD-11",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1055.75,
    "total_presupuestado": 1055.75
  },
  {
    "codigo": "OE.5.2.7.33",
    "descripcion": "Tablero de Distribucion TD-12",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1435.75,
    "total_presupuestado": 1435.75
  },
  {
    "codigo": "OE.5.2.7.34",
    "descripcion": "Tablero de Distribucion TD-13",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1055.75,
    "total_presupuestado": 1055.75
  },
  {
    "codigo": "OE.5.2.7.35",
    "descripcion": "Tablero de Distribucion TD-14",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1185.75,
    "total_presupuestado": 1185.75
  },
  {
    "codigo": "OE.5.2.7.36",
    "descripcion": "Tablero de Sub Distribucion TD-14-1",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1185.75,
    "total_presupuestado": 1185.75
  },
  {
    "codigo": "OE.5.2.7.37",
    "descripcion": "Tablero de Distribucion Estabilizado TDE-01",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1435.75,
    "total_presupuestado": 1435.75
  },
  {
    "codigo": "OE.5.2.7.38",
    "descripcion": "Tablero de Distribucion Estabilizado TDE-02",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1435.75,
    "total_presupuestado": 1435.75
  },
  {
    "codigo": "OE.5.2.7.39",
    "descripcion": "Tablero Bypass Comunicaciones TDC-01",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 1055.75,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.7.40",
    "descripcion": "Tablero de Distribucion TD-AA-01",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1055.75,
    "total_presupuestado": 1055.75
  },
  {
    "codigo": "OE.5.2.7.41",
    "descripcion": "Tablero de Distribucion TD-AA-02",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1055.75,
    "total_presupuestado": 1055.75
  },
  {
    "codigo": "OE.5.2.8.1",
    "descripcion": "Interruptor Termomagnetico de Caja Moldeada  Tetrapolar    4 x 350 A,  30 KA",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 2466.47,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.8.2",
    "descripcion": "Interruptor Termomagnetico de Caja Moldeada  Tetrapolar    4 x 140 A,  30 KA",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 959.37,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.8.3",
    "descripcion": "Interruptor Termomagnetico de Caja Moldeada Tetrapolar    4 x 120 A,  30 KA",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 880.31,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.8.4",
    "descripcion": "Interruptor Termomagnetico de Caja Moldeada  Tetrapolar    4 x 80 A,  20 KA",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 801.25,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.8.5",
    "descripcion": "Interruptor Termomagnetico de Caja Moldeada  Tetrapolar    4 x 70 A,  20 KA",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 801.25,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.8.6",
    "descripcion": "Interruptor Termomagnetico de Caja Moldeada  Tetrapolar    4 x 60 A,  20 KA",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 765.85,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.8.7",
    "descripcion": "Interruptor Termomagnetico de Caja Moldeada  Tetrapolar    4 x 50 A,  20 KA",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 765.85,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.8.8",
    "descripcion": "Interruptor Termomagnetico de Caja Moldeada  Tetrapolar    4 x 40 A,  20 KA",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 765.85,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.8.9",
    "descripcion": "Interruptor Termomagnetico de Caja Moldeada  Tetrapolar   4 x 30 A,  20 KA",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 765.85,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.8.10",
    "descripcion": "Interruptor Termomagnetico de Caja Moldeada  Tetrapolar   4 x 20 A,  20 KA",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 765.85,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.2.8.11",
    "descripcion": "Interruptor Termomagnetico Tipo Riel  Bipolar   2 x 30 A,  10 KA",
    "unidad": "und",
    "metrado_fijo": 22,
    "cantidad_presupuestada": 22,
    "precio_unitario_presupuestado": 64.41,
    "total_presupuestado": 1417.02
  },
  {
    "codigo": "OE.5.2.8.12",
    "descripcion": "Interruptor Termomagnético Tipo Riel Bipolar 2 X 20 A  10 KA",
    "unidad": "und",
    "metrado_fijo": 54,
    "cantidad_presupuestada": 54,
    "precio_unitario_presupuestado": 52.13,
    "total_presupuestado": 2815.02
  },
  {
    "codigo": "OE.5.2.8.13",
    "descripcion": "Interruptor Termomagnético Tipo Riel Bipolar 2 X 16 A  10 KA",
    "unidad": "und",
    "metrado_fijo": 56,
    "cantidad_presupuestada": 56,
    "precio_unitario_presupuestado": 52.13,
    "total_presupuestado": 2919.28
  },
  {
    "codigo": "OE.5.2.8.14",
    "descripcion": "Interruptor diferencial 2 x 25 A - 30 miliamperios",
    "unidad": "und",
    "metrado_fijo": 100,
    "cantidad_presupuestada": 100,
    "precio_unitario_presupuestado": 146.19,
    "total_presupuestado": 14619
  },
  {
    "codigo": "OE.5.2.8.15",
    "descripcion": "Contactor monofasico de 20 Amperios",
    "unidad": "und",
    "metrado_fijo": 2,
    "cantidad_presupuestada": 2,
    "precio_unitario_presupuestado": 155.7,
    "total_presupuestado": 311.4
  },
  {
    "codigo": "OE.5.2.8.16",
    "descripcion": "Reloj Horario",
    "unidad": "und",
    "metrado_fijo": 2,
    "cantidad_presupuestada": 2,
    "precio_unitario_presupuestado": 31.89,
    "total_presupuestado": 63.78
  },
  {
    "codigo": "OE.5.2.8.17",
    "descripcion": "Prueba de aislamiento de tableros",
    "unidad": "glb",
    "metrado_fijo": 2,
    "cantidad_presupuestada": 2,
    "precio_unitario_presupuestado": 3538.09,
    "total_presupuestado": 7076.18
  },
  {
    "codigo": "OE.5.2.8.18",
    "descripcion": "Prueba de balanceo de carga",
    "unidad": "glb",
    "metrado_fijo": 2,
    "cantidad_presupuestada": 2,
    "precio_unitario_presupuestado": 2897.19,
    "total_presupuestado": 5794.38
  },
  {
    "codigo": "OE.5.2.8.19",
    "descripcion": "Interruptor Termomagnético tipo caja moldeada 3X200A / 220V / 60Hz / 25KA",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 664.19,
    "total_presupuestado": 664.19
  },
  {
    "codigo": "OE.5.2.8.20",
    "descripcion": "Interruptor Termomagnético tipo caja moldeada 3X160A / 220V / 60Hz / 16KA",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 624.19,
    "total_presupuestado": 624.19
  },
  {
    "codigo": "OE.5.2.8.21",
    "descripcion": "Interruptor Termomagnético tipo caja moldeada 3X80A / 220V / 60Hz / 16KA",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 319.19,
    "total_presupuestado": 319.19
  },
  {
    "codigo": "OE.5.2.8.22",
    "descripcion": "Interruptor Termomagnético tipo caja moldeada 3X63A / 220V / 60Hz / 16KA",
    "unidad": "und",
    "metrado_fijo": 4,
    "cantidad_presupuestada": 4,
    "precio_unitario_presupuestado": 304.19,
    "total_presupuestado": 1216.76
  },
  {
    "codigo": "OE.5.2.8.23",
    "descripcion": "Interruptor Termomagnético tipo caja moldeada 3X40A / 220V / 60Hz / 16KA",
    "unidad": "und",
    "metrado_fijo": 12,
    "cantidad_presupuestada": 12,
    "precio_unitario_presupuestado": 304.19,
    "total_presupuestado": 3650.28
  },
  {
    "codigo": "OE.5.2.8.24",
    "descripcion": "Interruptor Termomagnético para riel DIN 3X32A / 220V / 60Hz / 10KA",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 124.19,
    "total_presupuestado": 124.19
  },
  {
    "codigo": "OE.5.2.8.25",
    "descripcion": "Interruptor Termomagnético para riel DIN 3X50A / 220V / 60Hz / 10KA",
    "unidad": "und",
    "metrado_fijo": 2,
    "cantidad_presupuestada": 2,
    "precio_unitario_presupuestado": 134.19,
    "total_presupuestado": 268.38
  },
  {
    "codigo": "OE.5.2.8.26",
    "descripcion": "Dispositivo de proteccion contra sobre tension",
    "unidad": "und",
    "metrado_fijo": 20,
    "cantidad_presupuestada": 20,
    "precio_unitario_presupuestado": 1428.39,
    "total_presupuestado": 28567.8
  },
  {
    "codigo": "OE.5.2.8.27",
    "descripcion": "Interruptor Termomagnético para riel DIN 3X40A/220V/60Hz/10KA",
    "unidad": "und",
    "metrado_fijo": 20,
    "cantidad_presupuestada": 20,
    "precio_unitario_presupuestado": 377.19,
    "total_presupuestado": 7543.8
  },
  {
    "codigo": "OE.5.3.1",
    "descripcion": "Suministro e Instalación de Postes de CAC DE 8m",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 856.16,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.4.1",
    "descripcion": "Pararrayo  TIPO PDC 3,3 RADIO 65m, Nivel III, C/Disposit. de Cebado.",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 7251.97,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.4.2",
    "descripcion": "Sistema de protección contra descargas eléctricas",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 7825.96,
    "total_presupuestado": 7825.96
  },
  {
    "codigo": "OE.5.5.1",
    "descripcion": "Pozo puesta a tierra",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1375.62,
    "total_presupuestado": 1375.62
  },
  {
    "codigo": "OE.5.5.2",
    "descripcion": "Pruebas Eléctricas ( Resistencia de Puesta a Tierra)",
    "unidad": "und",
    "metrado_fijo": 12,
    "cantidad_presupuestada": 12,
    "precio_unitario_presupuestado": 415.65,
    "total_presupuestado": 4987.8
  },
  {
    "codigo": "OE.5.5.3",
    "descripcion": "Puesta a tierra",
    "unidad": "und",
    "metrado_fijo": 12,
    "cantidad_presupuestada": 12,
    "precio_unitario_presupuestado": 1815.07,
    "total_presupuestado": 21780.84
  },
  {
    "codigo": "OE.5.6.1.1",
    "descripcion": "LUMINARIA TIPO DOWNLIGHT DE 2X18W, CODIGO DE PROTECCION IP 44, ADOSADO",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 157.66,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.1.2",
    "descripcion": "SPOT LIGHT DECORATIVO DLD 1x35W 220V, PARA ADOSAR",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 157.66,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.1.3",
    "descripcion": "BRAQUETE DE ALUMBRADO DE CABECERA DE CAMA 2x20W, PARA ADOSAR",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 135.24,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.1.4",
    "descripcion": "BRAQUETE DE ALUMBRADO PARA PASILLOS RSP 2X18W, PARA ADOSAR",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 167.12,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.1.5",
    "descripcion": "LUMINARIA HERMETICA CON TUBO LED CON DIFUSOR DE 2x36W (OFICINAS Y ZONAS DE ACCESO DEL PERSONAL) PARA ADOSAR",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 253.61,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.1.6",
    "descripcion": "LUMINARIA PARA ADOSAR CON TUBO LED DE 2x36W Y BALASTO ELECTRONICO",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 250.15,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.1.7",
    "descripcion": "LÁMPARA GERMICIDA ULTRAVIOLETA 30W, 220V 60HZ CON BALASTRO ELECTRÓNICO PARA ADOSAR",
    "unidad": "und",
    "metrado_fijo": 2,
    "cantidad_presupuestada": 2,
    "precio_unitario_presupuestado": 285.47,
    "total_presupuestado": 570.94
  },
  {
    "codigo": "OE.5.6.1.8",
    "descripcion": "LUMINARIA PARA ALUMBRADO DE GUARDIA CON LAMP. AHORRADORAS DE 11W, 220V, 60Hz PARA ADOSAR",
    "unidad": "und",
    "metrado_fijo": 6,
    "cantidad_presupuestada": 6,
    "precio_unitario_presupuestado": 90.22,
    "total_presupuestado": 541.32
  },
  {
    "codigo": "OE.5.6.1.9",
    "descripcion": "LAMPARA CIALITICA",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 24521.42,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.1.10",
    "descripcion": "LUMINARIA LED DE ALUMBRADO PUBLICO DE 150W (ZONA EXTERIOR DE AMBULANCIAS)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 601.87,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.1.11",
    "descripcion": "LUZ DE EMERGENCIA DE BATERÍA TIPO LED 35 W PARA ADOSAR IP 42, IK 07",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 309.48,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.1.12",
    "descripcion": "Prueba de medición del nivel de iluminación en interiores y exteriores",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1478.85,
    "total_presupuestado": 1478.85
  },
  {
    "codigo": "OE.5.6.1.13",
    "descripcion": "Luminaria tipo PANEL LED para empotrar, 60x60cm, 36w, 220v, 60Hz.",
    "unidad": "und",
    "metrado_fijo": 239,
    "cantidad_presupuestada": 239,
    "precio_unitario_presupuestado": 222.8,
    "total_presupuestado": 53249.2
  },
  {
    "codigo": "OE.5.6.1.14",
    "descripcion": "Luminaria tipo PANEL LED DOWNLIGHT para empotrar circular 15w, 220v, 60Hz",
    "unidad": "und",
    "metrado_fijo": 3,
    "cantidad_presupuestada": 3,
    "precio_unitario_presupuestado": 142.8,
    "total_presupuestado": 428.4
  },
  {
    "codigo": "OE.5.6.1.15",
    "descripcion": "Luminaria tipo ESTANCA LED para adosar 36w, 220v, 60Hz",
    "unidad": "und",
    "metrado_fijo": 77,
    "cantidad_presupuestada": 77,
    "precio_unitario_presupuestado": 202.8,
    "total_presupuestado": 15615.6
  },
  {
    "codigo": "OE.5.6.1.16",
    "descripcion": "Luminaria compacta prismática lineal  33w, 220v, 60Hz",
    "unidad": "und",
    "metrado_fijo": 71,
    "cantidad_presupuestada": 71,
    "precio_unitario_presupuestado": 202.8,
    "total_presupuestado": 14398.8
  },
  {
    "codigo": "OE.5.6.1.17",
    "descripcion": "Luminaria tipo PLAFON de 18w, 220v, 60Hz",
    "unidad": "und",
    "metrado_fijo": 4,
    "cantidad_presupuestada": 4,
    "precio_unitario_presupuestado": 142.8,
    "total_presupuestado": 571.2
  },
  {
    "codigo": "OE.5.6.1.18",
    "descripcion": "Luminaria tipo CABECERA LED de 18w, 220v, 60Hz",
    "unidad": "und",
    "metrado_fijo": 12,
    "cantidad_presupuestada": 12,
    "precio_unitario_presupuestado": 206.78,
    "total_presupuestado": 2481.36
  },
  {
    "codigo": "OE.5.6.1.19",
    "descripcion": "Equipo de iluminación de emergencia",
    "unidad": "und",
    "metrado_fijo": 42,
    "cantidad_presupuestada": 42,
    "precio_unitario_presupuestado": 186.78,
    "total_presupuestado": 7844.76
  },
  {
    "codigo": "OE.5.6.1.20",
    "descripcion": "Luminaria ORNAMENTAL tipo ISLA de 60W, 220v, 60Hz",
    "unidad": "und",
    "metrado_fijo": 9,
    "cantidad_presupuestada": 9,
    "precio_unitario_presupuestado": 2701.49,
    "total_presupuestado": 24313.41
  },
  {
    "codigo": "OE.5.6.1.21",
    "descripcion": "Lampara de examen clinico LED tipo cuello de ganso",
    "unidad": "und",
    "metrado_fijo": 3,
    "cantidad_presupuestada": 3,
    "precio_unitario_presupuestado": 4807.1,
    "total_presupuestado": 14421.3
  },
  {
    "codigo": "OE.5.6.1.22",
    "descripcion": "Lampara spot dicroico de 6 W",
    "unidad": "und",
    "metrado_fijo": 7,
    "cantidad_presupuestada": 7,
    "precio_unitario_presupuestado": 10.65,
    "total_presupuestado": 74.55
  },
  {
    "codigo": "OE.5.6.1.23",
    "descripcion": "Braquet reflector de 13 W",
    "unidad": "und",
    "metrado_fijo": 4,
    "cantidad_presupuestada": 4,
    "precio_unitario_presupuestado": 10.65,
    "total_presupuestado": 42.6
  },
  {
    "codigo": "OE.5.6.1.24",
    "descripcion": "Braquet de pared exterior  E27",
    "unidad": "und",
    "metrado_fijo": 2,
    "cantidad_presupuestada": 2,
    "precio_unitario_presupuestado": 17.04,
    "total_presupuestado": 34.08
  },
  {
    "codigo": "OE.5.6.1.25",
    "descripcion": "LUMINARIA  TIPO APLIQUE LED 20W",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 67.37,
    "total_presupuestado": 67.37
  },
  {
    "codigo": "OE.5.7.1.1",
    "descripcion": "SUMINISTRO E INSTALACIÓN DE ELECTROBOMBAS 3.4 H.P.-3Ø-380v.-60cps, incluye tablero de protección IP66 y sistema de automatización",
    "unidad": "glb",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 3370.35,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.7.1.2",
    "descripcion": "SUMINISTRO E INSTALACIÓN DE ELECTROBOMBAS SUMERGIBLES 3 H.P.-3Ø-220v.-60cps, incluye tablero de protección IP66 y sistema de automatización",
    "unidad": "glb",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 3286.89,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.7.2.1",
    "descripcion": "GRUPO ELECTROGENO de 140KVA prime, salida 380/220V, 1800RPM, 60HZ, incl Accesorios y Tanque de Comb.",
    "unidad": "glb",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 189999.98,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.7.2.2",
    "descripcion": "UPS TRIFASICO 20 KVA, 2 BATERIAS INTERNAS, INCLUYE TRANSFORMADOR DE AISLAMIENTO Y AUTOTRANSFORMADOR TRIFASICO 380/220V.",
    "unidad": "glb",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 63711.27,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.7.2.3",
    "descripcion": "Suministro e instalacion del Grupo electrogeno y tablero de transferencia",
    "unidad": "gbl",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 210369.64,
    "total_presupuestado": 210369.64
  },
  {
    "codigo": "OE.5.7.2.4",
    "descripcion": "Sistemas de alimentación ininterrumpida 20 KVA",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 48650,
    "total_presupuestado": 48650
  },
  {
    "codigo": "OE.5.7.2.5",
    "descripcion": "Sistemas de alimentación ininterrumpida 6 KVA",
    "unidad": "und",
    "metrado_fijo": 2,
    "cantidad_presupuestada": 2,
    "precio_unitario_presupuestado": 12500,
    "total_presupuestado": 25000
  },
  {
    "codigo": "OE.5.7.2.6",
    "descripcion": "Transformador de aislamiento de 20 KVA",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 12000,
    "total_presupuestado": 12000
  },
  {
    "codigo": "OE.5.7.2.7",
    "descripcion": "Transformador de aislamiento de 6 KVA",
    "unidad": "und",
    "metrado_fijo": 2,
    "cantidad_presupuestada": 2,
    "precio_unitario_presupuestado": 8000,
    "total_presupuestado": 16000
  },
  {
    "codigo": "OE.5.7.2.8",
    "descripcion": "Instalacion del sistema de respaldo de alimentacion ininterrumpida de 20KVA y de 6 KVA",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 8000,
    "total_presupuestado": 8000
  },
  {
    "codigo": "OE.5.7.2.9",
    "descripcion": "Suminstro e instalacion de rapiduchas",
    "unidad": "und",
    "metrado_fijo": 9,
    "cantidad_presupuestada": 9,
    "precio_unitario_presupuestado": 155.8,
    "total_presupuestado": 1402.2
  },
  {
    "codigo": "OE.5.8.1.1",
    "descripcion": "Bandeja de rejilla de acero electrosoldada de 300x100 mm/ 3m",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 134.29,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.8.1.2",
    "descripcion": "Accesorios",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 7.37,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.8.1.3",
    "descripcion": "Soporte INSTA-FIX para suspensión en trapecio DE 370X80mm",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 10.16,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.8.1.4",
    "descripcion": "Soportes de Distanciador para fijar en pared de 300mm",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 10.16,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.16.1.1",
    "descripcion": "VENTILADOR HELICOCENTRIFUGO( 2410 RPM - 30W - 220 V - 1Ø - 60 HZ - 85 CFM - 3.7 MMCA - 55 DB -Paprox. 1.5 Kg)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 1420.32,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.16.1.2",
    "descripcion": "SUMINISTRO E INSTALACION DE DUCTOS DE PLANCHA GALVANIZADA. INC ACCESORIOS, DAMPERS DE REGULACION, ANCLAJES.",
    "unidad": "kg",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 33.34,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.16.1.3",
    "descripcion": "SUMINISTRO E INSTALACION DE REJILLA DE INYECCIÓN",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 174.59,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.16.1.4",
    "descripcion": "CAJA PORTAFILTROS 154x319x154mm, INC. FILTROS, ACCESORIOS, ANCLAJES.",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 856.5,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.16.2.1",
    "descripcion": "EXTRACTOR AXIAL DIRECTO ( 2342 RPM - 38W - 220V - 1Ø-60 HZ - 102 CFM -  61 DB -Paprox. 5.4 Kg)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 852.73,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.16.2.2",
    "descripcion": "SUMINISTRO E INSTALACION DE DUCTOS DE PLANCHA GALVANIZADA. INC ACCESORIOS, DAMPERS DE REGULACION, ANCLAJES.",
    "unidad": "kg",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 33.34,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.16.2.3",
    "descripcion": "SUMINISTRO E INSTALACION DE REJILLA DE EXTRACCIÓN",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 224.82,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.16.2.4",
    "descripcion": "CAJA PORTAFILTROS 154x319x154mm, INC. FILTROS, ACCESORIOS, ANCLAJES.",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 856.5,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.16.3.1",
    "descripcion": "VENTILADOR HELICOCENTRIFUGO( 2417 RPM - 30W - 220 V - 1Ø - 60 HZ - 77 CFM - 3.46 MMCA - 55 DB -Paprox. 1.5 Kg)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 1564.92,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.16.3.2",
    "descripcion": "SUMINISTRO E INSTALACION DE DUCTOS DE PLANCHA GALVANIZADA. INC ACCESORIOS, DAMPERS DE REGULACION, ANCLAJES.",
    "unidad": "kg",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 33.34,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.16.3.3",
    "descripcion": "SUMINISTRO E INSTALACION DE REJILLA DE INYECCIÓN",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 174.59,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.16.3.4",
    "descripcion": "CAJA PORTAFILTROS 154x319x154mm, INC. FILTROS, ACCESORIOS, ANCLAJES.",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 856.5,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.16.4.1",
    "descripcion": "EXTRACTOR AXIAL DIRECTO ( 2342 RPM - 38W - 220V - 1Ø-60 HZ - 92 CFM -  61 DB -Paprox. 5.4 Kg)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 852.73,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.16.4.2",
    "descripcion": "SUMINISTRO E INSTALACION DE DUCTOS DE PLANCHA GALVANIZADA. INC ACCESORIOS, DAMPERS DE REGULACION, ANCLAJES.",
    "unidad": "kg",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 33.34,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.16.4.3",
    "descripcion": "SUMINISTRO E INSTALACION DE REJILLA DE EXTRACCIÓN",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 224.82,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.16.4.4",
    "descripcion": "CAJA PORTAFILTROS 154x319x154mm, INC. FILTROS, ACCESORIOS, ANCLAJES.",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 856.5,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.16.5.1",
    "descripcion": "VENTILADOR HELICOCENTRIFUGO( 2400 RPM - 30W - 220 V - 1Ø - 60 HZ - 69 CFM - 2.24MMCA - 55 DB -Paprox. 1.5 Kg)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 1420.32,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.16.5.2",
    "descripcion": "SUMINISTRO E INSTALACION DE DUCTOS DE PLANCHA GALVANIZADA. INC ACCESORIOS, DAMPERS DE REGULACION, ANCLAJES.",
    "unidad": "kg",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 33.34,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.16.5.3",
    "descripcion": "SUMINISTRO E INSTALACION DE REJILLA DE INYECCIÓN",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 174.59,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.16.5.4",
    "descripcion": "CAJA PORTAFILTROS 154x319x154mm, INC. FILTROS, ACCESORIOS, ANCLAJES.",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 856.5,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.16.6.1",
    "descripcion": "VENTILADOR HELICOCENTRIFUGO( 2410 RPM - 30W - 220 V - 1Ø - 60 HZ - 83 CFM - 3.23 MMCA - 55 DB -Paprox. 1.5 Kg)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 1420.32,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.16.6.2",
    "descripcion": "SUMINISTRO E INSTALACION DE DUCTOS DE PLANCHA GALVANIZADA. INC ACCESORIOS, DAMPERS DE REGULACION, ANCLAJES.",
    "unidad": "kg",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 33.34,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.16.6.3",
    "descripcion": "SUMINISTRO E INSTALACION DE REJILLA DE EXTRACCIÓN",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 224.82,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.16.6.4",
    "descripcion": "CAJA PORTAFILTROS 154x319x154mm, INC. FILTROS, ACCESORIOS, ANCLAJES.",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 856.5,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.18.1.1",
    "descripcion": "UNIDAD CONDENSADORA VRV DE REFRIGERANTE R-410A (CAPACIDAD NOMINAL DE 48000 BTU/H-3.6 kW-220 V-1f-60Hz)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 40892.32,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.18.2.1",
    "descripcion": "UNIDAD EVAPORADORA  MONTADO EN PARED DE REFRIGERANTE R-410A (CAPACIDAD NOMINAL DE 7500 BTU/H-0.03 KW-220V-1F-60HZ)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 2958.29,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.18.2.2",
    "descripcion": "UNIDAD EVAPORADORA  MONTADO EN PARED DE REFRIGERANTE R-410A (CAPACIDAD NOMINAL DE 9600 BTU/H-0.03 KW-220V-1F-60HZ)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 3014.28,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.18.2.3",
    "descripcion": "UNIDAD EVAPORADORA  MONTADO EN PARED DE REFRIGERANTE R-410A (CAPACIDAD NOMINAL DE 15400 BTU/H-0.03 KW-220V-1F-60HZ)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 3552.65,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.18.3.1",
    "descripcion": "UNIDAD CONDENSADORA DE REFRIGERANTE R-410A (CAPACIDAD NOMINAL DE 18000 BTU/H-2 kW-220 V-1f-60Hz)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 6754.78,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.18.3.2",
    "descripcion": "UNIDAD EVAPORADORA DE REFRIGERANTE R-410A (CAPACIDAD NOMINAL DE 18000 BTU/H-2 Kw-220 V-1f-60Hz)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 3497.45,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.18.4.1",
    "descripcion": "REFNET JOINT TIPO 1 (Branch Kit).",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 370.76,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.18.5.1",
    "descripcion": "BOMBA DE CONDENSADO (Kit Drenaje).",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 454.69,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.18.5.2",
    "descripcion": "CONTROLADOR REMOTO NAVEGACION (CON CABLE), EN PARED.",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 469.1,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.18.5.3",
    "descripcion": "TUBERIA PVC-SAP ELECTRICA Ø=3/4\", INC. ACCESORIOS. EN AIRE ACONDICIONADO.",
    "unidad": "m",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 8.24,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.18.5.4",
    "descripcion": "CABLE DE CONTROL FPLR 2x18 AWG LIBRE DE HALOGENO.",
    "unidad": "m",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 4.56,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.18.6.1",
    "descripcion": "TUBERIA DE COBRE DN 1/4\" - ØE 1/4\" TIPO FLEXIBLE, INC. AISLAMIENTO.",
    "unidad": "m",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 42.26,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.18.6.2",
    "descripcion": "TUBERIA DE COBRE DN 1/4\" - ØE 3/8\" TIPO L, INC. AISLAMIENTO.",
    "unidad": "m",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 43.93,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.18.6.3",
    "descripcion": "TUBERIA DE COBRE DN 3/8\" - ØE 1/2\" TIPO L, INC. AISLAMIENTO.",
    "unidad": "m",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 48.98,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.18.6.4",
    "descripcion": "TUBERIA DE COBRE DN 1/2\" - ØE 5/8\" TIPO L, INC. AISLAMIENTO.",
    "unidad": "m",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 53.34,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.18.7.1",
    "descripcion": "CARGA DE GAS REFRIGERANTE R410 ADICIONAL.",
    "unidad": "kg",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 55.22,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.18.8.1",
    "descripcion": "PERFIL PARA SOPORTE DE UNIDADES CONDENSADORAS, INC. ANCLAJE QUIMICO, PLANCHA e=1/4\", ACABADOS",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 936.42,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.18.9.1",
    "descripcion": "SOPORTE DE PISO CON PERNO Ø3/8\", INC. ANCLAJE, ACABADOS.",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 344.47,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.18.9.2",
    "descripcion": "ANCLAJE PARA TUBERIA DE COBRE (dos abrazaderas), EN MONTANTES.",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 36.55,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.5.6.18.10.1",
    "descripcion": "ADQUISICION Y PUESTA EN FUNCIONAMIENTO EQUIPO DE AIRE ACONDICIONADO TIPO SPLIT DECORATIVO DE PARED DE 18,000 BTU",
    "unidad": "und",
    "metrado_fijo": 6,
    "cantidad_presupuestada": 6,
    "precio_unitario_presupuestado": 6650,
    "total_presupuestado": 39900
  },
  {
    "codigo": "OE.6.1.1.1",
    "descripcion": "Cable UTP Categoria 6A",
    "unidad": "m",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 4.79,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.1.1.2",
    "descripcion": "Cable FPL 2X1 mm2",
    "unidad": "m",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 2.97,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.1.1.3",
    "descripcion": "Cable de audio polarizado 2x2.5 mm2",
    "unidad": "m",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 2.75,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.1.1.4",
    "descripcion": "Cable de Cu desnudo de 25 mm2",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 20.5,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.1.1.5",
    "descripcion": "Cable de Fibra Optica OM4 Multimodo de 50um/125um /OM4 10GbE.",
    "unidad": "m",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 45.14,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.1.1.6",
    "descripcion": "Cable FPL 2X16 AWG",
    "unidad": "m",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 3.93,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.01.01.07",
    "descripcion": "Tendido de Cable UTP Categoria 6A",
    "unidad": "m",
    "metrado_fijo": 4499,
    "cantidad_presupuestada": 4499,
    "precio_unitario_presupuestado": 6.57,
    "total_presupuestado": 29558.43
  },
  {
    "codigo": "OE.6.01.01.08",
    "descripcion": "Tendido de Cable FPL 2X1 mm2",
    "unidad": "m",
    "metrado_fijo": 1500,
    "cantidad_presupuestada": 1500,
    "precio_unitario_presupuestado": 5.5,
    "total_presupuestado": 8250
  },
  {
    "codigo": "OE.6.01.01.09",
    "descripcion": "Tendido de Cable de audio polarizado 2x2.5 mm2",
    "unidad": "m",
    "metrado_fijo": 400,
    "cantidad_presupuestada": 400,
    "precio_unitario_presupuestado": 3.65,
    "total_presupuestado": 1460
  },
  {
    "codigo": "OE.6.01.01.10",
    "descripcion": "Tendido de Cable de Cu desnudo de 25 mm2",
    "unidad": "m",
    "metrado_fijo": 23,
    "cantidad_presupuestada": 23,
    "precio_unitario_presupuestado": 21.4,
    "total_presupuestado": 492.2
  },
  {
    "codigo": "OE.6.01.01.11",
    "descripcion": "Tendido de Cable de Fibra Optica OM4 Multimodo de 50um/125um /OM4 10GbE",
    "unidad": "m",
    "metrado_fijo": 350,
    "cantidad_presupuestada": 350,
    "precio_unitario_presupuestado": 43.52,
    "total_presupuestado": 15232
  },
  {
    "codigo": "OE.6.01.01.12",
    "descripcion": "Tendido de Cable FPL 2X16 AWG",
    "unidad": "m",
    "metrado_fijo": 1000,
    "cantidad_presupuestada": 1000,
    "precio_unitario_presupuestado": 4.37,
    "total_presupuestado": 4370
  },
  {
    "codigo": "OE.6.01.01.13",
    "descripcion": "Tendido de Cable de Audio 2X14 AWG",
    "unidad": "m",
    "metrado_fijo": 50,
    "cantidad_presupuestada": 50,
    "precio_unitario_presupuestado": 8.59,
    "total_presupuestado": 429.5
  },
  {
    "codigo": "OE.6.2.1",
    "descripcion": "Tubería Conduit EMT de 25 mm",
    "unidad": "m",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 43.41,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.2.2",
    "descripcion": "Tubería Conduit EMT de 20 mm",
    "unidad": "m",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 28.36,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.2.3",
    "descripcion": "Curva Conduit EMT de 25 mm",
    "unidad": "und",
    "metrado_fijo": 174,
    "cantidad_presupuestada": 174,
    "precio_unitario_presupuestado": 9.66,
    "total_presupuestado": 1680.84
  },
  {
    "codigo": "OE.6.2.4",
    "descripcion": "Curva Conduit ETM de 20 mm",
    "unidad": "und",
    "metrado_fijo": 156,
    "cantidad_presupuestada": 156,
    "precio_unitario_presupuestado": 5.84,
    "total_presupuestado": 911.04
  },
  {
    "codigo": "OE.6.2.5",
    "descripcion": "Union Conduit EMT de 25 mm",
    "unidad": "und",
    "metrado_fijo": 174,
    "cantidad_presupuestada": 174,
    "precio_unitario_presupuestado": 6.55,
    "total_presupuestado": 1139.7
  },
  {
    "codigo": "OE.6.2.6",
    "descripcion": "Union Conduit ETM de 20 mm",
    "unidad": "und",
    "metrado_fijo": 100,
    "cantidad_presupuestada": 100,
    "precio_unitario_presupuestado": 5.52,
    "total_presupuestado": 552
  },
  {
    "codigo": "OE.6.2.7",
    "descripcion": "Conector Conduit EMT de 25 mm",
    "unidad": "und",
    "metrado_fijo": 325,
    "cantidad_presupuestada": 325,
    "precio_unitario_presupuestado": 7.93,
    "total_presupuestado": 2577.25
  },
  {
    "codigo": "OE.6.2.8",
    "descripcion": "Conector Conduit EMT de 20 mm",
    "unidad": "und",
    "metrado_fijo": 329,
    "cantidad_presupuestada": 329,
    "precio_unitario_presupuestado": 4.14,
    "total_presupuestado": 1362.06
  },
  {
    "codigo": "OE.6.2.9",
    "descripcion": "Tuberia Electrica PVC SAP NTP 399.006 DE 50 mm",
    "unidad": "m",
    "metrado_fijo": 227,
    "cantidad_presupuestada": 227,
    "precio_unitario_presupuestado": 15.31,
    "total_presupuestado": 3475.37
  },
  {
    "codigo": "OE.6.2.10",
    "descripcion": "Curva PVC SAP NTP 399.006 DE 50 mm",
    "unidad": "und",
    "metrado_fijo": 18,
    "cantidad_presupuestada": 18,
    "precio_unitario_presupuestado": 12.54,
    "total_presupuestado": 225.72
  },
  {
    "codigo": "OE.6.2.11",
    "descripcion": "Unión PVC SAP NTP 399.006 DE 50 mm",
    "unidad": "und",
    "metrado_fijo": 18,
    "cantidad_presupuestada": 18,
    "precio_unitario_presupuestado": 8.04,
    "total_presupuestado": 144.72
  },
  {
    "codigo": "OE.6.2.12",
    "descripcion": "Conector PVC SAP NTP 399.006 DE 50 mm",
    "unidad": "und",
    "metrado_fijo": 18,
    "cantidad_presupuestada": 18,
    "precio_unitario_presupuestado": 11.75,
    "total_presupuestado": 211.5
  },
  {
    "codigo": "OE.6.2.13",
    "descripcion": "Bandeja tipo malla electrozincado 105X200 X3000 mm con aterramiento incluye accesorios de instalación",
    "unidad": "m",
    "metrado_fijo": 225,
    "cantidad_presupuestada": 225,
    "precio_unitario_presupuestado": 130,
    "total_presupuestado": 29250
  },
  {
    "codigo": "OE.6.2.14",
    "descripcion": "Tuberia Electrica PVC SAP NTP 399.006 DE 25 mm",
    "unidad": "m",
    "metrado_fijo": 135,
    "cantidad_presupuestada": 135,
    "precio_unitario_presupuestado": 13.88,
    "total_presupuestado": 1873.8
  },
  {
    "codigo": "OE.6.2.15",
    "descripcion": "Union PVC SAP NTP 399.006 de 25 mm",
    "unidad": "und",
    "metrado_fijo": 18,
    "cantidad_presupuestada": 18,
    "precio_unitario_presupuestado": 4.31,
    "total_presupuestado": 77.58
  },
  {
    "codigo": "OE.6.2.16",
    "descripcion": "Conector PVC SAP NTP 399.006 de 25 mm",
    "unidad": "und",
    "metrado_fijo": 18,
    "cantidad_presupuestada": 18,
    "precio_unitario_presupuestado": 6.65,
    "total_presupuestado": 119.7
  },
  {
    "codigo": "OE.6.2.17",
    "descripcion": "Curva PVC SAP NTP 399.006 de 25 mm",
    "unidad": "und",
    "metrado_fijo": 18,
    "cantidad_presupuestada": 18,
    "precio_unitario_presupuestado": 7.1,
    "total_presupuestado": 127.8
  },
  {
    "codigo": "OE.6.2.18",
    "descripcion": "Tuberia Conduit Flexible de 20 mm",
    "unidad": "m",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 10.05,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.2.19",
    "descripcion": "Prensaestopa Conduit 20 mm",
    "unidad": "und",
    "metrado_fijo": 271,
    "cantidad_presupuestada": 271,
    "precio_unitario_presupuestado": 8.84,
    "total_presupuestado": 2395.64
  },
  {
    "codigo": "OE.6.02.20",
    "descripcion": "Instalación de Tubería Conduit EMT de 25 mm",
    "unidad": "m",
    "metrado_fijo": 585,
    "cantidad_presupuestada": 585,
    "precio_unitario_presupuestado": 46.04,
    "total_presupuestado": 26933.4
  },
  {
    "codigo": "OE.6.02.21",
    "descripcion": "Instalación deTubería Conduit EMT de 20 mm",
    "unidad": "m",
    "metrado_fijo": 585,
    "cantidad_presupuestada": 585,
    "precio_unitario_presupuestado": 30.45,
    "total_presupuestado": 17813.25
  },
  {
    "codigo": "OE.6.02.22",
    "descripcion": "Instalación de Tuberia Conduit Flexible de 20 mm",
    "unidad": "m",
    "metrado_fijo": 203,
    "cantidad_presupuestada": 203,
    "precio_unitario_presupuestado": 10.81,
    "total_presupuestado": 2194.43
  },
  {
    "codigo": "OE.6.3.1",
    "descripcion": "Salida de datos categoria 6A simple",
    "unidad": "pto",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 104.96,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.3.2",
    "descripcion": "Salida de datos categoria 6A doble",
    "unidad": "pto",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 105.28,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.3.3",
    "descripcion": "Salida detector de humo",
    "unidad": "pto",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 16.06,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.3.4",
    "descripcion": "Salida Estación Manual",
    "unidad": "pto",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 18.34,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.3.5",
    "descripcion": "Salida sirena con luz estrobo",
    "unidad": "pto",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 18.34,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.3.6",
    "descripcion": "Salida panel de alarma de incendio",
    "unidad": "pto",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 19.93,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.3.7",
    "descripcion": "Salida Parlantes",
    "unidad": "pto",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 18.98,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.3.8",
    "descripcion": "Salida microfono/audio",
    "unidad": "pto",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 29.09,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.3.9",
    "descripcion": "Salida consola amplificador",
    "unidad": "pto",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 19.93,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.3.10",
    "descripcion": "Salida para módulo de cabecera de llamado de enfermera",
    "unidad": "pto",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 18.21,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.3.11",
    "descripcion": "Salida para módulo de anulación",
    "unidad": "pto",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 18.21,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.3.12",
    "descripcion": "Salida para pulsador de baño",
    "unidad": "pto",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 18.21,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.3.13",
    "descripcion": "Salida para luz indicador de llamada de enfermera",
    "unidad": "pto",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 17.05,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.3.14",
    "descripcion": "Salida para central de llamada de enfermera",
    "unidad": "pto",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 19.93,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.3.15",
    "descripcion": "Salida detector de temperatura",
    "unidad": "pto",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 15.4,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.3.16",
    "descripcion": "Salida de atenuador de altavoz",
    "unidad": "pto",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 19.74,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.03.17",
    "descripcion": "Salida para datos categoria 6A simple",
    "unidad": "pto",
    "metrado_fijo": 69,
    "cantidad_presupuestada": 69,
    "precio_unitario_presupuestado": 128.34,
    "total_presupuestado": 8855.46
  },
  {
    "codigo": "OE.6.03.18",
    "descripcion": "Salida para datos categoria 6A doble",
    "unidad": "pto",
    "metrado_fijo": 21,
    "cantidad_presupuestada": 21,
    "precio_unitario_presupuestado": 128.66,
    "total_presupuestado": 2701.86
  },
  {
    "codigo": "OE.6.03.19",
    "descripcion": "Salida para detector de humo",
    "unidad": "pto",
    "metrado_fijo": 101,
    "cantidad_presupuestada": 101,
    "precio_unitario_presupuestado": 20.73,
    "total_presupuestado": 2093.73
  },
  {
    "codigo": "OE.6.03.20",
    "descripcion": "Salida para Estación Manual",
    "unidad": "pto",
    "metrado_fijo": 13,
    "cantidad_presupuestada": 13,
    "precio_unitario_presupuestado": 21.15,
    "total_presupuestado": 274.95
  },
  {
    "codigo": "OE.6.03.21",
    "descripcion": "Salida para sirena con luz estrobo",
    "unidad": "pto",
    "metrado_fijo": 13,
    "cantidad_presupuestada": 13,
    "precio_unitario_presupuestado": 21.15,
    "total_presupuestado": 274.95
  },
  {
    "codigo": "OE.6.03.22",
    "descripcion": "Salida para panel de alarma de incendio",
    "unidad": "pto",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 22.74,
    "total_presupuestado": 22.74
  },
  {
    "codigo": "OE.6.03.23",
    "descripcion": "Salida para Parlantes",
    "unidad": "pto",
    "metrado_fijo": 18,
    "cantidad_presupuestada": 18,
    "precio_unitario_presupuestado": 21.79,
    "total_presupuestado": 392.22
  },
  {
    "codigo": "OE.6.03.24",
    "descripcion": "Salida para microfono/audio",
    "unidad": "pto",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 32.37,
    "total_presupuestado": 32.37
  },
  {
    "codigo": "OE.6.03.25",
    "descripcion": "Salida para consola amplificador",
    "unidad": "pto",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 22.74,
    "total_presupuestado": 22.74
  },
  {
    "codigo": "OE.6.03.26",
    "descripcion": "Salida de módulo de cabecera de llamado de enfermera",
    "unidad": "pto",
    "metrado_fijo": 13,
    "cantidad_presupuestada": 13,
    "precio_unitario_presupuestado": 19.62,
    "total_presupuestado": 255.06
  },
  {
    "codigo": "OE.6.03.27",
    "descripcion": "Salida de módulo de anulación",
    "unidad": "pto",
    "metrado_fijo": 7,
    "cantidad_presupuestada": 7,
    "precio_unitario_presupuestado": 19.62,
    "total_presupuestado": 137.34
  },
  {
    "codigo": "OE.6.03.28",
    "descripcion": "Salida de pulsador de baño",
    "unidad": "pto",
    "metrado_fijo": 6,
    "cantidad_presupuestada": 6,
    "precio_unitario_presupuestado": 19.62,
    "total_presupuestado": 117.72
  },
  {
    "codigo": "OE.6.03.29",
    "descripcion": "Salida de luz indicador de llamada de enfermera",
    "unidad": "pto",
    "metrado_fijo": 7,
    "cantidad_presupuestada": 7,
    "precio_unitario_presupuestado": 19.62,
    "total_presupuestado": 137.34
  },
  {
    "codigo": "OE.6.03.30",
    "descripcion": "Salida de central de llamada de enfermera",
    "unidad": "pto",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 22.74,
    "total_presupuestado": 22.74
  },
  {
    "codigo": "OE.6.03.31",
    "descripcion": "Salida para detector de temperatura",
    "unidad": "pto",
    "metrado_fijo": 7,
    "cantidad_presupuestada": 7,
    "precio_unitario_presupuestado": 18.67,
    "total_presupuestado": 130.69
  },
  {
    "codigo": "OE.6.03.32",
    "descripcion": "Salida para atenuador de altavoz",
    "unidad": "pto",
    "metrado_fijo": 10,
    "cantidad_presupuestada": 10,
    "precio_unitario_presupuestado": 23.01,
    "total_presupuestado": 230.1
  },
  {
    "codigo": "OE.6.03.33",
    "descripcion": "salida para receptor AV",
    "unidad": "pto",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 32.36,
    "total_presupuestado": 32.36
  },
  {
    "codigo": "OE.6.03.34",
    "descripcion": "Salida para HDMI",
    "unidad": "pto",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 174.22,
    "total_presupuestado": 174.22
  },
  {
    "codigo": "OE.6.03.35",
    "descripcion": "Salida para parlante de techo",
    "unidad": "pto",
    "metrado_fijo": 4,
    "cantidad_presupuestada": 4,
    "precio_unitario_presupuestado": 28.05,
    "total_presupuestado": 112.2
  },
  {
    "codigo": "OE.6.4.1",
    "descripcion": "Zanja Electroducto 0.40x0.60m",
    "unidad": "m",
    "metrado_fijo": 134,
    "cantidad_presupuestada": 134,
    "precio_unitario_presupuestado": 10.91,
    "total_presupuestado": 1461.94
  },
  {
    "codigo": "OE.6.4.2",
    "descripcion": "Relleno y compactado con material propio 0.50 x0.60 m",
    "unidad": "m",
    "metrado_fijo": 134,
    "cantidad_presupuestada": 134,
    "precio_unitario_presupuestado": 33.07,
    "total_presupuestado": 4431.38
  },
  {
    "codigo": "OE.6.4.3",
    "descripcion": "Buzon Electroducto de Concreto Armado con tapa 0.60 x0.60 x 0.60m",
    "unidad": "und",
    "metrado_fijo": 8,
    "cantidad_presupuestada": 8,
    "precio_unitario_presupuestado": 527.63,
    "total_presupuestado": 4221.04
  },
  {
    "codigo": "OE.6.5.1",
    "descripcion": "Patch Panel Cat6A de 24 puertos",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 719.33,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.5.2",
    "descripcion": "Patch Cord UTP Cat6A de 3m",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 46.48,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.5.3",
    "descripcion": "Patch cord UTP Cat6A de 20cm",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 36.45,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.5.4",
    "descripcion": "Etiquetas adhesivas de identificacion, señalizacion y ordenamiento para el area de Trabajo y Gabinete",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 1,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.5.5",
    "descripcion": "Patch cord cat 6A x 1m",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 30,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.5.6",
    "descripcion": "Patch cord  cat 6A x 3m",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 46.48,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.5.7",
    "descripcion": "Patch Cord de Fibra Optica multimodo OM4 de 2m",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 43,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.5.8",
    "descripcion": "Bandeja de fibra optica de 1 RU incluye patch panel y acopladores",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 174.17,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.5.9",
    "descripcion": "Bandeja de empalme para bandeja de FO incluye accesorios",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 619.75,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.05.10",
    "descripcion": "Patch Panel Cat6A - 24 puertos",
    "unidad": "und",
    "metrado_fijo": 6,
    "cantidad_presupuestada": 6,
    "precio_unitario_presupuestado": 771.75,
    "total_presupuestado": 4630.5
  },
  {
    "codigo": "OE.6.05.11",
    "descripcion": "Etiquetas adhesivas de identificacion, señalizacion y ordenamiento",
    "unidad": "und",
    "metrado_fijo": 340,
    "cantidad_presupuestada": 340,
    "precio_unitario_presupuestado": 4.28,
    "total_presupuestado": 1455.2
  },
  {
    "codigo": "OE.6.05.12",
    "descripcion": "Patch cord cat 6A UTP de 1m",
    "unidad": "und",
    "metrado_fijo": 112,
    "cantidad_presupuestada": 112,
    "precio_unitario_presupuestado": 36.29,
    "total_presupuestado": 4064.48
  },
  {
    "codigo": "OE.6.05.13",
    "descripcion": "Patch cord  cat 6A UTP de 3m",
    "unidad": "und",
    "metrado_fijo": 98,
    "cantidad_presupuestada": 98,
    "precio_unitario_presupuestado": 52.77,
    "total_presupuestado": 5171.46
  },
  {
    "codigo": "OE.6.05.14",
    "descripcion": "Patch Cord de Fibra Optica OM4 multimodo de 2m",
    "unidad": "und",
    "metrado_fijo": 6,
    "cantidad_presupuestada": 6,
    "precio_unitario_presupuestado": 58.73,
    "total_presupuestado": 352.38
  },
  {
    "codigo": "OE.6.05.15",
    "descripcion": "Bandeja de fibra optica con patch panel y acopladores de 1 RU",
    "unidad": "und",
    "metrado_fijo": 3,
    "cantidad_presupuestada": 3,
    "precio_unitario_presupuestado": 488.69,
    "total_presupuestado": 1466.07
  },
  {
    "codigo": "OE.6.05.16",
    "descripcion": "Bandeja de empalme para bandeja de Fibra incluye accesorios",
    "unidad": "und",
    "metrado_fijo": 3,
    "cantidad_presupuestada": 3,
    "precio_unitario_presupuestado": 934.27,
    "total_presupuestado": 2802.81
  },
  {
    "codigo": "OE.6.6.1.1",
    "descripcion": "Switch Gigabit PoE de 48 puertos y 4 puertos SFP",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 8614,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.6.1.2",
    "descripcion": "Servicio de Instalación, configuración, capacitaciòn y Puesta en funcionamiento del patch panel/Rack de Comunicaciones",
    "unidad": "glb",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 1255.93,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.6.1.3",
    "descripcion": "Switch Gigabit PoE de 24 puertos y 4 puertos SFP",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 9319.64,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.6.1.4",
    "descripcion": "Transceptor SFP, conector LC duplex",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 706.11,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.06.01.05",
    "descripcion": "Switch Gigabit PoE 48 puertos, 4 puertos SFP",
    "unidad": "und",
    "metrado_fijo": 2,
    "cantidad_presupuestada": 2,
    "precio_unitario_presupuestado": 8718.84,
    "total_presupuestado": 17437.68
  },
  {
    "codigo": "OE.6.06.01.06",
    "descripcion": "Switch Gigabit PoE de 24 Port y 4 Port SFP",
    "unidad": "und",
    "metrado_fijo": 2,
    "cantidad_presupuestada": 2,
    "precio_unitario_presupuestado": 9319.64,
    "total_presupuestado": 18639.28
  },
  {
    "codigo": "OE.6.06.01.08",
    "descripcion": "Modulo Transceptor SFP, conector LC duplex",
    "unidad": "und",
    "metrado_fijo": 6,
    "cantidad_presupuestada": 6,
    "precio_unitario_presupuestado": 706.11,
    "total_presupuestado": 4236.66
  },
  {
    "codigo": "OE.6.6.2.1",
    "descripcion": "Gabinete de comunicaciones de piso de 42 RU c/accesorios de instalacion.",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 6155,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.6.2.2",
    "descripcion": "UPS de 3000VA rackeable",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 3595.2,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.6.2.3",
    "descripcion": "Certificacion de puntos de cableado de datos Categoria 6A",
    "unidad": "pto",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 45.01,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.6.2.4",
    "descripcion": "Gabinete de comunicación de pared de 12 RU c/accesorios de Instalacion",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 2065.5,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.06.02.05",
    "descripcion": "Gabinete de piso de 42 RU c/accesorios de instalacion.",
    "unidad": "und",
    "metrado_fijo": 2,
    "cantidad_presupuestada": 2,
    "precio_unitario_presupuestado": 6460.36,
    "total_presupuestado": 12920.72
  },
  {
    "codigo": "OE.6.06.02.06",
    "descripcion": "Certificación de 111 puntos de cableado de datos categoría 6A y 02 puntos de fibra",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 7790,
    "total_presupuestado": 7790
  },
  {
    "codigo": "OE.6.06.02.07",
    "descripcion": "Gabinete de comunicación de pared de 12 RU c/accesorios de Instalacion",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 2065.5,
    "total_presupuestado": 2065.5
  },
  {
    "codigo": "OE.6.7.1",
    "descripcion": "Caja de paso con tapa Biselada de F° G° 200x200x100 mm",
    "unidad": "und",
    "metrado_fijo": 42,
    "cantidad_presupuestada": 42,
    "precio_unitario_presupuestado": 53.49,
    "total_presupuestado": 2246.58
  },
  {
    "codigo": "OE.6.7.2",
    "descripcion": "Caja de paso con tapa Biselada de F° G° 150x150x100 mm",
    "unidad": "und",
    "metrado_fijo": 11,
    "cantidad_presupuestada": 11,
    "precio_unitario_presupuestado": 43.11,
    "total_presupuestado": 474.21
  },
  {
    "codigo": "OE.6.7.3",
    "descripcion": "Caja de paso pesada octogonal con tapa de 100x50 mm",
    "unidad": "und",
    "metrado_fijo": 11,
    "cantidad_presupuestada": 11,
    "precio_unitario_presupuestado": 46.2,
    "total_presupuestado": 508.2
  },
  {
    "codigo": "OE.6.7.4",
    "descripcion": "Caja de Paso con tapa Biselada de Fº Gº 100x100x100 mm",
    "unidad": "und",
    "metrado_fijo": 120,
    "cantidad_presupuestada": 120,
    "precio_unitario_presupuestado": 25.09,
    "total_presupuestado": 3010.8
  },
  {
    "codigo": "OE.6.7.5",
    "descripcion": "Caja de Paso con tapa Biselada de Fº Gº 300x300x100 mm",
    "unidad": "und",
    "metrado_fijo": 6,
    "cantidad_presupuestada": 6,
    "precio_unitario_presupuestado": 58.1,
    "total_presupuestado": 348.6
  },
  {
    "codigo": "OE.6.8.1.1",
    "descripcion": "Detector de Humo direccionable incluye base",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 230.01,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.8.1.2",
    "descripcion": "Estación manual de doble accion direccionable",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 326,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.8.1.3",
    "descripcion": "Sirena con luz estrobo",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 224,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.8.1.4",
    "descripcion": "Panel de alarma de Incendios Direccionable",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 5100,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.8.1.5",
    "descripcion": "Servicio de Instalacion, configuracion, capacitación y puesta en funcionamiento del Sistema de deteccion y alarma de incendios",
    "unidad": "glb",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 3913,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.8.1.6",
    "descripcion": "Detector de Temperatura direccionable incluye base",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 215.64,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.08.01.07",
    "descripcion": "Instalación de Detector de Humo direccionable con base",
    "unidad": "und",
    "metrado_fijo": 101,
    "cantidad_presupuestada": 101,
    "precio_unitario_presupuestado": 240.19,
    "total_presupuestado": 24259.19
  },
  {
    "codigo": "OE.6.08.01.08",
    "descripcion": "Instalación de Estación manual doble accion direccionable",
    "unidad": "und",
    "metrado_fijo": 13,
    "cantidad_presupuestada": 13,
    "precio_unitario_presupuestado": 351.45,
    "total_presupuestado": 4568.85
  },
  {
    "codigo": "OE.6.08.01.09",
    "descripcion": "Instalación de Sirena con luz estrobo",
    "unidad": "und",
    "metrado_fijo": 13,
    "cantidad_presupuestada": 13,
    "precio_unitario_presupuestado": 234.49,
    "total_presupuestado": 3048.37
  },
  {
    "codigo": "OE.6.08.01.10",
    "descripcion": "Instalación de Panel de alarma de Incendios Direccionable",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 5729.04,
    "total_presupuestado": 5729.04
  },
  {
    "codigo": "OE.6.08.01.11",
    "descripcion": "Instalación de Detector de Temperatura direccionable con base",
    "unidad": "und",
    "metrado_fijo": 7,
    "cantidad_presupuestada": 7,
    "precio_unitario_presupuestado": 206.49,
    "total_presupuestado": 1445.43
  },
  {
    "codigo": "OE.6.8.2.1",
    "descripcion": "Camara IP fija PoE para Exterior incluye accesorios",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 297.36,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.8.2.2",
    "descripcion": "Grabador de video NVR de 16 canales incluye licencia",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 4318.8,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.8.2.3",
    "descripcion": "Monitor LCD de 24\"para CCTV",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 647.15,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.8.2.4",
    "descripcion": "Estacion de video Vigilancia",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 4750,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.8.2.5",
    "descripcion": "Servicio de Instalacion, configuracion, capacitación y puesta en funcionamiento del Sistema de video vigilancia",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 1950,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.8.2.6",
    "descripcion": "Camara IP PoE tipo Domo",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 635,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.8.2.7",
    "descripcion": "Camara IP PoE tipo Bullet",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 480,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.8.2.8",
    "descripcion": "Grabador de video NVR de 24  canales incluye licencia",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 3660,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.08.02.09",
    "descripcion": "Instalación de Camara IP PoE tipo Domo",
    "unidad": "und",
    "metrado_fijo": 2,
    "cantidad_presupuestada": 2,
    "precio_unitario_presupuestado": 674.32,
    "total_presupuestado": 1348.64
  },
  {
    "codigo": "OE.6.08.02.10",
    "descripcion": "Instalación de Camara IP PoE tipo Bullet",
    "unidad": "und",
    "metrado_fijo": 17,
    "cantidad_presupuestada": 17,
    "precio_unitario_presupuestado": 519.32,
    "total_presupuestado": 8828.44
  },
  {
    "codigo": "OE.6.08.02.11",
    "descripcion": "Instalación de Grabador de video NVR de 24  canales incluye licencia",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 3698.17,
    "total_presupuestado": 3698.17
  },
  {
    "codigo": "OE.6.08.02.12",
    "descripcion": "Instalación de Unidad Central de Proceso -CPU",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 18411.77,
    "total_presupuestado": 18411.77
  },
  {
    "codigo": "OE.6.08.02.13",
    "descripcion": "Instalación de Monitor LED",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 6246.73,
    "total_presupuestado": 6246.73
  },
  {
    "codigo": "OE.6.08.02.14",
    "descripcion": "Instalación de Disco Duro Interno",
    "unidad": "und",
    "metrado_fijo": 2,
    "cantidad_presupuestada": 2,
    "precio_unitario_presupuestado": 2165.73,
    "total_presupuestado": 4331.46
  },
  {
    "codigo": "OE.6.08.02.15",
    "descripcion": "Instalación de Acumulador de energía – Equipo UPS",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1013.73,
    "total_presupuestado": 1013.73
  },
  {
    "codigo": "OE.6.8.3.1",
    "descripcion": "Parlantes de 6\" incluye accesosios  para montaje en pared",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 495,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.8.3.2",
    "descripcion": "Amplificador de 1000 Watts con Salida de 70 y 100 V",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 3500,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.8.3.3",
    "descripcion": "Consola mezcladora de audio de 8 canales",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 1050,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.8.3.4",
    "descripcion": "Microfono profesional con accesorios",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 214,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.8.3.5",
    "descripcion": "Servicio de Instalacion, configuracion, capacitacion y puesta en funcionamiento del sistema de sonido ambiental",
    "unidad": "glb",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 3337.63,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.8.3.6",
    "descripcion": "Atenuador de volumen",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 120,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.08.03.07",
    "descripcion": "Instalación de Parlantes de 6\" incluye accesosios  para montaje en pared",
    "unidad": "und",
    "metrado_fijo": 18,
    "cantidad_presupuestada": 18,
    "precio_unitario_presupuestado": 521.21,
    "total_presupuestado": 9381.78
  },
  {
    "codigo": "OE.6.08.03.08",
    "descripcion": "Instalación de Amplificador de 1000 Watts con Salida de 70 y 100 V",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 3539.32,
    "total_presupuestado": 3539.32
  },
  {
    "codigo": "OE.6.08.03.09",
    "descripcion": "Instalación de Consola mezcladora de audio de 8 canales",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1128.63,
    "total_presupuestado": 1128.63
  },
  {
    "codigo": "OE.6.08.03.10",
    "descripcion": "Instalación de Microfono profesional con accesorios",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 229.73,
    "total_presupuestado": 229.73
  },
  {
    "codigo": "OE.6.8.3.11",
    "descripcion": "Instalación de Atenuador de volumen",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 135.73,
    "total_presupuestado": 135.73
  },
  {
    "codigo": "OE.6.8.4.1",
    "descripcion": "Central de llamada de enfermera con accesorios",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 4640.4,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.8.4.2",
    "descripcion": "Consola de sobremesa para comunicación",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 4262.4,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.8.4.3",
    "descripcion": "UPS 1000 VA con accesorios de instalación",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 1800,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.8.4.4",
    "descripcion": "Modulo de cabecera de llamado de enfermera",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 468,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.8.4.5",
    "descripcion": "Modulo boton de anulacion",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 266.4,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.8.4.6",
    "descripcion": "Pulsador de llamado de enfermera",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 165.6,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.8.4.7",
    "descripcion": "Pulsador de baño",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 266.4,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.8.4.8",
    "descripcion": "Luz indicador de llamada de enfermera",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 162,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.8.4.9",
    "descripcion": "Servicio de Instalacion, configuración, capacitación y puesta en funcionamiento del sistema de llamada de enfermera",
    "unidad": "glb",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 2430.01,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.08.04.10",
    "descripcion": "Instalación de Central de llamada de enfermera con accesorios",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 5604.6,
    "total_presupuestado": 5604.6
  },
  {
    "codigo": "OE.6.08.04.11",
    "descripcion": "Instalación de Consola de sobremesa para comunicaion",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 3968.52,
    "total_presupuestado": 3968.52
  },
  {
    "codigo": "OE.6.08.04.12",
    "descripcion": "Instalación de Modulo de cabecera de llamado de enfermera",
    "unidad": "und",
    "metrado_fijo": 13,
    "cantidad_presupuestada": 13,
    "precio_unitario_presupuestado": 546.63,
    "total_presupuestado": 7106.19
  },
  {
    "codigo": "OE.6.08.04.13",
    "descripcion": "Instalación de Modulo boton de anulacion",
    "unidad": "und",
    "metrado_fijo": 7,
    "cantidad_presupuestada": 7,
    "precio_unitario_presupuestado": 305.72,
    "total_presupuestado": 2140.04
  },
  {
    "codigo": "OE.6.08.04.14",
    "descripcion": "Instalación de Pulsador de llamado a enfermeras",
    "unidad": "und",
    "metrado_fijo": 13,
    "cantidad_presupuestada": 13,
    "precio_unitario_presupuestado": 204.92,
    "total_presupuestado": 2663.96
  },
  {
    "codigo": "OE.6.08.04.15",
    "descripcion": "Instalación de Pulsador de baño",
    "unidad": "und",
    "metrado_fijo": 6,
    "cantidad_presupuestada": 6,
    "precio_unitario_presupuestado": 305.72,
    "total_presupuestado": 1834.32
  },
  {
    "codigo": "OE.6.08.04.16",
    "descripcion": "Instalación de Luz indicador de llamada de enfermera",
    "unidad": "und",
    "metrado_fijo": 7,
    "cantidad_presupuestada": 7,
    "precio_unitario_presupuestado": 201.32,
    "total_presupuestado": 1409.24
  },
  {
    "codigo": "OE.6.8.5.1",
    "descripcion": "Central telefonica IP incluye licenciamiento",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 5911.93,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.8.5.2",
    "descripcion": "Telefono IP POE de mesa de uso general",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 289.93,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.8.5.3",
    "descripcion": "Servicio de instalación, configuración, capacitación y puesta en funcionamiento del Sistema de telefonia",
    "unidad": "glb",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 1445.5,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.08.05.04",
    "descripcion": "Instalación de Central telefonica IP incluye licenciamiento",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 6069.19,
    "total_presupuestado": 6069.19
  },
  {
    "codigo": "OE.6.08.05.05",
    "descripcion": "Instalación de Telefono IP POE de mesa de uso general",
    "unidad": "und",
    "metrado_fijo": 8,
    "cantidad_presupuestada": 8,
    "precio_unitario_presupuestado": 316.14,
    "total_presupuestado": 2529.12
  },
  {
    "codigo": "OE.6.8.6.1",
    "descripcion": "Pozo puesta a tierra",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 1917.64,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.8.6.2",
    "descripcion": "Pruebas Eléctricas ( Resistencia de Puesta a Tierra)",
    "unidad": "und",
    "metrado_fijo": 0,
    "cantidad_presupuestada": 0,
    "precio_unitario_presupuestado": 415.65,
    "total_presupuestado": 0
  },
  {
    "codigo": "OE.6.08.06.03",
    "descripcion": "Pozo puesta a tierra",
    "unidad": "und",
    "metrado_fijo": 3,
    "cantidad_presupuestada": 3,
    "precio_unitario_presupuestado": 2219.64,
    "total_presupuestado": 6658.92
  },
  {
    "codigo": "OE.6.08.06.04",
    "descripcion": "Pruebas electricas (resistencia)",
    "unidad": "und",
    "metrado_fijo": 3,
    "cantidad_presupuestada": 3,
    "precio_unitario_presupuestado": 415.65,
    "total_presupuestado": 1246.95
  },
  {
    "codigo": "OE.6.8.7.1",
    "descripcion": "Receptor A/V",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 6578.63,
    "total_presupuestado": 6578.63
  },
  {
    "codigo": "OE.6.8.7.2",
    "descripcion": "Microfono inalambrico",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 3999.66,
    "total_presupuestado": 3999.66
  },
  {
    "codigo": "OE.6.8.7.3",
    "descripcion": "Parlante de Techo",
    "unidad": "und",
    "metrado_fijo": 4,
    "cantidad_presupuestada": 4,
    "precio_unitario_presupuestado": 739.32,
    "total_presupuestado": 2957.28
  },
  {
    "codigo": "OE.6.8.8.1",
    "descripcion": "Ecram Electrico",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 2139.32,
    "total_presupuestado": 2139.32
  },
  {
    "codigo": "OE.6.8.8.2",
    "descripcion": "Proyector Multimedia",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 8539.32,
    "total_presupuestado": 8539.32
  },
  {
    "codigo": "OE.7.1.1",
    "descripcion": "Gastos de proteccion de equipos",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 16359.52,
    "total_presupuestado": 16359.52
  },
  {
    "codigo": "OE.7.1.2",
    "descripcion": "Gastos de transporte de equipos",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1635.48,
    "total_presupuestado": 1635.48
  },
  {
    "codigo": "OE.7.2.1",
    "descripcion": "Contraste y verificacion de equipo biomedico a trasladar",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1286.2,
    "total_presupuestado": 1286.2
  },
  {
    "codigo": "OE.7.2.2",
    "descripcion": "Desinstalado de equipo biomedico",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 2478,
    "total_presupuestado": 2478
  },
  {
    "codigo": "OE.7.2.3",
    "descripcion": "Embalaje de equipo biomedico",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 354,
    "total_presupuestado": 354
  },
  {
    "codigo": "OE.7.2.4",
    "descripcion": "Transporte de equipo biomedico",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1623.68,
    "total_presupuestado": 1623.68
  },
  {
    "codigo": "OE.7.2.5",
    "descripcion": "Instalacion de equipo biomedico",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 3127,
    "total_presupuestado": 3127
  },
  {
    "codigo": "OE.7.2.6",
    "descripcion": "Pruebas en vacio de equipo biomedico",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1869.12,
    "total_presupuestado": 1869.12
  },
  {
    "codigo": "OE.7.3.1",
    "descripcion": "Contraste y verificacion de equipo electromecanico a trasladar",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1097.4,
    "total_presupuestado": 1097.4
  },
  {
    "codigo": "OE.7.3.2",
    "descripcion": "Desinstalado de equipo electromecanico",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1770,
    "total_presupuestado": 1770
  },
  {
    "codigo": "OE.7.3.3",
    "descripcion": "Embalaje de equipo electromecanico",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 354,
    "total_presupuestado": 354
  },
  {
    "codigo": "OE.7.3.4",
    "descripcion": "Transporte de equipo electromecanico",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1475,
    "total_presupuestado": 1475
  },
  {
    "codigo": "OE.7.3.5",
    "descripcion": "Instalacion de equipo electromecanico",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 2206.6,
    "total_presupuestado": 2206.6
  },
  {
    "codigo": "OE.7.3.6",
    "descripcion": "Pruebas en vacio de equipo electromecanico",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1947,
    "total_presupuestado": 1947
  },
  {
    "codigo": "OE.7.4.1",
    "descripcion": "Contraste y verificacion de equipo informatico a trasladar",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 354,
    "total_presupuestado": 354
  },
  {
    "codigo": "OE.7.4.2",
    "descripcion": "Desinstalado de equipo informaticos",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1298,
    "total_presupuestado": 1298
  },
  {
    "codigo": "OE.7.4.3",
    "descripcion": "Embalaje de equipo informatico",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 354,
    "total_presupuestado": 354
  },
  {
    "codigo": "OE.7.4.4",
    "descripcion": "Transporte de equipo informatico",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 613.6,
    "total_presupuestado": 613.6
  },
  {
    "codigo": "OE.7.4.5",
    "descripcion": "Instalacion de equipo informatico",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1888,
    "total_presupuestado": 1888
  },
  {
    "codigo": "OE.7.4.6",
    "descripcion": "Pruebas en vacio de equipo informatico",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 896.8,
    "total_presupuestado": 896.8
  },
  {
    "codigo": "OE.7.5.1",
    "descripcion": "Contraste y verificacion de bienes a trasladar - instrumental",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 306.8,
    "total_presupuestado": 306.8
  },
  {
    "codigo": "OE.7.5.2",
    "descripcion": "Embalaje de instrumental",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1878.56,
    "total_presupuestado": 1878.56
  },
  {
    "codigo": "OE.7.5.3",
    "descripcion": "Transporte instrumental",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 448.4,
    "total_presupuestado": 448.4
  },
  {
    "codigo": "OE.7.5.4",
    "descripcion": "Desembalaje, verificacion y organizacion de instrumental",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1260.24,
    "total_presupuestado": 1260.24
  },
  {
    "codigo": "OE.7.6.1",
    "descripcion": "Contraste de bienes a trasladar- mobiliario administrativo",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 613.6,
    "total_presupuestado": 613.6
  },
  {
    "codigo": "OE.7.6.2",
    "descripcion": "Desinstalado de mobiliario administrativo",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 3085.7,
    "total_presupuestado": 3085.7
  },
  {
    "codigo": "OE.7.6.3",
    "descripcion": "Embalaje de mobiliario administrativo",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 354,
    "total_presupuestado": 354
  },
  {
    "codigo": "OE.7.6.4",
    "descripcion": "Transporte de mobiliario administrativo",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1132.8,
    "total_presupuestado": 1132.8
  },
  {
    "codigo": "OE.7.6.5",
    "descripcion": "Instalacion de mobiliario administrativo",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 2837.9,
    "total_presupuestado": 2837.9
  },
  {
    "codigo": "OE.7.7.1",
    "descripcion": "Contraste de bienes a trasladar- mobiliario clinico",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 613.6,
    "total_presupuestado": 613.6
  },
  {
    "codigo": "OE.7.7.2",
    "descripcion": "Desinstalado de mobiliario clinico",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 3085.7,
    "total_presupuestado": 3085.7
  },
  {
    "codigo": "OE.7.7.3",
    "descripcion": "Embalaje de mobiliario clinico",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 295,
    "total_presupuestado": 295
  },
  {
    "codigo": "OE.7.7.4",
    "descripcion": "Transporte de mobiliario clinico",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1180,
    "total_presupuestado": 1180
  },
  {
    "codigo": "OE.7.7.5",
    "descripcion": "Instalacion de mobiliario clinico",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 3203.7,
    "total_presupuestado": 3203.7
  },
  {
    "codigo": "OE.7.8.1",
    "descripcion": "Contraste de productos farmaceuticos y de laboratorio",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 4543,
    "total_presupuestado": 4543
  },
  {
    "codigo": "OE.7.8.2",
    "descripcion": "Embalado de productos farmaceuticos y de laboratorio",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 1286.2,
    "total_presupuestado": 1286.2
  },
  {
    "codigo": "OE.7.8.3",
    "descripcion": "Transporte de productos farmaceuticos y laboratorio",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 10100.8,
    "total_presupuestado": 10100.8
  },
  {
    "codigo": "OE.7.8.4",
    "descripcion": "Instalacion de farmacia",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 4543,
    "total_presupuestado": 4543
  },
  {
    "codigo": "OE.8.1.1",
    "descripcion": "Manejo de Residuos Solidos",
    "unidad": "und",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 4461.22,
    "total_presupuestado": 4461.22
  },
  {
    "codigo": "OE.8.1.2",
    "descripcion": "Charlas de Sensibilización Ambiental",
    "unidad": "und",
    "metrado_fijo": 5,
    "cantidad_presupuestada": 5,
    "precio_unitario_presupuestado": 542.51,
    "total_presupuestado": 2712.55
  },
  {
    "codigo": "OE.8.1.3",
    "descripcion": "Monitoreo Ambiental",
    "unidad": "und",
    "metrado_fijo": 3,
    "cantidad_presupuestada": 3,
    "precio_unitario_presupuestado": 7383,
    "total_presupuestado": 22149
  },
  {
    "codigo": "OE.8.2.1",
    "descripcion": "Desmontaje de Instalaciones Provisionales",
    "unidad": "m²",
    "metrado_fijo": 89,
    "cantidad_presupuestada": 89,
    "precio_unitario_presupuestado": 16.67,
    "total_presupuestado": 1483.63
  },
  {
    "codigo": "OE.8.2.2",
    "descripcion": "Punto ecologico x 3",
    "unidad": "und",
    "metrado_fijo": 2,
    "cantidad_presupuestada": 2,
    "precio_unitario_presupuestado": 1380.51,
    "total_presupuestado": 2761.02
  },
  {
    "codigo": "OE.8.2.3",
    "descripcion": "Señalizacion Ambiental",
    "unidad": "glb",
    "metrado_fijo": 1,
    "cantidad_presupuestada": 1,
    "precio_unitario_presupuestado": 322.25,
    "total_presupuestado": 322.25
  }
];

    let insertados = 0;

    for (const p of partidas) {
      try {
        await client.query(
          `INSERT INTO partidas (codigo, descripcion, unidad, metrado_fijo, cantidad_presupuestada, precio_unitario_presupuestado, total_presupuestado)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [p.codigo, p.descripcion, p.unidad, p.metrado_fijo, p.cantidad_presupuestada, p.precio_unitario_presupuestado, p.total_presupuestado]
        );
        insertados++;
      } catch (e) {
        console.error(`  ❌ Error en ${p.codigo}: ${e.message.split('\\n')[0]}`);
      }
    }

    console.log(`\n✅ Partidas insertadas: ${insertados} / ${partidas.length}\n`);

    // Verificar
    const result = await client.query('SELECT COUNT(*) as count FROM partidas');
    console.log(`  📊 Total en BD: ${result.rows[0].count}\n`);

    console.log('═'.repeat(150));
    console.log('\n✅ ¡PARTIDAS CARGADAS!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

insertarPartidas();
