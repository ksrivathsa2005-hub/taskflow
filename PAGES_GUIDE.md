# TaskFlow Pages - Complete Guide

## Overview
This document provides a comprehensive guide to all functional pages in the TaskFlow marketplace platform, including user-facing pages and admin pages.

## Available Routes

### 1. **Public Pages**
- `/` - Landing Page
- `/customer` - Customer Dashboard
- `/worker` - Worker/Service Expert Dashboard

### 2. **User Pages**
- `/reviews` - Reviews & Ratings Page (NEW)
- `/disputes` - User Disputes Management Page

### 3. **Admin Pages**
- `/admin` - Admin Dashboard
- `/admin/users` - User Management (Admin)
- `/admin/reviews` - Task Review Queue (Admin)
- `/admin/disputes` - Dispute Management (Admin)

---

## Detailed Page Descriptions

### 1. `/reviews` - Reviews & Ratings Page
**Purpose:** Display and manage all task reviews from the platform

**Key Features:**
- **Stats Dashboard:**
  - Total Reviews count
  - Average Rating calculation
  - 5-star reviews count
  - 1-4 star reviews count

- **Filtering & Search:**
  - Filter by rating (1-5 stars)
  - Sort options: Newest First, Highest Rating, Lowest Rating
  - Search reviews by task ID, reviewer name, or review content

- **Review Display:**
  - Reviewer avatar and name
  - Review date and time
  - Star rating with visual indicators
  - Review comment/text
  - Task ID reference

- **User Actions:**
  - Mark reviews as helpful
  - Report inappropriate reviews
  - Delete own reviews (or admin can delete any)

**Component:** `ReviewsComponent` (Standalone)
**Path:** `/src/app/pages/reviews/reviews.component.ts`

---

### 2. `/disputes` - User Disputes Management Page
**Purpose:** Allow users to view, manage, and communicate about disputes related to their tasks

**Key Features:**
- **Disputes Sidebar:**
  - List of all user disputes
  - Status indicators (Pending, In Progress, Resolved)
  - Task ID reference
  - Visual selection highlight

- **Dispute Details Panel:**
  - Dispute header with unique ID
  - Task reference
  - Current status badge
  - Dispute reason/issue description
  
- **Chat Interface:**
  - Real-time messaging between parties
  - Message history with timestamps
  - Sender identification (different colors for user vs other party)
  - System messages about admin responses

- **User Actions:**
  - Send messages to other party
  - Resolve dispute (for admin/authorized users)
  - View resolution notes
  
- **Status Filters:**
  - View all disputes
  - Filter by status (Pending, In Progress, Resolved)

**Component:** `DisputesComponent` (Standalone)
**Path:** `/src/app/pages/disputes/disputes.component.ts`

---

### 3. `/admin/users` - User Management (Admin)
**Purpose:** Centralized admin interface for managing all platform users

**Key Features:**
- **Add New Worker:**
  - Form to create new worker accounts
  - Fields: Name, Email, Phone, Avatar URL, Skills
  - Auto-generate verification link

- **User Filtering:**
  - Filter by role (Customer, Worker, Admin)
  - Filter by status (Active, Suspended, Unverified)
  - Combined filter results

- **User Table Display:**
  - User avatar and name
  - Email address
  - User role with color-coded badges
  - Verification status with color-coded badges
  - User rating (★ stars)
  - Completed jobs count

- **Admin Actions:**
  - Verify/Unverify workers (toggle verification)
  - Suspend users
  - Activate suspended users
  - View user details

- **Visual Indicators:**
  - Role badges (Purple=Admin, Blue=Worker, Green=Customer)
  - Status badges (Green=Active, Red=Suspended, Yellow=Unverified)

**Component:** `UserManagementComponent` (Standalone)
**Path:** `/src/app/pages/admin-dashboard/user-management.component.ts`

---

### 4. `/admin/reviews` - Task Review Queue (Admin)
**Purpose:** Admin task review and approval system before tasks go live

**Key Features:**
- **Pending Tasks Section:**
  - Display all tasks in ADMIN_REVIEW status
  - Shows only tasks pending admin approval

