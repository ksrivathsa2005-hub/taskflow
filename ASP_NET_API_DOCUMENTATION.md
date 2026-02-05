# TaskFlow ASP.NET Core API Documentation

## Overview
This document provides comprehensive API endpoint specifications for the TaskFlow platform backend to be built with ASP.NET Core. The platform connects customers with service workers for task completion.

## Base URL
```
https://api.taskflow.com/api/v1
```

## Authentication
Most endpoints require JWT Bearer token authentication.

**Header:**
```
Authorization: Bearer {token}
```

---

## 1. Authentication & Authorization

### 1.1 Register User
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "CUSTOMER | WORKER | ADMIN",
  "phone": "string",
  "avatar": "string (optional)",
  "address": {
    "state": "string",
    "city": "string",
    "area": "string",
    "fullAddress": "string"
  },
  "skills": ["string"] // For workers only
}
```

**Response (201):**
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "role": "string",
  "status": "UNVERIFIED",
  "token": "string"
}
```

### 1.2 Login
**POST** `/auth/login`

Authenticate and receive JWT token.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "token": "string",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "string",
    "avatar": "string",
    "rating": 0.0,
    "completedJobs": 0,
    "status": "ACTIVE | SUSPENDED | UNVERIFIED"
  }
}
```

### 1.3 Refresh Token
**POST** `/auth/refresh`

Refresh JWT token.

**Request Body:**
```json
{
  "refreshToken": "string"
}
```

**Response (200):**
```json
{
  "token": "string",
  "refreshToken": "string"
}
```

### 1.4 Logout
**POST** `/auth/logout`

Invalidate current session.

**Response (204):** No Content

---

## 2. User Management

### 2.1 Get Current User
**GET** `/users/me`

Get authenticated user's profile.

**Response (200):**
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "role": "string",
  "avatar": "string",
  "phone": "string",
  "address": {
    "state": "string",
    "city": "string",
    "area": "string",
    "fullAddress": "string"
  },
  "rating": 4.5,
  "completedJobs": 120,
  "skills": ["string"],
  "categories": ["string"],
  "status": "ACTIVE",
  "createdDate": "2026-01-01T00:00:00Z"
}
```

### 2.2 Update User Profile
**PUT** `/users/me`

Update authenticated user's profile.

**Request Body:**
```json
{
  "name": "string (optional)",
  "phone": "string (optional)",
  "avatar": "string (optional)",
  "address": {
    "state": "string",
    "city": "string",
    "area": "string",
    "fullAddress": "string"
  },
  "skills": ["string"], // Workers only
  "categories": ["string"] // Workers only
}
```

**Response (200):** Updated user object

### 2.3 Get User by ID
**GET** `/users/{userId}`

Get public profile of any user.

**Response (200):**
```json
{
  "id": "string",
  "name": "string",
  "avatar": "string",
  "rating": 4.5,
  "completedJobs": 120,
  "skills": ["string"],
  "reviews": [{
    "id": "string",
    "rating": 5,
    "comment": "string",
    "reviewerName": "string",
    "createdDate": "2026-01-01T00:00:00Z"
  }]
}
```

### 2.4 Get All Users (Admin Only)
**GET** `/users`

Get list of all users with filtering.

**Query Parameters:**
- `role` (optional): CUSTOMER | WORKER | ADMIN
- `status` (optional): ACTIVE | SUSPENDED | UNVERIFIED
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 20)
- `search` (optional): Search by name or email

**Response (200):**
```json
{
  "users": [{
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "string",
    "status": "string",
    "rating": 4.5,
    "completedJobs": 50,
    "createdDate": "2026-01-01T00:00:00Z"
  }],
  "totalCount": 100,
  "page": 1,
  "pageSize": 20
}
```

### 2.5 Update User Status (Admin Only)
**PATCH** `/users/{userId}/status`

Suspend, activate, or verify a user.

