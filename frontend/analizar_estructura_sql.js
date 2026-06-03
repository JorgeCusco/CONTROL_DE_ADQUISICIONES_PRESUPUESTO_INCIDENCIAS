const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: 'postgres.lwuhsendnfwxenoryuzs',
  password: 'SxucXihjIVEMUCAD',
  host: 'aws-1-us-east-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
});

async function getStructure() {
  try {
    console.log('🔍 Conectando a la base de datos...\n');

    // 1. Listar todas las tablas
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    const tablesRes = await pool.query(tablesQuery);
    const tables = tablesRes.rows.map(r => r.table_name);
    
    console.log(`📊 TABLAS ENCONTRADAS (${tables.length}):`);
    console.log('─'.repeat(60));
    tables.forEach(t => console.log(`  • ${t}`));
    console.log('\n');

    let output = '# ESTRUCTURA SQL DETALLADA\n\n';
    output += `## 📊 TABLAS (${tables.length})\n\n`;

    // 2. Para cada tabla, obtener detalles completos
    for (const table of tables) {
      console.log(`\n📋 Analizando tabla: ${table}`);
      
      // Columnas
      const columnsQuery = `
        SELECT 
          column_name, 
          data_type, 
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns 
        WHERE table_name = $1 AND table_schema = 'public'
        ORDER BY ordinal_position;
      `;
      const columnsRes = await pool.query(columnsQuery, [table]);
      
      // Constraints
      const constraintsQuery = `
        SELECT constraint_type, constraint_name
        FROM information_schema.table_constraints
        WHERE table_name = $1 AND table_schema = 'public';
      `;
      const constraintsRes = await pool.query(constraintsQuery, [table]);

      // Foreign Keys
      const fkQuery = `
        SELECT 
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = $1
        AND tc.table_schema = 'public';
      `;
      const fkRes = await pool.query(fkQuery, [table]);

      // Primary Key
      const pkQuery = `
        SELECT a.attname
        FROM pg_class t
        JOIN pg_index idx ON t.oid = idx.indrelid
        JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(idx.indkey)
        WHERE t.relname = $1 AND idx.indisprimary;
      `;
      const pkRes = await pool.query(pkQuery, [table]);

      // Índices
      const indexesQuery = `
        SELECT 
          indexname,
          indexdef
        FROM pg_indexes
        WHERE tablename = $1 AND schemaname = 'public'
        ORDER BY indexname;
      `;
      const indexesRes = await pool.query(indexesQuery, [table]);

      // Conteo de registros
      const countQuery = `SELECT COUNT(*) as count FROM "${table}";`;
      const countRes = await pool.query(countQuery);
      const recordCount = countRes.rows[0].count;

      // Construir salida
      output += `\n### ${table.toUpperCase()}\n`;
      output += `**Registros:** ${recordCount}\n\n`;

      // Columnas
      output += `#### Columnas (${columnsRes.rows.length})\n`;
      output += '| Campo | Tipo | Nullable | Defecto |\n';
      output += '|-------|------|----------|----------|\n';
      columnsRes.rows.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? '✓' : '✗';
        const defaultVal = col.column_default || '-';
        const colType = col.character_maximum_length ? 
          `${col.data_type}(${col.character_maximum_length})` : 
          col.data_type;
        output += `| ${col.column_name} | ${colType} | ${nullable} | ${defaultVal} |\n`;
      });
      output += '\n';

      // Primary Key
      if (pkRes.rows.length > 0) {
        output += `**Primary Key:**\n`;
        pkRes.rows.forEach(pk => {
          output += `- \`${pk.attname}\`\n`;
        });
        output += '\n';
      }

      // Foreign Keys
      if (fkRes.rows.length > 0) {
        output += `**Foreign Keys:**\n`;
        fkRes.rows.forEach(fk => {
          output += `- \`${fk.column_name}\` → \`${fk.foreign_table_name}.${fk.foreign_column_name}\`\n`;
        });
        output += '\n';
      }

      // Constraints
      if (constraintsRes.rows.length > 0) {
        output += `**Constraints:**\n`;
        constraintsRes.rows.forEach(c => {
          output += `- ${c.constraint_type}: \`${c.constraint_name}\`\n`;
        });
        output += '\n';
      }

      // Índices
      if (indexesRes.rows.length > 0) {
        output += `**Índices:**\n`;
        indexesRes.rows.forEach(idx => {
          output += `- \`${idx.indexname}\`\n`;
          output += `  ${idx.indexdef}\n`;
        });
        output += '\n';
      }
    }

    // 3. Diagrama de relaciones
    console.log('\n\n🔗 Analizando relaciones entre tablas...');
    
    const allFKQuery = `
      SELECT 
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS referenced_table,
        ccu.column_name AS referenced_column
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      ORDER BY tc.table_name;
    `;
    const allFKRes = await pool.query(allFKQuery);

    output += `\n## 🔗 DIAGRAMA DE RELACIONES\n\n`;
    output += '```\n';
    
    if (allFKRes.rows.length > 0) {
      output += 'Relaciones (Foreign Keys):\n\n';
      const relations = {};
      allFKRes.rows.forEach(row => {
        const key = `${row.table_name}`;
        if (!relations[key]) relations[key] = [];
        relations[key].push(
          `${row.table_name}.${row.column_name} ──→ ${row.referenced_table}.${row.referenced_column}`
        );
      });

      Object.keys(relations).forEach(key => {
        output += `\n${key}:\n`;
        relations[key].forEach(rel => {
          output += `  ${rel}\n`;
        });
      });
    } else {
      output += 'No se encontraron relaciones de clave foránea.\n';
    }
    output += '```\n\n';

    // 4. Estadísticas
    output += `## 📈 ESTADÍSTICAS GENERALES\n\n`;
    output += `- **Total de tablas:** ${tables.length}\n`;
    output += `- **Total de Foreign Keys:** ${allFKRes.rows.length}\n`;
    
    // Guardar output
    const outputPath = path.join(__dirname, '..', 'ESTRUCTURA_SQL_COMPLETA.md');
    fs.writeFileSync(outputPath, output);
    console.log('\n\n✅ Estructura SQL guardada en ESTRUCTURA_SQL_COMPLETA.md');
    console.log('\n' + output);

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

getStructure();
