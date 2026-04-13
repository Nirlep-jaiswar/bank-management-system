import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Shield, Trophy, FileText, MapPin, CreditCard } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className="sidebar-link">
          <LayoutDashboard size={20} /> Dashboard
        </NavLink>
        <NavLink to="/players" className="sidebar-link">
          <Users size={20} /> Players
        </NavLink>
        <NavLink to="/teams" className="sidebar-link">
          <Shield size={20} /> Teams
        </NavLink>
        <NavLink to="/tournaments" className="sidebar-link">
          <Trophy size={20} /> Tournaments
        </NavLink>
        <NavLink to="/matches" className="sidebar-link">
          <FileText size={20} /> Matches
        </NavLink>
        <NavLink to="/venues" className="sidebar-link">
          <MapPin size={20} /> Venues
        </NavLink>
        <NavLink to="/registrations" className="sidebar-link">
          <CreditCard size={20} /> Payments
        </NavLink>
      </nav>
    </aside>
  );
}
