import { User, OrgNode } from './types';

/**
 * Mock data for local development and testing
 * Simulates a 45-person organization with realistic structure
 */

export const mockUsers: User[] = [
  // CEO
  {
    id: 'user-001',
    displayName: 'Sarah Chen',
    givenName: 'Sarah',
    surname: 'Chen',
    mail: 'sarah.chen@proclip.com',
    userPrincipalName: 'sarah.chen@proclip.com',
    jobTitle: 'Chief Executive Officer',
    department: 'Executive',
    officeLocation: 'San Francisco HQ',
    mobilePhone: '+1 (415) 555-0101',
    businessPhones: ['+1 (415) 555-0100'],
  },
  // Engineering - VP
  {
    id: 'user-002',
    displayName: 'Michael Rodriguez',
    givenName: 'Michael',
    surname: 'Rodriguez',
    mail: 'michael.rodriguez@proclip.com',
    userPrincipalName: 'michael.rodriguez@proclip.com',
    jobTitle: 'VP of Engineering',
    department: 'Engineering',
    officeLocation: 'San Francisco HQ',
    mobilePhone: '+1 (415) 555-0102',
    businessPhones: ['+1 (415) 555-0103'],
  },
  // Engineering - Frontend Manager
  {
    id: 'user-003',
    displayName: 'Emily Thompson',
    givenName: 'Emily',
    surname: 'Thompson',
    mail: 'emily.thompson@proclip.com',
    userPrincipalName: 'emily.thompson@proclip.com',
    jobTitle: 'Engineering Manager - Frontend',
    department: 'Engineering',
    officeLocation: 'San Francisco HQ',
    mobilePhone: '+1 (415) 555-0104',
    businessPhones: ['+1 (415) 555-0105'],
  },
  // Frontend Engineers
  {
    id: 'user-004',
    displayName: 'David Kim',
    mail: 'david.kim@proclip.com',
    userPrincipalName: 'david.kim@proclip.com',
    jobTitle: 'Senior Frontend Engineer',
    department: 'Engineering',
    officeLocation: 'San Francisco HQ',
  },
  {
    id: 'user-005',
    displayName: 'Jessica Martinez',
    mail: 'jessica.martinez@proclip.com',
    userPrincipalName: 'jessica.martinez@proclip.com',
    jobTitle: 'Frontend Engineer',
    department: 'Engineering',
    officeLocation: 'Remote - Austin',
  },
  {
    id: 'user-006',
    displayName: 'Ryan Patel',
    mail: 'ryan.patel@proclip.com',
    userPrincipalName: 'ryan.patel@proclip.com',
    jobTitle: 'Frontend Engineer',
    department: 'Engineering',
    officeLocation: 'San Francisco HQ',
  },
  {
    id: 'user-007',
    displayName: 'Olivia Johnson',
    mail: 'olivia.johnson@proclip.com',
    userPrincipalName: 'olivia.johnson@proclip.com',
    jobTitle: 'Junior Frontend Engineer',
    department: 'Engineering',
    officeLocation: 'Remote - Seattle',
  },
  // Engineering - Backend Manager
  {
    id: 'user-008',
    displayName: 'James Wilson',
    mail: 'james.wilson@proclip.com',
    userPrincipalName: 'james.wilson@proclip.com',
    jobTitle: 'Engineering Manager - Backend',
    department: 'Engineering',
    officeLocation: 'San Francisco HQ',
    mobilePhone: '+1 (415) 555-0106',
  },
  // Backend Engineers
  {
    id: 'user-009',
    displayName: 'Sophia Lee',
    mail: 'sophia.lee@proclip.com',
    userPrincipalName: 'sophia.lee@proclip.com',
    jobTitle: 'Senior Backend Engineer',
    department: 'Engineering',
    officeLocation: 'San Francisco HQ',
  },
  {
    id: 'user-010',
    displayName: 'Daniel Brown',
    mail: 'daniel.brown@proclip.com',
    userPrincipalName: 'daniel.brown@proclip.com',
    jobTitle: 'Backend Engineer',
    department: 'Engineering',
    officeLocation: 'Remote - Denver',
  },
  {
    id: 'user-011',
    displayName: 'Ava Garcia',
    mail: 'ava.garcia@proclip.com',
    userPrincipalName: 'ava.garcia@proclip.com',
    jobTitle: 'Backend Engineer',
    department: 'Engineering',
    officeLocation: 'San Francisco HQ',
  },
  {
    id: 'user-012',
    displayName: 'Ethan Davis',
    mail: 'ethan.davis@proclip.com',
    userPrincipalName: 'ethan.davis@proclip.com',
    jobTitle: 'DevOps Engineer',
    department: 'Engineering',
    officeLocation: 'Remote - Portland',
  },
  // Product - VP
  {
    id: 'user-013',
    displayName: 'Lisa Anderson',
    mail: 'lisa.anderson@proclip.com',
    userPrincipalName: 'lisa.anderson@proclip.com',
    jobTitle: 'VP of Product',
    department: 'Product',
    officeLocation: 'San Francisco HQ',
    mobilePhone: '+1 (415) 555-0107',
    businessPhones: ['+1 (415) 555-0108'],
  },
  // Product Managers
  {
    id: 'user-014',
    displayName: 'Noah Taylor',
    mail: 'noah.taylor@proclip.com',
    userPrincipalName: 'noah.taylor@proclip.com',
    jobTitle: 'Senior Product Manager',
    department: 'Product',
    officeLocation: 'San Francisco HQ',
  },
  {
    id: 'user-015',
    displayName: 'Isabella Martinez',
    mail: 'isabella.martinez@proclip.com',
    userPrincipalName: 'isabella.martinez@proclip.com',
    jobTitle: 'Product Manager',
    department: 'Product',
    officeLocation: 'Remote - NYC',
  },
  {
    id: 'user-016',
    displayName: 'Liam Harris',
    mail: 'liam.harris@proclip.com',
    userPrincipalName: 'liam.harris@proclip.com',
    jobTitle: 'Product Manager',
    department: 'Product',
    officeLocation: 'San Francisco HQ',
  },
  // Design
  {
    id: 'user-017',
    displayName: 'Mia Clark',
    mail: 'mia.clark@proclip.com',
    userPrincipalName: 'mia.clark@proclip.com',
    jobTitle: 'Design Manager',
    department: 'Product',
    officeLocation: 'San Francisco HQ',
  },
  {
    id: 'user-018',
    displayName: 'William Lewis',
    mail: 'william.lewis@proclip.com',
    userPrincipalName: 'william.lewis@proclip.com',
    jobTitle: 'Senior Product Designer',
    department: 'Product',
    officeLocation: 'San Francisco HQ',
  },
  {
    id: 'user-019',
    displayName: 'Charlotte Walker',
    mail: 'charlotte.walker@proclip.com',
    userPrincipalName: 'charlotte.walker@proclip.com',
    jobTitle: 'UX Designer',
    department: 'Product',
    officeLocation: 'Remote - LA',
  },
  // Sales - VP
  {
    id: 'user-020',
    displayName: 'Benjamin Hall',
    mail: 'benjamin.hall@proclip.com',
    userPrincipalName: 'benjamin.hall@proclip.com',
    jobTitle: 'VP of Sales',
    department: 'Sales',
    officeLocation: 'San Francisco HQ',
    mobilePhone: '+1 (415) 555-0109',
    businessPhones: ['+1 (415) 555-0110'],
  },
  // Sales Team
  {
    id: 'user-021',
    displayName: 'Amelia Young',
    mail: 'amelia.young@proclip.com',
    userPrincipalName: 'amelia.young@proclip.com',
    jobTitle: 'Sales Manager - Enterprise',
    department: 'Sales',
    officeLocation: 'San Francisco HQ',
  },
  {
    id: 'user-022',
    displayName: 'Lucas Allen',
    mail: 'lucas.allen@proclip.com',
    userPrincipalName: 'lucas.allen@proclip.com',
    jobTitle: 'Senior Account Executive',
    department: 'Sales',
    officeLocation: 'San Francisco HQ',
  },
  {
    id: 'user-023',
    displayName: 'Harper King',
    mail: 'harper.king@proclip.com',
    userPrincipalName: 'harper.king@proclip.com',
    jobTitle: 'Account Executive',
    department: 'Sales',
    officeLocation: 'Remote - Chicago',
  },
  {
    id: 'user-024',
    displayName: 'Alexander Wright',
    mail: 'alexander.wright@proclip.com',
    userPrincipalName: 'alexander.wright@proclip.com',
    jobTitle: 'Account Executive',
    department: 'Sales',
    officeLocation: 'Remote - Boston',
  },
  {
    id: 'user-025',
    displayName: 'Evelyn Lopez',
    mail: 'evelyn.lopez@proclip.com',
    userPrincipalName: 'evelyn.lopez@proclip.com',
    jobTitle: 'Sales Development Rep',
    department: 'Sales',
    officeLocation: 'San Francisco HQ',
  },
  {
    id: 'user-026',
    displayName: 'Sebastian Hill',
    mail: 'sebastian.hill@proclip.com',
    userPrincipalName: 'sebastian.hill@proclip.com',
    jobTitle: 'Sales Development Rep',
    department: 'Sales',
    officeLocation: 'Remote - Miami',
  },
  // Marketing - VP
  {
    id: 'user-027',
    displayName: 'Avery Scott',
    mail: 'avery.scott@proclip.com',
    userPrincipalName: 'avery.scott@proclip.com',
    jobTitle: 'VP of Marketing',
    department: 'Marketing',
    officeLocation: 'San Francisco HQ',
    mobilePhone: '+1 (415) 555-0111',
  },
  // Marketing Team
  {
    id: 'user-028',
    displayName: 'Ella Green',
    mail: 'ella.green@proclip.com',
    userPrincipalName: 'ella.green@proclip.com',
    jobTitle: 'Marketing Manager',
    department: 'Marketing',
    officeLocation: 'San Francisco HQ',
  },
  {
    id: 'user-029',
    displayName: 'Jackson Adams',
    mail: 'jackson.adams@proclip.com',
    userPrincipalName: 'jackson.adams@proclip.com',
    jobTitle: 'Content Marketing Manager',
    department: 'Marketing',
    officeLocation: 'Remote - Austin',
  },
  {
    id: 'user-030',
    displayName: 'Scarlett Baker',
    mail: 'scarlett.baker@proclip.com',
    userPrincipalName: 'scarlett.baker@proclip.com',
    jobTitle: 'Social Media Manager',
    department: 'Marketing',
    officeLocation: 'San Francisco HQ',
  },
  {
    id: 'user-031',
    displayName: 'Henry Nelson',
    mail: 'henry.nelson@proclip.com',
    userPrincipalName: 'henry.nelson@proclip.com',
    jobTitle: 'Marketing Coordinator',
    department: 'Marketing',
    officeLocation: 'Remote - Seattle',
  },
  // Customer Success
  {
    id: 'user-032',
    displayName: 'Grace Carter',
    mail: 'grace.carter@proclip.com',
    userPrincipalName: 'grace.carter@proclip.com',
    jobTitle: 'Head of Customer Success',
    department: 'Customer Success',
    officeLocation: 'San Francisco HQ',
    mobilePhone: '+1 (415) 555-0112',
  },
  {
    id: 'user-033',
    displayName: 'Samuel Mitchell',
    mail: 'samuel.mitchell@proclip.com',
    userPrincipalName: 'samuel.mitchell@proclip.com',
    jobTitle: 'Customer Success Manager',
    department: 'Customer Success',
    officeLocation: 'San Francisco HQ',
  },
  {
    id: 'user-034',
    displayName: 'Victoria Perez',
    mail: 'victoria.perez@proclip.com',
    userPrincipalName: 'victoria.perez@proclip.com',
    jobTitle: 'Customer Success Manager',
    department: 'Customer Success',
    officeLocation: 'Remote - NYC',
  },
  {
    id: 'user-035',
    displayName: 'Jack Roberts',
    mail: 'jack.roberts@proclip.com',
    userPrincipalName: 'jack.roberts@proclip.com',
    jobTitle: 'Support Engineer',
    department: 'Customer Success',
    officeLocation: 'San Francisco HQ',
  },
  // Finance & Operations
  {
    id: 'user-036',
    displayName: 'Chloe Turner',
    mail: 'chloe.turner@proclip.com',
    userPrincipalName: 'chloe.turner@proclip.com',
    jobTitle: 'CFO',
    department: 'Finance',
    officeLocation: 'San Francisco HQ',
    mobilePhone: '+1 (415) 555-0113',
    businessPhones: ['+1 (415) 555-0114'],
  },
  {
    id: 'user-037',
    displayName: 'Owen Phillips',
    mail: 'owen.phillips@proclip.com',
    userPrincipalName: 'owen.phillips@proclip.com',
    jobTitle: 'Finance Manager',
    department: 'Finance',
    officeLocation: 'San Francisco HQ',
  },
  {
    id: 'user-038',
    displayName: 'Lily Campbell',
    mail: 'lily.campbell@proclip.com',
    userPrincipalName: 'lily.campbell@proclip.com',
    jobTitle: 'Accountant',
    department: 'Finance',
    officeLocation: 'San Francisco HQ',
  },
  {
    id: 'user-039',
    displayName: 'Mason Parker',
    mail: 'mason.parker@proclip.com',
    userPrincipalName: 'mason.parker@proclip.com',
    jobTitle: 'Operations Manager',
    department: 'Operations',
    officeLocation: 'San Francisco HQ',
  },
  {
    id: 'user-040',
    displayName: 'Zoe Evans',
    mail: 'zoe.evans@proclip.com',
    userPrincipalName: 'zoe.evans@proclip.com',
    jobTitle: 'Office Manager',
    department: 'Operations',
    officeLocation: 'San Francisco HQ',
  },
  // HR & People
  {
    id: 'user-041',
    displayName: 'Aiden Edwards',
    mail: 'aiden.edwards@proclip.com',
    userPrincipalName: 'aiden.edwards@proclip.com',
    jobTitle: 'Head of People',
    department: 'Human Resources',
    officeLocation: 'San Francisco HQ',
    mobilePhone: '+1 (415) 555-0115',
  },
  {
    id: 'user-042',
    displayName: 'Layla Collins',
    mail: 'layla.collins@proclip.com',
    userPrincipalName: 'layla.collins@proclip.com',
    jobTitle: 'HR Manager',
    department: 'Human Resources',
    officeLocation: 'San Francisco HQ',
  },
  {
    id: 'user-043',
    displayName: 'Carter Stewart',
    mail: 'carter.stewart@proclip.com',
    userPrincipalName: 'carter.stewart@proclip.com',
    jobTitle: 'Recruiter',
    department: 'Human Resources',
    officeLocation: 'Remote - Portland',
  },
  {
    id: 'user-044',
    displayName: 'Penelope Sanchez',
    mail: 'penelope.sanchez@proclip.com',
    userPrincipalName: 'penelope.sanchez@proclip.com',
    jobTitle: 'People Operations Coordinator',
    department: 'Human Resources',
    officeLocation: 'San Francisco HQ',
  },
  {
    id: 'user-045',
    displayName: 'Grayson Morris',
    mail: 'grayson.morris@proclip.com',
    userPrincipalName: 'grayson.morris@proclip.com',
    jobTitle: 'Executive Assistant to CEO',
    department: 'Executive',
    officeLocation: 'San Francisco HQ',
  },
];

