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

export function getAllDepartmentColors(): Map<string, DepartmentColor> {
  return new Map(Object.entries(departmentColorMap));
}
