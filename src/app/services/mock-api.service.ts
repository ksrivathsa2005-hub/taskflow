import { Injectable } from '@angular/core';
import { User, UserRole, Task, TaskStatus, Bid, UserStatus, Review, Dispute, DisputeStatus, Address, ProgressUpdate } from '../types';

@Injectable({
    providedIn: 'root'
})
export class MockApiService {
    private MOCK_USERS: User[] = [
        {
            id: 'u1',
            name: 'Sarah Customer',
            email: 'sarah@example.com',
            role: UserRole.CUSTOMER,
            avatar: 'https://picsum.photos/seed/sarah/200',
            rating: 4.8,
            completedJobs: 12,
            status: UserStatus.ACTIVE,
            phone: '+91-9876543210',
            createdDate: '2025-01-01'
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
            skills: ['Plumbing', 'Pipe Repair'],
            status: UserStatus.ACTIVE,
            phone: '+91-9876543211',
            createdDate: '2024-06-15'
        },
        {
            id: 'u3',
            name: 'Admin Joe',
            email: 'admin@example.com',
            role: UserRole.ADMIN,
            avatar: 'https://picsum.photos/seed/admin/200',
            rating: 5.0,
            completedJobs: 0,
            status: UserStatus.ACTIVE,
            createdDate: '2024-01-01'
        },
        {
            id: 'u4',
            name: 'John Electrician',
            email: 'john@example.com',
            role: UserRole.WORKER,
            avatar: 'https://picsum.photos/seed/john/200',
            rating: 4.7,
            completedJobs: 89,
            isBusy: false,
            skills: ['Electrical', 'Wiring', 'Installation'],
            status: UserStatus.ACTIVE,
            phone: '+91-9876543212',
            createdDate: '2024-07-20'
        }
    ];

    private mockTasks: Task[] = [];
    private mockDisputes: Dispute[] = [];

    constructor() {
        this.initializeMockTasks();
    }

    private initializeMockTasks() {
        const delhiAddress: Address = {
            state: 'Delhi',
            city: 'South Delhi',
            area: 'Powai',
            fullAddress: '123 Main Street, Powai, South Delhi, Delhi 110057'
        };

        const mumbaiAddress: Address = {
            state: 'Maharashtra',
            city: 'Mumbai',
            area: 'Bandra',
            fullAddress: '456 Oak Avenue, Bandra, Mumbai, Maharashtra 400050'
        };

        this.mockTasks = [
            {
                id: 'task_1',
                title: 'Fix Leaky Pipe',
                description: 'There is a water leak under the bathroom sink that needs urgent repair.',
                category: 'Plumbing',
                location: delhiAddress,
                customerId: 'u1',
                status: TaskStatus.POSTED,
                budgetMin: 500,
                budgetMax: 2000,
                preferredDate: '2026-02-10',
                photos: ['https://picsum.photos/seed/leak1/400'],
                bids: [],
                progressUpdates: [],
                reviews: [],
                createdDate: '2026-02-03',
                adminReviewNotes: 'Pending admin approval'
            },
            {
                id: 'task_2',
                title: 'Electrical Wiring Installation',
                description: 'Need to install new electrical wiring in 3 rooms with proper earthing.',
                category: 'Electrical',
                location: mumbaiAddress,
                customerId: 'u1',
                status: TaskStatus.POSTED,
                budgetMin: 3000,
                budgetMax: 8000,
                preferredDate: '2026-02-15',
                photos: [],
                bids: [],
                progressUpdates: [],
                reviews: [],
                createdDate: '2026-02-02'
            }
        ];
    }

    // User Operations
    getAllUsers(): User[] {
        return [...this.MOCK_USERS];
    }

    getUserById(id: string): User | undefined {
        return this.MOCK_USERS.find(u => u.id === id);
    }

    getUsersByRole(role: UserRole): User[] {
        return this.MOCK_USERS.filter(u => u.role === role);
    }

    createUser(userData: Partial<User>): User {
        const newUser: User = {
            id: 'u' + Date.now(),
            name: userData.name || 'New User',
            email: userData.email || '',
            role: userData.role || UserRole.WORKER,
            avatar: userData.avatar || 'https://picsum.photos/seed/user/200',
            rating: 0,
            completedJobs: 0,
            status: UserStatus.UNVERIFIED,
            skills: userData.skills,
            phone: userData.phone,
            createdDate: new Date().toISOString()
        };

        this.MOCK_USERS.push(newUser);
        return newUser;
    }

