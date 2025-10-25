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
    const { orgTree } = get();
    if (!orgTree) return [];

    // Recursively find the node for the manager
    function findNode(node: OrgNode, targetId: string): OrgNode | null {
      if (node.user.id === targetId) return node;
      for (const child of node.children) {
        const found = findNode(child, targetId);
        if (found) return found;
      }
      return null;
    }

    const managerNode = findNode(orgTree, managerId);
    if (!managerNode) return [];

    // Return users from direct reports
    return managerNode.directReports
      .map(id => get().users.get(id))
      .filter((user): user is User => user !== undefined);
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