- **Task Details Review:**
  - Full task information display
  - Title and unique ID
  - Detailed description
  - Category, Location, Budget range
  - Preferred completion date
  - Associated photos
  
- **Admin Review Interface:**
  - Text area for review notes
  - Approve button (moves task to RECEIVING_BIDS)
  - Reject button (cancels task)
  - Note saving and tracking

- **Previously Reviewed Section:**
  - Historical task review data
  - Status column (Approved, Rejected, etc.)
  - Admin notes for context
  - Review date tracking
  
- **Action Flow:**
  - Admin reviews task details
  - Adds review notes if needed
  - Approves (task opens for bidding) OR Rejects (task cancelled)
  - Notes saved to task record

**Component:** `TaskReviewComponent` (Standalone)
**Path:** `/src/app/pages/admin-dashboard/task-review.component.ts`

---

### 5. `/admin/disputes` - Dispute Management (Admin)
**Purpose:** Comprehensive admin interface for resolving platform disputes

**Key Features:**
- **Disputes List (Sidebar):**
  - Filterable dispute list
  - Status filters (All, Pending, In Progress, Resolved)
  - Message count indicator
  - Click to select dispute

- **Dispute Details Panel:**
  - Dispute ID and task reference
  - Status badge with color coding
  - Participant information

- **Messaging System:**
  - Full message history
  - Admin messages highlighted differently
  - Timestamps for all messages
  - System notifications (e.g., "Admins are currently busy")
  - Average response time display

- **Admin Actions:**
  - Send messages to disputing parties
  - Resolve Dispute button (shows modal)
  - Add resolution notes/explanation
  - Confirm resolution action

- **Resolve Modal:**
  - Text area for resolution notes
  - Clear explanation of how dispute was resolved
  - Mark as Resolved button
  - Saves notes to dispute record

- **Status Indicators:**
  - Yellow badge = PENDING
  - Blue badge = IN_PROGRESS
  - Green badge = RESOLVED
  - Slate = Other statuses

**Component:** `AdminDisputesComponent` (Standalone)
**Path:** `/src/app/pages/admin-dashboard/disputes.component.ts`

---

## Navigation

### Quick Access Menu
A new dropdown menu has been added to the navbar for quick navigation:
- **File icon** in navbar opens dropdown
- Shows contextual links based on user role

**Available to All Users:**
- `/reviews` - View all reviews
- `/disputes` - Manage personal disputes

**Available to Admin Only:**
- `/admin/users` - User Management
- `/admin/reviews` - Task Review Queue
- `/admin/disputes` - Dispute Management

### Direct Navigation
- **Reviews:** Click "Reviews" in navbar dropdown or navigate to `/reviews`
- **Disputes:** Click "Disputes" in navbar dropdown or click bell icon, or navigate to `/disputes`
- **Admin Pages:** Available in navbar dropdown when logged in as admin

---

## Data Models & Types

### Key Interfaces Used:

**User Interface:**
```typescript
interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole; // CUSTOMER, WORKER, ADMIN
    avatar: string;
    phone?: string;
    rating: number;
    completedJobs: number;
    status: UserStatus; // ACTIVE, SUSPENDED, UNVERIFIED
    skills?: string[];
    createdDate?: string;
}
```

**Review Interface:**
```typescript
interface Review {
    id: string;
    taskId: string;
    reviewerId: string;
    reviewerName: string;
    rating: number; // 1-5
    comment: string;
    createdDate: string;
}
```

**Dispute Interface:**
```typescript
interface Dispute {
    id: string;
    taskId: string;
    initiatorId: string;
    respondentId: string;
    reason: string;
    status: DisputeStatus; // PENDING, IN_PROGRESS, RESOLVED
    messages: ChatMessage[];
    createdDate: string;
    resolvedDate?: string;
    adminNotes?: string;
}
```

**Task Interface:**
```typescript
interface Task {
    id: string;
    title: string;
    description: string;
    category: string;
    status: TaskStatus; // ADMIN_REVIEW, RECEIVING_BIDS, ASSIGNED, etc.
    budgetMin: number;
    budgetMax: number;
    reviews: Review[];
    adminReviewNotes?: string;
    createdDate?: string;
}
```

