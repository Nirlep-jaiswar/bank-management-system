import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Plus, Loader2, AlertCircle, CheckCircle2, Edit2, Trash2, Shield, Calendar } from 'lucide-react';
import Modal from '../components/Modal';

export default function Tournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]); // All teams for mapping
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Tournament Form
  const [formData, setFormData] = useState({ tournamentName: '', startDate: '', endDate: '' });
  const [editMode, setEditMode] = useState(null);

  // Manage Teams Modal
  const [manageTeamsModal, setManageTeamsModal] = useState({ open: false, tournament: null, participatingTeams: [] });
  const [selectedTeamToAdd, setSelectedTeamToAdd] = useState('');

  useEffect(() => {
    fetchTournaments();
    fetchTeams();
  }, []);

  const fetchTournaments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/tournaments');
      setTournaments(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchTeams = async () => {
    try {
      const res = await axios.get('http://localhost:5000/teams');
      setTeams(res.data);
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
      const payload = {
        ...formData,
        startDate: formData.startDate.split('T')[0],
        endDate: formData.endDate.split('T')[0]
      };
      if (editMode) {
        await axios.put(`http://localhost:5000/tournaments/${editMode}`, payload);
        showMsg('Tournament updated!');
        setEditMode(null);
      } else {
        await axios.post('http://localhost:5000/tournaments', payload);
        showMsg('Tournament published!');
      }
      setFormData({ tournamentName: '', startDate: '', endDate: '' });
      fetchTournaments();
    } catch (err) { showMsg('Operation failed', true); } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete tournament? This removes all team participations.')) return;
    try {
      await axios.delete(`http://localhost:5000/tournaments/${id}`);
      showMsg('Tournament removed');
      fetchTournaments();
    } catch (err) { showMsg('Failed to delete', true); }
  };

  const openEdit = (t) => {
    setEditMode(t.TournamentID);
    setFormData({ 
      tournamentName: t.TournamentName, 
      startDate: new Date(t.StartDate).toISOString().split('T')[0], 
      endDate: new Date(t.EndDate).toISOString().split('T')[0] 
    });
  };

  const openManageTeams = async (tournament) => {
    setManageTeamsModal({ open: true, tournament, participatingTeams: [] });
    try {
      const res = await axios.get(`http://localhost:5000/tournaments/${tournament.TournamentID}/teams`);
      setManageTeamsModal(prev => ({ ...prev, participatingTeams: res.data }));
    } catch (err) { console.error(err); }
  };

  const handleAddTeamToTourney = async () => {
    if (!selectedTeamToAdd) return;
    try {
      await axios.post('http://localhost:5000/tournaments/register-team', {
        teamId: selectedTeamToAdd,
        tournamentId: manageTeamsModal.tournament.TournamentID
      });
      setSelectedTeamToAdd('');
      openManageTeams(manageTeamsModal.tournament);
      showMsg('Team registered for tournament');
    } catch (err) { showMsg('Team already registered', true); }
  };

  return (
    <div className="tournaments-page">
      <h1 className="page-title">National Tournaments Panel</h1>
      
      <div className="split-layout">
        <div className="card" style={{ alignSelf: 'start' }}>
          <div className="card-header">
            <h2 className="card-title">
               {editMode ? <Edit2 size={20} color="#FF9933" /> : <Trophy size={20} color="#FF9933" />}
               {editMode ? ' Edit Event' : ' Organize Tournament'}
            </h2>
          </div>
          
          <AnimatePresence>
            {error && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="alert alert-error"><AlertCircle size={16}/> {error}</motion.div>}
            {success && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="alert alert-success"><CheckCircle2 size={16}/> {success}</motion.div>}
          </AnimatePresence>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Tournament Name</label>
              <input type="text" name="tournamentName" value={formData.tournamentName} onChange={handleInputChange} placeholder="e.g. Khelo India Games" required />
            </div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
              <div className="form-group">
                <label>Start Date</label>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} required />
              </div>
            </div>
            <div style={{display:'flex', gap:'1rem'}}>
              <button type="submit" className="btn btn-primary" style={{flex: 1, background: editMode ? '#FF9933' : '#000080'}} disabled={submitting}>
                {submitting ? <Loader2 className="spinner" size={18} /> : (editMode ? 'Update Event' : 'Publish Tournament')}
              </button>
              {editMode && (
                <button type="button" className="btn btn-outline" onClick={() => { setEditMode(null); setFormData({ tournamentName: '', startDate: '', endDate: '' }); }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title"><Trophy size={20} color="#000080" /> Active Tournaments</h2>
          </div>
          <div className="table-responsive">
            {loading ? <div style={{textAlign:'center', padding:'2rem'}}><Loader2 className="spinner" /></div> : (
              <table>
                <thead>
                  <tr>
                    <th>Event Details</th>
                    <th>Timeline</th>
                    <th>Teams</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {tournaments.map(t => (
                      <motion.tr key={t.TournamentID} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                        <td style={{fontWeight:600}}>{t.TournamentName}</td>
                        <td style={{fontSize:'0.85rem'}}>
                          <div style={{display:'flex', alignItems:'center', gap:'4px'}}><Calendar size={12}/> {new Date(t.StartDate).toLocaleDateString()}</div>
                          <div style={{color:'#64748B', marginLeft:'16px'}}>to {new Date(t.EndDate).toLocaleDateString()}</div>
                        </td>
                        <td>
                          <button onClick={() => openManageTeams(t)} className="btn btn-outline" style={{padding:'4px 12px', fontSize:'0.8rem'}}>
                            <Shield size={14} /> Assign
                          </button>
                        </td>
                        <td>
                          <div style={{display:'flex', gap:'8px'}}>
                            <button onClick={() => openEdit(t)} className="btn btn-outline" style={{padding:'4px 8px'}} title="Edit">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDelete(t.TournamentID)} className="btn btn-danger" style={{padding:'4px 8px'}} title="Delete">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {tournaments.length === 0 && <tr><td colSpan="4" style={{textAlign:'center'}}>No tournaments planned</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={manageTeamsModal.open} onClose={() => setManageTeamsModal({open:false, tournament:null, participatingTeams:[]})} title={`Register Teams: ${manageTeamsModal.tournament?.TournamentName}`}>
         <div className="tourney-manager">
            <div className="form-group" style={{display:'flex', gap:'8px'}}>
              <select style={{flex: 1}} value={selectedTeamToAdd} onChange={e => setSelectedTeamToAdd(e.target.value)}>
                <option value="">-- Choose Team to Add --</option>
                {teams.map(team => (
                  <option key={team.TeamID} value={team.TeamID}>{team.TeamName} ({team.SportType})</option>
                ))}
              </select>
              <button className="btn btn-primary" onClick={handleAddTeamToTourney} style={{background: '#138808'}}>
                <Plus size={18} />
              </button>
            </div>

            <div className="roster-list" style={{marginTop: '1.5rem'}}>
               <h4 style={{marginBottom:'0.5rem', color: '#64748B'}}>Current Participation ({manageTeamsModal.participatingTeams.length})</h4>
               <div style={{maxHeight:'300px', overflowY:'auto', border:'1px solid #eee', borderRadius:'6px'}}>
                  {manageTeamsModal.participatingTeams.length === 0 ? (
                    <div style={{padding:'1rem', textAlign:'center', color:'#999'}}>No teams registered yet</div>
                  ) : (
                    manageTeamsModal.participatingTeams.map(t => (
                      <div key={t.TeamID} style={{padding:'0.75rem 1rem', borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                         <div style={{fontWeight:500}}>{t.TeamName} <small style={{color:'#64748B'}}>({t.SportType})</small></div>
                         <Shield size={16} color="#138808" />
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
