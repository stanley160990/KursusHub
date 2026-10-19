import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runDatabaseInitialization() {
  console.log('====================================================');
  console.log('KursusHub - Manual Database Initialization & Seeding');
  console.log('====================================================');

  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL || undefined,
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    database: process.env.POSTGRES_DB || 'kursushub_db',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres_secret_password',
  });

  try {
    const client = await pool.connect();
    console.log('[PostgreSQL] Connected successfully to database server.');

    const sqlPath = path.resolve(__dirname, '../init-db.sql');
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`File SQL inisialisasi tidak ditemukan di: ${sqlPath}`);
    }

    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    console.log('[PostgreSQL] Executing SQL initialization script (init-db.sql)...');

    await client.query(sqlContent);
    console.log('[PostgreSQL] Database schema and initial default dataset initialized successfully!');

    client.release();
  } catch (error) {
    console.error('[PostgreSQL Init Error]:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runDatabaseInitialization();
