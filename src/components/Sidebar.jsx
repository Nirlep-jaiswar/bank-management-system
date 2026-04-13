import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Users, CreditCard, Landmark, Settings, LogOut, Wallet, Shield, Activity, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Sidebar() {
  const navigate = useNavigate();
  const adminObj = JSON.parse(localStorage.getItem('adminData') || '{}');
  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminData');
    navigate('/login');
  };
  
  let navItems = [];

  if (adminObj.Role === 'Super Admin') {
    navItems = [
      { icon: <Shield size={20} />, label: "Central Vault", path: "/dashboard/superadmin" },
      { icon: <Activity size={20} />, label: "Reports", path: "/dashboard/reports" },
      { icon: <Settings size={20} />, label: "Settings", path: "/dashboard/settings" }
    ];
  } else {
    navItems = [
      { icon: <Home size={20} />, label: "Dashboard", path: "/dashboard" },
      { icon: <Users size={20} />, label: "Customers", path: "/dashboard/customers" },
      { icon: <Wallet size={20} />, label: "Accounts", path: "/dashboard/accounts" },
      { icon: <CreditCard size={20} />, label: "Transactions", path: "/dashboard/transactions" },
      { icon: <Briefcase size={20} />, label: "Loans", path: "/dashboard/loans" },
      { icon: <Settings size={20} />, label: "Settings", path: "/dashboard/settings" }
    ];
  }

  return (
    <aside className="w-64 border-r border-slate-800 p-6 flex flex-col h-full bg-slate-900/40 backdrop-blur-xl z-20 shadow-2xl">
      <div className="flex items-center gap-3 mb-10 text-primary cursor-pointer hover:opacity-80 transition-opacity">
        <div className="bg-primary/20 p-2 rounded-xl border border-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
          <Landmark className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white leading-tight">NexusBank</h1>
          <p className="text-xs text-primary/80 font-medium font-mono uppercase tracking-widest mt-1">Admin</p>
        </div>
      </div>
      
      <nav className="flex-1 space-y-3">
        {navItems.map((item, i) => (
          <NavLink 
            key={i} 
            to={item.path}
            className={({isActive}) => `flex items-center gap-4 p-3 rounded-xl transition-all duration-300 relative group ${isActive ? 'text-white bg-slate-800/80 shadow-lg border border-slate-700/50' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'}`}
          >
            {({isActive}) => (
              <>
                {isActive && (
                  <motion.div layoutId="active-nav" className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                )}
                <div className={`${isActive ? 'text-primary' : 'text-slate-500 group-hover:text-primary transition-colors'}`}>
                  {item.icon}
                </div>
                <span className={`font-medium ${isActive ? 'tracking-wide' : ''} transition-all`}>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-8 border-t border-slate-800 pt-6">
        <button onClick={handleLogout} className="flex w-full items-center gap-4 p-3 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors font-medium">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