    updateUser(id: string, updates: Partial<User>): User | undefined {
        const userIndex = this.MOCK_USERS.findIndex(u => u.id === id);
        if (userIndex === -1) return undefined;

        this.MOCK_USERS[userIndex] = { ...this.MOCK_USERS[userIndex], ...updates };
        return this.MOCK_USERS[userIndex];
    }

    suspendUser(id: string): User | undefined {
        return this.updateUser(id, { status: UserStatus.SUSPENDED });
    }

    activateUser(id: string): User | undefined {
        return this.updateUser(id, { status: UserStatus.ACTIVE });
    }

    verifyUser(id: string): User | undefined {
        return this.updateUser(id, { status: UserStatus.ACTIVE });
    }

    // Task Operations
    getAllTasks(): Task[] {
        return [...this.mockTasks];
    }

    getTaskById(id: string): Task | undefined {
        return this.mockTasks.find(t => t.id === id);
    }

    getTasksByStatus(status: TaskStatus): Task[] {
        return this.mockTasks.filter(t => t.status === status);
    }

    getTasksByCategory(category: string): Task[] {
        return this.mockTasks.filter(t => t.category === category);
    }

    getTasksByCustomerId(customerId: string): Task[] {
        return this.mockTasks.filter(t => t.customerId === customerId);
    }

    getTasksByWorkerId(workerId: string): Task[] {
        return this.mockTasks.filter(t => t.workerId === workerId);
    }

    createTask(taskData: Partial<Task>): Task {
        const newTask: Task = {
            id: 'task_' + Date.now(),
            title: taskData.title || '',
            description: taskData.description || '',
            category: taskData.category || '',
            location: taskData.location || { state: '', city: '', area: '', fullAddress: '' },
            customerId: taskData.customerId || '',
            status: TaskStatus.POSTED,
            budgetMin: taskData.budgetMin || 0,
            budgetMax: taskData.budgetMax || 0,
            preferredDate: taskData.preferredDate || '',
            photos: taskData.photos || [],
            bids: [],
            progressUpdates: [],
            reviews: [],
            createdDate: new Date().toISOString(),
            adminReviewNotes: 'Pending admin review'
        };

        this.mockTasks.push(newTask);
        return newTask;
    }

    updateTask(id: string, updates: Partial<Task>): Task | undefined {
        const taskIndex = this.mockTasks.findIndex(t => t.id === id);
        if (taskIndex === -1) return undefined;

        this.mockTasks[taskIndex] = { ...this.mockTasks[taskIndex], ...updates };
        return this.mockTasks[taskIndex];
    }

    updateTaskStatus(taskId: string, status: TaskStatus, adminNotes?: string): Task | undefined {
        const task = this.getTaskById(taskId);
        if (!task) return undefined;

        const statusLabels: Record<TaskStatus, string> = {
            [TaskStatus.POSTED]: 'Task Posted',
            [TaskStatus.BIDDING]: 'Open for Bidding',
            [TaskStatus.ASSIGNED]: 'Worker Assigned',
            [TaskStatus.CONFIRMED]: 'Confirmed',
            [TaskStatus.TRAVELING]: 'Worker Traveling',
            [TaskStatus.ARRIVED]: 'Worker Arrived',
            [TaskStatus.IN_PROGRESS]: 'Work in Progress',
            [TaskStatus.WORK_COMPLETED]: 'Work Completed',
            [TaskStatus.VERIFIED]: 'Verified by Customer',
            [TaskStatus.PAID]: 'Payment Completed',
            [TaskStatus.COMPLETED]: 'Task Completed',
            [TaskStatus.CANCELLED]: 'Task Cancelled',
            [TaskStatus.DISPUTED]: 'Under Dispute'
        };

        const statusDescriptions: Record<TaskStatus, string> = {
            [TaskStatus.POSTED]: 'Task has been posted to the platform',
            [TaskStatus.BIDDING]: 'Workers are submitting their bids',
            [TaskStatus.ASSIGNED]: 'Worker has been selected',
            [TaskStatus.CONFIRMED]: 'Both parties have agreed to proceed',
            [TaskStatus.TRAVELING]: 'Worker is on the way',
            [TaskStatus.ARRIVED]: 'Worker has arrived at location',
            [TaskStatus.IN_PROGRESS]: 'Work is currently underway',
            [TaskStatus.WORK_COMPLETED]: 'Work has been completed by worker',
            [TaskStatus.VERIFIED]: 'Customer has verified and accepted the work',
            [TaskStatus.PAID]: 'Payment has been processed successfully',
            [TaskStatus.COMPLETED]: 'Task completed successfully',
            [TaskStatus.CANCELLED]: 'Task has been cancelled',
            [TaskStatus.DISPUTED]: 'A dispute has been raised'
        };

        // Create progress update
        const progressUpdate: ProgressUpdate = {
            timestamp: new Date().toISOString(),
            status: status,
            title: statusLabels[status],
            description: statusDescriptions[status]
        };

        // Update task with new status and progress update
        const updates: Partial<Task> = {
            status,
            progressUpdates: [...task.progressUpdates, progressUpdate]
        };
        
        if (adminNotes) updates.adminReviewNotes = adminNotes;
        
        return this.updateTask(taskId, updates);
    }

