# API Integration Guide

## Overview
The application now supports both **Mock API** (local development) and **Real API** (ASP.NET backend) modes.

## Quick Setup

### 1. Configure API Mode

Edit `src/app/app.service.ts` and set the mode:

```typescript
// Set to true to use real API, false to use mock data
const USE_REAL_API = false;  // Change to true when backend is ready
```

### 2. Configure API URL

Edit `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7123/api',
  // Or use ngrok URL:
  // apiUrl: 'https://your-ngrok-url.ngrok-free.app/api'
};
```

## Switching Modes

### Using Mock API (Default - No Backend Required)
- Set `USE_REAL_API = false` in `app.service.ts`
- All data is stored in memory and localStorage
- Quick role switching with demo users
- Perfect for frontend development and testing

### Using Real API (Requires ASP.NET Backend)
1. Set `USE_REAL_API = true` in `app.service.ts`
2. Update `apiUrl` in `environment.ts` with your backend URL
3. Make sure your ASP.NET backend is running
4. Use proper email/password authentication

## API Integration Status

### ✅ Completed
- Environment configuration
- API type definitions
- HTTP interceptor for authentication
- TaskFlow API service (auth, tasks, bids)
- API mapper (converts API types to local types)
- AppService dual-mode support (mock + real API)
- HTTP client configuration

### 🔧 Implemented API Methods

#### Authentication
- `login(email, password)` - Login with credentials
- `register(name, email, password, role)` - Register new user
- `logout()` - Logout and clear tokens
- `refreshToken(refreshToken)` - Refresh JWT token

#### Tasks
- `postTask(taskData)` - Create new task
- `getTasks(filters)` - Get tasks with filters
- `updateTaskStatus(taskId, status)` - Update task status
- `deleteTask(taskId)` - Delete task

#### Bids
- `placeBid(bidData)` - Create a bid on a task
- `selectWorker(taskId, bidId)` - Accept a bid (customer)
- `getBidsForTask(taskId)` - Get all bids for a task
- `rejectBid(bidId)` - Reject a bid

### 📋 To Be Implemented (if needed)
- Reviews API integration
- Disputes API integration
- User management API integration
- File upload API integration
- Real-time notifications (SignalR)

## API Service Files

### Core Files
```
src/
├── environments/
│   ├── environment.ts              # Development config (localhost/ngrok)
│   └── environment.prod.ts         # Production config
├── app/
│   ├── app.service.ts              # Main service (dual-mode)
│   ├── interceptors/
│   │   └── auth.interceptor.ts     # JWT token interceptor
│   └── services/
│       ├── taskflow-api.service.ts # Real API service
│       ├── api-types.ts            # TypeScript interfaces
│       ├── api-mapper.ts           # Type conversion utility
│       └── mock-api.service.ts     # Mock data service (existing)
```

## Authentication Flow

### Mock Mode
1. User clicks role button (Customer/Worker/Admin)
2. Demo user is loaded instantly
3. Navigate to dashboard

### API Mode
1. User enters email/password on login page
2. Call `appService.login(email, password)`
3. Backend validates and returns JWT token
4. Token stored in localStorage
5. HTTP interceptor adds token to all requests
6. Navigate to dashboard based on role

## Error Handling

All API errors are caught and displayed via toast notifications:
```typescript
try {
  await appService.login(email, password);
} catch (error) {
  // Error automatically shown via toast
  // Error logged to console
}
```

## Testing Checklist

### Mock Mode (Default)
- [x] Create task
- [x] Place bid
- [x] Accept bid
- [x] Update task status
- [x] View tasks
- [x] Role switching

### API Mode (When Backend Ready)
- [ ] Register new user
- [ ] Login with credentials
- [ ] Create task via API
- [ ] Place bid via API
- [ ] Accept bid via API
- [ ] Update status via API
- [ ] Token refresh on expiry
- [ ] Logout clears tokens
- [ ] 401 redirects to login

## Common Issues & Solutions

### Issue: "Network Error"
- Ensure backend is running
- Check API URL in environment.ts
- Verify CORS is configured on backend

### Issue: "401 Unauthorized"
- Token may be expired
- Try logging in again
- Check token is being sent in headers

### Issue: "CORS Error"
- Backend needs to allow frontend origin
- Add ngrok URL to CORS policy if using ngrok

### Issue: Mock data not working in API mode
- Set `USE_REAL_API = false` to use mock data
- Mock mode is independent of backend

## Example Usage

### In Components
```typescript
// Current usage (no changes needed)
this.appService.postTask(taskData);
this.appService.placeBid(bidData);
this.appService.updateTaskStatus(taskId, status);

// The AppService automatically handles mock vs API mode
```

### Switching to Real API
1. Start your ASP.NET backend
2. Update environment.ts with backend URL
3. Change `USE_REAL_API = true` in app.service.ts
4. Restart Angular dev server
5. Use email/password authentication

## Development Workflow

### Frontend Only Development
```bash
# Use mock mode (no backend needed)
USE_REAL_API = false

# All features work with mock data
# Fast iteration, no API calls
```

### Full Stack Development
```bash
# Terminal 1: Start ASP.NET backend
cd backend
dotnet run

# Terminal 2: Start ngrok (if needed)
ngrok http 7123

# Terminal 3: Start Angular frontend
cd frontend
npm start

# Enable API mode
USE_REAL_API = true
```

## Next Steps

1. **Test Mock Mode**: Verify all features work (default setup)
2. **Setup Backend**: Follow ASP_NET_API_DOCUMENTATION.md
3. **Enable API Mode**: Change flag and test with real backend
4. **Implement Remaining APIs**: Reviews, disputes, etc. as needed

## Support

For issues:
1. Check browser console for errors
2. Verify network requests in DevTools
3. Check backend logs in Visual Studio
4. Test endpoints in Swagger UI first
5. Ensure ngrok tunnel is active (if using ngrok)
