
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import TaskCard from '../components/TaskCard';
import { TaskStatus, UserRole } from '../types';
import { Plus, Search, Filter, X, Upload, Star, ChevronRight, CheckCircle } from 'lucide-react';
import { CATEGORIES, CURRENCY } from '../constants';

const CustomerDashboard: React.FC = () => {
  const { tasks, currentUser, postTask, selectWorker, approveTask } = useApp();
  const [isPostingTask, setIsPostingTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const customerTasks = tasks.filter(t => t.customerId === currentUser?.id);

  const handleSubmitTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      location: formData.get('location') as string,
      budgetMin: Number(formData.get('budgetMin')),
      budgetMax: Number(formData.get('budgetMax')),
      preferredDate: formData.get('date') as string,
      customerId: currentUser?.id,
      photos: []
    };
    postTask(data as any);
    setIsPostingTask(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Project Dashboard</h1>
          <p className="text-slate-500 mt-2 font-medium">Hello, {currentUser?.name}. You have {customerTasks.length} active service requests.</p>
        </div>
        <button 
          onClick={() => setIsPostingTask(true)}
          className="flex items-center justify-center bg-indigo-600 text-white font-black py-4 px-8 rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 group"
        >
          <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
          Create New Request
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {customerTasks.length === 0 ? (
          <div className="col-span-full py-32 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
            <div className="bg-white w-20 h-20 rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6">
              <Search className="text-indigo-500 w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">No requests found</h3>
            <p className="text-slate-500 max-w-sm mx-auto mt-3 font-medium">Post your first task to connect with Indian's top service experts.</p>
            <button 
              onClick={() => setIsPostingTask(true)}
              className="mt-8 text-indigo-600 font-bold flex items-center mx-auto hover:underline"
            >
              Start now <ChevronRight className="ml-1 w-4 h-4" />
            </button>
          </div>
        ) : (
          customerTasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              role={UserRole.CUSTOMER} 
              onSelect={() => setSelectedTask(task)} 
            />
          ))
        )}
      </div>

      {/* Post Task Modal */}
      {isPostingTask && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Post a Request</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Get custom bids from experts</p>
              </div>
              <button onClick={() => setIsPostingTask(false)} className="bg-slate-50 p-2 rounded-xl text-slate-400 hover:text-slate-600"><X /></button>
            </div>
            <form onSubmit={handleSubmitTask} className="p-8 overflow-y-auto max-h-[80vh]">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Short Title</label>
                  <input name="title" required placeholder="e.g. AC Installation in living room" className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-medium" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                    <select name="category" className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-100 outline-none font-medium">
                      {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Service Date</label>
                    <input type="date" name="date" required className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-100 outline-none font-medium" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Job Description</label>
                  <textarea name="description" rows={3} required placeholder="Detailed requirements..." className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-100 outline-none font-medium" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Location (e.g. South Delhi, Powai)</label>
                  <input name="location" required placeholder="Full service address" className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-100 outline-none font-medium" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Min Budget ({CURRENCY})</label>
                    <input type="number" name="budgetMin" required className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-100 outline-none font-medium" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Max Budget ({CURRENCY})</label>
                    <input type="number" name="budgetMax" required className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-100 outline-none font-medium" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-black transition-all mt-4 shadow-xl">
                  Launch Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-10 py-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <h2 className="text-2xl font-black text-slate-900">{selectedTask.title}</h2>
              <button onClick={() => setSelectedTask(null)} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"><X /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-1 space-y-8">
                  <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Requirement Brief</h3>
                    <p className="text-slate-600 leading-relaxed font-medium">{selectedTask.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                     <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Estimated Budget</span>
                        <span className="text-xl font-black text-slate-900">{CURRENCY}{selectedTask.budgetMin} - {CURRENCY}{selectedTask.budgetMax}</span>
                     </div>
                     <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Project Status</span>
                        <span className="text-sm font-black text-indigo-600 uppercase tracking-wider">{selectedTask.status}</span>
                     </div>
                  </div>

                  {selectedTask.status === TaskStatus.COMPLETED && (
                    <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                      <div className="flex items-center text-emerald-700 mb-2">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <span className="font-black text-sm uppercase tracking-wider">Payment Released</span>
                      </div>
                      <p className="text-xs font-medium text-emerald-600 leading-relaxed">Service completed successfully and funds transferred to expert.</p>
                    </div>
                  )}

                  {selectedTask.status === TaskStatus.IN_PROGRESS && (
                    <div className="bg-indigo-600 p-6 rounded-3xl text-white shadow-xl shadow-indigo-100">
                      <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-4">Milestone Active</p>
                      <p className="text-lg font-bold mb-6">Partner on-site since {selectedTask.checkInTime}</p>
                      <button 
                        onClick={() => {
                           approveTask(selectedTask.id);
                           setSelectedTask(null);
                        }}
                        className="w-full bg-white text-indigo-600 font-black py-4 rounded-xl hover:bg-slate-50 transition-all shadow-lg"
                      >
                        Release {CURRENCY}{selectedTask.budgetMax}
                      </button>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-slate-900 flex items-center">
                      Expert Proposals <span className="ml-3 px-3 py-1 bg-slate-100 rounded-lg text-xs text-slate-500">{selectedTask.bids.length}</span>
                    </h3>
                  </div>
                  
                  {selectedTask.bids.length === 0 ? (
                    <div className="bg-slate-50 rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
                       <p className="text-slate-400 font-bold">Proposals will appear here as experts respond to your request.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {selectedTask.bids.map((bid: any) => (
                        <div key={bid.id} className={`group relative bg-white border rounded-[2rem] p-8 transition-all ${bid.status === 'ACCEPTED' ? 'ring-2 ring-indigo-500 bg-indigo-50/10' : 'border-slate-100 hover:shadow-xl hover:shadow-slate-100'}`}>
                          <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                            <div className="flex items-center space-x-4">
                              <img src={bid.workerAvatar} className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
                              <div>
                                <h4 className="font-black text-slate-900 text-lg">{bid.workerName}</h4>
                                <div className="flex items-center text-sm font-bold mt-1">
                                  <Star className="w-4 h-4 fill-amber-500 text-amber-500 mr-1.5" />
                                  <span className="text-slate-700">{bid.workerRating}</span>
                                  <span className="mx-2 text-slate-300">•</span>
                                  <span className="text-indigo-600 uppercase tracking-widest text-[10px]">Verified Pro</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Proposed Quote</p>
                              <span className="text-3xl font-black text-slate-900">{CURRENCY}{bid.amount.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                          <div className="mt-6 p-5 bg-slate-50 rounded-2xl text-slate-600 text-sm font-medium leading-relaxed italic">
                            "{bid.message}"
                          </div>
                          
                          <div className="mt-6 flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. {bid.estimatedDays} Days Completion</span>
                            {selectedTask.status === TaskStatus.RECEIVING_BIDS && (
                              <button 
                                onClick={() => selectWorker(selectedTask.id, bid.id)}
                                className="bg-slate-900 text-white text-sm font-black px-8 py-3 rounded-xl hover:bg-black transition-all shadow-lg shadow-slate-200"
                              >
                                Accept & Hire
                              </button>
                            )}
                            {bid.status === 'ACCEPTED' && (
                              <div className="flex items-center text-indigo-600 font-black text-sm uppercase tracking-widest">
                                <CheckCircle className="w-4 h-4 mr-2" /> Hired Partner
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
