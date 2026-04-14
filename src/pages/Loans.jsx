import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, CheckCircle2, XCircle, Clock, Plus, Filter } from 'lucide-react';
import axios from 'axios';

export default function Loans() {
  const [loans, setLoans] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newLoan, setNewLoan] = useState({
    CustomerID: '',
    LoanType: 'Personal',
    PrincipalAmount: '',
    InterestRate: '',
    DurationMonths: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [loansRes, custRes] = await Promise.all([
        axios.get(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/loans`),
        axios.get(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/customers`)
      ]);
      setLoans(loansRes.data);
      setCustomers(custRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const adminData = localStorage.getItem('adminData');
      const adminObj = adminData ? JSON.parse(adminData) : null;
      await axios.put(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/loans/${id}/status`, { 
          status: newStatus,
          adminId: adminObj ? adminObj.AdminID : null
      });
      fetchData();
    } catch (err) {
      alert('Error updating status');
    }
  };

  const handleAddInterest = async (id) => {
    try {
      const adminData = localStorage.getItem('adminData');
      const adminObj = adminData ? JSON.parse(adminData) : null;
      await axios.post(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/loans/${id}/add-interest`, { 
          adminId: adminObj ? adminObj.AdminID : null
      });
      fetchData();
    } catch (err) {
      alert('Error adding interest: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleCreateLoan = async (e) => {
    e.preventDefault();
    if (!newLoan.CustomerID || !newLoan.PrincipalAmount) return alert('Missing required fields');
    try {
      await axios.post(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/loans`, newLoan);
      setNewLoan({ CustomerID: '', LoanType: 'Personal', PrincipalAmount: '', InterestRate: '', DurationMonths: '' });
      setShowAddForm(false);
      fetchData();
    } catch (err) {
      alert('Error creating loan: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-primary animate-spin" />
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved': return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1"><CheckCircle2 size={12} /> Approved</span>;
      case 'Rejected': return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1"><XCircle size={12} /> Rejected</span>;
      case 'Closed': return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-slate-500/10 text-slate-400 border border-slate-500/20 flex items-center gap-1"><Briefcase size={12} /> Closed</span>;
      default: return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1"><Clock size={12} /> Pending</span>;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/60 pb-6">
        <div>
          <motion.h2 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Loan Management
          </motion.h2>
          <motion.p className="text-slate-400 text-sm font-medium">
            Process applications, manage active lending, and track loan portfolios.
          </motion.p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className="bg-primary hover:bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.3)] text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all">
          <Plus size={18} /> New Application
        </button>
      </header>

      {showAddForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 mb-8 shadow-xl backdrop-blur-xl">
          <h3 className="text-lg font-bold text-white mb-4">Register New Loan</h3>
          <form onSubmit={handleCreateLoan} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Customer</label>
              <select required value={newLoan.CustomerID} onChange={e => setNewLoan({ ...newLoan, CustomerID: e.target.value })} className="w-full bg-[#050914] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm focus:border-primary text-white">
                <option value="">Select Customer</option>
                {customers.map(c => <option key={c.CustomerID} value={c.CustomerID}>ID #{c.CustomerID} - {c.FirstName} {c.LastName}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Loan Type</label>
              <select value={newLoan.LoanType} onChange={e => setNewLoan({ ...newLoan, LoanType: e.target.value })} className="w-full bg-[#050914] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm focus:border-primary text-white">
                <option value="Personal">Personal</option>
                <option value="Home">Home</option>
                <option value="Education">Education</option>
                <option value="Car">Car</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Principal ($)</label>
              <input required type="number" value={newLoan.PrincipalAmount} onChange={e => setNewLoan({ ...newLoan, PrincipalAmount: e.target.value })} placeholder="e.g. 50000" className="w-full bg-[#050914] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm focus:border-primary text-white" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Interest Rate (%)</label>
              <input required type="number" step="0.1" value={newLoan.InterestRate} onChange={e => setNewLoan({ ...newLoan, InterestRate: e.target.value })} placeholder="e.g. 8.5" className="w-full bg-[#050914] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm focus:border-primary text-white" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Duration (Months)</label>
              <input required type="number" value={newLoan.DurationMonths} onChange={e => setNewLoan({ ...newLoan, DurationMonths: e.target.value })} placeholder="12" className="w-full bg-[#050914] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm focus:border-primary text-white" />
            </div>
            <div className="lg:col-span-5 flex justify-end mt-2">
              <button type="submit" className="bg-primary hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)]">Submit Application</button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-2xl flex flex-col shadow-xl">
        <div className="mx-6 mt-6 pb-4 border-b border-slate-800/60 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white tracking-wide">Loan Registry</h3>
          <button className="text-slate-400 hover:text-white transition p-2 rounded-lg bg-slate-800/50">
            <Filter size={18} />
          </button>
        </div>

        <div className="overflow-x-auto p-2">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-xs uppercase tracking-wider font-semibold bg-slate-800/30">
                <th className="py-4 px-6 rounded-tl-xl">ID</th>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Type & Terms</th>
                <th className="py-4 px-6">Principal</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 rounded-tr-xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loans.length === 0 && (
                <tr><td colSpan="6" className="text-center py-12 text-slate-500">No loans registered yet.</td></tr>
              )}
              {loans.map((loan) => {
                const r = loan.InterestRate / 100 / 12;
                const n = loan.DurationMonths;
                const emi = (loan.PrincipalAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
                const totalLoans = loans.filter(l => l.CustomerID === loan.CustomerID).length;

                return (
                  <tr key={loan.LoanID} className="border-b border-slate-800/40 hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs text-slate-400">#{loan.LoanID}</td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-white">{loan.FirstName} {loan.LastName}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Loan ID: {loan.LoanID} • Total Loans Taken: {totalLoans}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-200">{loan.LoanType}</div>
                      <div className="text-[11px] text-slate-500">{loan.InterestRate}% APR • {loan.DurationMonths} Months</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-white font-mono tracking-tighter text-lg">
                        ${parseFloat(loan.PrincipalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[11px] text-primary font-bold mt-0.5 whitespace-nowrap">
                        EMI: ${emi.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} /mo
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(loan.Status)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {loan.Status === 'Pending' && (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleUpdateStatus(loan.LoanID, 'Approved')} className="text-[11px] font-bold px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition border border-emerald-500/20">Approve</button>
                          <button onClick={() => handleUpdateStatus(loan.LoanID, 'Rejected')} className="text-[11px] font-bold px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition border border-red-500/20">Reject</button>
                        </div>
                      )}
                      {loan.Status === 'Approved' && (
                        <div className="flex flex-col gap-1.5 items-end ml-auto w-32">
                          <button onClick={() => handleAddInterest(loan.LoanID)} className="text-[11px] font-bold px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition border border-indigo-500/20 w-full truncate">+ Apply Interest</button>
                          <button onClick={() => handleUpdateStatus(loan.LoanID, 'Closed')} className="text-[11px] font-bold px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition border border-slate-700 w-full">Mark Closed</button>
                        </div>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
