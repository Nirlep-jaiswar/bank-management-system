import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, ArrowDownCircle, ArrowUpCircle, ArrowRightLeft, Calendar } from 'lucide-react';
import axios from 'axios';

export default function Transactions() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/transactions`);
        setTransactions(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 w-16 h-16 rounded-full border-4 border-slate-800 border-t-secondary animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1 text-white">Transaction History</h2>
          <p className="text-slate-400 text-sm">Monitor all incoming and outgoing funds across the network.</p>
        </div>
      </header>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10"><ArrowDownCircle size={64} className="text-secondary" /></div>
           <p className="text-slate-400 text-sm font-medium mb-1">Total Inflow (Today)</p>
           <p className="text-2xl font-bold text-white mb-2">+$124,500.00</p>
        </div>
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10"><ArrowUpCircle size={64} className="text-orange-400" /></div>
           <p className="text-slate-400 text-sm font-medium mb-1">Total Outflow (Today)</p>
           <p className="text-2xl font-bold text-white mb-2">-$48,230.00</p>
        </div>
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10"><ArrowRightLeft size={64} className="text-primary" /></div>
           <p className="text-slate-400 text-sm font-medium mb-1">Transactions Count</p>
           <p className="text-2xl font-bold text-white mb-2">{transactions.length}</p>
        </div>
      </div>

      {/* Transactions Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl overflow-hidden min-h-[400px]"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-800/30 text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-700/50">
                <th className="py-4 px-6 md:pl-8">Reference ID</th>
                <th className="py-4 px-6 text-center">Type</th>
                <th className="py-4 px-6">Account ID & Name</th>
                <th className="py-4 px-6">Date & Time</th>
                <th className="py-4 px-6 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {transactions.length === 0 && (
                 <tr><td colSpan="5" className="text-center py-12 text-slate-500">No transactions recorded.</td></tr>
              )}
              {transactions.map((tx) => (
                <tr key={tx.TransactionID} className="border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors last:border-0 group cursor-pointer">
                  <td className="py-4 px-6 md:pl-8 font-mono text-xs text-primary group-hover:text-blue-400 transition-colors">
                    TXN-{tx.TransactionID}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="inline-flex p-2 rounded-full border border-slate-700/50 bg-slate-800/50 text-slate-300">
                      {tx.TransactionType === 'Deposit' && <ArrowDownCircle size={18} className="text-secondary" />}
                      {tx.TransactionType === 'Withdrawal' && <ArrowUpCircle size={18} className="text-orange-400" />}
                      {tx.TransactionType === 'Transfer' && <ArrowRightLeft size={18} className="text-primary" />}
                    </div>
                  </td>
                  <td className="py-4 px-6 font-semibold text-slate-200">
                    <div>ACCT-{tx.AccountID}</div>
                    <div className="text-xs text-slate-400 font-normal mt-0.5">{tx.FirstName} {tx.LastName}</div>
                  </td>
                  <td className="py-4 px-6 text-slate-400 font-medium text-xs">
                    {new Date(tx.TransactionDate).toLocaleString()}
                  </td>
                  <td className={`py-4 px-6 text-right font-bold tracking-tight text-base ${tx.TransactionType === 'Deposit' ? 'text-secondary' : 'text-white'}`}>
                    {tx.TransactionType === 'Deposit' ? '+' : '-'}${tx.Amount}
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
