import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0A0E17] text-slate-100 font-sans selection:bg-primary/30">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto relative p-6 md:p-10 scroll-smooth">
        {/* Ambient background glows */}
        <div className="absolute top-[-10%] left-[-5%] w-[40rem] h-[40rem] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
        
        <div className="relative z-10 max-w-[1600px] mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
