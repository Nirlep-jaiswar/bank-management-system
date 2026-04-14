import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, CreditCard, Users, Wallet, Activity, ArrowRightLeft, ShieldAlert } from 'lucide-react';
import axios from 'axios';

import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [recentLoans, setRecentLoans] = useState([]);
  const [transferData, setTransferData] = useState({ accountId: '', targetAccountId: '', customerName: '', amount: '', type: 'Deposit' });
  const [adminProfile, setAdminProfile] = useState({});

  const adminObj = JSON.parse(localStorage.getItem('adminData') || '{}');

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/transactions`);
      setRecentTransactions(res.data.slice(0, 5));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAdminProfile = async () => {
    if(!adminObj.AdminID) return;
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin?id=${adminObj.AdminID}&t=${new Date().getTime()}`);
      setAdminProfile(res.data);
      // Update local storage to keep it in sync across reloads
      localStorage.setItem('adminData', JSON.stringify({ ...adminObj, ...res.data }));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLoans = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/loans`);
      setRecentLoans(res.data.slice(0, 5));
    } catch (err) {
      console.error(err);
    }
  };

  const syncData = async () => {
      setLoading(true);
      await Promise.all([fetchTransactions(), fetchAdminProfile(), fetchLoans()]);
      setLoading(false);
  };

  useEffect(() => {
    if (adminObj.Role === 'Super Admin') {
        navigate('/dashboard/superadmin');
    } else {
        syncData();
    }
  }, []);

  const handleTransfer = async () => {
    if(!transferData.accountId || !transferData.amount) return;
    try {
       await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/transactions`, {
          AccountID: transferData.accountId,
          TargetAccountID: (transferData.type === 'Transfer' || transferData.type === 'Loan Repayment') ? transferData.targetAccountId : undefined,
          CustomerName: transferData.customerName,
          TransactionType: transferData.type,
          Amount: parseFloat(transferData.amount),
          Description: transferData.type === 'Transfer' ? `Transfer` : transferData.type === 'Loan Repayment' ? `Loan Repayment` : `Dashboard ${transferData.type}`,
          AdminID: adminObj.AdminID
       });
       setTransferData({ accountId: '', targetAccountId: '', customerName: '', amount: '', type: 'Deposit' });
       alert('Transaction completed!');
       syncData();
    } catch(err) {
       console.error(err);
       alert(err.response?.data?.error || 'Transaction Error. Please check your network or Drawer Capacity.');
    }
  };

  const handleReturnMoney = async () => {
    const amountToReturn = prompt(`How much money would you like to return to the Super Admin?\nYour current drawer capacity: $${adminProfile.AllocatedFunds || '0.00'}`);
    if (!amountToReturn || isNaN(amountToReturn) || parseFloat(amountToReturn) <= 0) return;
    
    try {
       const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/return`, {
           AdminID: adminObj.AdminID,
           Amount: parseFloat(amountToReturn)
       });
       alert(res.data.message);
       syncData();
    } catch(err) {
       alert(err.response?.data?.error || 'Error returning funds.');
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

  const isSuper = adminProfile.Role === 'Super Admin';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/60 pb-6">
        <div>
          <motion.h2 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Dashboard Overview
          </motion.h2>
          <motion.p className="text-slate-400 text-sm font-medium">
            Here's what's happening with NexusBank today. Welcome, {adminProfile.FirstName}.
          </motion.p>
        </div>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl relative overflow-hidden bg-gradient-to-b from-blue-900/20 to-transparent">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400"><Wallet /></div>
            <span className="flex items-center text-xs font-bold px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">Active Drawer</span>
          </div>
          <div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">{isSuper ? "Bank Vault Total" : "My Cash Drawer Limit"}</h3>
            <p className="text-3xl font-bold text-white">${parseFloat(adminProfile.AllocatedFunds || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-slate-800/80 rounded-xl text-emerald-400"><Users /></div>
          </div>
          <div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">Active Customers</h3>
            <p className="text-3xl font-bold text-white">4,291</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-slate-800/80 rounded-xl text-purple-400"><CreditCard /></div>
          </div>
          <div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">Transactions Today</h3>
            <p className="text-3xl font-bold text-white">842</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-slate-800/80 rounded-xl text-amber-400"><Activity /></div>
          </div>
          <div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">Network Uptime</h3>
            <p className="text-3xl font-bold text-white">99.99%</p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions List */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-2xl flex flex-col"
        >
          <div className="mx-6 mt-6 pb-4 border-b border-slate-800/60 flex justify-between items-center">
            <h3 className="text-lg font-bold text-white tracking-wide">Live Transactions</h3>
          </div>
          
          <div className="overflow-x-auto p-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Account Details</th>
                  <th className="py-4 px-6">Type</th>
                  <th className="py-4 px-6 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentTransactions.length === 0 && (
                   <tr><td colSpan="4" className="text-center py-8 text-slate-500">No transactions recorded yet.</td></tr>
                )}
                {recentTransactions.map((tx) => (
                  <tr key={tx.TransactionID} className="border-b border-slate-800/40 hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs text-slate-400">{tx.TransactionID}</td>
                    <td className="py-4 px-6 font-semibold text-slate-200">
                      <div>{tx.AccountID}</div>
                      <div className="text-xs text-slate-400 font-normal mt-0.5">{tx.FirstName} {tx.LastName}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border 
                        ${tx.TransactionType === 'Deposit' ? 'bg-secondary/10 text-secondary border-secondary/20' : 
                          tx.TransactionType === 'Withdrawal' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
                          'bg-primary/10 text-primary border-primary/20'}`}>
                        {tx.TransactionType}
                      </div>
                    </td>
                    <td className={`py-4 px-6 text-right font-bold tracking-tight ${tx.TransactionType === 'Deposit' ? 'text-secondary' : 'text-white'}`}>
                      {tx.TransactionType === 'Deposit' ? '+' : '-'}${tx.Amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Quick Action / Status */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 flex flex-col"
        >
          <div className="pb-4 border-b border-slate-800/60 mb-6 flex justify-between items-center">
            <h3 className="text-lg font-bold text-white tracking-wide">Drawer Actions</h3>
          </div>
          
          <div className="space-y-4">
             {!isSuper && (
                <div className="bg-slate-800/30 border border-emerald-500/20 rounded-xl p-4 flex flex-col gap-3">
                   <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                      <ShieldAlert size={18} /> End of Day Settlement
                   </div>
                   <p className="text-xs text-slate-400 leading-relaxed">
                     Submit any remaining physical drawer float back to the central Bank Vault.
                   </p>
                   <button onClick={handleReturnMoney} className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/50 font-bold py-2 rounded-lg transition-colors text-sm">
                      Return Excess Funds to Vault
                   </button>
                </div>
             )}
          </div>
            
          <div className="mt-auto pt-8">
            <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50 relative overflow-hidden">
               <h4 className="font-bold text-white mb-4 flex items-center gap-2 text-sm">
                 <ArrowRightLeft className="text-primary" size={16} /> Process Account Action
               </h4>
               <div className="space-y-3">
                 <div>
                   <label className="text-xs font-semibold text-slate-400 uppercase">Type</label>
                   <select value={transferData.type} onChange={(e) => setTransferData({...transferData, type: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary mt-1 appearance-none">
                     <option value="Deposit">Deposit (Receiving Cash)</option>
                     <option value="Withdrawal">Withdrawal (Giving Cash)</option>
                     <option value="Transfer">Transfer</option>
                     <option value="Loan Repayment">Loan Repayment</option>
                   </select>
                 </div>
                 <div>
                   <label className="text-xs font-semibold text-slate-400 uppercase">Customer Name</label>
                   <input type="text" onChange={(e) => setTransferData({...transferData, customerName: e.target.value})} value={transferData.customerName} placeholder="Enter Name (Optional)" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary mt-1" />
                 </div>
                 <div>
                   <label className="text-xs font-semibold text-slate-400 uppercase">
                     {transferData.type === 'Transfer' ? 'Sender Account ID' : transferData.type === 'Loan Repayment' ? 'Customer Account ID' : 'Account ID'}
                   </label>
                   <input type="number" onChange={(e) => setTransferData({...transferData, accountId: e.target.value})} value={transferData.accountId} placeholder="Valid ID (e.g. 100000000001)" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary mt-1" />
                 </div>
                 {(transferData.type === 'Transfer' || transferData.type === 'Loan Repayment') && (
                 <div>
                   <label className="text-xs font-semibold text-primary uppercase">
                      {transferData.type === 'Transfer' ? 'Receiver Account ID' : 'Target Loan ID'}
                   </label>
                   <input type="number" onChange={(e) => setTransferData({...transferData, targetAccountId: e.target.value})} value={transferData.targetAccountId} placeholder={transferData.type === 'Transfer' ? "Receiver ID (e.g. 100000000002)" : "Loan ID (e.g. 1)"} className="w-full bg-slate-900/50 border border-primary/50 shadow-[0_0_15px_rgba(59,130,246,0.1)] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary mt-1" />
                 </div>
                 )}
                 <div className="mb-4">
                   <label className="text-xs font-semibold text-slate-400 uppercase">Amount ($)</label>
                   <input type="number" onChange={(e) => setTransferData({...transferData, amount: e.target.value})} value={transferData.amount} placeholder="100.00" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary mt-1" />
                 </div>
                 <button onClick={handleTransfer} className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] active:scale-[0.98]">
                   Authorize {transferData.type}
                 </button>
               </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Loans Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="mt-8 bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-2xl flex flex-col"
      >
        <div className="mx-6 mt-6 pb-4 border-b border-slate-800/60 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white tracking-wide">Recent Loan Applications</h3>
          <button onClick={() => navigate('/dashboard/loans')} className="text-sm font-bold text-primary hover:text-blue-400 transition-colors">
            View All Loans →
          </button>
        </div>
        
        <div className="overflow-x-auto p-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Type & Terms</th>
                <th className="py-4 px-6">Principal</th>
                <th className="py-4 px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {recentLoans.length === 0 && (
                 <tr><td colSpan="5" className="text-center py-8 text-slate-500">No recent loans.</td></tr>
              )}
              {recentLoans.map((loan) => (
                <tr key={loan.LoanID} className="border-b border-slate-800/40 hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-6 font-mono text-xs text-slate-400">#{loan.LoanID}</td>
                  <td className="py-4 px-6 font-semibold text-slate-200">
                    <div>{loan.FirstName} {loan.LastName}</div>
                    <div className="text-[10px] text-slate-500 font-normal mt-0.5">Cust ID: {loan.CustomerID}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-slate-300">{loan.LoanType}</div>
                    <div className="text-[10px] text-slate-500">{loan.InterestRate}% • {loan.DurationMonths} Mo</div>
                  </td>
                  <td className="py-4 px-6 font-bold text-white tracking-tight">
                    ${parseFloat(loan.PrincipalAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </td>
                  <td className="py-4 px-6 text-right">
                     <span className={`px-2 py-1 text-[10px] font-bold rounded-md border inline-block
                        ${loan.Status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          loan.Status === 'Rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                          loan.Status === 'Closed' ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' : 
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                        {loan.Status}
                     </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
