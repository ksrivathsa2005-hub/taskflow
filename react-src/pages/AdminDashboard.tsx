
import React from 'react';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Briefcase, DollarSign, AlertCircle, TrendingUp, CheckCircle, ShieldAlert } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { tasks, users } = useApp();

  const stats = [
    { label: 'Active Users', value: users.length, icon: <Users />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Tasks', value: tasks.length, icon: <Briefcase />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Platform Revenue', value: `$${(tasks.filter(t => t.status === 'COMPLETED').length * 45).toLocaleString()}`, icon: <DollarSign />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Open Disputes', value: 0, icon: <AlertCircle />, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  const categoryData = [
    { name: 'Plumbing', value: tasks.filter(t => t.category === 'plumbing').length },
    { name: 'Electrical', value: tasks.filter(t => t.category === 'electrical').length },
    { name: 'Cleaning', value: tasks.filter(t => t.category === 'cleaning').length },
    { name: 'Other', value: tasks.filter(t => t.category === 'other').length },
  ].filter(d => d.value > 0);

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">Platform Overview</h1>
        <p className="text-slate-500 mt-1">Real-time analytics and management tools.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              {React.cloneElement(stat.icon as React.ReactElement, { className: 'w-6 h-6' })}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 flex items-center">
               <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" /> Task Category Distribution
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <h3 className="font-bold text-slate-800 mb-6">System Health</h3>
           <div className="space-y-6">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mr-3" />
                  <span className="text-sm font-bold text-slate-700">API Gateway</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">STABLE</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center">
                  <ShieldAlert className="w-5 h-5 text-amber-500 mr-3" />
                  <span className="text-sm font-bold text-slate-700">Payment Engine</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">STABLE</span>
              </div>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800">Recent Platform Activity</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white">
                <th className="px-6 py-4">Task ID</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Value</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks.map(task => (
                <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-xs font-medium text-slate-400">#{task.id}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-800">{task.title}</td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md border border-indigo-200 text-indigo-700 bg-indigo-50">
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">${task.budgetMax}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-indigo-600 hover:text-indigo-800 font-bold text-sm">Review</button>
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400 italic">No activity logged in the system.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
