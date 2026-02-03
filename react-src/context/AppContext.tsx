
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserRole, Task, TaskStatus, Bid } from '../types';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  tasks: Task[];
  users: User[];
  postTask: (task: Omit<Task, 'id' | 'status' | 'bids' | 'progressUpdates'>) => void;
  placeBid: (bid: Omit<Bid, 'id' | 'status'>) => void;
  selectWorker: (taskId: string, bidId: string) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  markWorkerArrival: (taskId: string) => void;
  approveTask: (taskId: string) => void;
  loginAs: (role: UserRole) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Sarah Customer',
    email: 'sarah@example.com',
    role: UserRole.CUSTOMER,
    avatar: 'https://picsum.photos/seed/sarah/200',
    rating: 4.8,
    completedJobs: 12
  },
  {
    id: 'u2',
    name: 'Mike Plumber',
    email: 'mike@example.com',
    role: UserRole.WORKER,
    avatar: 'https://picsum.photos/seed/mike/200',
    rating: 4.9,
    completedJobs: 156,
    isBusy: false,
    skills: ['Plumbing', 'Pipe Repair']
  },
  {
    id: 'u3',
    name: 'Admin Joe',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
    avatar: 'https://picsum.photos/seed/admin/200',
    rating: 5.0,
    completedJobs: 0
  }
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(MOCK_USERS[0]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);

  const loginAs = (role: UserRole) => {
    const user = users.find(u => u.role === role);
    if (user) setCurrentUser(user);
  };

  const postTask = (taskData: any) => {
    const newTask: Task = {
      ...taskData,
      id: Math.random().toString(36).substr(2, 9),
      status: TaskStatus.OPEN,
      bids: [],
      progressUpdates: [],
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const placeBid = (bidData: any) => {
    setTasks(prev => prev.map(task => {
      if (task.id === bidData.taskId) {
        const newBid: Bid = {
          ...bidData,
          id: Math.random().toString(36).substr(2, 9),
          status: 'PENDING'
        };
        return { 
          ...task, 
          bids: [...task.bids, newBid],
          status: task.status === TaskStatus.OPEN ? TaskStatus.RECEIVING_BIDS : task.status
        };
      }
      return task;
    }));
  };

  const selectWorker = (taskId: string, bidId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const bid = task.bids.find(b => b.id === bidId);
    if (!bid) return;

    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          workerId: bid.workerId,
          status: TaskStatus.ASSIGNED,
          bids: t.bids.map(b => ({
            ...b,
            status: b.id === bidId ? 'ACCEPTED' : 'REJECTED'
          }))
        };
      }
      return t;
    }));

    // Mark worker as busy
    setUsers(prev => prev.map(u => u.id === bid.workerId ? { ...u, isBusy: true } : u));
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
  };

  const markWorkerArrival = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { 
      ...t, 
      status: TaskStatus.IN_PROGRESS,
      checkInTime: new Date().toLocaleTimeString() 
    } : t));
  };

  const approveTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.workerId) return;

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: TaskStatus.COMPLETED } : t));
    // Release worker
    setUsers(prev => prev.map(u => u.id === task.workerId ? { ...u, isBusy: false, completedJobs: u.completedJobs + 1 } : u));
  };

  return (
    <AppContext.Provider value={{
      currentUser, setCurrentUser, tasks, users,
      postTask, placeBid, selectWorker, updateTaskStatus, 
      markWorkerArrival, approveTask, loginAs
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
