import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Root endpoint just to verify the backend is alive
app.get('/', (req, res) => {
    res.send('NexusBank API is running securely!');
});

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Nirlep@8369',
  database: process.env.DB_NAME || 'bank_management',
  port: process.env.DB_PORT || 3306,
  ssl: process.env.DB_HOST && process.env.DB_HOST.includes('aivencloud') ? { rejectUnauthorized: false } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper for Logging
async function logAdminAction(conn, adminId, actionType, description) {
    if(!adminId) return;
    await conn.query('INSERT INTO AdminAuditLogs (AdminID, ActionType, Description) VALUES (?, ?, ?)', [adminId, actionType, description]);
}

// Get all customers
app.get('/api/customers', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Customers');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all accounts
app.get('/api/accounts', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT a.AccountID, a.AccountType, a.Balance, a.Status, 
                   c.FirstName, c.LastName, 
                   b.BranchName 
            FROM Accounts a 
            LEFT JOIN Customers c ON a.CustomerID = c.CustomerID
            LEFT JOIN Branches b ON a.BranchID = b.BranchID
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new account
app.post('/api/accounts', async (req, res) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const { CustomerID, AccountType, Balance, AdminID } = req.body;
        const cid = CustomerID || 1;
        const [result] = await conn.query(
            'INSERT INTO Accounts (CustomerID, BranchID, AccountType, Balance, Status) VALUES (?, 1, ?, ?, \'Active\')',
            [cid, AccountType || 'Savings', Balance || 0]
        );
        await logAdminAction(conn, AdminID, 'Create Account', `Created ${AccountType} account for Customer ${cid}`);
        await conn.commit();
        res.json({ id: result.insertId, message: 'Account created successfully' });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
});

// Get all transactions
app.get('/api/transactions', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT t.*, c.FirstName, c.LastName 
            FROM Transactions t 
            LEFT JOIN Accounts a ON t.AccountID = a.AccountID
            LEFT JOIN Customers c ON a.CustomerID = c.CustomerID
            ORDER BY t.TransactionDate DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new customer
app.post('/api/customers', async (req, res) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const { FirstName, LastName, Email, Phone, Address, DateOfBirth, AdminID } = req.body;
        const [result] = await conn.query(
            'INSERT INTO Customers (FirstName, LastName, Email, Phone, Address, DateOfBirth) VALUES (?, ?, ?, ?, ?, ?)',
            [FirstName, LastName, Email, Phone, Address, DateOfBirth]
        );
        await logAdminAction(conn, AdminID, 'Create Customer', `Registered customer: ${FirstName} ${LastName}`);
        await conn.commit();
        res.json({ id: result.insertId, message: 'Customer added successfully' });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
});

// Delete a customer
app.delete('/api/customers/:id', async (req, res) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const customerId = req.params.id;
        const AdminID = req.headers['x-admin-id']; // Grab from headers for deletes
        
        // Find accounts belonging to the customer
        const [accounts] = await conn.query('SELECT AccountID FROM Accounts WHERE CustomerID = ?', [customerId]);
        const accountIds = accounts.map(a => a.AccountID);
        
        if (accountIds.length > 0) {
            await conn.query('DELETE FROM Transactions WHERE AccountID IN (?)', [accountIds]);
        }
        await conn.query('DELETE FROM Loans WHERE CustomerID = ?', [customerId]);
        await conn.query('DELETE FROM Accounts WHERE CustomerID = ?', [customerId]);
        await conn.query('DELETE FROM Customers WHERE CustomerID = ?', [customerId]);
        
        await logAdminAction(conn, AdminID, 'Delete Customer', `Deleted customer ID ${customerId} and all associated records`);
        await conn.commit();
        res.json({ message: 'Customer deleted successfully' });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
});

