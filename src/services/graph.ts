import { Client } from '@microsoft/microsoft-graph-client';
import { User, OrgNode } from '../types';
import { authService } from './auth';

/**
 * Microsoft Graph API service
 */
class GraphService {
  private client: Client | null = null;

  /**
   * Initialize Graph client with authentication
   */
  async initialize(): Promise<void> {
    const token = await authService.getAccessToken();

    this.client = Client.init({
      authProvider: (done) => {
        done(null, token);
      },
    });
  }

  /**
   * Get current user's profile
   */
  async getCurrentUser(): Promise<User> {
    if (!this.client) throw new Error('Graph client not initialized');

    try {
      const user = await this.client.api('/me').get();
      return this.mapGraphUser(user);
    } catch (error) {
      console.error('Failed to get current user:', error);
      throw error;
    }
  }

  /**
   * Get all users in the organization
   * For 45 employees, we can fetch all at once
   */
  async getAllUsers(): Promise<User[]> {
    if (!this.client) throw new Error('Graph client not initialized');

    try {
      const response = await this.client
        .api('/users')
        .select('id,displayName,givenName,surname,mail,userPrincipalName,jobTitle,department,officeLocation,mobilePhone,businessPhones')
        .top(100) // More than enough for 45 employees
        .get();

      return response.value.map(this.mapGraphUser);
    } catch (error) {
      console.error('Failed to get all users:', error);
      throw error;
    }
  }

  /**
   * Get user's manager
   */
  async getUserManager(userId: string): Promise<User | null> {
    if (!this.client) throw new Error('Graph client not initialized');

    try {
      const manager = await this.client.api(`/users/${userId}/manager`).get();
      return this.mapGraphUser(manager);
    } catch (error) {
      // User might not have a manager (CEO)
      if ((error as any).statusCode === 404) {
        return null;
      }
      console.error(`Failed to get manager for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get user's direct reports
   */
  async getUserDirectReports(userId: string): Promise<User[]> {
    if (!this.client) throw new Error('Graph client not initialized');

    try {
      const response = await this.client
        .api(`/users/${userId}/directReports`)
        .select('id,displayName,givenName,surname,mail,userPrincipalName,jobTitle,department,officeLocation')
        .get();

      return response.value.map(this.mapGraphUser);
    } catch (error) {
      console.error(`Failed to get direct reports for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Get user's photo as blob URL
   */
  async getUserPhoto(userId: string): Promise<string | null> {
    if (!this.client) throw new Error('Graph client not initialized');

    try {
      const photo = await this.client.api(`/users/${userId}/photo/$value`).get();
      const blob = new Blob([photo], { type: 'image/jpeg' });
      return URL.createObjectURL(blob);
    } catch (error) {
      // Photo might not exist
      return null;
    }
  }

  /**
   * Build organization tree from users and manager relationships
   */
  async buildOrgTree(users: User[]): Promise<OrgNode | null> {
    if (!this.client) throw new Error('Graph client not initialized');

    // Create a map of users with their manager IDs
    const userMap = new Map<string, { user: User; managerId: string | null }>();

    // Fetch manager relationships for all users
    for (const user of users) {
      try {
        const manager = await this.getUserManager(user.id);
        userMap.set(user.id, {
          user,
          managerId: manager?.id || null,
        });
      } catch (error) {
        console.error(`Failed to get manager for ${user.displayName}:`, error);
        userMap.set(user.id, { user, managerId: null });
      }
    }

    // Find the CEO (person with no manager)
    const ceo = Array.from(userMap.values()).find(entry => entry.managerId === null);

    if (!ceo) {
      console.error('No CEO found (no user without manager)');
      return null;
    }

    // Recursive function to build tree
    const buildNode = (userId: string, level: number = 0): OrgNode => {
      const entry = userMap.get(userId);
      if (!entry) {
        throw new Error(`User ${userId} not found in map`);
      }

      // Find direct reports
      const directReportIds = Array.from(userMap.entries())
        .filter(([_, value]) => value.managerId === userId)
        .map(([id]) => id);

      const children = directReportIds.map(id => buildNode(id, level + 1));

      return {
        user: entry.user,
        managerId: entry.managerId,
        directReports: directReportIds,
        level,
        children,
      };
    };

    return buildNode(ceo.user.id);
  }

  /**
   * Map Graph API user to our User type
   */
  private mapGraphUser(graphUser: any): User {
    return {
      id: graphUser.id,
      displayName: graphUser.displayName,
      givenName: graphUser.givenName,
      surname: graphUser.surname,
      mail: graphUser.mail,
      userPrincipalName: graphUser.userPrincipalName,
      jobTitle: graphUser.jobTitle,
      department: graphUser.department,
      officeLocation: graphUser.officeLocation,
      mobilePhone: graphUser.mobilePhone,
      businessPhones: graphUser.businessPhones,
    };
  }
}

export const graphService = new GraphService();
