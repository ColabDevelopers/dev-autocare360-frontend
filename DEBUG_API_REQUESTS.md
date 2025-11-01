# API Request Debugging Guide

## Overview

We've added comprehensive logging to help debug the 403 error issue with timelogs. The logging system will show you exactly what's being sent to the backend.

## What Was Added

### 1. Enhanced API Call Logging (`lib/api.ts`)

Every API request now logs:

- **Request Details:**
  - HTTP method (GET, POST, etc.)
  - Full URL being called
  - Token presence and preview
  - All request headers
  - Request body (if present)

- **Response Details:**
  - HTTP status code
  - Response headers
  - Error details (if request fails)

### 2. Service Layer Logging (`services/timelogs.ts`)

The `getTimeLogs()` function now logs:

- When it's called and with what parameters
- The endpoint being requested
- The response received
- Any errors that occur

### 3. Page Load Authentication Check (`app/employee/time-logs/page.tsx`)

When the time-logs page loads, it automatically logs:

- Whether a token exists in localStorage
- A preview of the token

### 4. Browser Console Debug Utility

You can manually check authentication state by typing in the browser console:

```javascript
debugAuth()
```

This will display:

- Token existence
- Token length
- Full token value
- Decoded JWT payload
- Token expiry time and status

## How to Use

### Step 1: Open Developer Console

1. Open your browser's Developer Tools (F12)
2. Go to the Console tab

### Step 2: Navigate to Time Logs Page

1. Log in to the application
2. Navigate to the Employee Time Logs page
3. Watch the console output

### Step 3: Analyze the Logs

#### Look for the Request Log Group

You'll see output like:

```
🌐 API Request: GET /time-logs
  📍 Full URL: http://localhost:8080/time-logs
  🔐 Token Present: true
  🎫 Token Preview: Bearer eyJhbGciOiJ...
  📏 Token Length: 180
  📋 Request Headers:
    ┌─────────────────┬──────────────────┐
    │ Authorization   │ Bearer eyJhbGci...│
    │ Content-Type    │ application/json │
    └─────────────────┴──────────────────┘
```

#### Look for the Response Log Group

```
📥 API Response: 403 Forbidden
  ✅ Status: 403
  🔗 URL: http://localhost:8080/time-logs
  📋 Response Headers: {...}
```

## What to Check

### If you see "NO TOKEN FOUND":

❌ **Problem:** The token is not being saved to localStorage
**Solution:** Check your login logic and ensure `localStorage.setItem('accessToken', token)` is called

### If Token is Present but You Get 403:

Compare the token from the frontend with the one that works in Postman:

1. **In the browser console, run:**

   ```javascript
   debugAuth()
   ```

   Copy the full token value

2. **In Postman:**
   - Check the Authorization header value
   - Compare both tokens character by character

### Common Issues to Check:

1. **Token Format Mismatch**
   - Frontend might be sending: `Bearer eyJhbGciOiJ...`
   - Backend expects: `eyJhbGciOiJ...` (without "Bearer")
   - OR vice versa

2. **Token Prefix Issue**
   - Check if "Bearer " (with space) is included twice
   - Check if "Bearer " is missing

3. **Token Expiry**
   - The `debugAuth()` function will show if token is expired
   - Compare expiry times

4. **Different Token Values**
   - Frontend might have an old/cached token
   - Postman might be using a fresh token

5. **CORS or Cookie Issues**
   - Check if backend expects cookies in addition to headers
   - Check CORS configuration

## Example Output

### Successful Request:

```
🌐 API Request: GET /time-logs
  [... request details ...]

📥 API Response: 200 OK
  ✅ Status: 200

✅ getTimeLogs response: [{...}, {...}]
```

### Failed Request (403):

```
🌐 API Request: GET /time-logs
  [... request details ...]

📥 API Response: 403 Forbidden
  ✅ Status: 403

❌ HTTP ERROR 403 for /time-logs
❌ Error Response Body: {error: "Access Denied"}
❌ getTimeLogs failed: Error: HTTP error! status: 403
```

## Next Steps

After collecting the logs:

1. **Compare Headers:**
   - Compare the logged headers from frontend vs what Postman sends
   - Look for missing or extra headers

2. **Compare Token Format:**
   - Check if token format matches between frontend and Postman

3. **Check Backend Logs:**
   - Look at backend logs to see what it's receiving
   - Check if backend authentication filter is rejecting the request

4. **Test Token Manually:**
   - Copy the exact token from frontend console
   - Paste it into Postman and test
   - If it fails in Postman too, token is the issue

## Cleaning Up

Once you've resolved the issue, you can remove or reduce the logging by:

1. Commenting out the detailed console.log statements
2. Keeping only essential error logging
3. Setting a debug flag to enable/disable verbose logging

## Additional Help

If the issue persists after checking all of the above:

- Share the complete console output (from both request and response groups)
- Share the backend API logs for the same request
- Compare the exact Authorization header values from both scenarios
