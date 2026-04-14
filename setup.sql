-- Bank Management System Database Setup

CREATE DATABASE IF NOT EXISTS bank_management;
USE bank_management;

-- Drop existing tables to ensure a clean slate
DROP TABLE IF EXISTS Transactions;
DROP TABLE IF EXISTS Loans;
DROP TABLE IF EXISTS Accounts;
DROP TABLE IF EXISTS Branches;
DROP TABLE IF EXISTS Customers;

-- Create Customers Table
CREATE TABLE Customers (
  CustomerID INT AUTO_INCREMENT PRIMARY KEY,
  FirstName VARCHAR(100) NOT NULL,
  LastName VARCHAR(100) NOT NULL,
  Email VARCHAR(100) UNIQUE NOT NULL,
  Phone VARCHAR(15),
  Address TEXT,
  DateOfBirth DATE,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Branches Table
CREATE TABLE Branches (
  BranchID INT AUTO_INCREMENT PRIMARY KEY,
  BranchName VARCHAR(100) NOT NULL,
  Location VARCHAR(255) NOT NULL,
  Contact VARCHAR(15)
);

-- Create Accounts Table
CREATE TABLE Accounts (
  AccountID BIGINT AUTO_INCREMENT PRIMARY KEY,
  CustomerID INT,
  BranchID INT,
  AccountType ENUM('Savings', 'Current', 'Salary') DEFAULT 'Savings',
  Balance DECIMAL(15,2) DEFAULT 0.00,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  Status ENUM('Active', 'Inactive', 'Closed') DEFAULT 'Active',
  FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID),
  FOREIGN KEY (BranchID) REFERENCES Branches(BranchID)
) AUTO_INCREMENT = 10000000000;

-- Create Transactions Table
CREATE TABLE Transactions (
  TransactionID INT AUTO_INCREMENT PRIMARY KEY,
  AccountID BIGINT,
  TransactionType ENUM('Deposit', 'Withdrawal', 'Transfer') NOT NULL,
  Amount DECIMAL(15,2) NOT NULL,
  TransactionDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  Description VARCHAR(255),
  FOREIGN KEY (AccountID) REFERENCES Accounts(AccountID)
);

-- Create Loans Table
CREATE TABLE Loans (
  LoanID INT AUTO_INCREMENT PRIMARY KEY,
  CustomerID INT,
  LoanType ENUM('Home', 'Personal', 'Education', 'Car') NOT NULL,
  PrincipalAmount DECIMAL(15,2) NOT NULL,
  InterestRate DECIMAL(5,2) NOT NULL,
  DurationMonths INT NOT NULL,
  Status ENUM('Pending', 'Approved', 'Rejected', 'Closed') DEFAULT 'Pending',
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID)
);

-- Insert dummy data into Branches
INSERT INTO Branches (BranchName, Location, Contact) VALUES
('Main Branch', '123 Wall Street', '123-456-7890'),
('Downtown Branch', '456 Market St', '123-456-7891');
