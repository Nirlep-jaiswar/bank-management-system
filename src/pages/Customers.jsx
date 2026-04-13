import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Filter, MoreVertical, Edit2, Trash2, Mail, Phone, MapPin, X } from 'lucide-react';
import axios from 'axios';

export default function Customers() {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    FirstName: '', LastName: '', Email: '', Phone: '', Address: '', DateOfBirth: ''
  });

  const fetchCustomers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/customers');
      setCustomers(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/customers', formData);
      setIsModalOpen(false);
      setFormData({ FirstName: '', LastName: '', Email: '', Phone: '', Address: '', DateOfBirth: '' });
      fetchCustomers();
    } catch (error) {
      console.error(error);
      alert('Error adding customer! Check console.');
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this customer and all their associated accounts and transactions?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/customers/${id}`);
      fetchCustomers();
    } catch (error) {
      console.error(error);
      alert('Error deleting customer! Check console.');
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
          <h2 className="text-3xl font-bold tracking-tight mb-1 text-white">Customers Management</h2>
          <p className="text-slate-400 text-sm">View, manage, and add new banking customers.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-5 py-2.5 bg-primary hover:bg-blue-600 text-white font-medium rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] active:scale-95">
           <Plus size={18} /> Add Customer
        </button>
      </header>

      {/* Toolbar */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between shadow-lg">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by name, email, or ID..." 
            className="w-full bg-slate-800/50 border border-slate-700/80 rounded-xl pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white transition-all placeholder-slate-500"
          />
        </div>
      </div>

      {/* Customers Table View */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl overflow-hidden min-h-[400px]"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/30 text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-700/50">
                <th className="py-4 px-6 md:pl-8">Customer Detail</th>
                <th className="py-4 px-6">Contact Info</th>
                <th className="py-4 px-6 hidden md:table-cell">Location</th>
                <th className="py-4 px-6 hidden lg:table-cell">Joined</th>
                <th className="py-4 px-6 text-right md:pr-8">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {customers.length === 0 && (
                 <tr><td colSpan="5" className="text-center py-12 text-slate-500">No real customers found. Add finding above!</td></tr>
              )}
              {customers.map((cust) => (
                <tr key={cust.CustomerID} className="border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors last:border-0 group">
                  <td className="py-4 px-6 md:pl-8">
                    <div className="flex items-center gap-4">
                      {/* Avatar placeholder */}
                      <div className="hidden sm:flex w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-800 items-center justify-center text-white font-bold text-sm shadow-md uppercase">
                        {cust.FirstName[0]}{cust.LastName[0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-200 text-base">{cust.FirstName} {cust.LastName}</div>
                        <div className="font-mono text-xs text-slate-500 mt-0.5">ID: {cust.CustomerID}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-1.5">
                      <span className="flex items-center gap-2 text-slate-300 text-xs"><Mail size={12} className="text-slate-500" /> {cust.Email}</span>
                      <span className="flex items-center gap-2 text-slate-300 text-xs"><Phone size={12} className="text-slate-500" /> {cust.Phone}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 hidden md:table-cell">
                    <span className="flex items-center gap-2 text-slate-400 text-xs"><MapPin size={12} /> {cust.Address || 'N/A'}</span>
                  </td>
                  <td className="py-4 px-6 hidden lg:table-cell text-slate-400 text-xs font-medium">
                    {new Date(cust.CreatedAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 md:pr-8 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDeleteCustomer(cust.CustomerID)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add Customer Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-800">
                 <h3 className="text-xl font-bold text-white">Add New Customer</h3>
                 <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition"><X size={20} /></button>
              </div>
              <form onSubmit={handleAddCustomer} className="p-6 space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">First Name</label>
                      <input required type="text" className="w-full bg-slate-800/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white transition-all" value={formData.FirstName} onChange={e => setFormData({...formData, FirstName: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Last Name</label>
                      <input required type="text" className="w-full bg-slate-800/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white transition-all" value={formData.LastName} onChange={e => setFormData({...formData, LastName: e.target.value})} />
                    </div>
                 </div>
                 <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Email</label>
                    <input required type="email" className="w-full bg-slate-800/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white transition-all" value={formData.Email} onChange={e => setFormData({...formData, Email: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Phone</label>
                      <input required type="text" className="w-full bg-slate-800/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white transition-all" value={formData.Phone} onChange={e => setFormData({...formData, Phone: e.target.value})} />
                   </div>
                   <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Date of Birth</label>
                      <input required type="date" className="w-full bg-slate-800/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white transition-all" value={formData.DateOfBirth} onChange={e => setFormData({...formData, DateOfBirth: e.target.value})} />
                   </div>
                 </div>
                 <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Address</label>
                    <input required type="text" className="w-full bg-slate-800/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white transition-all" value={formData.Address} onChange={e => setFormData({...formData, Address: e.target.value})} />
                 </div>
                 <div className="pt-4 mt-6 border-t border-slate-800 flex justify-end gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-400 hover:text-white font-medium rounded-xl transition text-sm">Cancel</button>
                    <button type="submit" className="px-6 py-2.5 bg-primary hover:bg-blue-600 text-white font-medium rounded-xl transition shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] active:scale-[0.98]">Create Customer</button>
                 </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