---

## API Integration Points

### AppService Methods Used:

**User Management:**
- `createWorker(workerData)` - Create new worker
- `updateUser(userId, updates)` - Update user info
- `suspendUser(userId)` - Suspend user
- `activateUser(userId)` - Reactivate user
- `verifyUser(userId)` - Verify worker

**Task Management:**
- `approveTaskForBidding(taskId, notes)` - Approve task
- `rejectTask(taskId, reason)` - Reject task

**Disputes:**
- `createDispute(disputeData)` - Create dispute
- `addMessageToDispute(disputeId, message)` - Add message
- `resolveDispute(disputeId, adminNotes)` - Resolve dispute

**Data Access:**
- `appService.users$` - Observable of all users
- `appService.tasks$` - Observable of all tasks
- `appService.disputes$` - Observable of all disputes
- `appService.currentUser` - Current logged-in user

---

## Functional Features

### 1. Real-time Updates
- All pages subscribe to observable streams
- UI updates automatically when data changes
- No page refresh needed

### 2. Role-Based Access
- Features filtered by user role
- Admin sees additional pages and actions
- User actions match their role permissions

### 3. Status Tracking
- Color-coded status badges
- Status filtering capabilities
- Status-specific actions

### 4. Search & Filter
- Quick filtering options
- Search by keywords
- Combined filter results

### 5. User-Friendly Feedback
- Confirmation dialogs for destructive actions
- Visual loading states
- Success/error notifications
- Helpful empty states

---

## UI Components Used

- **Angular Components:** Standalone components with CommonModule
- **Forms:** FormsModule with ngModel binding
- **Icons:** Lucide Angular icons
- **Styling:** Tailwind CSS
- **Layout:** Responsive grid/flex layouts
- **Modal/Dropdown:** Angular *ngIf conditional rendering

---

## Security Considerations

### Current Implementation:
- Role-based access control
- User verification status tracking
- Admin action logging (in notes/audit trail)
- Protected actions with confirmation dialogs

### Best Practices:
- All admin actions logged to `adminNotes` field
- User status checks before sensitive operations
- Input validation in forms
- Confirmation dialogs for destructive actions

---

## Future Enhancement Opportunities

1. **Notifications:** Real-time notification system
2. **Analytics:** Dashboards with charts and metrics
3. **Bulk Actions:** Admin bulk user operations
4. **Export:** Export disputes/reviews to CSV
5. **Search:** Advanced search with multiple criteria
6. **Pagination:** Lazy loading for large datasets
7. **Caching:** Optimize API calls with caching
8. **Testing:** Add unit and e2e tests

---

## File Structure

```
src/app/
├── pages/
│   ├── reviews/
│   │   └── reviews.component.ts (NEW)
│   ├── disputes/
│   │   └── disputes.component.ts (EXISTING)
│   └── admin-dashboard/
│       ├── user-management.component.ts
│       ├── task-review.component.ts
│       └── disputes.component.ts
├── app.routes.ts (UPDATED with /reviews route)
└── components/
    └── navbar/ (ENHANCED with quick menu)
```

---

## Testing the Pages

### Sample Test Flow:

1. **Login as Admin:** Select "Administrator" role
2. **Access Reviews:** Click navbar dropdown → Reviews
3. **Access Admin Panel:**
   - Click navbar dropdown → User Management
   - View all users with filtering
   - Try add new worker form
   
4. **Admin Review Queue:**
   - Click navbar dropdown → Task Reviews
   - Approve/Reject pending tasks
   - Add review notes

5. **Manage Disputes:**
   - Click navbar dropdown → Manage Disputes
   - Select dispute from list
   - Send message to parties
   - Resolve dispute with notes

6. **User Disputes:**
   - Switch to Customer role
   - Click bell icon or "Disputes" in dropdown
   - View personal disputes
   - Send messages

7. **View Reviews:**
   - Click navbar dropdown → Reviews
   - Filter by rating
   - Sort by different criteria
   - Search for specific reviews

---

## Contact & Support

For issues or feature requests related to these pages, please refer to the main project documentation and issue tracker.
