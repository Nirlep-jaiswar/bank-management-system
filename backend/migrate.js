import fs from 'fs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runMigration() {
    try {
        console.log('Connecting to MySQL...');
        const pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            multipleStatements: true
        });

        const sqlFilePath = path.join(__dirname, '../setup.sql');
        const sql = fs.readFileSync(sqlFilePath, 'utf8');

        console.log('Executing SQL script...');
        await pool.query(sql);
        console.log('Database and tables created successfully!');
        
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
