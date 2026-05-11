const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  database: '7_insumos_rado',
  user: 'postgres',
  password: 'Jo.9839514500',
  port: 5432
});

async function detectarVariaciones() {
  const client = await pool.connect();
  try {
    const result = await client.query(`SELECT DISTINCT codigo FROM partidas ORDER BY codigo`);

    const codigos = result.rows.map(r => r.codigo);

    console.log('='.repeat(80));
    console.log('ANÁLISIS DE VARIACIONES EN CÓDIGOS DE PARTIDAS');
    console.log('='.repeat(80));

    console.log(`\nTOTAL DE CÓDIGOS ÚNICOS: ${codigos.length}\n`);

    // Detectar patrones
    const patrones = {
      'O.E. con puntos (O.E.X.X.X.X)': [],
      'OE sin puntos entre O-E (OE.X.X.X.X)': [],
      'Con ceros a izquierda (OE.01.02 o similar)': [],
      'Longitud variable de segmentos': [],
      'Otros formatos anómalos': []
    };

    codigos.forEach(codigo => {
      // Patrón 1: O.E. con puntos
      if (codigo.match(/^O\.E\./)) {
        patrones['O.E. con puntos (O.E.X.X.X.X)'].push(codigo);
      }
      // Patrón 2: OE sin puntos entre O-E (normal)
      else if (codigo.match(/^OE\.[0-9]/)) {
        // Verificar si tiene ceros a la izquierda
        if (codigo.match(/\.0\d/)) {
          patrones['Con ceros a izquierda (OE.01.02 o similar)'].push(codigo);
        } else {
          patrones['OE sin puntos entre O-E (OE.X.X.X.X)'].push(codigo);
        }
      }
      // Otros
      else {
        patrones['Otros formatos anómalos'].push(codigo);
      }
    });

    // Mostrar resultados
    Object.entries(patrones).forEach(([patron, codes]) => {
      if (codes.length > 0) {
        console.log(`\n${patron}`);
        console.log(`  Cantidad: ${codes.length}`);
        console.log(`  Ejemplos: ${codes.slice(0, 5).join(', ')}`);
        if (codes.length > 5) console.log(`  ... y ${codes.length - 5} más`);
      }
    });

    // Análisis detallado de estructura
    console.log('\n' + '='.repeat(80));
    console.log('ANÁLISIS DE ESTRUCTURA (separador de segmentos)');
    console.log('='.repeat(80));

    const estructuras = {};
    codigos.forEach(codigo => {
      // Contar puntos y guiones
      const puntos = (codigo.match(/\./g) || []).length;
      const segmentos = codigo.split(/[\.\-]/).filter(s => s);
      const clave = `${puntos} separadores, ${segmentos.length} segmentos`;

      if (!estructuras[clave]) estructuras[clave] = [];
      estructuras[clave].push(codigo);
    });

    Object.entries(estructuras).forEach(([estructura, codes]) => {
      console.log(`\n${estructura}`);
      console.log(`  Cantidad: ${codes.length}`);
      console.log(`  Ejemplos: ${codes.slice(0, 5).join(', ')}`);
    });

    // Buscar códigos con ceros a la izquierda específicamente
    console.log('\n' + '='.repeat(80));
    console.log('CÓDIGOS CON CEROS A LA IZQUIERDA (01, 02, 001, etc)');
    console.log('='.repeat(80));

    const conCeros = codigos.filter(c => c.match(/\.0[0-9]/));
    if (conCeros.length > 0) {
      console.log(`\nEncontrados: ${conCeros.length}`);
      conCeros.slice(0, 20).forEach(c => console.log(`  ${c}`));
      if (conCeros.length > 20) console.log(`  ... y ${conCeros.length - 20} más`);
    } else {
      console.log('\n✅ NO HAY CÓDIGOS CON CEROS A LA IZQUIERDA');
    }

  } finally {
    client.release();
    await pool.end();
  }
}

detectarVariaciones().catch(console.error);
