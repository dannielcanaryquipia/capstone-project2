# Session Management Implementation

This document explains the comprehensive session management system implemented to solve the user session persistence issues in the React Native Expo app.

## Problem Solved

The app was experiencing the following issues:
1. Users were redirected to auth page when refreshing the app in Expo Go
2. Sessions were not persisted across app restarts
3. Loading states would get stuck when the development server restarted
4. Users would lose their login state unexpectedly

## Solution Overview

A robust session management system has been implemented using:
- **Zustand** for state management with persistence
- **AsyncStorage** for local storage persistence
- **Supabase Auth** for authentication
- **Automatic session refresh** to maintain valid sessions
- **Session restoration** from storage on app startup

## Key Components

### 1. Enhanced useAuth Hook (`hooks/useAuth.ts`)

The main authentication hook that provides:
- Session state management
- User profile management
- Role-based access control (admin, delivery, customer)
- Automatic session persistence
- Session restoration from storage
- Error handling and loading states

**Key Features:**
- `isInitialized`: Tracks if auth has been initialized
- `lastSessionRefresh`: Timestamp of last session refresh
- Automatic session restoration on app startup
- Persistent storage of session and profile data

### 2. Session Persistence Utility (`utils/sessionPersistence.ts`)

Handles saving and loading session data to/from AsyncStorage:
- `saveSession()`: Saves session and profile to storage
- `loadSession()`: Loads session from storage with age validation
- `clearSession()`: Removes session data from storage
- `hasStoredSession()`: Checks if session exists in storage
- `getSessionAge()`: Returns age of stored session

### 3. Session Service (`services/session.service.ts`)

Manages automatic session refresh and validation:
- Automatic token refresh every 5 minutes
- Session validation before expiry
- Auth state change listeners
- Cleanup on sign out

### 4. Updated App Layout (`app/_layout.tsx`)

Enhanced with:
- Improved AuthGuard with proper initialization checks
- Session service initialization
- Better error handling and loading states
- Debug component for testing (development only)

## How It Works

### 1. App Startup
1. App loads and initializes the session service
2. `useAuth` hook checks for stored session in AsyncStorage
3. If stored session exists, it's restored immediately (fast UI)
4. Supabase session is verified in the background
5. If verification fails, stored session is cleared

### 2. Session Persistence
1. Every auth state change is automatically saved to AsyncStorage
2. Session data includes: session, profile, user, roles, timestamp
3. Stored sessions expire after 24 hours for security
4. Session is cleared on sign out

### 3. Automatic Refresh
1. Session service runs every 5 minutes
2. Checks if token is close to expiry (5 minutes buffer)
3. Automatically refreshes token if needed
4. Updates stored session with new token

### 4. Error Handling
1. Network errors don't break the app
2. Invalid sessions are automatically cleared
3. Users are redirected to auth only when necessary
4. Loading states prevent premature navigation

## Usage

### Basic Usage
```typescript
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { 
    user, 
    session, 
    profile, 
    isLoading, 
    isInitialized,
    isAdmin, 
    isDelivery,
    signOut 
  } = useAuth();

  if (!isInitialized || isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <MainApp />;
}
```

### Session Management
```typescript
import { sessionService } from '../services/session.service';

// Initialize session management (done automatically in app layout)
sessionService.initialize();

// Validate current session
const isValid = await sessionService.validateSession();

// Refresh session manually
await sessionService.refreshSession();
```

## Testing

### Debug Component
A debug component is included for development testing:
- Shows current session state
- Displays user information
- Provides buttons to test persistence
- Allows manual session refresh
- Includes sign out functionality

### Testing Scenarios
1. **App Refresh**: User stays logged in after refreshing Expo Go
2. **Server Restart**: User stays logged in after development server restart
3. **Token Expiry**: Session automatically refreshes before expiry
4. **Network Issues**: App handles network errors gracefully
5. **Sign Out**: Session is properly cleared on sign out

## Configuration

### Session Refresh Interval
```typescript
// In services/session.service.ts
private readonly REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
```

### Token Expiry Buffer
```typescript
// In services/session.service.ts
private readonly TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes before expiry
```

### Session Storage Duration
```typescript
// In utils/sessionPersistence.ts
const maxAge = 24 * 60 * 60 * 1000; // 24 hours
```

## Security Considerations

1. **Token Expiry**: Sessions automatically expire after 24 hours
2. **Secure Storage**: Session data is stored in AsyncStorage (encrypted on device)
3. **Validation**: All sessions are validated with Supabase before use
4. **Cleanup**: Sessions are properly cleared on sign out
5. **Refresh**: Tokens are refreshed before expiry to maintain security

## Troubleshooting

### Common Issues

1. **Session not persisting**: Check AsyncStorage permissions
2. **Infinite loading**: Check network connection and Supabase configuration
3. **Wrong role**: Verify profile data in database
4. **Token errors**: Check Supabase auth configuration

### Debug Steps

1. Use the SessionDebug component to check current state
2. Check console logs for auth state changes
3. Verify AsyncStorage has session data
4. Test with different network conditions

## Migration Notes

The old `AuthContext` has been replaced with the new `useAuth` hook. Update any components using the old context:

```typescript
// Old
import { useAuth } from '../contexts/AuthContext';

// New
import { useAuth } from '../hooks/useAuth';
```

The new hook provides the same interface with additional features and better reliability.
