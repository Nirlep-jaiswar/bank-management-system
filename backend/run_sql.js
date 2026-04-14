import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Nirlep@8369',
  database: process.env.DB_NAME || 'bank_management',
  port: process.env.DB_PORT || 3306,
  ssl: process.env.DB_HOST && process.env.DB_HOST.includes('aivencloud') ? { rejectUnauthorized: false } : undefined,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  multipleStatements: true
});

async function runSQL() {
  try {
    const sqlPath = path.join(process.cwd(), '..', 'setup.sql');
    const sqlScript = fs.readFileSync(sqlPath, 'utf-8');
    
    console.log('Got SQL Script...');
    // Connect to DB and run the full string.
    // Ensure multipleStatements: true is set or run queries sequentially.
    
    // Quick split by semicolon for basic commands to avoid some multipleStatements issues, or since we set multipleStatements: true, we can just run it whole:
    const conn = await pool.getConnection();
    console.log('Connected to DB! Dropping tables and re-initializing data...');
    
    // Setting multipleStatements=true allows us to just execute the whole block
    await conn.query(sqlScript);
    
    console.log('Database setup executed successfully!');
    conn.release();
    process.exit(0);
  } catch (error) {
    console.error('Error executing SQL:', error);
    process.exit(1);
  }
}

runSQL();
