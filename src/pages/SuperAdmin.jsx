import { useState, useEffect } from 'react';
import { Send, Shield, Activity, DollarSign, ArrowDownToLine, ArrowUpFromLine, Inbox } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function SuperAdmin() {
  const [admins, setAdmins] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [targetAdminID, setTargetAdminID] = useState('');
  const [allocateForm, setAllocateForm] = useState({ Amount: '' });
  const [vaultData, setVaultData] = useState(null);
  
  const superAdmin = JSON.parse(localStorage.getItem('adminData') || '{}');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [adminsRes, logsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/superadmin/admins?t=${new Date().getTime()}`),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/superadmin/logs?t=${new Date().getTime()}`)
      ]);
      const normalAdmins = adminsRes.data.filter(a => a.Role !== 'Super Admin');
      setAdmins(normalAdmins);
      setVaultData(adminsRes.data.find(a => a.Role === 'Super Admin'));
      setLogs(logsRes.data);
      
      // Auto select first admin
      if(normalAdmins.length > 0 && !targetAdminID) {
         setTargetAdminID(normalAdmins[0].AdminID.toString());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAllocate = async (e) => {
    e.preventDefault();
    if (!targetAdminID || !allocateForm.Amount) return alert('Please enter Amount');
    
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/superadmin/allocate`, {
        SuperAdminID: superAdmin.AdminID,
        TargetAdminID: parseInt(targetAdminID),
        Amount: parseFloat(allocateForm.Amount)
      });
      alert('Funds successfully allocated to the Admin!');
      setAllocateForm({ Amount: '' });
      fetchData(); // refresh data
    } catch (err) {
      alert(err.response?.data?.error || 'Allocation failed');
    }
  };

  // Helper to calculate today's teller activity based on logs
  const getTellerStats = (tellerId) => {
      const today = new Date().toDateString();
      const tellerLogs = logs.filter(log => new Date(log.Timestamp).toDateString() === today);
      
      let returned = 0;
      let used = 0; // Money they gave to customers (Withdrawals)
      let receivedFromSuper = 0;

      tellerLogs.forEach(log => {
          // If teller returned money to vault
          if (log.AdminID === parseInt(tellerId) && log.ActionType === 'Return Funds') {
              const amountMatch = log.Description.match(/\$(\d+(\.\d{1,2})?)/);
              if (amountMatch) returned += parseFloat(amountMatch[1]);
          }
          // If teller used money (Withdrawal = giving cash out of drawer)
          if (log.AdminID === parseInt(tellerId) && log.ActionType === 'Withdrawal') {
              const amountMatch = log.Description.match(/\$(\d+(\.\d{1,2})?)/);
              if (amountMatch) used += parseFloat(amountMatch[1]);
          }
          // If super admin allocated money to this teller
          if (log.ActionType === 'Allocate Funds' && log.Description.includes(`Admin ${tellerId}`)) {
              const amountMatch = log.Description.match(/\$(\d+(\.\d{1,2})?)/);
              if (amountMatch) receivedFromSuper += parseFloat(amountMatch[1]);
          }
      });

      return { returned, used, receivedFromSuper };
  };

  if (loading) return <div className="text-white p-8">Loading Admin Data...</div>;

  const currentTeller = admins.find(a => a.AdminID.toString() === targetAdminID);
  const stats = currentTeller ? getTellerStats(targetAdminID) : { returned: 0, used: 0, receivedFromSuper: 0 };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <Shield className="text-emerald-400" size={28} />
             <h2 className="text-3xl font-bold tracking-tight text-white">Central Vault Management</h2>
          </div>
          <p className="text-slate-400 text-sm">Review specific admin operations, track their daily cash usage, and distribute limits.</p>
        </div>
        
        {vaultData && (
          <div className="bg-slate-800/50 border border-slate-700/80 rounded-xl p-4 text-right shadow-lg shadow-emerald-500/5">
             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Vault Reserves</div>
             <div className="text-4xl font-bold text-emerald-400 font-mono tracking-tighter drop-shadow-md">
                ${parseFloat(vaultData.AllocatedFunds).toLocaleString(undefined, {minimumFractionDigits: 2})}
             </div>
          </div>
        )}
      </header>

      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
         <div className="mb-8 border-b border-slate-800/80 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
             <div>
               <h3 className="text-lg font-bold text-white mb-2">Select Admin to Monitor</h3>
               <select 
                   value={targetAdminID}
                   onChange={e => setTargetAdminID(e.target.value)}
                   className="w-full sm:w-80 bg-[#050914] border border-slate-700/80 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white font-medium"
                 >
                   <option value="">Select an active Admin...</option>
                   {admins.map(a => (
                     <option key={a.AdminID} value={a.AdminID}>ID: #{a.AdminID} - {a.FirstName} {a.LastName}</option>
                   ))}
               </select>
             </div>
             
             {currentTeller && (
               <div className="text-right">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Current Active Cash Drawer</div>
                  <div className="text-3xl font-bold text-emerald-400 font-mono tracking-tighter">
                     ${parseFloat(currentTeller.AllocatedFunds).toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </div>
               </div>
             )}
         </div>

         {currentTeller ? (
           <div className="space-y-8">
             {/* Dynamic Today Stats */}
             <div>
                <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-4">Today's Float Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 text-emerald-500/20"><ArrowDownToLine size={48} /></div>
                      <div className="text-xs font-bold text-slate-400 mb-2 relative z-10">Cash Handed To Admin</div>
                      <div className="text-2xl font-bold text-white relative z-10">${stats.receivedFromSuper.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                   </div>
                   
                   <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 text-amber-500/20"><Activity size={48} /></div>
                      <div className="text-xs font-bold text-slate-400 mb-2 relative z-10">Money Used by Admin</div>
                      <div className="text-2xl font-bold text-white relative z-10">${stats.used.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                      <div className="text-[10px] text-slate-500 mt-1 relative z-10">(Total customer withdrawals given)</div>
                   </div>

                   <div className="bg-emerald-900/10 border border-emerald-500/30 rounded-xl p-5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 text-emerald-500/20"><ArrowUpFromLine size={48} /></div>
                      <div className="text-xs font-bold text-emerald-400 mb-2 relative z-10">Money Returned to Vault</div>
                      <div className="text-2xl font-bold text-white relative z-10">${stats.returned.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                   </div>
                </div>
             </div>

             {/* Action to Give Money to this Teller */}
             <div className="bg-gradient-to-br from-slate-900 to-[#0a0f1e] border border-blue-900/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden mt-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                <h3 className="text-lg font-bold text-white mb-2 relative z-10 flex items-center gap-2">
                   <Inbox size={20} className="text-primary"/> Transfer Money to Admin
                </h3>
                <p className="text-xs text-slate-400 mb-6 relative z-10 max-w-lg">
                  Inject daily operational funds directly into their digital drawer so they can authorize cash withdrawals.
                </p>
                
                <form onSubmit={handleAllocate} className="flex flex-col sm:flex-row gap-4 relative z-10 max-w-xl">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Transfer Amount ($)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                      <input 
                        required type="number" min="1" step="0.01"
                        value={allocateForm.Amount} onChange={e => setAllocateForm({ Amount: e.target.value })}
                        placeholder="50000.00"
                        className="w-full bg-[#050914] border border-slate-700/80 rounded-xl pl-8 pr-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary text-white font-mono font-bold"
                      />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button type="submit" className="w-full sm:w-auto bg-primary hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2 whitespace-nowrap">
                      <Send size={16} /> Give Float
                    </button>
                  </div>
                </form>
             </div>

           </div>
         ) : (
           <div className="text-center py-10 text-slate-500">Please select an admin to view operations.</div>
         )}
      </div>
    </div>
  );
}