**Request Body:**
```json
{
  "status": "ACTIVE | SUSPENDED | UNVERIFIED"
}
```

**Response (200):** Updated user object

### 2.6 Delete User (Admin Only)
**DELETE** `/users/{userId}`

Soft delete a user account.

**Response (204):** No Content

---

## 3. Task Management

### 3.1 Create Task
**POST** `/tasks`

Create a new task (Customer only).

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "category": "string",
  "location": {
    "state": "string",
    "city": "string",
    "area": "string",
    "fullAddress": "string",
    "coordinates": {
      "latitude": 0.0,
      "longitude": 0.0
    }
  },
  "budgetMin": 500,
  "budgetMax": 2000,
  "preferredDate": "2026-02-10",
  "photos": ["string"] // URLs
}
```

**Response (201):**
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "category": "string",
  "location": {...},
  "customerId": "string",
  "status": "POSTED",
  "budgetMin": 500,
  "budgetMax": 2000,
  "preferredDate": "2026-02-10",
  "photos": ["string"],
  "bids": [],
  "progressUpdates": [],
  "reviews": [],
  "createdDate": "2026-02-03T10:00:00Z"
}
```

### 3.2 Get All Tasks
**GET** `/tasks`

Get list of tasks with filtering.

**Query Parameters:**
- `status` (optional): Task status
- `category` (optional): Service category
- `customerId` (optional): Filter by customer
- `workerId` (optional): Filter by worker
- `location` (optional): Filter by state/city
- `page` (optional): Page number
- `pageSize` (optional): Items per page
- `sortBy` (optional): createdDate | budgetMax | preferredDate
- `sortOrder` (optional): asc | desc

**Response (200):**
```json
{
  "tasks": [{
    "id": "string",
    "title": "string",
    "description": "string",
    "category": "string",
    "location": {...},
    "customerId": "string",
    "workerId": "string",
    "status": "POSTED",
    "budgetMin": 500,
    "budgetMax": 2000,
    "preferredDate": "2026-02-10",
    "bids": [{
      "id": "string",
      "workerId": "string",
      "workerName": "string",
      "workerAvatar": "string",
      "workerRating": 4.5,
      "amount": 1200,
      "estimatedDays": 2,
      "message": "string",
      "status": "PENDING"
    }],
    "createdDate": "2026-02-03T10:00:00Z"
  }],
  "totalCount": 50,
  "page": 1,
  "pageSize": 20
}
```

### 3.3 Get Task by ID
**GET** `/tasks/{taskId}`

Get detailed information about a specific task.

