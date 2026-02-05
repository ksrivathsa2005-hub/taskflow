// Utility to map between API types and local application types
import { User, Task, Bid, Review, Dispute, ProgressUpdate, Address, TaskStatus, UserRole, DisputeStatus } from '../types';
import { ApiUser, ApiTask, ApiBid, ApiReview, ApiDispute, ApiProgressUpdate, ApiTaskLocation, ApiTaskStatus } from './api-types';

export class ApiMapper {
  // ==================== USER MAPPING ====================
  
  static toLocalUser(apiUser: ApiUser): User {
    // Convert API role (number) to local UserRole enum
    const roleMap: Record<string, UserRole> = {
      '0': UserRole.CUSTOMER,
      '1': UserRole.WORKER,
      '2': UserRole.ADMIN,
      'CUSTOMER': UserRole.CUSTOMER,
      'WORKER': UserRole.WORKER,
      'ADMIN': UserRole.ADMIN
    };

    const role = roleMap[String(apiUser.role)] || UserRole.CUSTOMER;

    return {
      id: apiUser.id,
      name: apiUser.name,
      email: apiUser.email,
      role: role,
      avatar: apiUser.avatar || '',
      phone: apiUser.phone,
      rating: apiUser.rating,
      completedJobs: apiUser.completedJobs,
      isBusy: apiUser.isBusy,
      skills: apiUser.skills,
      categories: apiUser.categories,
      experience: apiUser.experience,
      status: apiUser.status as any,
      createdDate: apiUser.email // Using email as placeholder since createdDate not in ApiUser
    };
  }

  // ==================== TASK STATUS MAPPING ====================
  
  static toLocalTaskStatus(apiStatus: ApiTaskStatus | number): TaskStatus {
    // Handle numeric status codes from API
    if (typeof apiStatus === 'number') {
      const statusMap: Record<number, TaskStatus> = {
        0: TaskStatus.POSTED,
        1: TaskStatus.BIDDING,
        2: TaskStatus.ASSIGNED,
        3: TaskStatus.CONFIRMED,
        4: TaskStatus.TRAVELING,
        5: TaskStatus.ARRIVED,
        6: TaskStatus.IN_PROGRESS,
        7: TaskStatus.WORK_COMPLETED,
        8: TaskStatus.VERIFIED,
        9: TaskStatus.PAID,
        10: TaskStatus.COMPLETED,
        11: TaskStatus.CANCELLED,
        12: TaskStatus.DISPUTED
      };
      return statusMap[apiStatus] || TaskStatus.POSTED;
    }
    return apiStatus as TaskStatus;
  }

  static toApiTaskStatus(localStatus: TaskStatus): ApiTaskStatus {
    return localStatus as ApiTaskStatus;
  }

  // ==================== ADDRESS MAPPING ====================
  
  static toLocalAddress(apiLocation?: ApiTaskLocation | string): Address {
    if (!apiLocation) {
      return {
        state: '',
        city: '',
        area: '',
        fullAddress: ''
      };
    }
    
    // Handle case where location comes as a stringified JSON object
    let locationObj: ApiTaskLocation;
    if (typeof apiLocation === 'string') {
      try {
        locationObj = JSON.parse(apiLocation);
      } catch (error) {
        console.error('Failed to parse location string:', apiLocation, error);
        return {
          state: '',
          city: '',
          area: '',
          fullAddress: apiLocation
        };
      }
    } else {
      locationObj = apiLocation;
    }
    
    return {
      state: locationObj.state || '',
      city: locationObj.city || '',
      area: locationObj.area || '',
      fullAddress: locationObj.fullAddress || '',
      coordinates: locationObj.latitude && locationObj.longitude ? {
        latitude: locationObj.latitude,
        longitude: locationObj.longitude
      } : undefined
    };
  }

  // ==================== BID MAPPING ====================
  
