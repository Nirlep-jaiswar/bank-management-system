import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Loader2, AlertCircle, CheckCircle2, Edit2, Trash2 } from 'lucide-react';

export default function Venues() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({ venueName: '', location: '', capacity: '' });
  const [editMode, setEditMode] = useState(null);

  useEffect(() => { fetchVenues(); }, []);

  const fetchVenues = async () => {
    try {
      const res = await axios.get('http://localhost:5000/venues');
      setVenues(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
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
        await axios.put(`http://localhost:5000/venues/${editMode}`, formData);
        showMsg('Venue updated successfully!');
        setEditMode(null);
      } else {
        await axios.post('http://localhost:5000/venues', formData);
        showMsg('Venue registered successfully!');
      }
      setFormData({ venueName: '', location: '', capacity: '' });
      fetchVenues();
    } catch (err) { showMsg('Operation failed', true); } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this venue? This may affect matches scheduled here.')) return;
    try {
      await axios.delete(`http://localhost:5000/venues/${id}`);
      showMsg('Venue removed');
      fetchVenues();
    } catch (err) { showMsg('Failed to delete venue', true); }
  };

  const openEdit = (v) => {
    setEditMode(v.VenueID);
    setFormData({ venueName: v.VenueName, location: v.Location, capacity: v.Capacity });
  };

  return (
    <div className="venues-page">
      <h1 className="page-title">National Venues Administration</h1>
      
      <div className="split-layout">
        <div className="card" style={{ alignSelf: 'start' }}>
          <div className="card-header">
            <h2 className="card-title">
              {editMode ? <Edit2 size={20} color="#FF9933" /> : <MapPin size={20} color="#FF9933" />}
              {editMode ? ' Update Facility' : ' Add Facility'}
            </h2>
          </div>
          
          <AnimatePresence>
            {error && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="alert alert-error"><AlertCircle size={16}/> {error}</motion.div>}
            {success && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="alert alert-success"><CheckCircle2 size={16}/> {success}</motion.div>}
          </AnimatePresence>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Venue Name</label>
              <input type="text" name="venueName" value={formData.venueName} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Location / City</label>
              <input type="text" name="location" value={formData.location} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Seating Capacity</label>
              <input type="number" name="capacity" value={formData.capacity} onChange={handleInputChange} required />
            </div>
            <div style={{display:'flex', gap:'1rem'}}>
               <button type="submit" className="btn btn-primary" style={{flex: 1, background: editMode ? '#FF9933' : '#138808'}} disabled={submitting}>
                 {submitting ? <Loader2 className="spinner" size={18} /> : (editMode ? 'Update Facility' : 'Register Venue')}
               </button>
               {editMode && (
                 <button type="button" className="btn btn-outline" onClick={() => { setEditMode(null); setFormData({ venueName: '', location: '', capacity: '' }); }}>
                   Cancel
                 </button>
               )}
            </div>
          </form>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title"><MapPin size={20} color="#000080" /> Accredited Facilities</h2>
          </div>
          <div className="table-responsive">
            {loading ? <div style={{textAlign:'center', padding:'2rem'}}><Loader2 className="spinner" /></div> : (
              <table>
                <thead>
                  <tr>
                    <th>Facility Name</th>
                    <th>Location</th>
                    <th>Capacity</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {venues.map(v => (
                      <motion.tr key={v.VenueID} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                        <td style={{fontWeight:600}}>{v.VenueName}</td>
                        <td>{v.Location}</td>
                        <td><span className="badge badge-navy">{v.Capacity.toLocaleString()} Seats</span></td>
                        <td>
                           <div style={{display:'flex', gap:'8px'}}>
                              <button onClick={() => openEdit(v)} className="btn btn-outline" style={{padding:'4px 8px'}} title="Edit">
                                <Edit2 size={14} />
                              </button>
                              <button onClick={() => handleDelete(v.VenueID)} className="btn btn-danger" style={{padding:'4px 8px'}} title="Delete">
                                <Trash2 size={14} />
                              </button>
                           </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {venues.length === 0 && <tr><td colSpan="4" style={{textAlign:'center'}}>No registered venues</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
