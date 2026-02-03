
import React from 'react';
import { Task, TaskStatus, UserRole } from '../types';
import { STATUS_COLORS, CURRENCY } from '../constants';
import { MapPin, Calendar, CreditCard, MessageSquare, ArrowRight } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  role: UserRole;
  onSelect?: () => void;
  onBid?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, role, onSelect, onBid }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-slate-200 transition-all group flex flex-col h-full">
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider border ${STATUS_COLORS[task.status]}`}>
            {task.status.replace('_', ' ')}
          </span>
          <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">ID: {task.id.toUpperCase()}</span>
        </div>

        <h3 className="text-xl font-extrabold text-slate-900 mb-3 leading-tight group-hover:text-indigo-600 transition-colors">
          {task.title}
        </h3>
        <p className="text-slate-500 text-sm line-clamp-2 mb-6 font-medium">
          {task.description}
        </p>

        <div className="grid grid-cols-1 gap-3 mb-6">
          <div className="flex items-center text-slate-600 text-xs font-semibold">
            <div className="w-6 h-6 rounded-md bg-slate-50 flex items-center justify-center mr-3">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
            </div>
            {task.location}
          </div>
          <div className="flex items-center text-slate-600 text-xs font-semibold">
            <div className="w-6 h-6 rounded-md bg-slate-50 flex items-center justify-center mr-3">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
            </div>
            {new Date(task.preferredDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          <div className="flex items-center text-slate-600 text-xs font-semibold">
            <div className="w-6 h-6 rounded-md bg-slate-50 flex items-center justify-center mr-3">
              <CreditCard className="w-3.5 h-3.5 text-slate-400" />
            </div>
            Budget: {CURRENCY}{task.budgetMin.toLocaleString('en-IN')} - {CURRENCY}{task.budgetMax.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between mt-auto">
        <div className="flex items-center text-indigo-600 font-black text-xs uppercase tracking-widest">
          <MessageSquare className="w-4 h-4 mr-2" />
          {task.bids.length} Proposals
        </div>
        
        {role === UserRole.CUSTOMER && (
          <button 
            onClick={onSelect}
            className="flex items-center text-sm font-black text-slate-900 hover:text-indigo-600 transition-colors"
          >
            Review <ArrowRight className="ml-1 w-4 h-4" />
          </button>
        )}

        {role === UserRole.WORKER && task.status === TaskStatus.OPEN && (
           <button 
            onClick={onBid}
            className="text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            Send Bid
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
