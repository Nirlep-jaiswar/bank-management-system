import { useState, useEffect } from 'react';
import { Shield, Activity, ArrowDownToLine, ArrowUpFromLine, RefreshCw } from 'lucide-react';
import axios from 'axios';

export default function VaultReports() {
  const [admins, setAdmins] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [targetAdminID, setTargetAdminID] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [adminsRes, logsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/superadmin/admins`),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/superadmin/logs`)
      ]);
      const normalAdmins = adminsRes.data.filter(a => a.Role !== 'Super Admin');
      setAdmins(normalAdmins);
      setLogs(logsRes.data);
      
      if(normalAdmins.length > 0 && !targetAdminID) {
         setTargetAdminID(normalAdmins[0].AdminID.toString());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getAdminReportLogs = (tellerId) => {
      if (!tellerId) return [];
      return logs.filter(log => {
          const isReturn = log.AdminID === parseInt(tellerId) && log.ActionType === 'Return Funds';
          const isAllocated = log.ActionType === 'Allocate Funds' && log.Description.includes(`Admin ${tellerId}`);
          const isWithdrawal = log.AdminID === parseInt(tellerId) && log.ActionType === 'Withdrawal';
          const isLoanApproval = log.AdminID === parseInt(tellerId) && log.ActionType === 'Loan Approval';
          const isLoanRepayment = log.AdminID === parseInt(tellerId) && log.ActionType === 'Loan Repayment';
          return isReturn || isAllocated || isWithdrawal || isLoanApproval || isLoanRepayment;
      }).sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));
  };

  if (loading) return <div className="text-white p-8">Loading Report Data...</div>;

  const currentAdmin = admins.find(a => a.AdminID.toString() === targetAdminID);
  const reportLogs = currentAdmin ? getAdminReportLogs(targetAdminID) : [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <Activity className="text-emerald-400" size={28} />
             <h2 className="text-3xl font-bold tracking-tight text-white">Vault & Operations Report</h2>
          </div>
          <p className="text-slate-400 text-sm">Detailed breakdown of admin fund movements including allocations, returns, and customer withdrawals.</p>
        </div>
      </header>

      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
         <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
             <div>
               <h3 className="text-lg font-bold text-white mb-2">Select Admin</h3>
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
         </div>

         {currentAdmin ? (
           <div className="bg-[#050914] border border-slate-700/80 rounded-xl overflow-hidden shadow-lg">
             {reportLogs.length > 0 ? (
               <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm text-slate-300">
                   <thead className="text-xs uppercase bg-slate-800/80 text-slate-400 border-b border-slate-700">
                     <tr>
                       <th className="px-6 py-4 font-bold">Date & Time</th>
                       <th className="px-6 py-4 font-bold">Action</th>
                       <th className="px-6 py-4 font-bold">Amount</th>
                       <th className="px-6 py-4 font-bold">Details</th>
                       <th className="px-6 py-4 font-bold">Movement</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-800/80">
                     {reportLogs.map(log => {
                       const amountMatch = log.Description.match(/\$(\d+(?:,\d{3})*(?:\.\d{1,2})?)/);
                       let amount = amountMatch ? amountMatch[0] : '-';
                       
                       const isAllocated = log.ActionType === 'Allocate Funds';
                       const isReturn = log.ActionType === 'Return Funds';
                       const isWithdrawal = log.ActionType === 'Withdrawal';
                       const isLoanApproval = log.ActionType === 'Loan Approval';
                       const isLoanRepayment = log.ActionType === 'Loan Repayment';
                       
                       let badgeColor = 'bg-slate-500/10 text-slate-400 border-slate-500/20';
                       if(isAllocated) badgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                       if(isReturn) badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                       if(isWithdrawal) badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                       if(isLoanApproval) badgeColor = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
                       if(isLoanRepayment) badgeColor = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';

                       return (
                         <tr key={log.LogID} className="hover:bg-slate-800/30 transition-colors">
                           <td className="px-6 py-4 font-medium whitespace-nowrap text-slate-400">
                             {new Date(log.Timestamp).toLocaleString()}
                           </td>
                           <td className="px-6 py-4">
                             <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider ${badgeColor}`}>
                               {log.ActionType}
                             </span>
                           </td>
                           <td className="px-6 py-4 font-mono font-bold text-white text-lg">
                             {amount}
                           </td>
                           <td className="px-6 py-4 text-xs text-slate-400 max-w-xs truncate" title={log.Description}>
                             {log.Description}
                           </td>
                           <td className="px-6 py-4">
                             <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
                               {isAllocated && <><span className="text-slate-500">Vault</span> <ArrowDownToLine size={14} className="text-blue-400 mx-1"/> <span className="text-white">Admin</span></>}
                               {isReturn && <><span className="text-white">Admin</span> <ArrowUpFromLine size={14} className="text-emerald-400 mx-1"/> <span className="text-slate-500">Vault</span></>}
                               {isWithdrawal && <><span className="text-slate-400">Admin Drawer</span> <ArrowDownToLine size={14} className="text-amber-400 mx-1"/> <span className="text-white">Customer</span></>}
                               {isLoanApproval && <><span className="text-slate-400">Bank Vault</span> <ArrowDownToLine size={14} className="text-purple-400 mx-1"/> <span className="text-white">Customer</span></>}
                               {isLoanRepayment && <><span className="text-white">Customer</span> <ArrowUpFromLine size={14} className="text-indigo-400 mx-1"/> <span className="text-slate-400">Bank Vault</span></>}
                             </div>
                           </td>
                         </tr>
                       );
                     })}
                   </tbody>
                 </table>
               </div>
             ) : (
               <div className="p-10 flex flex-col items-center justify-center text-slate-500">
                 <RefreshCw size={32} className="mb-4 opacity-50" />
                 <p>No transaction history found for this admin.</p>
               </div>
             )}
           </div>
         ) : (
           <div className="text-center py-10 text-slate-500">Please select an admin to view operations.</div>
         )}
      </div>
    </div>
  );
}
