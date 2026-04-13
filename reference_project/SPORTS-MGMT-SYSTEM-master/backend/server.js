import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// =======================
// DASHBOARD ANALYTICS
// =======================
app.get('/analytics/dashboard', async (req, res) => {
  try {
    const [players] = await pool.query('SELECT COUNT(*) as count FROM Player');
    const [teams] = await pool.query('SELECT COUNT(*) as count FROM Team');
    const [tournaments] = await pool.query('SELECT COUNT(*) as count FROM Tournament');
    const [matches] = await pool.query('SELECT COUNT(*) as count FROM Match_Table WHERE MatchStatus="Scheduled"');
    
    const [revenue] = await pool.query('SELECT SUM(Amount) as total FROM Payment');
    const [topPlayer] = await pool.query('SELECT Name, Score FROM Player ORDER BY Score DESC LIMIT 1');

    res.json({
      playersCount: players[0].count,
      teamsCount: teams[0].count,
      tournamentsCount: tournaments[0].count,
      matchesCount: matches[0].count,
      totalRevenue: revenue[0].total || 0,
      topPlayer: topPlayer[0] || null
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// =======================
// PLAYERS
// =======================
app.get('/players', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Player ORDER BY PlayerID DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});
app.post('/players', async (req, res) => {
  const { name, email, age, gender, contact } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO Player (Name, Email, Age, Gender, Contact) VALUES (?, ?, ?, ?, ?)',
      [name, email, age, gender, contact]
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Email exists or Failed' });
  }
});
app.put('/players/:id', async (req, res) => {
  const { name, email, age, gender, contact } = req.body;
  try {
    await pool.query('UPDATE Player SET Name=?, Email=?, Age=?, Gender=?, Contact=? WHERE PlayerID=?', [name, email, age, gender, contact, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Update Failed' });
  }
});
app.delete('/players/:id', async (req, res) => {
  try {
    // Need to clear mapped tables first
    await pool.query('DELETE FROM Register_For WHERE PlayerID=?', [req.params.id]);
    await pool.query('DELETE FROM Registration WHERE PlayerID=?', [req.params.id]);
    await pool.query('DELETE FROM Player WHERE PlayerID=?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Delete Failed' });
  }
});

// =======================
// TEAMS
// =======================
app.get('/teams', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Team ORDER BY TeamID DESC');
    res.json(rows);
  } catch (error) { res.status(500).json({ error: 'Failed' }); }
});
app.post('/teams', async (req, res) => {
  const { teamName, sportType } = req.body;
  try {
    const [result] = await pool.query('INSERT INTO Team (TeamName, SportType) VALUES (?, ?)', [teamName, sportType]);
    res.status(201).json({ id: result.insertId });
  } catch (error) { res.status(500).json({ error: 'Failed' }); }
});
app.put('/teams/:id', async (req, res) => {
  const { teamName, sportType } = req.body;
  try {
    await pool.query('UPDATE Team SET TeamName=?, SportType=? WHERE TeamID=?', [teamName, sportType, req.params.id]);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Failed' }); }
});
app.delete('/teams/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM Register_For WHERE TeamID=?', [req.params.id]);
    await pool.query('DELETE FROM Participates WHERE TeamID=?', [req.params.id]);
    await pool.query('DELETE FROM Team WHERE TeamID=?', [req.params.id]);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Failed' }); }
});

// TEAM-PLAYER MAPPING
app.post('/team/register-player', async (req, res) => {
  const { playerId, teamId } = req.body;
  try {
    await pool.query('INSERT INTO Register_For (PlayerID, TeamID) VALUES (?, ?)', [playerId, teamId]);
    res.status(201).json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Already mapped' }); }
});
app.get('/teams/:id/players', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT p.* FROM Player p JOIN Register_For r ON p.PlayerID = r.PlayerID WHERE r.TeamID = ?', [req.params.id]);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: 'Failed' }); }
});
app.delete('/team/remove-player', async (req, res) => {
  const { playerId, teamId } = req.body;
  try {
    await pool.query('DELETE FROM Register_For WHERE PlayerID=? AND TeamID=?', [playerId, teamId]);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Failed' }); }
});

// =======================
// TOURNAMENTS
// =======================
app.get('/tournaments', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Tournament ORDER BY TournamentID DESC');
    res.json(rows);
  } catch (error) { res.status(500).json({ error: 'Failed' }); }
});
app.post('/tournaments', async (req, res) => {
  const { tournamentName, startDate, endDate } = req.body;
  try {
    const [result] = await pool.query('INSERT INTO Tournament (TournamentName, StartDate, EndDate) VALUES (?, ?, ?)', [tournamentName, startDate, endDate]);
    res.status(201).json({ id: result.insertId });
  } catch (error) { res.status(500).json({ error: 'Failed' }); }
});
app.put('/tournaments/:id', async (req, res) => {
  const { tournamentName, startDate, endDate } = req.body;
  try {
    await pool.query('UPDATE Tournament SET TournamentName=?, StartDate=?, EndDate=? WHERE TournamentID=?', [tournamentName, startDate, endDate, req.params.id]);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Failed' }); }
});
app.delete('/tournaments/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM Participates WHERE TournamentID=?', [req.params.id]);
    await pool.query('DELETE FROM Tournament WHERE TournamentID=?', [req.params.id]);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Failed' }); }
});

