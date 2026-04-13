import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bank_management',
});

async function run() {
    try {
        await pool.query("INSERT IGNORE INTO Customers (CustomerID, FirstName, LastName, Email) VALUES (1, 'Admin', 'User', 'admin@example.com')");
        await pool.query("INSERT IGNORE INTO Branches (BranchID, BranchName, Location) VALUES (1, 'Main Branch', 'Virtual HQ')");
        console.log("Seeded default customer and branch.");
    } catch(e) {
        console.error(e);
    }
    process.exit(0);
}
run();
