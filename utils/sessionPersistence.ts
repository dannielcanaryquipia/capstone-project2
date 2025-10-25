import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '@supabase/supabase-js';

const SESSION_KEY = 'supabase_session';
const PROFILE_KEY = 'user_profile';

export interface StoredSession {
  session: Session | null;
  profile: any;
  timestamp: number;
}

export const sessionPersistence = {
  /**
   * Save session to storage
   */
  async saveSession(session: Session | null, profile: any = null) {
    try {
      const storedData: StoredSession = {
        session,
        profile,
        timestamp: Date.now(),
      };
      
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(storedData));
      console.log('Session saved to storage');
    } catch (error) {
      console.warn('Failed to save session:', error);
    }
  },

  /**
   * Load session from storage
   */
  async loadSession(): Promise<StoredSession | null> {
    try {
      const storedData = await AsyncStorage.getItem(SESSION_KEY);
      if (!storedData) return null;

      const parsed: StoredSession = JSON.parse(storedData);
      
      // Check if session is not too old (24 hours max)
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      if (Date.now() - parsed.timestamp > maxAge) {
        console.log('Stored session is too old, clearing...');
        await this.clearSession();
        return null;
      }

      return parsed;
    } catch (error) {
      console.warn('Failed to load session:', error);
      return null;
    }
  },

  /**
   * Clear session from storage
   */
  async clearSession() {
    try {
      await AsyncStorage.removeItem(SESSION_KEY);
      await AsyncStorage.removeItem(PROFILE_KEY);
      console.log('Session cleared from storage');
    } catch (error) {
      console.warn('Failed to clear session:', error);
    }
  },

  /**
   * Check if session exists in storage
   */
  async hasStoredSession(): Promise<boolean> {
    try {
      const storedData = await AsyncStorage.getItem(SESSION_KEY);
      return storedData !== null;
    } catch (error) {
      console.warn('Failed to check stored session:', error);
      return false;
    }
  },

  /**
   * Get session age in milliseconds
   */
  async getSessionAge(): Promise<number | null> {
    try {
      const storedData = await AsyncStorage.getItem(SESSION_KEY);
      if (!storedData) return null;

      const parsed: StoredSession = JSON.parse(storedData);
      return Date.now() - parsed.timestamp;
    } catch (error) {
      console.warn('Failed to get session age:', error);
      return null;
    }
  },
};
