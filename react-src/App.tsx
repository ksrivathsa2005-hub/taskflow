
import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { UserRole } from './types';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import CustomerDashboard from './pages/CustomerDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import AdminDashboard from './pages/AdminDashboard';

const DashboardRouter: React.FC = () => {
  const { currentUser } = useApp();

  if (!currentUser) return <LandingPage />;

  switch (currentUser.role) {
    case UserRole.CUSTOMER:
      return <CustomerDashboard />;
    case UserRole.WORKER:
      return <WorkerDashboard />;
    case UserRole.ADMIN:
      return <AdminDashboard />;
    default:
      return <LandingPage />;
  }
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
        <Navbar />
        <main className="flex-grow">
          <DashboardRouter />
        </main>
        <footer className="bg-slate-900 border-t border-slate-800 py-16 text-white mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
              <div className="col-span-1 md:col-span-2">
                <h2 className="text-2xl font-black mb-6">TaskFlow</h2>
                <p className="text-slate-400 max-w-sm leading-relaxed">
                  India's leading professional service marketplace connecting experts with those who need them. Trust, quality, and transparency in every task.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-6 text-sm uppercase tracking-widest text-slate-500">Platform</h3>
                <ul className="space-y-4 text-slate-300 text-sm font-medium">
                  <li className="hover:text-white cursor-pointer transition-colors">Find an Expert</li>
                  <li className="hover:text-white cursor-pointer transition-colors">Become a Partner</li>
                  <li className="hover:text-white cursor-pointer transition-colors">Pricing</li>
                  <li className="hover:text-white cursor-pointer transition-colors">Success Stories</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-6 text-sm uppercase tracking-widest text-slate-500">Support</h3>
                <ul className="space-y-4 text-slate-300 text-sm font-medium">
                  <li className="hover:text-white cursor-pointer transition-colors">Help Center</li>
                  <li className="hover:text-white cursor-pointer transition-colors">Trust & Safety</li>
                  <li className="hover:text-white cursor-pointer transition-colors">Terms of Service</li>
                  <li className="hover:text-white cursor-pointer transition-colors">Privacy Policy</li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">© 2024 TaskFlow Marketplace India Pvt Ltd.</p>
              <div className="flex space-x-6 text-slate-400">
                 {/* Social links placeholder */}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </AppProvider>
  );
};

export default App;
