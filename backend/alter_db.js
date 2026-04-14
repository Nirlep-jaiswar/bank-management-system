import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Nirlep@8369',
  database: process.env.DB_NAME || 'bank_management',
  port: process.env.DB_PORT || 3306,
  ssl: process.env.DB_HOST && process.env.DB_HOST.includes('aivencloud') ? { rejectUnauthorized: false } : undefined
});

async function alterDb() {
  try {
    const conn = await pool.getConnection();
    console.log('Connected. Altering table...');
    await conn.query("ALTER TABLE Transactions MODIFY COLUMN TransactionType ENUM('Deposit', 'Withdrawal', 'Transfer', 'Loan Repayment') NOT NULL;");
    console.log('Successfully altered Transactions table ENUM to include Loan Repayment!');
    conn.release();
    process.exit(0);
  } catch (err) {
    console.error('Error altering DB:', err);
    process.exit(1);
  }
}
alterDb();
