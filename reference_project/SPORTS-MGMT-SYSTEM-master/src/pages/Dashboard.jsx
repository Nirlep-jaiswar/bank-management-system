import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Users, Shield, Trophy, FileText, IndianRupee, Star, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/analytics/dashboard')
      .then(res => setStats(res.data))
      .catch(console.error);
  }, []);

  if (!stats) return <div style={{padding:'2rem', textAlign:'center'}}><Loader2 className="spinner" size={32} /></div>;

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="dashboard">
      <h1 className="page-title">Admin Dashboard</h1>
      
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon"><Users size={24} /></div>
          <div className="stat-info">
            <h3>Registered Athletes</h3>
            <p>{stats.playersCount || 0}</p>
          </div>
        </div>
        
        <div className="stat-card orange">
          <div className="stat-icon"><Shield size={24} /></div>
          <div className="stat-info">
            <h3>Active Teams</h3>
            <p>{stats.teamsCount || 0}</p>
          </div>
        </div>
        
        <div className="stat-card green">
          <div className="stat-info">
            <h3 style={{color: '#138808'}}>Revenue Captured</h3>
            <p style={{color: '#138808'}}>₹{(stats.totalRevenue || 0).toLocaleString()}</p>
          </div>
          <div className="stat-icon" style={{marginLeft: 'auto'}}><IndianRupee size={24} color="#138808" /></div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><Trophy size={24} /></div>
          <div className="stat-info">
            <h3>Tournaments</h3>
            <p>{stats.tournamentsCount || 0}</p>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon"><FileText size={24} /></div>
          <div className="stat-info">
            <h3>Scheduled Matches</h3>
            <p>{stats.matchesCount || 0}</p>
          </div>
        </div>
        
        {stats.topPlayer && (
          <div className="stat-card" style={{borderLeftColor: '#FF9933', background: '#FFFDF0'}}>
            <div className="stat-icon" style={{background: '#FFE0B2', color: '#E65100'}}><Star size={24} /></div>
            <div className="stat-info">
              <h3>Top MVP Athlete</h3>
              <p style={{fontSize:'1.25rem'}}>{stats.topPlayer.Name} <span className="badge badge-saffron">★ {stats.topPlayer.Score} pts</span></p>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">System Status Overview</h2>
        </div>
        <p>Welcome to the <strong>Bharat Sports Management Platform</strong> Executive Panel. All microservices are online. Real-time synchronisation with the central MySQL infrastructure is active.</p>
        <p>Use the navigation panel on the left to allocate teams, track financial receipts, construct tournament branches, and approve facility validations.</p>
      </div>
    </motion.div>
  );
}
