
import React from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { LayoutGrid, Bell, ChevronDown, LogOut, Home } from 'lucide-react';

const Navbar: React.FC = () => {
  const { currentUser, loginAs, setCurrentUser } = useApp();

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setCurrentUser(null)}>
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
              <LayoutGrid className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              TaskFlow
            </span>
          </div>

          <div className="flex items-center space-x-6">
            {currentUser ? (
              <>
                <div className="hidden md:flex items-center bg-slate-100 rounded-xl px-4 py-2 space-x-2 border border-slate-200">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Role:</span>
                  <select 
                    value={currentUser.role}
                    onChange={(e) => loginAs(e.target.value as UserRole)}
                    className="bg-transparent text-sm font-bold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value={UserRole.CUSTOMER}>Customer</option>
                    <option value={UserRole.WORKER}>Service Expert</option>
                    <option value={UserRole.ADMIN}>Administrator</option>
                  </select>
                </div>

                <div className="flex items-center space-x-4 pl-4 border-l border-slate-100">
                  <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                  </button>
                  
                  <div className="flex items-center space-x-3 group cursor-pointer">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold text-slate-800 leading-none">{currentUser.name}</p>
                      <p className="text-[10px] font-black text-indigo-600 uppercase mt-1 tracking-wider">{currentUser.role}</p>
                    </div>
                    <img 
                      src={currentUser.avatar} 
                      className="w-10 h-10 rounded-xl border-2 border-slate-100 shadow-sm"
                      alt="Profile"
                    />
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </div>
                  
                  <button 
                    onClick={() => setCurrentUser(null)}
                    className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    title="Sign Out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                 <button 
                   onClick={() => loginAs(UserRole.WORKER)}
                   className="hidden sm:block text-sm font-bold text-slate-600 hover:text-indigo-600"
                 >
                   Become a Partner
                 </button>
                 <button 
                   onClick={() => loginAs(UserRole.CUSTOMER)}
                   className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                 >
                   Login
                 </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
