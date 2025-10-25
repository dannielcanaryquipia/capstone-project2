import { useAuthStore } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

class SessionService {
  private refreshInterval: ReturnType<typeof setInterval> | null = null;
  private readonly REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private readonly TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes before expiry

  /**
   * Initialize session management
   */
  initialize() {
    this.startSessionRefresh();
    this.setupAuthStateListener();
  }

  /**
   * Start automatic session refresh
   */
  private startSessionRefresh() {
    // Clear existing interval
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    // Set up new interval
    this.refreshInterval = setInterval(async () => {
      await this.checkAndRefreshSession();
    }, this.REFRESH_INTERVAL);
  }

  /**
   * Check if session needs refresh and refresh if necessary
   */
  private async checkAndRefreshSession() {
    try {
      const state = useAuthStore.getState();
      const { session } = state;

      if (!session?.access_token) {
        return;
      }

      // Check if token is close to expiry
      const tokenExpiry = session.expires_at ? session.expires_at * 1000 : 0;
      const now = Date.now();
      const timeUntilExpiry = tokenExpiry - now;

      if (timeUntilExpiry <= this.TOKEN_EXPIRY_BUFFER) {
        console.log('Token is close to expiry, refreshing...');
        await this.refreshSession();
      }
    } catch (error) {
      console.warn('Error checking session:', error);
    }
  }

  /**
   * Refresh the current session
   */
  async refreshSession() {
    try {
      const state = useAuthStore.getState();
      await state.refreshSession();
    } catch (error) {
      console.warn('Failed to refresh session:', error);
      // If refresh fails, sign out the user
      await this.handleSessionExpired();
    }
  }

  /**
   * Handle session expiry
   */
  private async handleSessionExpired() {
    try {
      const state = useAuthStore.getState();
      await state.signOut();
    } catch (error) {
      console.warn('Error during session expiry handling:', error);
    }
  }

  /**
   * Setup auth state change listener
   */
  private setupAuthStateListener() {
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Session service - Auth state change:', event);
      
      if (event === 'SIGNED_OUT') {
        this.stopSessionRefresh();
      } else if (event === 'SIGNED_IN' && session) {
        this.startSessionRefresh();
      }
    });
  }

  /**
   * Stop session refresh
   */
  private stopSessionRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  /**
   * Validate current session
   */
  async validateSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.warn('Session validation error:', error);
        return false;
      }

      if (!session) {
        return false;
      }

      // Check if session is expired
      const now = Date.now();
      const tokenExpiry = session.expires_at ? session.expires_at * 1000 : 0;
      
      if (tokenExpiry <= now) {
        console.log('Session expired, attempting refresh...');
        await this.refreshSession();
        return false;
      }

      return true;
    } catch (error) {
      console.warn('Error validating session:', error);
      return false;
    }
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.stopSessionRefresh();
  }
}

export const sessionService = new SessionService();
