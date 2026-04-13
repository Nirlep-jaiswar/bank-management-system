import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldPlus, Loader2, AlertCircle, CheckCircle2, Edit2, Trash2, Users, UserPlus, X } from 'lucide-react';
import Modal from '../components/Modal';

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]); // All players for dropdown
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Team Form
  const [formData, setFormData] = useState({ teamName: '', sportType: 'Cricket' });
  const [editMode, setEditMode] = useState(null);

  // Manage Players Modal
  const [managePlayersModal, setManagePlayersModal] = useState({ open: false, team: null, teamPlayers: [] });
  const [selectedPlayerToAdd, setSelectedPlayerToAdd] = useState('');

  useEffect(() => {
    fetchTeams();
    fetchPlayers();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await axios.get('http://localhost:5000/teams');
      setTeams(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchPlayers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/players');
      setPlayers(res.data);
    } catch (err) { console.error(err); }
  };

  const showMsg = (msg, isErr = false) => {
    if (isErr) setError(msg); else setSuccess(msg);
    setTimeout(() => { setError(null); setSuccess(null); }, 3000);
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editMode) {
        await axios.put(`http://localhost:5000/teams/${editMode}`, formData);
        showMsg('Team updated successfully!');
        setEditMode(null);
      } else {
        await axios.post('http://localhost:5000/teams', formData);
        showMsg('Team registered successfully!');
      }
      setFormData({ teamName: '', sportType: 'Cricket' });
      fetchTeams();
    } catch (err) {
      showMsg('Operation failed', true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this team? This will remove all tournament participations and player mappings.')) return;
    try {
      await axios.delete(`http://localhost:5000/teams/${id}`);
      showMsg('Team removed');
      fetchTeams();
    } catch (err) { showMsg('Failed to delete team', true); }
  };

  const openEdit = (t) => {
    setEditMode(t.TeamID);
    setFormData({ teamName: t.TeamName, sportType: t.SportType });
  };

  // --- Player Management Logic ---
  const openManagePlayers = async (team) => {
    setManagePlayersModal({ open: true, team, teamPlayers: [] });
    try {
      const res = await axios.get(`http://localhost:5000/teams/${team.TeamID}/players`);
      setManagePlayersModal(prev => ({ ...prev, teamPlayers: res.data }));
    } catch (err) { console.error(err); }
  };

  const handleAddPlayerToTeam = async () => {
    if (!selectedPlayerToAdd) return;
    try {
      await axios.post('http://localhost:5000/team/register-player', {
        playerId: selectedPlayerToAdd,
        teamId: managePlayersModal.team.TeamID
      });
      setSelectedPlayerToAdd('');
      openManagePlayers(managePlayersModal.team); // refresh roster
      showMsg('Player added to roster');
    } catch (err) { showMsg('Player already in team', true); }
  };

  const handleRemovePlayer = async (pid) => {
    try {
      await axios.delete('http://localhost:5000/team/remove-player', {
        data: { playerId: pid, teamId: managePlayersModal.team.TeamID }
      });
      openManagePlayers(managePlayersModal.team); // refresh roster
      showMsg('Player removed from roster');
    } catch (err) { showMsg('Failed to remove player', true); }
  };

  return (
    <div className="teams-page">
      <h1 className="page-title">National Teams Directory</h1>
      
      <div className="split-layout">
        <div className="card" style={{ alignSelf: 'start' }}>
          <div className="card-header">
            <h2 className="card-title">
              {editMode ? <Edit2 size={20} color="#FF9933" /> : <ShieldPlus size={20} color="#138808" />}
              {editMode ? ' Update Team' : ' Register Team'}
            </h2>
          </div>
          
          <AnimatePresence>
            {error && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="alert alert-error"><AlertCircle size={16}/> {error}</motion.div>}
            {success && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="alert alert-success"><CheckCircle2 size={16}/> {success}</motion.div>}
          </AnimatePresence>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Team Name</label>
              <input type="text" name="teamName" value={formData.teamName} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Sport Type</label>
              <select name="sportType" value={formData.sportType} onChange={handleInputChange}>
                <option value="Cricket">Cricket</option>
                <option value="Football">Football</option>
                <option value="Hockey">Hockey</option>
                <option value="Kabaddi">Kabaddi</option>
                <option value="Wrestling">Wrestling</option>
                <option value="Badminton">Badminton</option>
              </select>
            </div>
            <div style={{display:'flex', gap:'1rem'}}>
              <button type="submit" className="btn btn-primary" style={{flex: 1, background: editMode ? '#FF9933' : '#138808'}} disabled={submitting}>
                {submitting ? <Loader2 className="spinner" size={18} /> : (editMode ? 'Update Team' : 'Create Team')}
              </button>
              {editMode && (
                <button type="button" className="btn btn-outline" onClick={() => { setEditMode(null); setFormData({ teamName: '', sportType: 'Cricket' }); }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title"><Shield size={20} color="#000080" /> Registered Teams</h2>
          </div>
          <div className="table-responsive">
            {loading ? <div style={{textAlign:'center', padding:'2rem'}}><Loader2 className="spinner" /></div> : (
              <table>
                <thead>
                  <tr>
                    <th>Team Name</th>
                    <th>Category</th>
                    <th>Roster</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {teams.map(t => (
                      <motion.tr key={t.TeamID} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                        <td style={{fontWeight:600}}>{t.TeamName}</td>
                        <td><span className="badge badge-green">{t.SportType}</span></td>
                        <td>
                          <button onClick={() => openManagePlayers(t)} className="btn btn-outline" style={{padding:'4px 12px', fontSize:'0.8rem'}}>
                            <Users size={14} /> Manage
                          </button>
                        </td>
                        <td>
                          <div style={{display:'flex', gap:'8px'}}>
                            <button onClick={() => openEdit(t)} className="btn btn-outline" style={{padding:'4px 8px'}} title="Edit">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDelete(t.TeamID)} className="btn btn-danger" style={{padding:'4px 8px'}} title="Delete">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {teams.length === 0 && <tr><td colSpan="4" style={{textAlign:'center'}}>No teams found</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={managePlayersModal.open} onClose={() => setManagePlayersModal({open:false, team:null, teamPlayers:[]})} title={`Manage Roster: ${managePlayersModal.team?.TeamName}`}>
         <div className="roster-manager">
            <div className="form-group" style={{display:'flex', gap:'8px'}}>
              <select style={{flex: 1}} value={selectedPlayerToAdd} onChange={e => setSelectedPlayerToAdd(e.target.value)}>
                <option value="">-- Add Athlete to Team --</option>
                {players.map(p => (
                  <option key={p.PlayerID} value={p.PlayerID}>{p.Name} (ID: {p.PlayerID})</option>
                ))}
              </select>
              <button className="btn btn-primary" onClick={handleAddPlayerToTeam} style={{background: '#138808'}}>
                <UserPlus size={18} />
              </button>
            </div>

            <div className="roster-list" style={{marginTop: '1.5rem'}}>
               <h4 style={{marginBottom:'0.5rem', color: '#64748B'}}>Current Players ({managePlayersModal.teamPlayers.length})</h4>
               <div style={{maxHeight:'300px', overflowY:'auto', border:'1px solid #eee', borderRadius:'6px'}}>
                  {managePlayersModal.teamPlayers.length === 0 ? (
                    <div style={{padding:'1rem', textAlign:'center', color:'#999'}}>No players assigned</div>
                  ) : (
                    managePlayersModal.teamPlayers.map(p => (
                      <div key={p.PlayerID} style={{padding:'0.75rem 1rem', borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                         <div>
                            <div style={{fontWeight:500}}>{p.Name}</div>
                            <div style={{fontSize:'0.75rem', color:'#64748B'}}>Score: {p.Score}</div>
                         </div>
                         <button onClick={() => handleRemovePlayer(p.PlayerID)} style={{background:'none', border:'none', color:'#DC2626', cursor:'pointer'}}>
                            <Trash2 size={16} />
                         </button>
                      </div>
                    ))
                  )}
               </div>
            </div>
         </div>
      </Modal>
    </div>
  );
}
