-- Recreate DB
CREATE DATABASE IF NOT EXISTS sports_management;
USE sports_management;

-- Drop existing tables to ensure a clean slate and avoid foreign key conflicts during recreation.
DROP TABLE IF EXISTS Participates;
DROP TABLE IF EXISTS Register_For;
DROP TABLE IF EXISTS Payment;
DROP TABLE IF EXISTS Registration;
DROP TABLE IF EXISTS Match_Table; -- Cannot use 'Match' as it's a reserved keyword, using Match_Table
DROP TABLE IF EXISTS Venue;
DROP TABLE IF EXISTS Tournament;
DROP TABLE IF EXISTS Coach;
DROP TABLE IF EXISTS Team;
DROP TABLE IF EXISTS Player;
DROP TABLE IF EXISTS players; -- Drop old table

CREATE TABLE Player (
  PlayerID INT AUTO_INCREMENT PRIMARY KEY,
  Name VARCHAR(100),
  Email VARCHAR(100) UNIQUE,
  Age INT,
  Gender VARCHAR(10),
  Contact VARCHAR(15)
);

CREATE TABLE Team (
  TeamID INT AUTO_INCREMENT PRIMARY KEY,
  TeamName VARCHAR(100),
  SportType VARCHAR(50)
);

CREATE TABLE Coach (
  CoachID INT AUTO_INCREMENT PRIMARY KEY,
  Name VARCHAR(100),
  Experience INT,
  Contact VARCHAR(15)
);

CREATE TABLE Tournament (
  TournamentID INT AUTO_INCREMENT PRIMARY KEY,
  TournamentName VARCHAR(100),
  StartDate DATE,
  EndDate DATE
);

CREATE TABLE Venue (
  VenueID INT AUTO_INCREMENT PRIMARY KEY,
  VenueName VARCHAR(100),
  Location VARCHAR(100),
  Capacity INT
);

CREATE TABLE Match_Table (
  MatchID INT AUTO_INCREMENT PRIMARY KEY,
  MatchDate DATE,
  MatchTime TIME,
  Sport VARCHAR(50),
  VenueID INT,
  TournamentID INT,
  Team1ID INT,
  Team2ID INT,
  FOREIGN KEY (VenueID) REFERENCES Venue(VenueID),
  FOREIGN KEY (TournamentID) REFERENCES Tournament(TournamentID),
  FOREIGN KEY (Team1ID) REFERENCES Team(TeamID),
  FOREIGN KEY (Team2ID) REFERENCES Team(TeamID)
);

CREATE TABLE Registration (
  RegistrationID INT AUTO_INCREMENT PRIMARY KEY,
  PlayerID INT,
  RegistrationDate DATE,
  Status VARCHAR(50),
  FOREIGN KEY (PlayerID) REFERENCES Player(PlayerID)
);

CREATE TABLE Payment (
  PaymentID INT AUTO_INCREMENT PRIMARY KEY,
  RegistrationID INT,
  Amount DECIMAL(10,2),
  PaymentMode VARCHAR(50),
  PaymentDate DATE,
  Status VARCHAR(50),
  FOREIGN KEY (RegistrationID) REFERENCES Registration(RegistrationID)
);

CREATE TABLE Register_For (
  PlayerID INT,
  TeamID INT,
  PRIMARY KEY (PlayerID, TeamID),
  FOREIGN KEY (PlayerID) REFERENCES Player(PlayerID),
  FOREIGN KEY (TeamID) REFERENCES Team(TeamID)
);

CREATE TABLE Participates (
  TeamID INT,
  TournamentID INT,
  PRIMARY KEY (TeamID, TournamentID),
  FOREIGN KEY (TeamID) REFERENCES Team(TeamID),
  FOREIGN KEY (TournamentID) REFERENCES Tournament(TournamentID)
);
