/**
 * Color coding for departments
 * Returns soft background colors and outline colors for visual distinction
 * Supports both light and dark mode variants
 */

interface DepartmentColor {
  background: string;
  border: string;
}

interface DepartmentColorScheme {
  light: DepartmentColor;
  dark: DepartmentColor;
}

const departmentColorMap: Record<string, DepartmentColorScheme> = {
  'Engineering': {
    light: {
      background: '#e0f2fe', // soft blue
      border: '#0ea5e9',
    },
    dark: {
      background: '#0c4a6e', // dark blue
      border: '#38bdf8',
    },
  },
  'Product': {
    light: {
      background: '#fce7f3', // soft pink
      border: '#ec4899',
    },
    dark: {
      background: '#831843', // dark pink
      border: '#f9a8d4',
    },
  },
  'Sales': {
    light: {
      background: '#dcfce7', // soft green
      border: '#10b981',
    },
    dark: {
      background: '#064e3b', // dark green
      border: '#34d399',
    },
  },
  'Marketing': {
    light: {
      background: '#fef3c7', // soft yellow
      border: '#f59e0b',
    },
    dark: {
      background: '#78350f', // dark yellow/amber
      border: '#fbbf24',
    },
  },
  'Customer Success': {
    light: {
      background: '#e9d5ff', // soft purple
      border: '#a855f7',
    },
    dark: {
      background: '#581c87', // dark purple
      border: '#c084fc',
    },
  },
  'Finance': {
    light: {
      background: '#dbeafe', // soft indigo
      border: '#3b82f6',
    },
    dark: {
      background: '#1e3a8a', // dark indigo
      border: '#60a5fa',
    },
  },
  'Operations': {
    light: {
      background: '#fed7aa', // soft orange
      border: '#f97316',
    },
    dark: {
      background: '#7c2d12', // dark orange
      border: '#fb923c',
    },
  },
  'Human Resources': {
    light: {
      background: '#fecdd3', // soft rose
      border: '#f43f5e',
    },
    dark: {
      background: '#881337', // dark rose
      border: '#fb7185',
    },
  },
  'Executive': {
    light: {
      background: '#f3e8ff', // soft violet
      border: '#8b5cf6',
    },
    dark: {
      background: '#4c1d95', // dark violet
      border: '#a78bfa',
    },
  },
  'Logistics': {
    light: {
      background: '#cffafe', // soft cyan
      border: '#06b6d4',
    },
    dark: {
      background: '#164e63', // dark cyan
      border: '#22d3ee',
    },
  },
  'Warehouse': {
    light: {
      background: '#fef9c3', // soft lime
      border: '#84cc16',
    },
    dark: {
      background: '#365314', // dark lime
      border: '#a3e635',
    },
  },
  'Customer Experience': {
    light: {
      background: '#fce7f3', // soft magenta/pink
      border: '#db2777',
    },
    dark: {
      background: '#9f1239', // dark magenta
      border: '#f9a8d4',
    },
  },
  'Accounting': {
    light: {
      background: '#ddd6fe', // soft violet (different from Finance)
      border: '#8b5cf6',
    },
    dark: {
      background: '#5b21b6', // dark violet
      border: '#a78bfa',
    },
  },
  'IT': {
    light: {
      background: '#e0e7ff', // soft indigo
      border: '#6366f1',
    },
    dark: {
      background: '#312e81', // dark indigo
      border: '#818cf8',
    },
  },
  'E-Commerce': {
    light: {
      background: '#fbcfe8', // soft pink
      border: '#ec4899',
    },
    dark: {
      background: '#831843', // dark pink
      border: '#f9a8d4',
    },
  },
  'Sales/B2B': {
    light: {
      background: '#d1fae5', // soft emerald (different from Sales)
      border: '#059669',
    },
    dark: {
      background: '#064e3b', // dark emerald
      border: '#10b981',
    },
  },
  'Creative': {
    light: {
      background: '#f5d0fe', // soft purple/fuchsia (different from Product/Customer Experience)
      border: '#d946ef',
    },
    dark: {
      background: '#701a75', // dark fuchsia
      border: '#e879f9',
    },
  },
  'Product Engineering': {
    light: {
      background: '#bfdbfe', // soft blue (different from Engineering)
      border: '#2563eb',
    },
    dark: {
      background: '#1e3a8a', // dark blue
      border: '#60a5fa',
    },
  },
  'Product Data': {
    light: {
      background: '#e0f2fe', // soft cyan/sky (different from IT)
      border: '#0ea5e9',
    },
    dark: {
      background: '#075985', // dark cyan
      border: '#38bdf8',
    },
  },
  'HR': {
    light: {
      background: '#fecdd3', // soft rose
      border: '#f43f5e',
    },
    dark: {
      background: '#881337', // dark rose
      border: '#fb7185',
    },
  },
  'B2B': {
    light: {
      background: '#d1fae5', // soft emerald
      border: '#059669',
    },
    dark: {
      background: '#064e3b', // dark emerald
      border: '#10b981',
    },
  },
  'Product & Marketing': {
    light: {
      background: '#fed7aa', // soft orange (similar to Marketing but distinct)
      border: '#ea580c',
    },
    dark: {
      background: '#7c2d12', // dark orange
      border: '#fb923c',
    },
  },
};

const defaultColor: DepartmentColorScheme = {
  light: {
    background: '#f1f5f9', // soft gray
    border: '#94a3b8',
  },
  dark: {
    background: '#334155', // dark gray
    border: '#cbd5e1',
  },
};

export function getDepartmentColor(department?: string, isDarkMode: boolean = false): DepartmentColor {
  const colorScheme = department ? (departmentColorMap[department] || defaultColor) : defaultColor;
  return isDarkMode ? colorScheme.dark : colorScheme.light;
}

export function getAllDepartmentColors(): Map<string, DepartmentColorScheme> {
  return new Map(Object.entries(departmentColorMap));
}
