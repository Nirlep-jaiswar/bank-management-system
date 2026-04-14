import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Wallet, Shield, Building, X } from 'lucide-react';
import axios from 'axios';

export default function Accounts() {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ CustomerID: '', AccountType: 'Savings', Balance: '' });

  const fetchAccounts = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/accounts`);
      setAccounts(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/customers`);
      setCustomers(res.data);
      if (res.data.length > 0) {
        setFormData(prev => ({ ...prev, CustomerID: res.data[0].CustomerID }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchCustomers();
  }, []);

  const handleAddAccount = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/accounts`, {
         CustomerID: formData.CustomerID,
         AccountType: formData.AccountType,
         Balance: parseFloat(formData.Balance) || 0
      });
      setIsModalOpen(false);
      setFormData({ CustomerID: customers[0]?.CustomerID || '', AccountType: 'Savings', Balance: '' });
      fetchAccounts();
    } catch (error) {
      console.error(error);
      alert('Error creating account! Check console.');
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
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1 text-white">Accounts Registry</h2>
          <p className="text-slate-400 text-sm">Manage customer accounts, balances, and status.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-5 py-2.5 bg-primary hover:bg-blue-600 text-white font-medium rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] active:scale-95">
           <Plus size={18} /> Open Account
        </button>
      </header>

      {/* Accounts Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl overflow-hidden min-h-[400px]"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-800/30 text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-700/50">
                <th className="py-4 px-6 md:pl-8">Account ID</th>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Type</th>
                <th className="py-4 px-6 hidden sm:table-cell">Branch</th>
                <th className="py-4 px-6 md:pr-8">Status</th>
                <th className="py-4 px-6 text-right md:pr-8">Balance</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {accounts.length === 0 && (
                 <tr><td colSpan="6" className="text-center py-12 text-slate-500">No active accounts found. Open an account above!</td></tr>
              )}
              {accounts.map((acc) => (
                <tr key={acc.AccountID} className="border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors last:border-0 group cursor-pointer">
                  <td className="py-4 px-6 md:pl-8 font-mono text-xs font-bold text-primary group-hover:text-blue-400 transition-colors">
                    ACCT-{acc.AccountID}
                  </td>
                  <td className="py-4 px-6 font-semibold text-slate-200">
                    {acc.FirstName} {acc.LastName}
                  </td>
                  <td className="py-4 px-6">
                    <span className="bg-slate-800 px-3 py-1 rounded-full text-xs font-medium text-slate-300 border border-slate-700">
                      {acc.AccountType}
                    </span>
                  </td>
                  <td className="py-4 px-6 hidden sm:table-cell text-slate-400 text-xs">
                    {acc.BranchName || 'Main Branch'}
                  </td>
                  <td className="py-4 px-6 md:pr-8">
                    <span className={`inline-flex flex-row items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider
                      ${acc.Status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        acc.Status === 'Inactive' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                        'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${acc.Status === 'Active' ? 'bg-emerald-400' : acc.Status === 'Inactive' ? 'bg-amber-400' : 'bg-red-500'}`}></span>
                      {acc.Status}
                    </span>
                  </td>
                  <td className="py-4 px-6 md:pr-8 text-right font-bold tracking-tight text-base text-white">
                    ${acc.Balance}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Open Account Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-800">
                 <h3 className="text-xl font-bold text-white">Open New Account</h3>
                 <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition"><X size={20} /></button>
              </div>
              <form onSubmit={handleAddAccount} className="p-6 space-y-4">
                 <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Customer Name</label>
                    <select required className="w-full bg-slate-800/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white transition-all appearance-none cursor-pointer"
                            value={formData.CustomerID} onChange={e => setFormData({...formData, CustomerID: e.target.value})}>
                        {customers.map(c => (
                           <option key={c.CustomerID} value={c.CustomerID}>{c.FirstName} {c.LastName}</option>
                        ))}
                    </select>
                 </div>
                 <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Account Type</label>
                    <select className="w-full bg-slate-800/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white transition-all appearance-none cursor-pointer"
                            value={formData.AccountType} onChange={e => setFormData({...formData, AccountType: e.target.value})}>
                        <option value="Savings">Savings</option>
                        <option value="Current">Current</option>
                        <option value="Salary">Salary</option>
                    </select>
                 </div>
                 <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Initial Deposit ($)</label>
                    <input required type="number" step="0.01" className="w-full bg-slate-800/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white transition-all" value={formData.Balance} onChange={e => setFormData({...formData, Balance: e.target.value})} placeholder="100.00" />
                 </div>
                 <div className="bg-slate-800/40 p-4 rounded-xl mt-4 border border-slate-700/50">
                    <p className="text-xs text-slate-400 leading-relaxed">
                       Note: A new 12-digit Account ID will be automatically generated and linked to the selected customer.
                    </p>
                 </div>
                 <div className="pt-4 mt-6 border-t border-slate-800 flex justify-end gap-3">
                    <button type="submit" className="w-full py-2.5 bg-primary hover:bg-blue-600 text-white font-medium rounded-xl transition shadow-[0_0_15px_rgba(59,130,246,0.3)] active:scale-[0.98]">
                      Create Account
                    </button>
                 </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
