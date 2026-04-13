import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Loader2, Plus, Trophy, MapPin, Calendar, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import Modal from '../components/Modal';

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [venues, setVenues] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Filters
  const [filterSport, setFilterSport] = useState('');

  // Schedule Form
  const [formData, setFormData] = useState({
    matchDate: '',
    matchTime: '',
    sport: 'Cricket',
    venueId: '',
    tournamentId: '',
    team1Id: '',
    team2Id: ''
  });

  // Result Modal
  const [resultModal, setResultModal] = useState({ open: false, match: null, winnerTeamId: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [mRes, tRes, vRes, trRes] = await Promise.all([
        axios.get('http://localhost:5000/matches'),
        axios.get('http://localhost:5000/teams'),
        axios.get('http://localhost:5000/venues'),
        axios.get('http://localhost:5000/tournaments')
      ]);
      setMatches(mRes.data);
      setTeams(tRes.data);
      setVenues(vRes.data);
      setTournaments(trRes.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const showMsg = (msg, isErr = false) => {
    if (isErr) setError(msg); else setSuccess(msg);
    setTimeout(() => { setError(null); setSuccess(null); }, 3000);
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (formData.team1Id === formData.team2Id) {
      return showMsg('Cannot pitch team against themselves', true);
    }
    setSubmitting(true);
    try {
      await axios.post('http://localhost:5000/matches', formData);
      setFormData({ matchDate: '', matchTime: '', sport: 'Cricket', venueId: '', tournamentId: '', team1Id: '', team2Id: '' });
      fetchData();
      showMsg('Match scheduled successfully!');
    } catch (err) { showMsg('Failed to schedule match', true); } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete match record?')) return;
    try {
      await axios.delete(`http://localhost:5000/matches/${id}`);
      fetchData();
      showMsg('Match cancelled');
    } catch (err) { showMsg('Failed to cancel match', true); }
  };

  const handleSubmitResult = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`http://localhost:5000/matches/${resultModal.match.MatchID}/result`, {
        winnerTeamId: resultModal.winnerTeamId
      });
      setResultModal({ open: false, match: null, winnerTeamId: '' });
      fetchData();
      showMsg('Result recorded & Scores updated!');
    } catch (err) { showMsg('Failed to record result', true); } finally { setSubmitting(false); }
  };

  const filteredMatches = matches.filter(m => filterSport ? m.Sport === filterSport : true);

  return (
    <div className="matches-page">
      <h1 className="page-title">Match Control Center</h1>
      
      <div className="split-layout">
        <div className="card" style={{ alignSelf: 'start' }}>
          <div className="card-header">
            <h2 className="card-title"><Plus size={20} color="#FF9933" /> Schedule Match</h2>
          </div>
          
          <AnimatePresence>
            {error && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="alert alert-error"><AlertCircle size={16}/> {error}</motion.div>}
            {success && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="alert alert-success"><CheckCircle2 size={16}/> {success}</motion.div>}
          </AnimatePresence>

          <form onSubmit={handleSchedule}>
            <div className="form-group">
              <label>Sport Category</label>
              <select name="sport" value={formData.sport} onChange={handleInputChange}>
                <option value="Cricket">Cricket</option>
                <option value="Football">Football</option>
                <option value="Hockey">Hockey</option>
                <option value="Kabaddi">Kabaddi</option>
              </select>
            </div>
            <div className="form-group">
              <label>Tournament (Optional)</label>
              <select name="tournamentId" value={formData.tournamentId} onChange={handleInputChange}>
                <option value="">-- Exhibition / None --</option>
                {tournaments.map(t => (
                  <option key={t.TournamentID} value={t.TournamentID}>{t.TournamentName}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Venue</label>
              <select name="venueId" value={formData.venueId} onChange={handleInputChange} required>
                <option value="">-- Choose Venue --</option>
                {venues.map(v => (
                  <option key={v.VenueID} value={v.VenueID}>{v.VenueName} ({v.Location})</option>
                ))}
              </select>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
               <div className="form-group">
                  <label>Date</label>
                  <input type="date" name="matchDate" value={formData.matchDate} onChange={handleInputChange} required />
               </div>
               <div className="form-group">
                  <label>Time</label>
                  <input type="time" name="matchTime" value={formData.matchTime} onChange={handleInputChange} required />
               </div>
            </div>
            <div className="form-group">
               <label>Team 1 (Blue)</label>
               <select name="team1Id" value={formData.team1Id} onChange={handleInputChange} required>
                 <option value="">-- Select Team 1 --</option>
                 {teams.map(t => (
                   <option key={t.TeamID} value={t.TeamID}>{t.TeamName} ({t.SportType})</option>
                 ))}
               </select>
            </div>
            <div className="form-group">
               <label>Team 2 (Red)</label>
               <select name="team2Id" value={formData.team2Id} onChange={handleInputChange} required>
                 <option value="">-- Select Team 2 --</option>
                 {teams.map(t => (
                   <option key={t.TeamID} value={t.TeamID}>{t.TeamName} ({t.SportType})</option>
                 ))}
               </select>
            </div>
            
            <button type="submit" className="btn btn-primary" style={{width: '100%'}} disabled={submitting}>
              {submitting ? <Loader2 className="spinner" size={18} /> : 'Confirm Game Slot'}
            </button>
          </form>
        </div>

        <div className="card">
          <div className="card-header" style={{flexDirection: 'column', alignItems: 'flex-start', gap: '1rem'}}>
             <div style={{display:'flex', justifyContent:'space-between', width:'100%', alignItems:'center'}}>
               <h2 className="card-title"><FileText size={20} color="#000080" /> Scheduled Fixtures</h2>
               <select value={filterSport} onChange={e=>setFilterSport(e.target.value)} style={{padding:'4px 8px', borderRadius:'4px', border:'1px solid #ddd'}}>
                  <option value="">All Sports</option>
                  <option value="Cricket">Cricket</option>
                  <option value="Football">Football</option>
                  <option value="Hockey">Hockey</option>
                  <option value="Kabaddi">Kabaddi</option>
               </select>
             </div>
          </div>
          <div className="table-responsive">
            {loading ? <div style={{textAlign:'center', padding:'2rem'}}><Loader2 className="spinner" /></div> : (
              <table>
                <thead>
                  <tr>
                    <th>Matchup</th>
                    <th>Logistics</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredMatches.map(m => (
                      <motion.tr key={m.MatchID} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                        <td>
                          <div style={{fontWeight:600}}>{m.Team1Name} <span style={{color:'#FF9933'}}>vs</span> {m.Team2Name}</div>
                          <div className="badge badge-navy" style={{fontSize:'0.7rem', display:'inline-block'}}>{m.Sport}</div>
                        </td>
                        <td style={{fontSize:'0.85rem'}}>
                           <div><Calendar size={12}/> {new Date(m.MatchDate).toLocaleDateString()} at {m.MatchTime}</div>
                           <div style={{color:'#64748B'}}><MapPin size={12}/> {m.VenueName}</div>
                        </td>
                        <td>
                           {m.MatchStatus === 'Completed' ? 
                             <div className="badge badge-green" style={{display:'flex', alignItems:'center', gap:'4px'}}><Trophy size={10}/> Completed</div> : 
                             <span className="badge badge-saffron">Scheduled</span>
                           }
                        </td>
                        <td>
                           <div style={{display:'flex', gap:'8px'}}>
                              {m.MatchStatus !== 'Completed' && (
                                <button onClick={() => setResultModal({open:true, match:m, winnerTeamId:''})} className="btn btn-primary" style={{padding:'4px 8px', fontSize:'0.75rem'}}>
                                  Record Result
                                </button>
                              )}
                              <button onClick={() => handleDelete(m.MatchID)} className="btn btn-danger" style={{padding:'6px 8px'}} title="Cancel Match">
                                <Trash2 size={14} />
                              </button>
                           </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {filteredMatches.length === 0 && <tr><td colSpan="4" style={{textAlign:'center'}}>No matches found</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={resultModal.open} onClose={()=>setResultModal({open:false, match:null, winnerTeamId:''})} title="Official Match Scorecard">
         {resultModal.match && (
           <form onSubmit={handleSubmitResult}>
              <div style={{textAlign:'center', marginBottom: '1.5rem'}}>
                  <h4 style={{margin:0}}>{resultModal.match.Team1Name} vs {resultModal.match.Team2Name}</h4>
                  <p style={{color:'#64748B', fontSize:'0.9rem'}}>{resultModal.match.TournamentName || 'Exhibition Match'}</p>
              </div>
              <div className="form-group">
                 <label>Select Winning Side</label>
                 <select value={resultModal.winnerTeamId} onChange={e=>setResultModal({...resultModal, winnerTeamId: e.target.value})} required>
                    <option value="">-- Choose Victor --</option>
                    <option value={resultModal.match.Team1ID}>{resultModal.match.Team1Name}</option>
                    <option value={resultModal.match.Team2ID}>{resultModal.match.Team2Name}</option>
                 </select>
              </div>
              <p style={{fontSize:'0.85rem', color:'#64748B', background:'#F1F5F9', padding:'8px', borderRadius:'4px'}}>
                 <strong>Note:</strong> Declaring a winner will automatically allocate <strong>+5 points</strong> to all players assigned to the winning roster.
              </p>
              <button type="submit" className="btn btn-primary" style={{width:'100%', background: '#138808'}} disabled={submitting}>
                 {submitting ? <Loader2 className="spinner" size={18} /> : 'Finalize Match Result'}
              </button>
           </form>
         )}
      </Modal>
    </div>
  );
}
