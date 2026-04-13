import mysql from 'mysql2/promise';

async function seed() {
    const pool = mysql.createPool({ host: 'localhost', user: 'root', password: 'Nirlep@8369', database: 'bank_management' });
    try {
        console.log('Seeding Customers...');
        await pool.query(`INSERT INTO Customers (FirstName, LastName, Email, Phone, Address, DateOfBirth) VALUES 
            ('James', 'Miller', 'james.m@example.com', '555-0101', '123 Tech Lane', '1985-06-15'),
            ('Sarah', 'Connors', 'sarah.c@example.com', '555-0102', '456 Cyber St', '1990-08-22'),
            ('Marcus', 'Wright', 'marcus.w@example.com', '555-0103', '789 Future Ave', '1979-11-05'),
            ('Elena', 'Rivera', 'elena.r@example.com', '555-0104', '321 Neural Way', '1993-02-14'),
            ('David', 'Chen', 'david.c@example.com', '555-0105', '654 Data Dr', '1988-09-30')`);
            
        console.log('Fetching Customer IDs...');
        const [customers] = await pool.query('SELECT CustomerID FROM Customers');
        
        console.log('Seeding Accounts...');
        for(let c of customers) {
            await pool.query(`INSERT INTO Accounts (CustomerID, BranchID, AccountType, Balance, Status) VALUES 
                (?, 1, 'Savings', ?, 'Active')`, [c.CustomerID, Math.floor(Math.random() * 50000) + 1000]);
        }
        
        console.log('Fetching Account IDs...');
        const [accounts] = await pool.query('SELECT AccountID, CustomerID FROM Accounts');
        
        console.log('Seeding Transactions...');
        for(let a of accounts) {
            await pool.query(`INSERT INTO Transactions (AccountID, TransactionType, Amount, Description) VALUES
                (?, 'Deposit', ?, 'Initial Branch Transfer'),
                (?, 'Withdrawal', ?, 'ATM Cash Withdrawal')`, 
                [a.AccountID, 500, a.AccountID, 150]);
        }
        console.log('Database beautifully seeded!');
    } catch(err) {
        console.error(err);
    }
    process.exit(0);
}
seed();