    approveTaskForBidding(taskId: string): Task | undefined {
        return this.updateTaskStatus(taskId, TaskStatus.BIDDING, 'Approved by admin');
    }

    rejectTask(taskId: string, reason: string): Task | undefined {
        return this.updateTaskStatus(taskId, TaskStatus.CANCELLED, reason);
    }

    // Bid Operations
    getBidsForTask(taskId: string): Bid[] {
        const task = this.getTaskById(taskId);
        return task ? [...task.bids] : [];
    }

    createBid(bidData: Partial<Bid>): Bid {
        const worker = this.getUserById(bidData.workerId || '');
        return {
            id: 'bid_' + Date.now(),
            taskId: bidData.taskId || '',
            workerId: bidData.workerId || '',
            workerName: worker?.name || 'Unknown Worker',
            workerAvatar: worker?.avatar || '',
            workerRating: worker?.rating || 0,
            amount: bidData.amount || 0,
            estimatedDays: bidData.estimatedDays || 1,
            message: bidData.message || '',
            status: 'PENDING'
        };
    }

    addBidToTask(taskId: string, bidData: Partial<Bid>): Task | undefined {
        const task = this.getTaskById(taskId);
        if (!task) return undefined;

        const newBid = this.createBid(bidData);
        const updatedBids = [...task.bids, newBid];
        const updates: Partial<Task> = {
            bids: updatedBids,
            status: task.status === TaskStatus.BIDDING ? TaskStatus.BIDDING : TaskStatus.BIDDING
        };

        return this.updateTask(taskId, updates);
    }

    acceptBid(taskId: string, bidId: string): Task | undefined {
        const task = this.getTaskById(taskId);
        if (!task) return undefined;

        const bid = task.bids.find(b => b.id === bidId);
        if (!bid) return undefined;

        const updatedBids = task.bids.map(b => ({
            ...b,
            status: b.id === bidId ? 'ACCEPTED' : 'REJECTED' as 'ACCEPTED' | 'REJECTED'
        }));

        const updates: Partial<Task> = {
            bids: updatedBids,
            status: TaskStatus.ASSIGNED,
            workerId: bid.workerId
        };

        // Mark worker as busy
        this.updateUser(bid.workerId, { isBusy: true });

        return this.updateTask(taskId, updates);
    }

    // Review Operations
    submitReview(taskId: string, review: Partial<Review>): Review {
        const newReview: Review = {
            id: 'review_' + Date.now(),
            taskId: taskId,
            reviewerId: review.reviewerId || '',
            reviewerName: review.reviewerName || '',
            rating: review.rating || 0,
            comment: review.comment || '',
            createdDate: new Date().toISOString(),
            revieweeId: review.revieweeId || ''
        };

        const task = this.getTaskById(taskId);
        if (task) {
            this.updateTask(taskId, { reviews: [...task.reviews, newReview] });
        }

        // Update worker rating
        const worker = this.getUserById(review.revieweeId || '');
        if (worker) {
            const workerReviews = this.mockTasks
                .flatMap(t => t.reviews)
                .filter(r => r.revieweeId === worker.id);

            const avgRating = workerReviews.length > 0
                ? workerReviews.reduce((sum, r) => sum + r.rating, 0) / workerReviews.length
                : worker.rating;

            this.updateUser(worker.id, { rating: parseFloat(avgRating.toFixed(1)) });
        }

        return newReview;
    }

