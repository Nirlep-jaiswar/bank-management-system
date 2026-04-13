import mysql from 'mysql2/promise';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

async function runSetup() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      multipleStatements: true // VERY IMPORTANT for running script
    });

    const sqlPath = path.resolve('../setup.sql');
    const sqlScript = fs.readFileSync(sqlPath, 'utf8');

    console.log('Got SQL Script...');
    await connection.query(sqlScript);
    console.log('Database schema successfully updated.');

  } catch (error) {
    console.error('Error executing setup.sql:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runSetup();
