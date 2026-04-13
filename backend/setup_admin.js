import mysql from 'mysql2/promise';

async function run() { 
    try {
        const pool = mysql.createPool({ host: 'localhost', user: 'root', password: 'Nirlep@8369', database: 'bank_management' }); 
        
        // Ensure Admins table exists with the new schema (Role and AllocatedFunds)
        // Since we don't want to destroy existing data if possible, we'll try to alter it or recreate.
        // For simplicity since it's a dev environment, we can alter if it exists or create if not.
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Admins ( 
                AdminID INT AUTO_INCREMENT PRIMARY KEY, 
                FirstName VARCHAR(100) NOT NULL, 
                LastName VARCHAR(100) NOT NULL, 
                Email VARCHAR(100) UNIQUE NOT NULL, 
                Password VARCHAR(255) NOT NULL, 
                AssignedBranch VARCHAR(100) DEFAULT 'Main Branch - Wall Street',
                Role ENUM('Super Admin', 'Admin') DEFAULT 'Admin',
                AllocatedFunds DECIMAL(15,2) DEFAULT 0.00
            )
        `); 

        // Attempting to add Columns just in case the table already existed from before
        try {
            await pool.query("ALTER TABLE Admins ADD COLUMN Role ENUM('Super Admin', 'Admin') DEFAULT 'Admin'");
            await pool.query("ALTER TABLE Admins ADD COLUMN AllocatedFunds DECIMAL(15,2) DEFAULT 0.00");
        } catch(e) {
            // Duplicate column error is expected if already altered
        }

        // Create the Audit Logs Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS AdminAuditLogs (
                LogID INT AUTO_INCREMENT PRIMARY KEY,
                AdminID INT,
                ActionType VARCHAR(100) NOT NULL,
                Description TEXT NOT NULL,
                Timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (AdminID) REFERENCES Admins(AdminID)
            )
        `);

        // Insert the root Super Admin
        await pool.query(`
            INSERT IGNORE INTO Admins (AdminID, FirstName, LastName, Email, Password, Role, AllocatedFunds) 
            VALUES (1, 'Super', 'Administrator', 'super@nexusbank.com', 'admin123', 'Super Admin', 99999999.00)
        `);

        // Insert a normal Admin for testing
        await pool.query(`
            INSERT IGNORE INTO Admins (AdminID, FirstName, LastName, Email, Password, Role, AllocatedFunds) 
            VALUES (2, 'Standard', 'Teller', 'teller@nexusbank.com', 'teller123', 'Admin', 0.00)
        `);
        
        // Update Admin 1 to Super Admin just in case it existed before
        await pool.query(`UPDATE Admins SET Role = 'Super Admin' WHERE AdminID = 1`);

        console.log('Database upgraded: Super Admin capabilities and Audit Logs added.'); 
        process.exit(0); 
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
} 

run();
