import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="navbar-header">
      <div className="navbar-top-accent"></div>
      <div className="navbar-content">
        <Link to="/" className="logo hide-link-style">
          <Activity size={24} color="#000080" />
          <span>BHARAT</span> Sports
        </Link>
        <div className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/dashboard" className="btn btn-primary" style={{padding: '0.5rem 1rem', width: 'auto'}}>System Portal</Link>
        </div>
      </div>
    </header>
  );
}
