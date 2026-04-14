import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, Mail, ArrowRight } from 'lucide-react';
import axios from 'axios';

export default function Login() {
  const [formData, setFormData] = useState({ Email: '', Password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/login`, formData);
      if(res.data.success) {
        localStorage.setItem('adminAuth', 'true');
        localStorage.setItem('adminData', JSON.stringify(res.data.admin)); // Save full admin profile
        
        // Redirect appropriately
        if (res.data.admin.Role === 'Super Admin') {
           navigate('/dashboard/superadmin');
        } else {
           navigate('/dashboard');
        }
      }
    } catch(err) {
      setError(err.response?.data?.error || 'Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative text-slate-300 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-[#0a0f1e] border border-slate-800/80 rounded-3xl p-8 relative z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-[#3b82f6] rounded-2xl flex items-center justify-center mb-6 shadow-md">
            <Shield className="text-white" size={32} strokeWidth={2} />
          </div>
          <h1 className="text-[28px] font-bold text-slate-200 tracking-tight">NexusBank Admin</h1>
          <p className="text-slate-500 text-sm mt-2">Enter your credentials to access the system</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2">
            <Lock size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6" autoComplete="off">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input required type="email" value={formData.Email} onChange={e => setFormData({...formData, Email: e.target.value})} autoComplete="off" className="w-full bg-[#050914] border border-slate-800 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white transition-all" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input required type="password" value={formData.Password} onChange={e => setFormData({...formData, Password: e.target.value})} autoComplete="new-password" className="w-full bg-[#050914] border border-slate-800 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white transition-all" />
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-[#3b82f6] hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-8 disabled:opacity-70 disabled:cursor-not-allowed text-[15px]">
            {loading ? 'Authenticating...' : <>Secure Login <ArrowRight size={18} strokeWidth={2.5} /></>}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
