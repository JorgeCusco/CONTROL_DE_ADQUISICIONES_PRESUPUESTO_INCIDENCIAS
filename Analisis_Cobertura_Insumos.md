# Análisis de Cobertura de Insumos vs Partidas (APU)

Este informe compara los insumos declarados en tu `LISTA_INSUMOS.xls` con los insumos requeridos por las partidas según `APUS_INSUMOS_ESTRUCTURADO.csv`.

## 📊 Resumen Ejecutivo
- **Total Insumos en LISTA_INSUMOS.xls:** 1024
- **Total Insumos requeridos por las Partidas (APUs):** 1027
- **Insumos emparejados (En lista y en APU):** 1013
- **Cobertura de la lista:** 98.9%

## ⚠️ Insumos Faltantes (Solo en APU)
Hay **14** insumos que son requeridos por las partidas, pero **NO** están en tu hoja `LISTA_INSUMOS.xls`.
| Código | Descripción | Cantidad de Partidas que lo usan |
|---|---|---|
| 530020001 | PETROLEO | 6 |
| 99 | Acero f'y=4200 kg/cm2 | 2 |
| 99 | CONCRETO F'C = 175 KG/CM2 CEMENTO TIPO I (PREPARACION Y VACIADO) | 2 |
| 99 | Encofrado y desencofrado para muros | 2 |
| 99 | Excavacion manual para caja en Terreno Normal | 2 |
| 99 | PINTURA PARA TUBERIA METALICA (BASE Y ESMALTE EPOXICOS). | 2 |
| 99 | Tarrajeo de Muro C/Impérmeabilizante, acabado pulido C:A - 1:5 E=1.5 cm, H=0.5m | 2 |
| 99 | Encofrado y desencofrado para tapa | 1 |
| 99 | Excavacion de zanja para lecho de Cable N2XOH, para alimentadores (0.60x0.60) | 1 |
| 370010001 | Herramientas | 1 |
| 99 | Relleno y compactado de zanja para lecho de cable N2XOH. | 1 |
| 99 | Solado para zapata e=0.10m, f'c=100kg/cm2 | 1 |
| 99 | Tendido de Conductor N2XOH en Zanja  
 | 1 |
| 99 | Trazo, niveles y replanteo preliminar | 1 |

## 🔍 Insumos Sobrantes (Solo en LISTA)
Hay **11** insumos en tu `LISTA_INSUMOS.xls` que **NO** son requeridos por ninguna partida en los APUs.
| Código | Descripción |
|---|---|
| 120010004.0 | BRAQUET DE PARED EXTERIOR E27 |
| 120010003.0 | BRAQUET REFLECTOR DE 13W |
| 990020905.0 | CAJA DE CONCRETO VIBRADO DE 0.40X0.40X0.35m INCLUYE TAPA |
| 120020431.0 | CAJA DE PASO BISELADA PESADA DE Fº Gº DE 150x150X100MM INCLUY TAPA |
| 540020584.0 | DISOLVENTE PARA PINTURA ANTICORROSIVA |
| 100010002.0 | INODORO TIPO C-1 CON FLUXOMETRO (DONACION ANTONIO LORENA) |
| 100010003.0 | LAVATORIO DE LOZA (DONACION ANTONIO LORENA) |
| 120010002.0 | LUMINARIA SPOT DICROICO DE 6W |
| 100010001.0 | URINARIO DE LOZA VITRIFICADA (DONACIÓN ANTONIO LORENA) |
| nan | SUB-CONTRATOS |
| 88888888.0 | GASTOS GENERALES |
