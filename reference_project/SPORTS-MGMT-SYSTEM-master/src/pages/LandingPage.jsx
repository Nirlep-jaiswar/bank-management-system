import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Trophy, Users, ShieldCheck, PhoneCall, Mail, MapPin } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="landing-page">
      <header className="navbar-header">
        <div className="navbar-top-accent"></div>
        <div className="navbar-content">
          <div className="logo">
            <Activity size={24} color="#000080" />
            <span>BHARAT</span> Sports
          </div>
          <div className="navbar-links">
            <Link to="/dashboard" className="btn btn-primary" style={{padding: '0.5rem 1.5rem', width: 'auto'}}>Official Login</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="hero-content"
          >
            <div className="badge-pill">🇮🇳 Government of India Initiative</div>
            <h1>Bharat Sports Management System</h1>
            <p className="tagline">"From Gully to Glory 🇮🇳"</p>
            <p className="hero-desc">The digital backbone for managing national sports, tracking player trajectories, organizing tournaments, and building a stronger athletic ecosystem.</p>
            <div className="hero-actions">
              <Link to="/dashboard" className="btn btn-primary lg-btn">Access Dashboard</Link>
              <button className="btn btn-outline lg-btn">Learn More</button>
            </div>
          </motion.div>
        </section>

        <section className="features-section">
          <div className="container">
            <h2 className="section-title">Core Capabilities</h2>
            <div className="features-grid">
              <div className="feature-card">
                <Users size={32} color="#FF9933" />
                <h3>Player Management</h3>
                <p>Comprehensive tracking of athlete health, performance, and details.</p>
              </div>
              <div className="feature-card">
                <ShieldCheck size={32} color="#138808" />
                <h3>Team Building</h3>
                <p>Register official teams, map players, and designate responsible coaches.</p>
              </div>
              <div className="feature-card">
                <Trophy size={32} color="#000080" />
                <h3>Tournament Org</h3>
                <p>End-to-end tournament lifecycle scheduling and management.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="stats-stripe">
          <div className="container stats-stripe-grid">
            <div className="stat-item">
              <h2 className="counter">10,000+</h2>
              <p>Registered Athletes</p>
            </div>
            <div className="stat-item">
              <h2 className="counter">500+</h2>
              <p>Active Teams</p>
            </div>
            <div className="stat-item">
              <h2 className="counter">50+</h2>
              <p>National Tournaments</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="gov-footer">
        <div className="container footer-grid">
          <div className="footer-col">
            <div className="logo" style={{color: 'white', marginBottom: '1rem'}}>
              <Activity size={24} color="#FF9933" />
              <span>BHARAT</span> Sports
            </div>
            <p>Empowering the next generation of Indian athletes through digital excellence.</p>
          </div>
          <div className="footer-col">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="#">Ministry of Youth Affairs</Link></li>
              <li><Link to="#">SAI Official Site</Link></li>
              <li><Link to="#">Khelo India Portal</Link></li>
              <li><Link to="#">National Anti-Doping</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h3>Contact Us</h3>
            <ul className="contact-list">
              <li><PhoneCall size={16} /> 1800-11-2233 (Toll Free)</li>
              <li><Mail size={16} /> support@bharatsports.gov.in</li>
              <li><MapPin size={16} /> JLN Stadium, New Delhi</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Bharat Sports Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
