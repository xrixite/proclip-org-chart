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
      console.log('📊 Calling Graph API: /me');
      const user = await this.client.api('/me').get();
      console.log('✅ Graph API /me success');
      return this.mapGraphUser(user);
    } catch (error: any) {
      console.error('❌ Failed to get current user:', error);
      console.error('Error status:', error?.statusCode);
      console.error('Error message:', error?.message);
      console.error('Error body:', error?.body);
      throw error;
    }
  }

  /**
   * Get user photo URL
   */
  async getUserPhoto(userId: string): Promise<string | undefined> {
    if (!this.client) throw new Error('Graph client not initialized');

    try {
      // Try to get photo blob
      const photoBlob = await this.client
        .api(`/users/${userId}/photo/$value`)
        .get();

      // Convert blob to object URL
      const url = URL.createObjectURL(photoBlob);
      return url;
    } catch (error: any) {
      // User might not have a photo - this is normal, not an error
      if (error?.statusCode === 404) {
        return undefined;
      }
      console.warn(`Could not fetch photo for user ${userId}:`, error?.message);
      return undefined;
    }
  }

  /**
   * Get all users in the organization
   * Filters out unlicensed and blocked users
   */
  async getAllUsers(): Promise<User[]> {
    if (!this.client) throw new Error('Graph client not initialized');

    try {
      let allUsers: any[] = [];
      let nextLink: string | undefined = undefined;

      // Fetch all pages of users
      do {
        const response: any = nextLink
          ? await this.client.api(nextLink).get()
          : await this.client
              .api('/users')
              .select('id,displayName,givenName,surname,mail,userPrincipalName,jobTitle,department,officeLocation,mobilePhone,businessPhones,accountEnabled,assignedLicenses')
              .filter('accountEnabled eq true') // Only active users
              .top(999) // Max page size
              .get();

        allUsers = allUsers.concat(response.value);
        nextLink = response['@odata.nextLink'];
      } while (nextLink);

      console.log(`Fetched ${allUsers.length} active users from Microsoft 365`);

      // Filter to only users with at least one license
      const licensedUsers = allUsers.filter((user: any) =>
        user.assignedLicenses && user.assignedLicenses.length > 0
      );

      console.log(`${licensedUsers.length} users have licenses assigned`);

      // Map users
      const users = licensedUsers.map(this.mapGraphUser);

      // Fetch photos for all users (in parallel, but limit concurrency)
      console.log(`📸 Fetching photos for ${users.length} users...`);
      await this.fetchPhotosForUsers(users);

      return users;
    } catch (error) {
      console.error('Failed to get all users:', error);
      throw error;
    }
  }

  /**
   * Fetch photos for multiple users in parallel with concurrency limit
   */
  private async fetchPhotosForUsers(users: User[]): Promise<void> {
    const BATCH_SIZE = 10; // Process 10 photos at a time

    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const batch = users.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (user) => {
          const photoUrl = await this.getUserPhoto(user.id);
          if (photoUrl) {
            user.photoUrl = photoUrl;
          }
        })
      );
    }

    console.log(`✅ Fetched photos for ${users.filter(u => u.photoUrl).length}/${users.length} users`);
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

      // Group direct reports by department
      const departmentGroups = new Map<string, string[]>();
      for (const reportId of directReportIds) {
        const reportEntry = userMap.get(reportId);
        // Trim department name to remove leading/trailing spaces
        const dept = (reportEntry?.user.department || 'Unassigned').trim();
        if (!departmentGroups.has(dept)) {
          departmentGroups.set(dept, []);
        }
        departmentGroups.get(dept)!.push(reportId);
      }

      let children: OrgNode[];

      // If there are 2+ departments with multiple members each, create department header nodes
      if (departmentGroups.size >= 2) {
        console.log(`Creating department headers for ${departmentGroups.size} departments under ${entry.user.displayName}`);

        children = Array.from(departmentGroups.entries()).map(([deptName, memberIds]) => {
          // Build children first so we can count total descendants
          const childNodes = memberIds.map(id => buildNode(id, level + 2));

          // Count total members in this department (including all levels)
          const countDescendants = (node: OrgNode): number => {
            return 1 + node.children.reduce((sum, child) => sum + countDescendants(child), 0);
          };
          const totalMembers = childNodes.reduce((sum, child) => sum + countDescendants(child), 0);

          // Create a department header node
          const firstMemberId = memberIds[0];
          const firstMember = userMap.get(firstMemberId)!;

          return {
            user: {
              ...firstMember.user,
              displayName: deptName,
              jobTitle: `${totalMembers} member${totalMembers > 1 ? 's' : ''}`,
            },
            managerId: userId,
            directReports: memberIds,
            level: level + 1,
            children: childNodes,
            isDepartmentGroup: true,
            departmentName: deptName,
            totalMembers, // Store for department card display
          };
        });
      } else {
        // No grouping needed - normal tree structure
        children = directReportIds.map(id => buildNode(id, level + 1));
      }

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

  /**
   * Check if current user has admin role
   * Checks for Global Administrator, Privileged Role Administrator, or User Administrator
   */
  async isUserAdmin(): Promise<boolean> {
    if (!this.client) throw new Error('Graph client not initialized');

    try {
      console.log('📊 Checking user admin roles...');

      // Get directory roles for the current user
      const response = await this.client
        .api('/me/memberOf')
        .filter("@odata.type eq 'microsoft.graph.directoryRole'")
        .get();

      const roles = response.value || [];

      // Admin role template IDs (these are constant across all tenants)
      const adminRoleTemplateIds = [
        '62e90394-69f5-4237-9190-012177145e10', // Global Administrator
        'e8611ab8-c189-46e8-94e1-60213ab1f814', // Privileged Role Administrator
        'fe930be7-5e62-47db-91af-98c3a49a38b1', // User Administrator
      ];

      // Check role display names as fallback
      const adminRoleNames = [
        'Global Administrator',
        'Privileged Role Administrator',
        'User Administrator',
        'Company Administrator', // Legacy name for Global Admin
      ];

      const isAdmin = roles.some((role: any) =>
        adminRoleTemplateIds.includes(role.roleTemplateId) ||
        adminRoleNames.includes(role.displayName)
      );

      console.log('✅ User admin check:', isAdmin);
      return isAdmin;
    } catch (error: any) {
      console.error('❌ Failed to check admin roles:', error);
      console.error('Error status:', error?.statusCode);
      console.error('Error message:', error?.message);

      // If API call fails, deny access (fail closed)
      return false;
    }
  }
}

export const graphService = new GraphService();
