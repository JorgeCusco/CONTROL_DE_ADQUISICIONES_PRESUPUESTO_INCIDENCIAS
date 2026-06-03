const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres.lwuhsendnfwxenoryuzs',
  password: 'Jo.9839514500',
  host: 'aws-1-us-east-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres'
});

console.log('🔍 PROBANDO ENDPOINT /api/data\n');
console.log('═'.repeat(150));

(async () => {
  try {
    const client = await pool.connect();

    // Exactamente lo que hace el API /api/data
    console.log('\n📝 Ejecutando: SELECT DISTINCT descripcion FROM insumos ORDER BY descripcion\n');

    const insumosResult = await client.query('SELECT DISTINCT descripcion FROM insumos ORDER BY descripcion');
    const insumos = insumosResult.rows.map(r => r.descripcion);

    console.log(`✓ Total descripciones únicas: ${insumos.length}\n`);

    console.log('Primeras 30 descripciones:\n');
    insumos.slice(0, 30).forEach((desc, idx) => {
      console.log(`  ${(idx + 1).toString().padStart(2)}. ${desc}`);
    });

    // Simular la búsqueda booleana
    console.log('\n' + '═'.repeat(150));
    console.log('\n🔎 PRUEBA DE BÚSQUEDA BOOLEANA\n');

    const testSearches = [
      'CEMENTO',
      'cemento',
      'ACERO',
      'AGUA',
      'OFICIAL'
    ];

    testSearches.forEach(search => {
      const terms = search.toLowerCase().split(/\s+/).filter(Boolean);
      const filtered = insumos.filter(ins => {
        const lowerIns = ins.toLowerCase();
        return terms.every(term => lowerIns.includes(term));
      }).slice(0, 5);

      console.log(`🔍 Búsqueda: "${search}" → ${filtered.length} resultados`);
      if (filtered.length > 0) {
        filtered.forEach(f => console.log(`   - ${f}`));
      }
      console.log();
    });

    client.release();
    process.exit(0);

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
