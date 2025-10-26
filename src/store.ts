import { create } from 'zustand';
import { AppState, User, OrgNode } from './types';

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  users: new Map(),
  orgTree: null,
  currentUserId: null,
  viewMode: 'reactflow',
  searchQuery: '',
  selectedUserId: null,
  departmentFilter: null,
  isDarkMode: false,
  isLoading: false,
  error: null,
  isAdmin: false,

  // Actions
  setUsers: (users: User[]) => {
    const userMap = new Map(users.map(user => [user.id, user]));
    set({ users: userMap });
  },

  setOrgTree: (tree) => set({ orgTree: tree }),

  setCurrentUserId: (id) => set({ currentUserId: id }),

  setViewMode: (mode) => set({ viewMode: mode }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setSelectedUserId: (id) => set({ selectedUserId: id }),

  setDepartmentFilter: (department) => set({ departmentFilter: department }),

  setDarkMode: (isDark) => set({ isDarkMode: isDark }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  setIsAdmin: (isAdmin) => set({ isAdmin }),

  // Computed values
  getFilteredUsers: () => {
    const { users, searchQuery, departmentFilter } = get();
    const query = searchQuery.toLowerCase().trim();

    let filteredUsers = Array.from(users.values());

    // Apply department filter
    if (departmentFilter) {
      filteredUsers = filteredUsers.filter(user => user.department === departmentFilter);
    }

    // Apply search query
    if (query) {
      filteredUsers = filteredUsers.filter(user =>
        user.displayName?.toLowerCase().includes(query) ||
        user.jobTitle?.toLowerCase().includes(query) ||
        user.department?.toLowerCase().includes(query) ||
        user.mail?.toLowerCase().includes(query)
      );
    }

    return filteredUsers;
  },

  getUserById: (id: string) => {
    return get().users.get(id);
  },

  getDirectReports: (managerId: string) => {
    const { orgTree, users } = get();
    if (!orgTree) return [];

    // Recursively find the node for the manager (skip department groups)
    function findNode(node: OrgNode, targetId: string): OrgNode | null {
      // Only match if this is NOT a department group and the ID matches
      if (!node.isDepartmentGroup && node.user.id === targetId) return node;
      for (const child of node.children) {
        const found = findNode(child, targetId);
        if (found) return found;
      }
      return null;
    }

    const managerNode = findNode(orgTree, managerId);
    if (!managerNode) {
      console.log('Manager node not found for:', managerId);
      return [];
    }

    console.log('Manager node found:', managerNode.user.displayName, 'children:', managerNode.children.length);

    // Collect all actual users (not department groups) from children
    const directReports: User[] = [];

    function collectUsers(node: OrgNode) {
      console.log('Processing node:', node.user.displayName, 'isDepartmentGroup:', node.isDepartmentGroup);
      if (node.isDepartmentGroup) {
        // If this is a department group, collect users from its children
        for (const child of node.children) {
          collectUsers(child);
        }
      } else {
        // This is an actual user, add them to direct reports
        const user = users.get(node.user.id);
        if (user) {
          console.log('Adding direct report:', user.displayName);
          directReports.push(user);
        }
      }
    }

    // Process all children of the manager
    for (const child of managerNode.children) {
      collectUsers(child);
    }

    console.log('Total direct reports found:', directReports.length);
    return directReports;
  },

  getManager: (userId: string) => {
    const { orgTree } = get();
    if (!orgTree) return undefined;

    // Recursively find the node for the user
    function findNode(node: OrgNode, targetId: string): OrgNode | null {
      if (node.user.id === targetId) return node;
      for (const child of node.children) {
        const found = findNode(child, targetId);
        if (found) return found;
      }
      return null;
    }

    const userNode = findNode(orgTree, userId);
    if (!userNode || !userNode.managerId) return undefined;

    return get().users.get(userNode.managerId);
  },

  getManagerChain: (userId: string) => {
    const chain: User[] = [];
    let currentUserId: string | undefined = userId;

    while (currentUserId) {
      const manager = get().getManager(currentUserId);
      if (!manager) break;
      chain.push(manager);
      currentUserId = manager.id;
    }

    return chain;
  },

  getDirectReportsCount: (userId: string) => {
    return get().getDirectReports(userId).length;
  },

  getAllDepartments: () => {
    const { users } = get();
    const departments = new Set<string>();

    Array.from(users.values()).forEach(user => {
      if (user.department) {
        departments.add(user.department);
      }
    });

    return Array.from(departments).sort();
  },
}));
