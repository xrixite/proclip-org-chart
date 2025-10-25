/**
 * User data from Microsoft Graph API
 */
export interface User {
  id: string;
  displayName: string;
  givenName?: string;
  surname?: string;
  mail?: string;
  userPrincipalName: string;
  jobTitle?: string;
  department?: string;
  officeLocation?: string;
  mobilePhone?: string;
  businessPhones?: string[];
  photoUrl?: string;
}

/**
 * Organization node for tree structure
 */
export interface OrgNode {
  user: User;
  managerId: string | null;
  directReports: string[]; // Array of user IDs
  level: number; // Depth from CEO
  children: OrgNode[];
  isDepartmentGroup?: boolean; // True if this is a department grouping node
  departmentName?: string; // Name of the department if isDepartmentGroup is true
}

/**
 * View mode for org chart
 */
export type ViewMode = 'reactflow' | 'd3-tree' | 'd3-radial' | 'list';

/**
 * App state
 */
export interface AppState {
  // Data
  users: Map<string, User>;
  orgTree: OrgNode | null;
  currentUserId: string | null;

  // UI State
  viewMode: ViewMode;
  searchQuery: string;
  selectedUserId: string | null;
  departmentFilter: string | null;
  isDarkMode: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUsers: (users: User[]) => void;
  setOrgTree: (tree: OrgNode | null) => void;
  setCurrentUserId: (id: string) => void;
  setViewMode: (mode: ViewMode) => void;
  setSearchQuery: (query: string) => void;
  setSelectedUserId: (id: string | null) => void;
  setDepartmentFilter: (department: string | null) => void;
  setDarkMode: (isDark: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Computed
  getFilteredUsers: () => User[];
  getUserById: (id: string) => User | undefined;
  getDirectReports: (managerId: string) => User[];
  getManager: (userId: string) => User | undefined;
  getManagerChain: (userId: string) => User[]; // From employee to CEO
  getDirectReportsCount: (userId: string) => number;
  getAllDepartments: () => string[];
}
