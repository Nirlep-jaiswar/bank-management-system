import mysql from 'mysql2/promise';

async function fix() {
    const pool = mysql.createPool({ host: 'localhost', user: 'root', password: 'Nirlep@8369', database: 'bank_management' });
    
    // Check what we have
    const [rows] = await pool.query("SELECT * FROM Admins");
    console.log("Current Admins:", rows);

    // Let's force super admin update correctly
    // Let's force super admin update correctly
    await pool.query("UPDATE Admins SET FirstName = 'Nirlep', LastName = 'Jaiswar', Email = 'super@nexusbank.com', Role = 'Super Admin' WHERE AdminID = 1");
    
    // Add the regular admins if they don't exist, then update their names
    await pool.query("INSERT IGNORE INTO Admins (AdminID, Email, Password, Role, AllocatedFunds) VALUES (2, 'admin1@nexusbank.com', 'admin123', 'Admin', 0.00)");
    await pool.query("UPDATE Admins SET FirstName = 'Tanay', LastName = 'Tiwari', Role = 'Admin', Email = 'admin1@nexusbank.com' WHERE AdminID = 2");

    await pool.query("INSERT IGNORE INTO Admins (AdminID, Email, Password, Role, AllocatedFunds) VALUES (3, 'admin2@nexusbank.com', 'admin123', 'Admin', 0.00)");
    await pool.query("UPDATE Admins SET FirstName = 'Durgesh', LastName = 'Nandan', Role = 'Admin', Email = 'admin2@nexusbank.com' WHERE AdminID = 3");
    
    await pool.query("INSERT IGNORE INTO Admins (AdminID, Email, Password, Role, AllocatedFunds) VALUES (4, 'admin3@nexusbank.com', 'admin123', 'Admin', 0.00)");
    await pool.query("UPDATE Admins SET FirstName = 'Ayush', LastName = 'Singh', Role = 'Admin', Email = 'admin3@nexusbank.com' WHERE AdminID = 4");
    
    await pool.query("UPDATE Admins SET Password = 'admin123'");
    
    // Check credentials
    const [finalRows] = await pool.query("SELECT AdminID, Email, Password, Role, FirstName, LastName FROM Admins");
    console.log("Final Admins List:");
    console.table(finalRows);
    process.exit(0);
}
fix();
