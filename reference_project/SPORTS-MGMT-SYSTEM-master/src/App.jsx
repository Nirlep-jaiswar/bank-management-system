import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Players from './pages/Players';
import Teams from './pages/Teams';
import Matches from './pages/Matches';
import Tournaments from './pages/Tournaments';
import Venues from './pages/Venues';
import Registrations from './pages/Registrations';
import Layout from './components/Layout';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/players" element={<Players />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/venues" element={<Venues />} />
          <Route path="/registrations" element={<Registrations />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