    getReviewsForUser(userId: string): Review[] {
        return this.mockTasks
            .flatMap(t => t.reviews)
            .filter(r => r.revieweeId === userId);
    }

    // Dispute Operations
    getAllDisputes(): Dispute[] {
        return [...this.mockDisputes];
    }

    getDisputesForUser(userId: string): Dispute[] {
        return this.mockDisputes.filter(d => d.initiatorId === userId || d.respondentId === userId);
    }

    createDispute(disputeData: Partial<Dispute>): Dispute {
        const newDispute: Dispute = {
            id: 'dispute_' + Date.now(),
            taskId: disputeData.taskId || '',
            initiatorId: disputeData.initiatorId || '',
            initiatorRole: disputeData.initiatorRole || UserRole.CUSTOMER,
            respondentId: disputeData.respondentId || '',
            reason: disputeData.reason || '',
            status: DisputeStatus.PENDING,
            messages: [],
            createdDate: new Date().toISOString()
        };

        this.mockDisputes.push(newDispute);
        return newDispute;
    }

    addMessageToDispute(disputeId: string, message: any): Dispute | undefined {
        const dispute = this.mockDisputes.find(d => d.id === disputeId);
        if (!dispute) return undefined;

        const newMessage = {
            id: 'msg_' + Date.now(),
            senderId: message.senderId || '',
            senderName: message.senderName || '',
            message: message.message || '',
            timestamp: new Date().toISOString()
        };

        dispute.messages.push(newMessage);
        if (dispute.status === DisputeStatus.PENDING) {
            dispute.status = DisputeStatus.IN_PROGRESS;
        }

        return dispute;
    }

    resolveDispute(disputeId: string, adminNotes?: string): Dispute | undefined {
        const dispute = this.mockDisputes.find(d => d.id === disputeId);
        if (!dispute) return undefined;

        dispute.status = DisputeStatus.RESOLVED;
        dispute.resolvedDate = new Date().toISOString();
        if (adminNotes) dispute.adminNotes = adminNotes;

        return dispute;
    }

    getUnresolvedDisputeCount(): number {
        return this.mockDisputes.filter(d => d.status !== DisputeStatus.RESOLVED).length;
    }

    // Analytics
    getTotalRevenue(): number {
        const completedTasks = this.mockTasks.filter(t => t.status === TaskStatus.COMPLETED);
        return completedTasks.length * 45; // ₹45 per completed task
    }

    getAnalytics() {
        const allUsers = this.getAllUsers();
        const activeUsers = allUsers.filter(u => u.status === UserStatus.ACTIVE).length;
        const totalTasks = this.mockTasks.length;
        const openDisputes = this.mockDisputes.filter(d => d.status !== DisputeStatus.RESOLVED).length;

        return {
            activeUsers,
            totalTasks,
            totalRevenue: this.getTotalRevenue(),
            openDisputes,
            tasksByStatus: {
                open: this.getTasksByStatus(TaskStatus.POSTED).length,
                posted: this.getTasksByStatus(TaskStatus.POSTED).length,
                bidding: this.getTasksByStatus(TaskStatus.BIDDING).length,
                assigned: this.getTasksByStatus(TaskStatus.ASSIGNED).length,
                inProgress: this.getTasksByStatus(TaskStatus.IN_PROGRESS).length,
                completed: this.getTasksByStatus(TaskStatus.COMPLETED).length
            }
        };
    }

    // Mark worker arrival
    markWorkerArrival(taskId: string): Task | undefined {
        const checkInTime = new Date().toLocaleTimeString();
        return this.updateTaskStatus(taskId, TaskStatus.IN_PROGRESS);
    }

    // Complete task
    completeTask(taskId: string): Task | undefined {
        const task = this.getTaskById(taskId);
        if (!task || !task.workerId) return undefined;

        // Release worker
        this.updateUser(task.workerId, {
            isBusy: false,
            completedJobs: (this.getUserById(task.workerId)?.completedJobs || 0) + 1
        });

        return this.updateTaskStatus(taskId, TaskStatus.COMPLETED);
    }
}
