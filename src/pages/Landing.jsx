import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Landmark, Shield, Zap, Globe, ArrowRight, ChevronRight, Activity, TrendingUp, Lock } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="h-screen bg-slate-950 text-slate-100 font-sans selection:bg-primary/30 overflow-hidden relative flex flex-col">
      {/* Background Ambient Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[60rem] h-[60rem] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50rem] h-[50rem] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      
      {/* Navbar */}
      <nav className="relative z-20 flex items-center justify-between px-8 md:px-16 py-6 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-primary to-blue-400 p-2.5 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.4)]">
            <Landmark className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white leading-none">NexusBank</h1>
            <p className="text-[10px] text-primary font-bold uppercase tracking-[0.2em] mt-1 ml-1">Enterprise</p>
          </div>
        </div>

        <button 
          onClick={() => navigate('/login')}
          className="bg-slate-800/80 hover:bg-slate-700 text-white font-semibold py-2.5 px-6 rounded-xl border border-slate-700 transition flex items-center gap-2 text-sm shadow-xl"
        >
          Admin Portal <ArrowRight size={16} />
        </button>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-8 md:px-16 flex-1 flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-8">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Next Generation Banking Core
              </div>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-6 bg-gradient-to-br from-white via-white to-slate-500 bg-clip-text text-transparent">
                Manage Wealth With Absolute Precision.
              </h2>
              <p className="text-lg text-slate-400 mb-6 max-w-xl leading-relaxed">
                NexusBank empowers financial institutions with a frictionless, high-speed administrative dashboard. Manage customer accounts and oversee branches.
              </p>
              <p className="text-lg text-slate-400 mb-10 max-w-xl leading-relaxed">
                Unlock Data-Driven Financial Insights. Instantly analyze spending patterns and predict cash flows with our embedded neural pathways and intelligent banking algorithms.
              </p>
              
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button onClick={() => navigate('/login')} className="bg-primary hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-xl transition flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.4)] hover:-translate-y-1">
                  Enter Admin Console <ChevronRight size={20} />
                </button>
                <button className="bg-slate-900/50 hover:bg-slate-800 text-slate-300 font-bold py-4 px-8 rounded-xl transition border border-slate-700 backdrop-blur-md">
                  View Documentation
                </button>
              </div>
            </motion.div>
          </div>

          {/* Hero Visual Mockup */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-emerald-500/20 rounded-[2.5rem] blur-2xl transform -rotate-6" />
            <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-[2rem] shadow-2xl p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
                 <div className="flex gap-2">
                   <div className="w-3 h-3 rounded-full bg-red-500" />
                   <div className="w-3 h-3 rounded-full bg-yellow-500" />
                   <div className="w-3 h-3 rounded-full bg-green-500" />
                 </div>
                 <div className="text-xs font-mono text-slate-500 bg-slate-950/50 px-3 py-1 rounded-md">secure.nexusbank.com/admin</div>
              </div>
              <div className="space-y-4">
                <div className="h-12 bg-slate-800/50 rounded-xl flex items-center px-4 gap-4 border border-slate-700/30">
                  <Activity size={18} className="text-primary" />
                  <div className="h-2 w-32 bg-slate-700 rounded-full" />
                  <div className="h-2 w-12 bg-emerald-500 rounded-full ml-auto shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                </div>
                <div className="h-24 bg-slate-800/50 rounded-xl border border-slate-700/30 p-4">
                  <div className="flex justify-between mb-4">
                    <div className="h-3 w-20 bg-slate-700 rounded-full" />
                    <div className="h-3 w-16 bg-slate-600 rounded-full" />
                  </div>
                  <div className="h-8 w-40 bg-gradient-to-r from-primary/40 to-transparent rounded-lg" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-32 bg-slate-800/50 rounded-xl border border-slate-700/30" />
                  <div className="h-32 bg-slate-800/50 rounded-xl border border-slate-700/30" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>


    </div>
  );
}
