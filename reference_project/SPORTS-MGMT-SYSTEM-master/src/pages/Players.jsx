import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Users, Loader2, AlertCircle, CheckCircle2, Edit2, Trash2, Search, Star } from 'lucide-react';
import Modal from '../components/Modal';

export default function Players() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Create/Edit Form Data
  const [formData, setFormData] = useState({ name: '', email: '', age: '', gender: 'Male', contact: '' });
  
  // Edit Modal State
  const [editModal, setEditModal] = useState({ open: false, player: null });

  useEffect(() => { fetchPlayers(); }, []);

  const fetchPlayers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/players');
      setPlayers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (msg, isErr = false) => {
    if (isErr) setError(msg); else setSuccess(msg);
    setTimeout(() => { setError(null); setSuccess(null); }, 3000);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editModal.open) {
        await axios.put(`http://localhost:5000/players/${editModal.player.PlayerID}`, formData);
        showMsg('Player updated successfully!');
        setEditModal({ open: false, player: null });
      } else {
        await axios.post('http://localhost:5000/players', formData);
        showMsg('Player registered successfully!');
      }
      setFormData({ name: '', email: '', age: '', gender: 'Male', contact: '' });
      fetchPlayers();
    } catch (err) {
      showMsg(err.response?.data?.error || 'Operation failed', true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this athlete? All related registrations will be cleared.')) return;
    try {
      await axios.delete(`http://localhost:5000/players/${id}`);
      showMsg('Player removed from database');
      fetchPlayers();
    } catch (err) {
      showMsg('Failed to delete player', true);
    }
  };

  const openEdit = (p) => {
    setEditModal({ open: true, player: p });
    setFormData({
      name: p.Name,
      email: p.Email,
      age: p.Age,
      gender: p.Gender,
      contact: p.Contact || ''
    });
  };

  const filteredPlayers = players.filter(p => 
    p.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.Email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="players-page">
      <h1 className="page-title">National Player Database</h1>
      
      <div className="split-layout">
        <div className="card" style={{ alignSelf: 'start' }}>
          <div className="card-header">
            <h2 className="card-title">
              {editModal.open ? <Edit2 size={20} color="#FF9933" /> : <UserPlus size={20} color="#FF9933" />}
              {editModal.open ? ' Update Athlete' : ' Register New Athlete'}
            </h2>
          </div>
          
          <AnimatePresence>
            {error && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="alert alert-error"><AlertCircle size={16}/> {error}</motion.div>}
            {success && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="alert alert-success"><CheckCircle2 size={16}/> {success}</motion.div>}
          </AnimatePresence>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
            </div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
              <div className="form-group">
                <label>Age</label>
                <input type="number" name="age" value={formData.age} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleInputChange}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Contact Number</label>
              <input type="text" name="contact" value={formData.contact} onChange={handleInputChange} />
            </div>
            <div style={{display:'flex', gap: '1rem'}}>
              <button type="submit" className="btn btn-primary" style={{flex: 1, background: editModal.open ? '#FF9933' : '#000080'}} disabled={submitting}>
                {submitting ? <Loader2 className="spinner" size={18} /> : (editModal.open ? 'Update Record' : 'Submit Registration')}
              </button>
              {editModal.open && (
                <button type="button" className="btn btn-outline" onClick={() => { setEditModal({open:false, player:null}); setFormData({ name: '', email: '', age: '', gender: 'Male', contact: '' }); }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="card">
          <div className="card-header" style={{flexDirection: 'column', alignItems: 'flex-start', gap: '1rem'}}>
            <div style={{display:'flex', justifyContent:'space-between', width:'100%', alignItems:'center'}}>
              <h2 className="card-title"><Users size={20} color="#000080" /> Accredited Athletes</h2>
              <span className="badge badge-navy">{filteredPlayers.length} Total</span>
            </div>
            <div className="form-group" style={{width:'100%', marginBottom: 0}}>
              <div style={{position:'relative'}}>
                <Search size={18} style={{position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', color:'#64748B'}} />
                <input 
                  type="text" 
                  placeholder="Search by name or email..." 
                  style={{paddingLeft:'35px'}}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="table-responsive">
            {loading ? <div style={{textAlign:'center', padding:'2rem'}}><Loader2 className="spinner" /></div> : (
              <table>
                <thead>
                  <tr>
                    <th>Athlete</th>
                    <th>Details</th>
                    <th>Score</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredPlayers.map(p => (
                      <motion.tr key={p.PlayerID} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                        <td>
                          <div style={{fontWeight:600}}>{p.Name}</div>
                          <div style={{fontSize:'0.8rem', color:'#64748B'}}>{p.Email}</div>
                        </td>
                        <td>
                          <div>{p.Age} yrs • {p.Gender}</div>
                          <div style={{fontSize:'0.8rem'}}>{p.Contact}</div>
                        </td>
                        <td>
                          <div className="badge badge-saffron" style={{display:'inline-flex', alignItems:'center', gap:'4px'}}>
                            <Star size={12} fill="#FF9933" /> {p.Score}
                          </div>
                        </td>
                        <td>
                          <div style={{display:'flex', gap:'8px'}}>
                            <button onClick={() => openEdit(p)} className="btn btn-outline" style={{padding:'4px 8px'}} title="Edit">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDelete(p.PlayerID)} className="btn btn-danger" style={{padding:'4px 8px'}} title="Delete">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {filteredPlayers.length === 0 && <tr><td colSpan="4" style={{textAlign:'center'}}>No athletes found matching search</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
