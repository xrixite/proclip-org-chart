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
   * Get access token for direct API calls
   */
  async getAccessToken(): Promise<string> {
    return authService.getAccessToken();
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
   * Filters out unlicensed and blocked users
   */
  async getAllUsers(): Promise<User[]> {
    if (!this.client) throw new Error('Graph client not initialized');

    try {
      const response = await this.client
        .api('/users')
        .select('id,displayName,givenName,surname,mail,userPrincipalName,jobTitle,department,officeLocation,mobilePhone,businessPhones,accountEnabled,assignedLicenses')
        .filter('accountEnabled eq true') // Only active users
        .top(100)
        .get();

      // Filter to only users with at least one license
      const licensedUsers = response.value.filter((user: any) =>
        user.assignedLicenses && user.assignedLicenses.length > 0
      );

      return licensedUsers.map(this.mapGraphUser);
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
    console.log('Total users in map:', userMap.size);
    console.log('User manager IDs:', Array.from(userMap.values()).map(e => ({ name: e.user.displayName, managerId: e.managerId })));

    const ceoCandidates = Array.from(userMap.values()).filter(entry => entry.managerId === null);
    console.log('CEO candidates found:', ceoCandidates.length);

    if (ceoCandidates.length === 0) {
      console.error('No CEO found (no user without manager)');
      return null;
    }

    // If multiple users have no manager, pick the first one
    const ceo = ceoCandidates[0];

    if (ceoCandidates.length > 1) {
      console.warn(`Found ${ceoCandidates.length} users without managers. Using ${ceo.user.displayName} as CEO. Others will appear as siblings.`);
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

      // Sort direct reports by department to visually cluster them
      const departmentGroups = new Map<string, string[]>();
      for (const reportId of directReportIds) {
        const reportEntry = userMap.get(reportId);
        const dept = reportEntry?.user.department || 'Unassigned';
        if (!departmentGroups.has(dept)) {
          departmentGroups.set(dept, []);
        }
        departmentGroups.get(dept)!.push(reportId);
      }

      // Flatten the groups back to a sorted list (grouped by department)
      const sortedReportIds: string[] = [];
      for (const [_, memberIds] of departmentGroups.entries()) {
        sortedReportIds.push(...memberIds);
      }

      // Build nodes for all reports (no department card nodes)
      const children = sortedReportIds.map(id => buildNode(id, level + 1));

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