/**
 * Manager relationships (userId -> managerId)
 */
const managerMap: Record<string, string> = {
  // CEO (no manager)
  'user-001': '',

  // Reports to CEO
  'user-002': 'user-001', // VP Engineering -> CEO
  'user-013': 'user-001', // VP Product -> CEO
  'user-020': 'user-001', // VP Sales -> CEO
  'user-027': 'user-001', // VP Marketing -> CEO
  'user-032': 'user-001', // Head of Customer Success -> CEO
  'user-036': 'user-001', // CFO -> CEO
  'user-041': 'user-001', // Head of People -> CEO
  'user-045': 'user-001', // Executive Assistant -> CEO

  // Engineering
  'user-003': 'user-002', // Frontend Manager -> VP Engineering
  'user-008': 'user-002', // Backend Manager -> VP Engineering
  'user-004': 'user-003', // Senior Frontend -> Frontend Manager
  'user-005': 'user-003', // Frontend -> Frontend Manager
  'user-006': 'user-003', // Frontend -> Frontend Manager
  'user-007': 'user-003', // Junior Frontend -> Frontend Manager
  'user-009': 'user-008', // Senior Backend -> Backend Manager
  'user-010': 'user-008', // Backend -> Backend Manager
  'user-011': 'user-008', // Backend -> Backend Manager
  'user-012': 'user-008', // DevOps -> Backend Manager

  // Product
  'user-014': 'user-013', // Senior PM -> VP Product
  'user-015': 'user-013', // PM -> VP Product
  'user-016': 'user-013', // PM -> VP Product
  'user-017': 'user-013', // Design Manager -> VP Product
  'user-018': 'user-017', // Senior Designer -> Design Manager
  'user-019': 'user-017', // UX Designer -> Design Manager

  // Sales
  'user-021': 'user-020', // Sales Manager -> VP Sales
  'user-022': 'user-021', // Senior AE -> Sales Manager
  'user-023': 'user-021', // AE -> Sales Manager
  'user-024': 'user-021', // AE -> Sales Manager
  'user-025': 'user-021', // SDR -> Sales Manager
  'user-026': 'user-021', // SDR -> Sales Manager

  // Marketing
  'user-028': 'user-027', // Marketing Manager -> VP Marketing
  'user-029': 'user-028', // Content Manager -> Marketing Manager
  'user-030': 'user-028', // Social Media Manager -> Marketing Manager
  'user-031': 'user-028', // Marketing Coordinator -> Marketing Manager

  // Customer Success
  'user-033': 'user-032', // CSM -> Head of CS
  'user-034': 'user-032', // CSM -> Head of CS
  'user-035': 'user-032', // Support Engineer -> Head of CS

  // Finance & Operations
  'user-037': 'user-036', // Finance Manager -> CFO
  'user-038': 'user-037', // Accountant -> Finance Manager
  'user-039': 'user-036', // Operations Manager -> CFO
  'user-040': 'user-039', // Office Manager -> Operations Manager

  // HR
  'user-042': 'user-041', // HR Manager -> Head of People
  'user-043': 'user-042', // Recruiter -> HR Manager
  'user-044': 'user-042', // People Ops -> HR Manager
};

/**
 * Build mock organization tree
 */
export function buildMockOrgTree(): OrgNode {
  const userMap = new Map(mockUsers.map(user => [user.id, user]));

  function buildNode(userId: string, level: number = 0): OrgNode {
    const user = userMap.get(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    // Find direct reports
    const directReportIds = Object.entries(managerMap)
      .filter(([_, managerId]) => managerId === userId)
      .map(([empId]) => empId);

    const children = directReportIds.map(id => buildNode(id, level + 1));

    return {
      user,
      managerId: managerMap[userId] || null,
      directReports: directReportIds,
      level,
      children,
    };
  }

  return buildNode('user-001'); // Start from CEO
}

/**
 * Check if we're in mock mode (development with placeholder credentials)
 */
export function isMockMode(): boolean {
  const clientId = import.meta.env.VITE_CLIENT_ID;
  return !clientId || clientId === '00000000-0000-0000-0000-000000000000';
}