  static toLocalBid(apiBid: ApiBid): Bid {
    return {
      id: apiBid.id,
      taskId: apiBid.taskId,
      workerId: apiBid.workerId,
      workerName: apiBid.workerName,
      workerAvatar: apiBid.workerAvatar || '',
      workerRating: apiBid.workerRating,
      amount: apiBid.amount,
      estimatedDays: apiBid.estimatedDays,
      message: apiBid.message || '',
      status: apiBid.status
    };
  }

  // ==================== PROGRESS UPDATE MAPPING ====================
  
  static toLocalProgressUpdate(apiUpdate: ApiProgressUpdate): ProgressUpdate {
    return {
      timestamp: apiUpdate.timestamp,
      status: this.toLocalTaskStatus(apiUpdate.status),
      title: apiUpdate.title,
      description: apiUpdate.description
    };
  }

  // ==================== REVIEW MAPPING ====================
  
  static toLocalReview(apiReview: ApiReview): Review {
    return {
      id: apiReview.id,
      taskId: apiReview.taskId,
      reviewerId: apiReview.reviewerId,
      reviewerName: apiReview.reviewerName,
      revieweeId: apiReview.revieweeId,
      rating: apiReview.rating,
      comment: apiReview.comment,
      createdDate: apiReview.createdDate
    };
  }

  // ==================== DISPUTE MAPPING ====================
  
  static toLocalDispute(apiDispute: ApiDispute): Dispute {
    return {
      id: apiDispute.id,
      taskId: apiDispute.taskId,
      initiatorId: apiDispute.initiatorId,
      initiatorRole: apiDispute.initiatorRole as UserRole,
      respondentId: apiDispute.respondentId,
      reason: apiDispute.reason,
      issueType: apiDispute.issueType,
      evidence: apiDispute.evidence?.map(e => e.evidenceUrl) || [],
      status: apiDispute.status as DisputeStatus,
      messages: apiDispute.messages || [],
      createdDate: apiDispute.createdDate,
      resolvedDate: apiDispute.resolvedDate,
      adminNotes: apiDispute.adminNotes
    };
  }

  // ==================== TASK MAPPING ====================
  
  static toLocalTask(apiTask: ApiTask): Task {
    return {
      id: apiTask.id,
      title: apiTask.title,
      description: apiTask.description,
      category: apiTask.category,
      location: this.toLocalAddress(apiTask.location),
      customerId: apiTask.customerId,
      workerId: apiTask.workerId,
      workerName: apiTask.workerName,
      status: this.toLocalTaskStatus(apiTask.status),
      budgetMin: apiTask.budgetMin,
      budgetMax: apiTask.budgetMax,
      finalPrice: apiTask.finalPrice,
      preferredDate: apiTask.preferredDate,
      photos: apiTask.photos?.map(p => p.photoUrl) || [],
      bids: apiTask.bids?.map(b => this.toLocalBid(b)) || [],
      checkInTime: apiTask.checkInTime,
      progressUpdates: apiTask.progressUpdates?.map(u => this.toLocalProgressUpdate(u)) || [],
      reviews: apiTask.reviews?.map(r => this.toLocalReview(r)) || [],
      adminReviewNotes: apiTask.adminReviewNotes,
      createdDate: apiTask.createdDate,
      completionDate: apiTask.completionDate
    };
  }

  // ==================== BULK MAPPING ====================
  
  static toLocalTasks(apiTasks: ApiTask[]): Task[] {
    return apiTasks.map(task => this.toLocalTask(task));
  }

  static toLocalUsers(apiUsers: ApiUser[]): User[] {
    return apiUsers.map(user => this.toLocalUser(user));
  }

  static toLocalBids(apiBids: ApiBid[]): Bid[] {
    return apiBids.map(bid => this.toLocalBid(bid));
  }

  static toLocalDisputes(apiDisputes: ApiDispute[]): Dispute[] {
    return apiDisputes.map(dispute => this.toLocalDispute(dispute));
  }
}
