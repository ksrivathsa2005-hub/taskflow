
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import TaskCard from '../components/TaskCard';
import { TaskStatus, UserRole } from '../types';
import { CURRENCY } from '../constants';
// Added X to imports
import { Search, Star, Clock, Briefcase, Navigation, CheckCircle2, TrendingUp, DollarSign, X } from 'lucide-react';

const WorkerDashboard: React.FC = () => {
  const { tasks, currentUser, placeBid, markWorkerArrival } = useApp();
  const [biddingOn, setBiddingOn] = useState<any>(null);

  const availableTasks = tasks.filter(t => t.status === TaskStatus.OPEN || t.status === TaskStatus.RECEIVING_BIDS);
  const myActiveTask = tasks.find(t => t.workerId === currentUser?.id && (t.status === TaskStatus.ASSIGNED || t.status === TaskStatus.IN_PROGRESS));
  const myCompletedTasks = tasks.filter(t => t.workerId === currentUser?.id && t.status === TaskStatus.COMPLETED);

  const handleBidSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      taskId: biddingOn.id,
      workerId: currentUser?.id,
      workerName: currentUser?.name,
      workerAvatar: currentUser?.avatar,
      workerRating: currentUser?.rating,
      amount: Number(formData.get('amount')),
      estimatedDays: Number(formData.get('estimatedDays')),
      message: formData.get('message') as string,
    };
    placeBid(data as any);
    setBiddingOn(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
            <div className="h-24 bg-gradient-to-r from-indigo-600 to-blue-600"></div>
            <div className="px-6 pb-8 -mt-12 text-center">
              <img src={currentUser?.avatar} className="w-24 h-24 rounded-[2rem] border-4 border-white mx-auto shadow-xl mb-4 object-cover" />
              <h2 className="text-2xl font-black text-slate-900">{currentUser?.name}</h2>
              <div className="flex items-center justify-center space-x-1 mt-2 mb-6">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="font-black text-slate-800 text-sm">{currentUser?.rating}</span>
                <span className="text-slate-400 text-xs font-bold">({currentUser?.completedJobs} jobs)</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-6">
                 <div className="text-center">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                   <span className={`text-[10px] font-black px-3 py-1 rounded-full ${currentUser?.isBusy ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                    {currentUser?.isBusy ? 'ENGAGED' : 'AVAILABLE'}
                   </span>
                 </div>
                 <div className="text-center">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Earning</p>
                   <span className="text-[10px] font-black px-3 py-1 rounded-full bg-slate-100 text-slate-800">
                    GOLD
                   </span>
                 </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2rem] p-8 text-white">
            <h3 className="text-lg font-black mb-6 flex items-center">
              <TrendingUp className="w-5 h-5 mr-3 text-indigo-400" /> Performance
            </h3>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Completion Rate</p>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full w-[98%]"></div>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Response Time</p>
                <p className="text-xl font-black">~15 Mins</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-12">
          {myActiveTask && (
            <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-200 border border-indigo-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Navigation className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-lg">Active Engagement</span>
                    <h2 className="text-3xl font-black mt-3 leading-tight">{myActiveTask.title}</h2>
                  </div>
                  {myActiveTask.status === TaskStatus.ASSIGNED && (
                    <button 
                      onClick={() => markWorkerArrival(myActiveTask.id)}
                      className="bg-white text-indigo-600 font-black px-8 py-4 rounded-2xl hover:bg-slate-50 transition-all flex items-center shadow-lg active:scale-95"
                    >
                      Check-In at Location
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/10 backdrop-blur-sm p-6 rounded-3xl border border-white/10">
                    <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-2">Location Detail</p>
                    <p className="font-bold">{myActiveTask.location}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm p-6 rounded-3xl border border-white/10">
                    <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-2">Service Fee</p>
                    <p className="font-bold text-2xl">{CURRENCY}{myActiveTask.budgetMax.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <section>
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Open Opportunities</h2>
                <p className="text-slate-500 mt-1 font-medium">New tasks matching your skills.</p>
              </div>
              <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-2 text-slate-400">
                <Search className="w-5 h-5 mr-3" />
                <input placeholder="Filter by area..." className="bg-transparent text-sm font-medium outline-none text-slate-900 w-32" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {availableTasks.length === 0 ? (
                <div className="col-span-full py-32 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-black">Scanning for new tasks near your location...</p>
                </div>
              ) : (
                availableTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    role={UserRole.WORKER} 
                    onBid={currentUser?.isBusy ? undefined : () => setBiddingOn(task)}
                  />
                ))
              )}
            </div>
          </section>

          <section>
             <h2 className="text-2xl font-black text-slate-900 mb-8">Work History</h2>
             <div className="grid grid-cols-1 gap-4">
               {myCompletedTasks.map(task => (
                 <div key={task.id} className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center justify-between hover:shadow-md transition-all group">
                   <div className="flex items-center space-x-5">
                     <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                       <CheckCircle2 className="w-6 h-6" />
                     </div>
                     <div>
                       <h4 className="font-black text-slate-900 leading-none">{task.title}</h4>
                       <p className="text-xs text-slate-400 font-bold mt-2 uppercase tracking-widest">{new Date(task.preferredDate).toLocaleDateString()}</p>
                     </div>
                   </div>
                   <div className="text-right">
                      <span className="text-lg font-black text-slate-900">{CURRENCY}{task.budgetMax.toLocaleString('en-IN')}</span>
                      <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-1">Paid to Wallet</p>
                   </div>
                 </div>
               ))}
             </div>
          </section>
        </div>
      </div>

      {/* Bidding Modal */}
      {biddingOn && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0">
              <h2 className="text-2xl font-black text-slate-900">Prepare Proposal</h2>
              <button onClick={() => setBiddingOn(null)} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 font-bold"><X /></button>
            </div>
            <form onSubmit={handleBidSubmit} className="p-8">
              <div className="mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                 <h4 className="font-black text-slate-700 text-sm mb-1">{biddingOn.title}</h4>
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Client Range: {CURRENCY}{biddingOn.budgetMin} - {CURRENCY}{biddingOn.budgetMax}</p>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Your Quote ({CURRENCY})</label>
                    <input name="amount" type="number" required defaultValue={biddingOn.budgetMax} className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Days to Finish</label>
                    <input name="estimatedDays" type="number" required defaultValue={1} className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pitch to Customer</label>
                  <textarea name="message" rows={4} required placeholder="Why should they choose you?" className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-black transition-all shadow-xl">
                  Submit Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerDashboard;
