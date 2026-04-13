import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    const pool = mysql.createPool({ host: process.env.DB_HOST||'localhost', user: process.env.DB_USER||'root', password: process.env.DB_PASSWORD||'Nirlep@8369', database: process.env.DB_NAME||'bank_management' });
    try {
        await pool.query("UPDATE Loans SET Status = 'Approved' WHERE LoanID = 1");
        console.log('Fixed retroactively!');
    } catch(e) {
        console.error(e);
    }
    process.exit(0);
}
run();
