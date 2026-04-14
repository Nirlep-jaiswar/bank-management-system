import fs from 'fs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), 'backend', '.env') });

async function initDB() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
        ssl: { rejectUnauthorized: false },
        multipleStatements: true
    });

    try {
        console.log('Connecting to Aiven Cloud Database...');
        const sql = fs.readFileSync('setup.sql', 'utf8');
        console.log('Executing setup.sql (This may take a moment)...');
        await pool.query(sql);
        console.log('Database successfully initialized with all tables!');
        process.exit(0);
    } catch (error) {
        console.error('Error initializing database:');
        console.error(error.message);
        process.exit(1);
    }
}

initDB();
