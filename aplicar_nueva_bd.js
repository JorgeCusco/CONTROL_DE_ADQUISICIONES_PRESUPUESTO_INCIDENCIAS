require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');

async function applyNewDB() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();
        console.log('Conectado a la base de datos.');

        const files = [
            'reestructuracion_bd.sql',
            'DATA_USAR/INSERT_partidas_p.sql',
            'DATA_USAR/INSERT_acus.sql',
            'DATA_USAR/INSERT_compras_c.sql',
            'DATA_USAR/INSERT_insumos_p.sql'
        ];

        for (const file of files) {
            console.log(`Ejecutando ${file}...`);
            const sql = fs.readFileSync(file, 'utf8');
            await client.query(sql);
            console.log(`✅ ${file} completado.`);
        }

        console.log('¡Toda la base de datos ha sido reestructurada exitosamente!');
    } catch (err) {
        console.error('❌ Error ejecutando SQL:', err);
    } finally {
        await client.end();
    }
}

applyNewDB();
