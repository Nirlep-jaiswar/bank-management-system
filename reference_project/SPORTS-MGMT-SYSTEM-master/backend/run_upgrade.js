import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function runUpgrade() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true
    });

    const queries = [
      "ALTER TABLE Player ADD COLUMN Score INT DEFAULT 50;",
      "ALTER TABLE Match_Table ADD COLUMN WinnerTeamID INT DEFAULT NULL;",
      "ALTER TABLE Match_Table ADD COLUMN MatchStatus VARCHAR(20) DEFAULT 'Scheduled';"
    ];

    for (let q of queries) {
      try {
        await connection.query(q);
        console.log(`Executed: ${q}`);
      } catch(e) {
        if(e.code === 'ER_DUP_FIELDNAME') {
          console.log(`Column already exists, skipping: ${q}`);
        } else {
          throw e; // throw unexpected errors
        }
      }
    }

    console.log('Database schema successfully upgraded.');

  } catch (error) {
    console.error('Error executing upgrade:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runUpgrade();