// Admin Login
app.post('/api/login', async (req, res) => {
    try {
        const { Email, Password } = req.body;
        const [admins] = await pool.query('SELECT AdminID, FirstName, LastName, Email, AssignedBranch, Role, AllocatedFunds FROM Admins WHERE Email = ? AND Password = ?', [Email, Password]);
        if (admins.length > 0) {
            res.json({ success: true, admin: admins[0] });
        } else {
            res.status(401).json({ error: 'Invalid credentials. Please try again.' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Admin Profile (Modified to fetch specific admin by ID via query param)
app.get('/api/admin', async (req, res) => {
    try {
        const adminId = req.query.id || 1;
        const [admins] = await pool.query('SELECT AdminID, FirstName, LastName, Email, AssignedBranch, Role, AllocatedFunds FROM Admins WHERE AdminID = ?', [adminId]);
        res.json(admins[0] || {});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Admin Profile
app.put('/api/admin', async (req, res) => {
    try {
        const { AdminID, FirstName, LastName, Email, AssignedBranch, Password } = req.body;
        const id = AdminID || 1;
        let query = 'UPDATE Admins SET FirstName=?, LastName=?, Email=?, AssignedBranch=? WHERE AdminID=?';
        let params = [FirstName, LastName, Email, AssignedBranch, id];
        
        if (Password) {
            query = 'UPDATE Admins SET FirstName=?, LastName=?, Email=?, AssignedBranch=?, Password=? WHERE AdminID=?';
            params = [FirstName, LastName, Email, AssignedBranch, Password, id];
        }
        
        await pool.query(query, params);
        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- SUPER ADMIN APIS --- //
app.get('/api/superadmin/admins', async (req, res) => {
    try {
        const [admins] = await pool.query('SELECT AdminID, FirstName, LastName, Email, Role, AllocatedFunds FROM Admins ORDER BY Role DESC, AdminID ASC');
        res.json(admins);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/superadmin/logs', async (req, res) => {
    try {
        const [logs] = await pool.query(`
            SELECT l.*, a.FirstName, a.LastName 
            FROM AdminAuditLogs l 
            JOIN Admins a ON l.AdminID = a.AdminID 
            ORDER BY l.Timestamp DESC LIMIT 200
        `);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/superadmin/allocate', async (req, res) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const { SuperAdminID, TargetAdminID, Amount } = req.body;
        
        // Verify super admin
        const [superAdmins] = await conn.query('SELECT Role FROM Admins WHERE AdminID = ?', [SuperAdminID]);
        if (superAdmins.length === 0 || superAdmins[0].Role !== 'Super Admin') {
            await conn.rollback();
            return res.status(403).json({ error: 'Forbidden: Super Admin rights required.' });
        }

        // Add funds to target
        await conn.query('UPDATE Admins SET AllocatedFunds = AllocatedFunds + ? WHERE AdminID = ?', [Amount, TargetAdminID]);
        
        await logAdminAction(conn, SuperAdminID, 'Allocate Funds', `Allocated $${Amount} to Admin ${TargetAdminID}`);
        await conn.commit();
        res.json({ success: true, message: `Successfully allocated $${Amount} to Admin.` });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
});

// Return funds from Admin to Vault
app.post('/api/admin/return', async (req, res) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const { AdminID, Amount } = req.body;
        
        const [admins] = await conn.query('SELECT Role, AllocatedFunds FROM Admins WHERE AdminID = ?', [AdminID]);
        if(admins.length === 0) {
            await conn.rollback();
            return res.status(401).json({ error: 'Unauthorized: Invalid Admin.' });
        }
        
        const currentAdmin = admins[0];
        
        if (currentAdmin.AllocatedFunds < Amount || Amount <= 0) {
            await conn.rollback();
            return res.status(400).json({ error: `Invalid amount. You only have $${currentAdmin.AllocatedFunds} available to return.` });
        }

        await conn.query('UPDATE Admins SET AllocatedFunds = AllocatedFunds - ? WHERE AdminID = ?', [Amount, AdminID]);
        await conn.query('UPDATE Admins SET AllocatedFunds = AllocatedFunds + ? WHERE Role = \'Super Admin\' LIMIT 1', [Amount]);
        
        await logAdminAction(conn, AdminID, 'Return Funds', `Returned $${Amount} to Main Vault at end of day.`);
        await conn.commit();
        res.json({ success: true, message: `Successfully returned $${Amount} to Bank Vault.` });
    } catch(err) {
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
});

// Create a new transaction (WITH DRAWER ALLOCATION LOGIC)
app.post('/api/transactions', async (req, res) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const { AccountID, TargetAccountID, TransactionType, Amount, Description, CustomerName, AdminID } = req.body;
        
        if (!AdminID) {
            await conn.rollback();
            return res.status(401).json({ error: 'Unauthorized: Admin authentication payload missing.' });
        }

        const [admins] = await conn.query('SELECT Role, AllocatedFunds FROM Admins WHERE AdminID = ?', [AdminID]);
        if(admins.length === 0) {
            await conn.rollback();
            return res.status(401).json({ error: 'Unauthorized: Invalid Admin.' });
        }
        const currentAdmin = admins[0];

        // Ensure account exists
        const [accounts] = await conn.query(`
            SELECT a.*, c.FirstName, c.LastName 
            FROM Accounts a 
            LEFT JOIN Customers c ON a.CustomerID = c.CustomerID 
            WHERE a.AccountID = ?
        `, [AccountID]);
        
        if (accounts.length === 0) {
            await conn.rollback();
            return res.status(404).json({ error: 'Account not found. Please check your Account ID.' });
        }
        
        // Verification constraint
        if (CustomerName) {
            const ownerName = `${accounts[0].FirstName} ${accounts[0].LastName}`.toLowerCase();
            if (!ownerName.includes(CustomerName.toLowerCase().trim())) {
                await conn.rollback();
                return res.status(400).json({ error: 'Security alert: The name provided does not match the account holder.' });
            }
        }
        
        // Target Logic
        let targetExists = false;
        if (TransactionType === 'Transfer' && TargetAccountID) {
            const [targetAccounts] = await conn.query('SELECT AccountID FROM Accounts WHERE AccountID = ?', [TargetAccountID]);
            if(targetAccounts.length === 0) {
                await conn.rollback();
                return res.status(404).json({ error: 'Target Account not found.' });
            }
            if(TargetAccountID === AccountID) {
                await conn.rollback();
                return res.status(400).json({ error: 'Cannot transfer to the same account.' });
            }
             // Ensure sufficient balance for transfer
            if (accounts[0].Balance < Amount) {
                await conn.rollback();
                return res.status(400).json({ error: 'Insufficient balance in the source account for transfer.' });
            }
            targetExists = true;
        }

        if (TransactionType === 'Withdrawal' || TransactionType === 'Loan Repayment') {
            if (accounts[0].Balance < Amount) {
                 await conn.rollback();
                 return res.status(400).json({ error: 'Insufficient balance in customer account.' });
            }
        }

        let isLoanRepayment = false;
        if (TransactionType === 'Loan Repayment') {
            const [loans] = await conn.query('SELECT LoanID, PrincipalAmount, Status FROM Loans WHERE LoanID = ? AND Status = \'Approved\'', [TargetAccountID]);
            if (loans.length === 0) {
                 await conn.rollback();
                 return res.status(404).json({ error: 'Active loan not found. Please check Loan ID.' });
            }
            if (loans[0].PrincipalAmount < Amount) {
                 await conn.rollback();
                 return res.status(400).json({ error: `Cannot overpay. Remaining loan principal is $${loans[0].PrincipalAmount}` });
            }
            isLoanRepayment = true;
        }

        // DRAWER LOGIC (Only strictly apply physical limitations for non Super Admins)
        if (currentAdmin.Role !== 'Super Admin') {
            if (TransactionType === 'Withdrawal') {
                 // Withdrawal means handing physical cash to customer. Drawer decreases.
                 if (currentAdmin.AllocatedFunds < Amount) {
                     await conn.rollback();
                     return res.status(400).json({ error: `Not enough physical funds in your drawer map. You only have $${currentAdmin.AllocatedFunds} available to disburse.` });
                 }
                 await conn.query('UPDATE Admins SET AllocatedFunds = AllocatedFunds - ? WHERE AdminID = ?', [Amount, AdminID]);
            } else if (TransactionType === 'Deposit') {
                 // Deposit means taking physical cash from customer. Drawer increases.
                 await conn.query('UPDATE Admins SET AllocatedFunds = AllocatedFunds + ? WHERE AdminID = ?', [Amount, AdminID]);
            }
        }

        const [result] = await conn.query(
            'INSERT INTO Transactions (AccountID, TransactionType, Amount, Description) VALUES (?, ?, ?, ?)',
            [AccountID, TransactionType, Amount, targetExists ? `Transfer to ACCT-${TargetAccountID}` : isLoanRepayment ? `Repayment for Loan #${TargetAccountID}` : Description]
        );
        
        // Update balance
        if (TransactionType === 'Deposit') {
            await conn.query('UPDATE Accounts SET Balance = Balance + ? WHERE AccountID = ?', [Amount, AccountID]);
        } else if (TransactionType === 'Withdrawal' || TransactionType === 'Transfer' || TransactionType === 'Loan Repayment') {
            await conn.query('UPDATE Accounts SET Balance = Balance - ? WHERE AccountID = ?', [Amount, AccountID]);
        }
        
        if (isLoanRepayment) {
            await conn.query('UPDATE Loans SET PrincipalAmount = PrincipalAmount - ? WHERE LoanID = ?', [Amount, TargetAccountID]);
            await conn.query('UPDATE Loans SET Status = \'Closed\' WHERE LoanID = ? AND PrincipalAmount <= 0', [TargetAccountID]);
        }
        
        // Process target receiver if it's a Transfer
        if (targetExists) {
            await conn.query('UPDATE Accounts SET Balance = Balance + ? WHERE AccountID = ?', [Amount, TargetAccountID]);
            await conn.query(
                'INSERT INTO Transactions (AccountID, TransactionType, Amount, Description) VALUES (?, ?, ?, ?)',
                [TargetAccountID, 'Deposit', Amount, `Received transfer from ACCT-${AccountID}`]
            );
        }
        
        await logAdminAction(conn, AdminID, TransactionType, `Processed ${TransactionType} of $${Amount} for ACCT-${AccountID}`);
        
        await conn.commit();
        res.json({ id: result.insertId, message: 'Transaction successful' });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
});

// Get all loans
app.get('/api/loans', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT l.*, c.FirstName, c.LastName 
            FROM Loans l
            JOIN Customers c ON l.CustomerID = c.CustomerID
            ORDER BY l.CreatedAt DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update loan status
app.put('/api/loans/:id/status', async (req, res) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const { status, adminId } = req.body;
        const loanId = req.params.id;
        
        await conn.query('UPDATE Loans SET Status = ? WHERE LoanID = ?', [status, loanId]);
        
        // If loan is approved, disburse funds to customer's first active account
        if (status === 'Approved') {
            const [loans] = await conn.query('SELECT CustomerID, PrincipalAmount FROM Loans WHERE LoanID = ?', [loanId]);
            if (loans.length > 0) {
                const { CustomerID, PrincipalAmount } = loans[0];
                const [accounts] = await conn.query('SELECT AccountID FROM Accounts WHERE CustomerID = ? AND Status = \'Active\' LIMIT 1', [CustomerID]);
                if (accounts.length > 0) {
                    const accountId = accounts[0].AccountID;
                    await conn.query('UPDATE Accounts SET Balance = Balance + ? WHERE AccountID = ?', [PrincipalAmount, accountId]);
                    await conn.query(
                        'INSERT INTO Transactions (AccountID, TransactionType, Amount, Description) VALUES (?, ?, ?, ?)',
                        [accountId, 'Deposit', PrincipalAmount, `Loan Disbursement (Loan ID: #${loanId})`]
                    );
                }
                
                if (adminId) {
                    await logAdminAction(conn, adminId, 'Loan Approval', `Disbursed $${PrincipalAmount} for Loan #${loanId}`);
                }
            }
        }
        
        await conn.commit();
        res.json({ message: 'Loan status updated successfully' });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
});

// Add interest to loan
app.post('/api/loans/:id/add-interest', async (req, res) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const { adminId } = req.body;
        const loanId = req.params.id;
        
        const [loans] = await conn.query('SELECT PrincipalAmount, InterestRate FROM Loans WHERE LoanID = ? AND Status = \'Approved\'', [loanId]);
        if (loans.length === 0) {
            await conn.rollback();
            return res.status(404).json({ error: 'Active loan not found.' });
        }
        
        const { PrincipalAmount, InterestRate } = loans[0];
        const monthlyInterestRate = InterestRate / 100 / 12;
        const interestAmount = PrincipalAmount * monthlyInterestRate;
        
        await conn.query('UPDATE Loans SET PrincipalAmount = PrincipalAmount + ? WHERE LoanID = ?', [interestAmount, loanId]);
        
        if (adminId) {
            await logAdminAction(conn, adminId, 'Interest Applied', `Applied $${interestAmount.toFixed(2)} interest to Loan #${loanId}`);
        }
        
        await conn.commit();
        res.json({ message: 'Interest applied successfully' });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
});

// Create Loan
app.post('/api/loans', async (req, res) => {
    try {
        const { CustomerID, LoanType, PrincipalAmount, InterestRate, DurationMonths } = req.body;
        await pool.query('INSERT INTO Loans (CustomerID, LoanType, PrincipalAmount, InterestRate, DurationMonths) VALUES (?, ?, ?, ?, ?)', [CustomerID, LoanType, PrincipalAmount, InterestRate, DurationMonths]);
        res.json({ message: 'Loan created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
