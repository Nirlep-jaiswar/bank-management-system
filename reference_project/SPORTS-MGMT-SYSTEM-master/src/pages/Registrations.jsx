import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Loader2, AlertCircle, CheckCircle2, UserCheck, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';

export default function Registrations() {
  const [registrations, setRegistrations] = useState([]);
  const [players, setPlayers] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Registration Form
  const [formData, setFormData] = useState({ playerId: '', tournamentId: '' });
  
  // Payment Modal
  const [paymentModal, setPaymentModal] = useState({ open: false, regId: null });
  const [paymentData, setPaymentData] = useState({ amount: '', mode: 'UPI' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [regRes, pRes, tRes] = await Promise.all([
        axios.get('http://localhost:5000/registrations'),
        axios.get('http://localhost:5000/players'),
        axios.get('http://localhost:5000/tournaments')
      ]);
      setRegistrations(regRes.data);
      setPlayers(pRes.data);
      setTournaments(tRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (msg, isErr=false) => {
    if(isErr) setError(msg); else setSuccess(msg);
    setTimeout(() => { setError(null); setSuccess(null); }, 3000);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('http://localhost:5000/registrations', formData);
      setFormData({ playerId: '', tournamentId: '' });
      fetchData();
      showMsg('Player registered successfully!');
    } catch (err) {
      showMsg('Failed to register player', true);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('http://localhost:5000/payments', {
        registrationId: paymentModal.regId,
        amount: paymentData.amount,
        mode: paymentData.mode
      });
      setPaymentModal({ open: false, regId: null });
      setPaymentData({ amount: '', mode: 'UPI' });
      fetchData();
      showMsg('Payment Processed Successfully!');
    } catch (err) {
      showMsg('Payment Failed', true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="registrations-page">
      <h1 className="page-title">Registrations & Payments</h1>
      
      <div className="split-layout">
        <div className="card" style={{ alignSelf: 'start' }}>
          <div className="card-header">
            <h2 className="card-title"><UserCheck size={20} color="#FF9933" /> Register Player Event</h2>
          </div>
          
          <AnimatePresence>
            {error && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="alert alert-error"><AlertCircle size={16}/> {error}</motion.div>}
            {success && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="alert alert-success"><CheckCircle2 size={16}/> {success}</motion.div>}
          </AnimatePresence>

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Select Player</label>
              <select name="playerId" value={formData.playerId} onChange={e=>setFormData({...formData, playerId: e.target.value})} required>
                <option value="">-- Choose Athlete --</option>
                {players.map(p => (
                  <option key={p.PlayerID} value={p.PlayerID}>{p.Name} (ID: {p.PlayerID})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Select Tournament</label>
              <select name="tournamentId" value={formData.tournamentId} onChange={e=>setFormData({...formData, tournamentId: e.target.value})} required>
                <option value="">-- Choose Event --</option>
                {tournaments.map(t => (
                  <option key={t.TournamentID} value={t.TournamentID}>{t.TournamentName}</option>
                ))}
              </select>
            </div>
            
            <button type="submit" className="btn btn-primary" style={{width: '100%', background: '#138808'}} disabled={submitting}>
              {submitting ? <Loader2 className="spinner" size={18} /> : 'Complete Registration'}
            </button>
          </form>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title"><CreditCard size={20} color="#000080" /> Tracking Database</h2>
          </div>
          <div className="table-responsive">
            {loading ? <div style={{textAlign:'center', padding:'2rem'}}><Loader2 className="spinner" /></div> : (
              <table>
                <thead>
                  <tr>
                    <th>Reg ID</th>
                    <th>Athlete</th>
                    <th>Tournament</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {registrations.map(r => (
                      <motion.tr key={r.RegistrationID} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                        <td>#{r.RegistrationID}</td>
                        <td style={{fontWeight:600}}>{r.PlayerName}</td>
                        <td>{r.TournamentName || 'N/A'}</td>
                        <td>{new Date(r.RegistrationDate).toLocaleDateString()}</td>
                        <td>
                          {r.Status === 'Confirmed' ? 
                            <span className="badge badge-green">Confirmed (Paid)</span> : 
                            <span className="badge badge-saffron">Pending Payment</span>
                          }
                        </td>
                        <td>
                          {r.Status !== 'Confirmed' && (
                            <button onClick={() => setPaymentModal({open: true, regId: r.RegistrationID})} className="btn btn-primary" style={{padding: '0.25rem 0.75rem', fontSize: '0.8rem'}}>
                              Pay Now
                            </button>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {registrations.length === 0 && <tr><td colSpan="6" style={{textAlign:'center'}}>No registrations found</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={paymentModal.open} onClose={() => setPaymentModal({open: false, regId: null})} title="Process Payment Gateway (Mock)">
        <form onSubmit={handlePayment}>
           <div className="form-group">
            <label>Amount (₹)</label>
            <input type="number" required value={paymentData.amount} onChange={e=>setPaymentData({...paymentData, amount: e.target.value})} placeholder="e.g. 1500" />
           </div>
           <div className="form-group">
            <label>Payment Method</label>
            <select value={paymentData.mode} onChange={e=>setPaymentData({...paymentData, mode: e.target.value})}>
              <option value="UPI">UPI</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
           </div>
           <button type="submit" className="btn btn-primary" style={{width: '100%'}} disabled={submitting}>
              {submitting ? <Loader2 className="spinner" size={18} /> : 'Process & Confirm'}
            </button>
        </form>
      </Modal>
    </div>
  );
}
