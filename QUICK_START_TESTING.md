# Quick Start - API Integration Testing

## Test the Application

### 1. Start the Application
```bash
npm start
```

Visit: `http://localhost:4200`

### 2. Current Mode: Mock API (Default)
The app is currently using **Mock API mode** - no backend required!

- Click "Continue as Customer/Worker/Admin" to test
- All features work with local mock data
- Perfect for development

## Switch to Real API Mode

### Step 1: Enable API Mode
Edit `src/app/app.service.ts`:
```typescript
// Line 13: Change this flag
const USE_REAL_API = true;  // ← Change from false to true
```

### Step 2: Configure Backend URL
Edit `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7123/api'  // Your ASP.NET backend URL
  // or use ngrok:
  // apiUrl: 'https://your-url.ngrok-free.app/api'
};
```

### Step 3: Start Backend
Make sure your ASP.NET backend is running:
```bash
cd backend-project
dotnet run
```

### Step 4: Restart Angular
```bash
# Stop current server (Ctrl+C)
npm start
```

## Test API Integration

### Test Authentication
```typescript
// In browser console:
const appService = window['ng'].getComponent(document.querySelector('app-root')).appService;

// Test login
await appService.login('user@example.com', 'password123');

// Test register
await appService.register('John Doe', 'john@example.com', 'password123', 'CUSTOMER');
```

### Test Task Creation
```typescript
// Create a task
appService.postTask({
  title: 'Fix Leaky Pipe',
  description: 'Kitchen sink needs repair',
  category: 'plumber',
  budgetMin: 500,
  budgetMax: 2000,
  preferredDate: '2026-02-15',
  location: {
    state: 'California',
    city: 'Los Angeles',
    area: 'Downtown',
    fullAddress: '123 Main St'
  }
});
```

### Monitor API Calls
1. Open Browser DevTools (F12)
2. Go to **Network** tab
3. Filter by **XHR** or **Fetch**
4. Watch API requests in real-time

## Verify Integration

### Check Mock Mode is Working
- [x] Can create tasks
- [x] Can place bids
- [x] Can accept bids
- [x] Can update task status
- [x] Data persists in localStorage

### Check API Mode is Working
- [ ] Login returns JWT token
- [ ] Token is sent in Authorization header
- [ ] Tasks are created on backend
- [ ] Bids are stored in database
- [ ] Status updates sync with backend
- [ ] 401 errors redirect to login

## Debugging

### Check if API Mode is Active
```typescript
// In browser console:
console.log('Using Mock API:', !window.localStorage.getItem('accessToken'));
```

### View Stored Token
```typescript
// In browser console:
console.log('Access Token:', localStorage.getItem('accessToken'));
console.log('Refresh Token:', localStorage.getItem('refreshToken'));
```

### Clear Auth Data
```typescript
// In browser console:
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
localStorage.removeItem('currentUser');
location.reload();
```

## Common Issues

### Issue: "Network Error"
**Solution:** Backend not running or wrong URL in environment.ts

### Issue: "CORS Error"
**Solution:** Backend needs to allow frontend origin in CORS policy

### Issue: "401 Unauthorized"
**Solution:** Token expired - login again

### Issue: Still using mock data in API mode
**Solution:** 
1. Verify `USE_REAL_API = true` in app.service.ts
2. Restart Angular dev server
3. Clear browser cache

## API Endpoints Being Used

### When Creating Task:
```
POST https://localhost:7123/api/tasks
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "...",
  "description": "...",
  "category": "...",
  ...
}
```

### When Placing Bid:
```
POST https://localhost:7123/api/bids
Authorization: Bearer {token}

{
  "taskId": "...",
  "amount": 1500,
  "estimatedDays": 2,
  "message": "..."
}
```

### When Accepting Bid:
```
PUT https://localhost:7123/api/bids/{bidId}/accept
Authorization: Bearer {token}
```

## Success Indicators

### Mock Mode Success:
- ✅ Toast notifications appear
- ✅ UI updates immediately
- ✅ No network requests in DevTools
- ✅ Data in localStorage

### API Mode Success:
- ✅ Network requests visible in DevTools
- ✅ 200 OK responses
- ✅ JWT token in request headers
- ✅ Data synced with backend database

## Next Steps

1. ✅ Test in Mock Mode (works now)
2. ⏳ Build ASP.NET backend (see ASP_NET_API_DOCUMENTATION.md)
3. ⏳ Switch to API Mode
4. ⏳ Test full integration
5. ⏳ Deploy to production

---

**Your app is fully integrated and ready for both mock and real API testing!**
