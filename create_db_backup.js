const { execSync } = require('child_process');
const fs = require('fs');
require('dotenv').config({ path: './frontend/.env' });

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT || '5432';
const dbName = process.env.DB_NAME;

const backupDir = './backup';
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

const pgDumpCmd = `pg_dump -U ${dbUser} -h ${dbHost} -p ${dbPort} -d ${dbName} -F p -f ${backupDir}/database_backup.sql`;

console.log('Creando backup de la base de datos Supabase...');
try {
  execSync(pgDumpCmd, { env: { ...process.env, PGPASSWORD: dbPassword }, stdio: 'inherit' });
  console.log('✅ Backup de BD creado exitosamente.');
} catch (e) {
  console.error('Error creando backup de DB:', e.message);
}
