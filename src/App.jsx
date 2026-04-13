import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Transactions from './pages/Transactions';
import Accounts from './pages/Accounts';
import Settings from './pages/Settings';
import Login from './pages/Login';
import SuperAdmin from './pages/SuperAdmin';
import VaultReports from './pages/VaultReports';
import Loans from './pages/Loans';

const ProtectedRoute = ({ children }) => {
  if (!localStorage.getItem('adminAuth')) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="customers" element={<Customers />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="accounts" element={<Accounts />} />
        <Route path="loans" element={<Loans />} />
        <Route path="settings" element={<Settings />} />
        <Route path="superadmin" element={<SuperAdmin />} />
        <Route path="reports" element={<VaultReports />} />
      </Route>
    </Routes>
  );
}