// TEAM-TOURNEY MAPPING
app.post('/tournaments/register-team', async (req, res) => {
  const { teamId, tournamentId } = req.body;
  try {
    await pool.query('INSERT INTO Participates (TeamID, TournamentID) VALUES (?, ?)', [teamId, tournamentId]);
    res.status(201).json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Failed' }); }
});
app.get('/tournaments/:id/teams', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT t.* FROM Team t JOIN Participates p ON t.TeamID = p.TeamID WHERE p.TournamentID = ?', [req.params.id]);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: 'Failed' }); }
});

// =======================
// VENUES
// =======================
app.get('/venues', async (req, res) => {
  try { const [rows] = await pool.query('SELECT * FROM Venue ORDER BY VenueID DESC'); res.json(rows); } catch (e) { res.status(500).json({ error: 'Failed' }); }
});
app.post('/venues', async (req, res) => {
  const { venueName, location, capacity } = req.body;
  try { await pool.query('INSERT INTO Venue (VenueName, Location, Capacity) VALUES (?, ?, ?)', [venueName, location, capacity]); res.status(201).json({ success: true }); } catch (e) { res.status(500).json({ error: 'Failed' }); }
});
app.put('/venues/:id', async (req, res) => {
  const { venueName, location, capacity } = req.body;
  try { await pool.query('UPDATE Venue SET VenueName=?, Location=?, Capacity=? WHERE VenueID=?', [venueName, location, capacity, req.params.id]); res.json({ success: true }); } catch (e) { res.status(500).json({ error: 'Failed' }); }
});
app.delete('/venues/:id', async (req, res) => {
  try { await pool.query('DELETE FROM Venue WHERE VenueID=?', [req.params.id]); res.json({ success: true }); } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

// =======================
// MATCHES & SMART RESULTS
// =======================
app.get('/matches', async (req, res) => {
  const q = `
    SELECT m.*, t1.TeamName as Team1Name, t2.TeamName as Team2Name, v.VenueName, tr.TournamentName
    FROM Match_Table m
    LEFT JOIN Team t1 ON m.Team1ID = t1.TeamID
    LEFT JOIN Team t2 ON m.Team2ID = t2.TeamID
    LEFT JOIN Venue v ON m.VenueID = v.VenueID
    LEFT JOIN Tournament tr ON m.TournamentID = tr.TournamentID
    ORDER BY m.MatchDate DESC
  `;
  try { const [rows] = await pool.query(q); res.json(rows); } catch (e) { res.status(500).json({ error: 'Failed' }); }
});
app.post('/matches', async (req, res) => {
  const { matchDate, matchTime, sport, venueId, tournamentId, team1Id, team2Id } = req.body;
  try {
    await pool.query(
      'INSERT INTO Match_Table (MatchDate, MatchTime, Sport, VenueID, TournamentID, Team1ID, Team2ID) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [matchDate, matchTime, sport, venueId, tournamentId, team1Id, team2Id]
    );
    res.status(201).json({ success: true });
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});
app.delete('/matches/:id', async (req, res) => {
  try { await pool.query('DELETE FROM Match_Table WHERE MatchID=?', [req.params.id]); res.json({ success: true }); } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

// SMART LOGIC: Match Result
app.post('/matches/:id/result', async (req, res) => {
  const { winnerTeamId } = req.body;
  const matchId = req.params.id;
  try {
    // 1. Update match
    await pool.query('UPDATE Match_Table SET WinnerTeamID=?, MatchStatus=? WHERE MatchID=?', [winnerTeamId, 'Completed', matchId]);
    // 2. Increase Score of players in winning team by 5
    await pool.query(`
      UPDATE Player p 
      JOIN Register_For r ON p.PlayerID = r.PlayerID 
      SET p.Score = p.Score + 5 
      WHERE r.TeamID = ?
    `, [winnerTeamId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record result' });
  }
});

// =======================
// REGISTRATIONS & PAYMENTS
// =======================
app.get('/registrations', async (req, res) => {
  const q = `
    SELECT r.*, p.Name as PlayerName, p.Email, t.TournamentName 
    FROM Registration r
    JOIN Player p ON r.PlayerID = p.PlayerID
    LEFT JOIN Tournament t ON r.TournamentID = t.TournamentID
    ORDER BY r.RegistrationID DESC
  `;
  try { const [rows] = await pool.query(q); res.json(rows); } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

app.post('/registrations', async (req, res) => {
  const { playerId, tournamentId, date } = req.body;
  try {
    const [result] = await pool.query('INSERT INTO Registration (PlayerID, TournamentID, RegistrationDate, Status) VALUES (?, ?, ?, ?)', [playerId, tournamentId, date || new Date().toISOString().split('T')[0], 'Pending']);
    res.status(201).json({ id: result.insertId });
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

app.post('/payments', async (req, res) => {
  const { registrationId, amount, mode } = req.body;
  try {
    await pool.query('INSERT INTO Payment (RegistrationID, Amount, PaymentMode, PaymentDate, Status) VALUES (?, ?, ?, ?, ?)', 
      [registrationId, amount, mode, new Date().toISOString().split('T')[0], 'Paid']);
    await pool.query('UPDATE Registration SET Status="Confirmed" WHERE RegistrationID=?', [registrationId]);
    res.status(201).json({ success: true });
  } catch (e) { res.status(500).json({ error: 'Failed to process payment' }); }
});
app.get('/payments', async (req, res) => {
  try { const [rows] = await pool.query('SELECT * FROM Payment ORDER BY PaymentID DESC'); res.json(rows); } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

// Server starts
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
