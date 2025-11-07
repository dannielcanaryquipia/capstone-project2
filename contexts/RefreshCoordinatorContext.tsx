import React, { createContext, useCallback, useContext, useRef } from 'react';

interface RefreshCoordinatorContextType {
  // Register a refresh function for a specific data type
  registerRefresh: (key: string, refreshFn: () => Promise<void> | void) => () => void;
  // Trigger refresh for specific data types (debounced to prevent excessive refreshes)
  refresh: (keys: string[]) => Promise<void>;
  // Trigger refresh for all registered data types
  refreshAll: () => Promise<void>;
}

const RefreshCoordinatorContext = createContext<RefreshCoordinatorContextType | undefined>(undefined);

export const useRefreshCoordinator = () => {
  const context = useContext(RefreshCoordinatorContext);
  if (!context) {
    throw new Error('useRefreshCoordinator must be used within a RefreshCoordinatorProvider');
  }
  return context;
};

interface RefreshCoordinatorProviderProps {
  children: React.ReactNode;
}

// Debounce utility
const debounce = <T extends (...args: any[]) => Promise<void> | void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => Promise<void>) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let pendingPromise: Promise<void> | null = null;
  let resolvePending: (() => void) | null = null;
  let rejectPending: ((reason?: unknown) => void) | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    if (!pendingPromise) {
      pendingPromise = new Promise<void>((resolve, reject) => {
        resolvePending = resolve;
        rejectPending = reject;
      });
    }

    timeout = setTimeout(async () => {
      timeout = null;
      try {
        await func(...args);
        resolvePending?.();
      } catch (error) {
        rejectPending?.(error);
      } finally {
        pendingPromise = null;
        resolvePending = null;
        rejectPending = null;
      }
    }, wait);

    return pendingPromise;
  };
};

export const RefreshCoordinatorProvider: React.FC<RefreshCoordinatorProviderProps> = ({ children }) => {
  // Store registered refresh functions
  const refreshFunctions = useRef<Map<string, () => Promise<void> | void>>(new Map());
  // Track if a refresh is in progress to prevent cascading refreshes
  const isRefreshing = useRef<Set<string>>(new Set());
  // Track last refresh time to prevent too frequent refreshes
  const lastRefreshTime = useRef<Map<string, number>>(new Map());

  // Minimum time between refreshes for the same key (in milliseconds)
  const MIN_REFRESH_INTERVAL = 1000; // 1 second

  const registerRefresh = useCallback((key: string, refreshFn: () => Promise<void> | void) => {
    refreshFunctions.current.set(key, refreshFn);
    
    // Return unregister function
    return () => {
      refreshFunctions.current.delete(key);
      isRefreshing.current.delete(key);
      lastRefreshTime.current.delete(key);
    };
  }, []);

  const refresh = useCallback(async (keys: string[]) => {
    const now = Date.now();
    const keysToRefresh: string[] = [];

    // Filter out keys that are already refreshing or were refreshed too recently
    for (const key of keys) {
      const lastRefresh = lastRefreshTime.current.get(key) || 0;
      const timeSinceLastRefresh = now - lastRefresh;

      if (!isRefreshing.current.has(key) && timeSinceLastRefresh >= MIN_REFRESH_INTERVAL) {
        keysToRefresh.push(key);
      }
    }

    if (keysToRefresh.length === 0) {
      console.log('🔄 RefreshCoordinator - Skipping refresh, too soon or already refreshing');
      return;
    }

    // Mark as refreshing
    keysToRefresh.forEach(key => {
      isRefreshing.current.add(key);
      lastRefreshTime.current.set(key, now);
    });

    try {
      // Execute all refreshes in parallel
      const refreshPromises = keysToRefresh.map(async (key) => {
        const refreshFn = refreshFunctions.current.get(key);
        if (refreshFn) {
          try {
            console.log(`🔄 RefreshCoordinator - Refreshing: ${key}`);
            await refreshFn();
            console.log(`✅ RefreshCoordinator - Refreshed: ${key}`);
          } catch (error) {
            console.error(`❌ RefreshCoordinator - Error refreshing ${key}:`, error);
          }
        }
      });

      await Promise.all(refreshPromises);
    } finally {
      // Mark as no longer refreshing
      keysToRefresh.forEach(key => {
        isRefreshing.current.delete(key);
      });
    }
  }, []);

  const refreshAll = useCallback(async () => {
    const allKeys = Array.from(refreshFunctions.current.keys());
    await refresh(allKeys);
  }, [refresh]);

  // Debounced version of refresh to prevent rapid successive calls
  const debouncedRefresh = useCallback(
    debounce(async (keys: string[]) => {
      await refresh(keys);
    }, 300), // 300ms debounce
    [refresh]
  );

  const value: RefreshCoordinatorContextType = {
    registerRefresh,
    refresh: debouncedRefresh,
    refreshAll,
  };

  return (
    <RefreshCoordinatorContext.Provider value={value}>
      {children}
    </RefreshCoordinatorContext.Provider>
  );
};