**Response (200):**
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "category": "string",
  "location": {...},
  "customerId": "string",
  "customerName": "string",
  "customerAvatar": "string",
  "workerId": "string",
  "workerName": "string",
  "status": "IN_PROGRESS",
  "budgetMin": 500,
  "budgetMax": 2000,
  "preferredDate": "2026-02-10",
  "photos": ["string"],
  "bids": [...],
  "progressUpdates": [{
    "timestamp": "2026-02-03T10:00:00Z",
    "status": "POSTED",
    "title": "Task Posted",
    "description": "Task has been posted to the platform"
  }],
  "reviews": [{
    "id": "string",
    "reviewerId": "string",
    "reviewerName": "string",
    "rating": 5,
    "comment": "string",
    "createdDate": "2026-02-03T10:00:00Z"
  }],
  "createdDate": "2026-02-03T10:00:00Z"
}
```

### 3.4 Update Task
**PUT** `/tasks/{taskId}`

Update task details (Customer only, before assignment).

**Request Body:**
```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "budgetMin": 500,
  "budgetMax": 2000,
  "preferredDate": "2026-02-10"
}
```

**Response (200):** Updated task object

### 3.5 Update Task Status
**PATCH** `/tasks/{taskId}/status`

Update task status.

**Request Body:**
```json
{
  "status": "BIDDING | ASSIGNED | CONFIRMED | TRAVELING | ARRIVED | IN_PROGRESS | WORK_COMPLETED | VERIFIED | PAID | COMPLETED | CANCELLED | DISPUTED",
  "notes": "string (optional)"
}
```

**Response (200):** Updated task object with new progress update

### 3.6 Delete Task
**DELETE** `/tasks/{taskId}`

Cancel/delete a task (Customer only, before assignment).

**Response (204):** No Content

### 3.7 Get Tasks Requiring Action
**GET** `/tasks/pending-actions`

Get tasks that require user action.

**Response (200):**
```json
{
  "tasks": [{
    "id": "string",
    "title": "string",
    "status": "WORK_COMPLETED",
    "actionRequired": "Awaiting approval",
    "createdDate": "2026-02-03T10:00:00Z"
  }]
}
```

---

## 4. Bid Management

### 4.1 Create Bid
**POST** `/tasks/{taskId}/bids`

Submit a bid for a task (Worker only).

**Request Body:**
```json
{
  "amount": 1200,
  "estimatedDays": 2,
  "message": "I can complete this work professionally."
}
```

**Response (201):**
```json
{
  "id": "string",
  "taskId": "string",
  "workerId": "string",
  "workerName": "string",
  "workerAvatar": "string",
  "workerRating": 4.5,
  "amount": 1200,
  "estimatedDays": 2,
  "message": "string",
  "status": "PENDING",
  "createdDate": "2026-02-03T10:00:00Z"
}
```

### 4.2 Get Bids for Task
**GET** `/tasks/{taskId}/bids`

Get all bids submitted for a task.

**Response (200):**
```json
{
  "bids": [{
    "id": "string",
    "workerId": "string",
    "workerName": "string",
    "workerAvatar": "string",
    "workerRating": 4.5,
    "amount": 1200,
    "estimatedDays": 2,
    "message": "string",
    "status": "PENDING",
    "createdDate": "2026-02-03T10:00:00Z"
  }]
}
```

### 4.3 Accept Bid
**POST** `/tasks/{taskId}/bids/{bidId}/accept`

Accept a worker's bid (Customer only).

**Response (200):**
```json
{
  "task": {...}, // Updated task with status ASSIGNED
  "message": "Bid accepted successfully"
}
```

### 4.4 Reject Bid
**POST** `/tasks/{taskId}/bids/{bidId}/reject`

Reject a worker's bid (Customer only).

**Response (200):**
```json
{
  "message": "Bid rejected"
}
```

### 4.5 Get Worker's Bids
**GET** `/bids/my-bids`

Get all bids submitted by the authenticated worker.

**Query Parameters:**
- `status` (optional): PENDING | ACCEPTED | REJECTED
- `page` (optional): Page number
- `pageSize` (optional): Items per page

**Response (200):**
```json
{
  "bids": [{
    "id": "string",
    "taskId": "string",
    "taskTitle": "string",
    "amount": 1200,
    "status": "PENDING",
    "createdDate": "2026-02-03T10:00:00Z"
  }],
  "totalCount": 10,
  "page": 1,
  "pageSize": 20
}
```

---

## 5. Review & Rating System

### 5.1 Submit Review
**POST** `/tasks/{taskId}/reviews`

Submit a review after task completion.

**Request Body:**
```json
{
  "revieweeId": "string", // Worker or Customer ID
  "rating": 5,
  "comment": "Excellent work, very professional!"
}
```

**Response (201):**
```json
{
  "id": "string",
  "taskId": "string",
  "reviewerId": "string",
  "reviewerName": "string",
  "revieweeId": "string",
  "rating": 5,
  "comment": "string",
  "createdDate": "2026-02-03T10:00:00Z"
}
```

### 5.2 Get Reviews for User
**GET** `/users/{userId}/reviews`

Get all reviews received by a user.

**Query Parameters:**
- `page` (optional): Page number
- `pageSize` (optional): Items per page

**Response (200):**
```json
{
  "reviews": [{
    "id": "string",
    "taskId": "string",
    "taskTitle": "string",
    "reviewerName": "string",
    "reviewerAvatar": "string",
    "rating": 5,
    "comment": "string",
    "createdDate": "2026-02-03T10:00:00Z"
  }],
  "averageRating": 4.7,
  "totalCount": 50
}
```

### 5.3 Get Reviews for Task
**GET** `/tasks/{taskId}/reviews`

Get all reviews for a specific task.

**Response (200):**
```json
{
  "reviews": [{
    "id": "string",
    "reviewerId": "string",
    "reviewerName": "string",
    "revieweeId": "string",
    "rating": 5,
    "comment": "string",
    "createdDate": "2026-02-03T10:00:00Z"
  }]
}
```

---

## 6. Dispute Management

### 6.1 Create Dispute
**POST** `/disputes`

Raise a dispute for a task.

**Request Body:**
```json
{
  "taskId": "string",
  "respondentId": "string",
  "reason": "Work not completed as agreed",
  "issueType": "QUALITY | PAYMENT | BEHAVIOR | OTHER",
  "evidence": ["string"] // URLs to photos/documents
}
```

**Response (201):**
```json
{
  "id": "string",
  "taskId": "string",
  "initiatorId": "string",
  "initiatorRole": "CUSTOMER",
  "respondentId": "string",
  "reason": "string",
  "issueType": "QUALITY",
  "status": "PENDING",
  "messages": [],
  "createdDate": "2026-02-03T10:00:00Z"
}
```

### 6.2 Get All Disputes
**GET** `/disputes`

Get disputes (filtered by role).

**Query Parameters:**
- `status` (optional): PENDING | IN_PROGRESS | RESOLVED
- `userId` (optional): Filter by user involved
- `page` (optional): Page number
- `pageSize` (optional): Items per page

**Response (200):**
```json
{
  "disputes": [{
    "id": "string",
    "taskId": "string",
    "taskTitle": "string",
    "initiatorId": "string",
    "initiatorName": "string",
    "respondentId": "string",
    "respondentName": "string",
    "reason": "string",
    "status": "PENDING",
    "createdDate": "2026-02-03T10:00:00Z"
  }],
  "totalCount": 5
}
```

### 6.3 Get Dispute by ID
**GET** `/disputes/{disputeId}`

Get detailed dispute information.

**Response (200):**
```json
{
  "id": "string",
  "taskId": "string",
  "taskTitle": "string",
  "initiatorId": "string",
  "initiatorName": "string",
  "initiatorRole": "CUSTOMER",
  "respondentId": "string",
  "respondentName": "string",
  "reason": "string",
  "issueType": "QUALITY",
  "evidence": ["string"],
  "status": "IN_PROGRESS",
  "messages": [{
    "id": "string",
    "senderId": "string",
    "senderName": "string",
    "message": "string",
    "timestamp": "2026-02-03T10:00:00Z"
  }],
  "createdDate": "2026-02-03T10:00:00Z",
  "resolvedDate": null,
  "adminNotes": null
}
```

### 6.4 Add Message to Dispute
**POST** `/disputes/{disputeId}/messages`

Add a message to dispute chat.

**Request Body:**
```json
{
  "message": "string"
}
```

**Response (201):**
```json
{
  "id": "string",
  "senderId": "string",
  "senderName": "string",
  "message": "string",
  "timestamp": "2026-02-03T10:00:00Z"
}
```

### 6.5 Resolve Dispute (Admin Only)
**POST** `/disputes/{disputeId}/resolve`

Resolve a dispute.

**Request Body:**
```json
{
  "resolution": "Refund issued to customer",
  "adminNotes": "string"
}
```

**Response (200):**
```json
{
  "dispute": {...}, // Updated dispute with status RESOLVED
  "message": "Dispute resolved successfully"
}
```

---

## 7. Admin Operations

### 7.1 Approve Task for Bidding (Admin Only)
**POST** `/admin/tasks/{taskId}/approve`

Approve a posted task to move to bidding stage.

**Request Body:**
```json
{
  "notes": "Task approved after verification"
}
```

**Response (200):** Updated task object

### 7.2 Reject Task (Admin Only)
**POST** `/admin/tasks/{taskId}/reject`

Reject a posted task.

**Request Body:**
```json
{
  "reason": "Task description violates guidelines"
}
```

**Response (200):**
```json
{
  "message": "Task rejected successfully"
}
```

### 7.3 Get Pending Tasks for Review (Admin Only)
**GET** `/admin/tasks/pending-review`

Get all tasks awaiting admin approval.

**Response (200):**
```json
{
  "tasks": [{
    "id": "string",
    "title": "string",
    "category": "string",
    "customerId": "string",
    "customerName": "string",
    "status": "POSTED",
    "budgetMin": 500,
    "budgetMax": 2000,
    "createdDate": "2026-02-03T10:00:00Z"
  }]
}
```

### 7.4 Get Platform Analytics (Admin Only)
**GET** `/admin/analytics`

Get platform-wide statistics.

**Query Parameters:**
- `startDate` (optional): Start date for analytics
- `endDate` (optional): End date for analytics

**Response (200):**
```json
{
  "users": {
    "total": 1000,
    "customers": 700,
    "workers": 290,
    "admins": 10,
    "active": 850,
    "suspended": 50,
    "unverified": 100
  },
  "tasks": {
    "total": 500,
    "posted": 50,
    "bidding": 80,
    "assigned": 100,
    "inProgress": 120,
    "completed": 150
  },
  "revenue": {
    "total": 22500,
    "thisMonth": 4500,
    "lastMonth": 3800
  },
  "disputes": {
    "total": 20,
    "pending": 5,
    "inProgress": 10,
    "resolved": 5
  },
  "categoryBreakdown": [{
    "category": "Plumbing",
    "count": 120,
    "revenue": 5400
  }]
}
```

---

## 8. Worker Earnings

### 8.1 Get Worker Earnings
**GET** `/workers/earnings`

Get earnings summary for authenticated worker.

**Query Parameters:**
- `startDate` (optional): Filter by date range
- `endDate` (optional): Filter by date range

**Response (200):**
```json
{
  "totalEarnings": 45000,
  "completedJobs": 30,
  "averageEarningPerJob": 1500,
  "thisMonthEarnings": 8500,
  "lastMonthEarnings": 7200,
  "earningsBreakdown": [{
    "month": "2026-02",
    "earnings": 8500,
    "jobsCompleted": 6
  }],
  "taskHistory": [{
    "taskId": "string",
    "taskTitle": "string",
    "amount": 1200,
    "completedDate": "2026-02-03T10:00:00Z"
  }]
}
```

---

## 9. Notifications

### 9.1 Get Notifications
**GET** `/notifications`

Get user notifications.

**Query Parameters:**
- `unreadOnly` (optional): boolean
- `page` (optional): Page number
- `pageSize` (optional): Items per page

**Response (200):**
```json
{
  "notifications": [{
    "id": "string",
    "userId": "string",
    "type": "BID_RECEIVED | BID_ACCEPTED | TASK_STATUS_UPDATE | REVIEW_RECEIVED | DISPUTE_CREATED",
    "title": "New bid received",
    "message": "You received a new bid for 'Fix Leaky Pipe'",
    "relatedEntityId": "string",
    "relatedEntityType": "TASK | BID | REVIEW | DISPUTE",
    "isRead": false,
    "createdDate": "2026-02-03T10:00:00Z"
  }],
  "unreadCount": 5,
  "totalCount": 50
}
```

### 9.2 Mark Notification as Read
**PATCH** `/notifications/{notificationId}/read`

Mark a notification as read.

**Response (200):**
```json
{
  "message": "Notification marked as read"
}
```

### 9.3 Mark All Notifications as Read
**POST** `/notifications/mark-all-read`

Mark all notifications as read.

**Response (200):**
```json
{
  "message": "All notifications marked as read"
}
```

---

## 10. File Upload

### 10.1 Upload File
**POST** `/files/upload`

Upload file (photo, document, etc.).

**Request:** multipart/form-data
- `file`: File to upload
- `type`: TASK_PHOTO | DISPUTE_EVIDENCE | PROFILE_AVATAR

**Response (201):**
```json
{
  "fileId": "string",
  "url": "https://cdn.taskflow.com/uploads/file123.jpg",
  "fileName": "leak_photo.jpg",
  "fileSize": 1024000,
  "mimeType": "image/jpeg"
}
```

### 10.2 Delete File
**DELETE** `/files/{fileId}`

Delete an uploaded file.

**Response (204):** No Content

---

## 11. Service Categories

### 11.1 Get All Categories
**GET** `/categories`

Get list of all service categories.

**Response (200):**
```json
{
  "categories": [{
    "id": "plumber",
    "name": "Plumber",
    "icon": "Droplet",
    "description": "Plumbing repairs and installation",
    "color": "bg-blue-100 text-blue-700"
  }]
}
```

---

## 12. Location Services

### 12.1 Get States
**GET** `/locations/states`

Get list of available states.

**Response (200):**
```json
{
  "states": ["Delhi", "Maharashtra", "Karnataka", "Tamil Nadu", "West Bengal"]
}
```

### 12.2 Get Cities by State
**GET** `/locations/states/{state}/cities`

Get cities for a specific state.

**Response (200):**
```json
{
  "cities": ["North Delhi", "South Delhi", "East Delhi", "West Delhi"]
}
```

### 12.3 Get Areas by City
**GET** `/locations/cities/{city}/areas`

Get areas for a specific city.

**Response (200):**
```json
{
  "areas": ["Area 1", "Area 2", "Area 3", "Area 4"]
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "BAD_REQUEST",
  "message": "Invalid input data",
  "details": {
    "field": "email",
    "issue": "Invalid email format"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "UNAUTHORIZED",
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "FORBIDDEN",
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "error": "NOT_FOUND",
  "message": "Resource not found"
}
```

### 409 Conflict
```json
{
  "error": "CONFLICT",
  "message": "Email already exists"
}
```

### 422 Unprocessable Entity
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": [{
    "field": "budgetMin",
    "message": "Budget minimum must be less than maximum"
  }]
}
```

### 500 Internal Server Error
```json
{
  "error": "INTERNAL_SERVER_ERROR",
  "message": "An unexpected error occurred"
}
```

---

## WebSocket Events (Real-time Updates)

### Connection
```
wss://api.taskflow.com/ws?token={jwt_token}
```

### Events to Subscribe

1. **task.status.updated**
```json
{
  "event": "task.status.updated",
  "data": {
    "taskId": "string",
    "status": "IN_PROGRESS",
    "updatedBy": "string",
    "timestamp": "2026-02-03T10:00:00Z"
  }
}
```

2. **bid.received**
```json
{
  "event": "bid.received",
  "data": {
    "taskId": "string",
    "bidId": "string",
    "workerId": "string",
    "amount": 1200
  }
}
```

3. **notification.new**
```json
{
  "event": "notification.new",
  "data": {
    "notificationId": "string",
    "type": "BID_ACCEPTED",
    "message": "Your bid was accepted"
  }
}
```

4. **dispute.message**
```json
{
  "event": "dispute.message",
  "data": {
    "disputeId": "string",
    "messageId": "string",
    "senderId": "string",
    "message": "string"
  }
}
```

---

## Rate Limiting

- **Standard endpoints:** 100 requests per minute per IP
- **Authentication endpoints:** 5 requests per minute per IP
- **File upload:** 10 requests per minute per user

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1706956800
```

---

## Pagination

All list endpoints support pagination with consistent parameters:

**Query Parameters:**
- `page`: Page number (default: 1)
- `pageSize`: Items per page (default: 20, max: 100)

**Response Headers:**
```
X-Total-Count: 500
X-Page: 1
X-Page-Size: 20
X-Total-Pages: 25
```

---

## Database Models (ASP.NET Core EF Core)

### User Model
```csharp
public class User
{
    public string Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string PasswordHash { get; set; }
    public UserRole Role { get; set; }
    public string Avatar { get; set; }
    public string Phone { get; set; }
    public Address Address { get; set; }
    public bool? IsBusy { get; set; }
    public decimal Rating { get; set; }
    public int CompletedJobs { get; set; }
    public List<string> Skills { get; set; }
    public List<string> Categories { get; set; }
    public int? Experience { get; set; }
    public UserStatus Status { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime? ModifiedDate { get; set; }
    
    // Navigation properties
    public virtual ICollection<Task> CustomerTasks { get; set; }
    public virtual ICollection<Task> WorkerTasks { get; set; }
    public virtual ICollection<Bid> Bids { get; set; }
    public virtual ICollection<Review> ReviewsGiven { get; set; }
    public virtual ICollection<Review> ReviewsReceived { get; set; }
}
```

### Task Model
```csharp
public class Task
{
    public string Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public string Category { get; set; }
    public Address Location { get; set; }
    public string CustomerId { get; set; }
    public string WorkerId { get; set; }
    public TaskStatus Status { get; set; }
    public decimal BudgetMin { get; set; }
    public decimal BudgetMax { get; set; }
    public DateTime PreferredDate { get; set; }
    public List<string> Photos { get; set; }
    public DateTime? CheckInTime { get; set; }
    public string AdminReviewNotes { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime? CompletionDate { get; set; }
    
    // Navigation properties
    public virtual User Customer { get; set; }
    public virtual User Worker { get; set; }
    public virtual ICollection<Bid> Bids { get; set; }
    public virtual ICollection<ProgressUpdate> ProgressUpdates { get; set; }
    public virtual ICollection<Review> Reviews { get; set; }
    public virtual ICollection<Dispute> Disputes { get; set; }
}
```

### Bid Model
```csharp
public class Bid
{
    public string Id { get; set; }
    public string TaskId { get; set; }
    public string WorkerId { get; set; }
    public decimal Amount { get; set; }
    public int EstimatedDays { get; set; }
    public string Message { get; set; }
    public BidStatus Status { get; set; }
    public DateTime CreatedDate { get; set; }
    
    // Navigation properties
    public virtual Task Task { get; set; }
    public virtual User Worker { get; set; }
}
```

---

## Implementation Notes

1. **Authentication:** Use ASP.NET Core Identity with JWT Bearer tokens
2. **Database:** SQL Server or PostgreSQL with Entity Framework Core
3. **File Storage:** Azure Blob Storage or AWS S3
4. **Real-time:** SignalR for WebSocket connections
5. **Caching:** Redis for session management and frequently accessed data
6. **Email:** SendGrid or similar service for notifications
7. **SMS:** Twilio for SMS notifications
8. **Payment Gateway:** Razorpay or Stripe integration
9. **Logging:** Serilog with Application Insights
10. **API Documentation:** Swagger/OpenAPI

---

## Security Considerations

1. **Password Hashing:** Use BCrypt or PBKDF2
2. **Input Validation:** Validate all inputs on server side
3. **SQL Injection Prevention:** Use parameterized queries (EF Core)
4. **XSS Prevention:** Sanitize user input
5. **CORS:** Configure appropriate CORS policies
6. **Rate Limiting:** Implement rate limiting middleware
7. **HTTPS Only:** Enforce HTTPS in production
8. **JWT Security:** Short expiry times, refresh token rotation
9. **File Upload:** Validate file types and sizes
10. **Audit Logging:** Log all sensitive operations
