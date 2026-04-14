import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save } from 'lucide-react';
import axios from 'axios';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState({ FirstName: '', LastName: '', Email: '', AssignedBranch: '', Password: '' });
  
  const adminObj = JSON.parse(localStorage.getItem('adminData') || '{}');

  useEffect(() => {
    if(!adminObj.AdminID) return;
    axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin?id=${adminObj.AdminID}`)
      .then(res => setAdminData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
        await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin`, adminData);
        alert('Settings saved successfully!');
    } catch(err) {
        alert('Error saving settings.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 w-16 h-16 rounded-full border-4 border-slate-800 border-t-primary animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <header className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight mb-1 text-white">System Settings</h2>
        <p className="text-slate-400 text-sm">Configure your administrator profile.</p>
      </header>

      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl overflow-hidden max-w-4xl">
        <div className="p-6 border-b border-slate-800">
          <h3 className="text-xl font-bold text-white">Administrator Profile</h3>
          <p className="text-slate-400 text-sm mt-1">Manage your bank admin details and contact info.</p>
        </div>
        <div className="p-8 space-y-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-blue-900 flex items-center justify-center text-3xl font-bold text-white border-4 border-slate-800 shadow-xl uppercase">
              {adminData.FirstName?.[0]}{adminData.LastName?.[0]}
            </div>
            <div>
              <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-xl border border-slate-700 transition">
                Change Avatar
              </button>
              <p className="text-xs text-slate-500 mt-2">JPG, GIF, or PNG. Max size 2MB.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">First Name</label>
              <input type="text" value={adminData.FirstName} onChange={e => setAdminData({...adminData, FirstName: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white transition-all" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Last Name</label>
              <input type="text" value={adminData.LastName} onChange={e => setAdminData({...adminData, LastName: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white transition-all" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Email Address</label>
              <input type="email" value={adminData.Email} onChange={e => setAdminData({...adminData, Email: e.target.value})} className="w-full bg-slate-800/50 border border-slate-700/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white transition-all" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">System Role</label>
              <input type="text" defaultValue="Super Administrator" disabled className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-500 cursor-not-allowed" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Update Password</label>
              <input type="password" value={adminData.Password || ''} onChange={e => setAdminData({...adminData, Password: e.target.value})} placeholder="Leave blank to keep unchanged" className="w-full bg-slate-800/50 border border-slate-700/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white transition-all" />
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-800/80 flex justify-end gap-4">
            <button className="px-5 py-2.5 text-slate-400 hover:text-white font-medium rounded-xl transition text-sm">
              Discard Changes
            </button>
            <button onClick={handleSave} className="px-6 py-2.5 bg-primary hover:bg-blue-600 text-white font-medium rounded-xl transition flex items-center gap-2 text-sm shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <Save size={16} /> Save Settings
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
