/**
 * Storage service for persisting org chart settings
 * Uses backend API for centralized storage shared across all users
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://proclip-org-chart.vercel.app';

export class StorageService {
  /**
   * Get list of excluded user IDs
   */
  async getExcludedUsers(): Promise<Set<string>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/excluded-users`);

      if (!response.ok) {
        throw new Error(`Failed to fetch excluded users: ${response.status}`);
      }

      const data = await response.json();
      return new Set(data.excludedUsers || []);
    } catch (error) {
      console.error('Error fetching excluded users:', error);
      // Fallback to localStorage if API fails
      return this.getExcludedUsersFromLocalStorage();
    }
  }

  /**
   * Save list of excluded user IDs
   */
  async saveExcludedUsers(excludedUserIds: Set<string>): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/excluded-users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          excludedUsers: Array.from(excludedUserIds),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save excluded users: ${response.status}`);
      }

      // Also save to localStorage as backup
      this.saveExcludedUsersToLocalStorage(excludedUserIds);
    } catch (error) {
      console.error('Error saving excluded users:', error);
      // Fallback to localStorage if API fails
      this.saveExcludedUsersToLocalStorage(excludedUserIds);
      throw error;
    }
  }

  /**
   * Fallback: Get from localStorage
   */
  private getExcludedUsersFromLocalStorage(): Set<string> {
    try {
      const stored = localStorage.getItem('proclip-excluded-users');
      if (stored) {
        return new Set(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
    }
    return new Set();
  }

  /**
   * Fallback: Save to localStorage
   */
  private saveExcludedUsersToLocalStorage(excludedUserIds: Set<string>): void {
    try {
      localStorage.setItem(
        'proclip-excluded-users',
        JSON.stringify(Array.from(excludedUserIds))
      );
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }
}

export const storageService = new StorageService();
