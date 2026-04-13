import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function runUpgrade2() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
  });
  try {
    await connection.query("ALTER TABLE Registration ADD COLUMN TournamentID INT; ALTER TABLE Registration ADD FOREIGN KEY (TournamentID) REFERENCES Tournament(TournamentID);");
    console.log('Registration table upgraded');
  } catch(e) {
    console.log(e.message);
  } finally {
    await connection.end();
  }
}
runUpgrade2();
