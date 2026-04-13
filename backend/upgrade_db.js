import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bank_management',
    multipleStatements: true
});

async function run() {
    try {
        console.log("Fetching foreign key constraint name...");
        const [rows] = await pool.query(`
            SELECT CONSTRAINT_NAME 
            FROM information_schema.KEY_COLUMN_USAGE 
            WHERE TABLE_NAME = 'Transactions' AND COLUMN_NAME = 'AccountID' AND TABLE_SCHEMA = 'bank_management'
        `);
        const fkName = rows[0]?.CONSTRAINT_NAME;
        if(fkName) {
            await pool.query(`ALTER TABLE Transactions DROP FOREIGN KEY ${fkName}`);
        }
        
        console.log("Upgrading Accounts to BIGINT...");
        await pool.query("ALTER TABLE Accounts MODIFY AccountID BIGINT AUTO_INCREMENT");
        await pool.query("ALTER TABLE Transactions MODIFY AccountID BIGINT");
        
        if(fkName) {
            await pool.query(`ALTER TABLE Transactions ADD CONSTRAINT ${fkName} FOREIGN KEY (AccountID) REFERENCES Accounts(AccountID)`);
        }
        await pool.query("ALTER TABLE Accounts AUTO_INCREMENT = 100000000001");
        console.log("12-digit Account IDs enabled.");
    } catch(e) {
        console.error(e);
    }
    process.exit(0);
}
run();
