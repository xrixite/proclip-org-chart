/**
 * Environment variable validation and utilities
 */

export interface EnvConfig {
  clientId: string | undefined;
  tenantId: string | undefined;
}

export function getEnvConfig(): EnvConfig {
  return {
    clientId: import.meta.env.VITE_CLIENT_ID,
    tenantId: import.meta.env.VITE_TENANT_ID,
  };
}

export function validateEnv(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const config = getEnvConfig();

  // Check if in mock mode (development without credentials)
  if (!config.clientId || config.clientId === '00000000-0000-0000-0000-000000000000') {
    // Mock mode is valid for development
    return { isValid: true, errors: [] };
  }

  // Validate Client ID
  if (!config.clientId) {
    errors.push('VITE_CLIENT_ID is not set in environment variables');
  } else {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(config.clientId)) {
      errors.push('VITE_CLIENT_ID must be a valid UUID');
    }
  }

  // Validate Tenant ID
  if (!config.tenantId) {
    errors.push('VITE_TENANT_ID is not set in environment variables');
  } else {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(config.tenantId)) {
      errors.push('VITE_TENANT_ID must be a valid UUID');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function isMockMode(): boolean {
  const config = getEnvConfig();
  return !config.clientId || config.clientId === '00000000-0000-0000-0000-000000000000';
}

/**
 * Get a specific environment variable with error handling
 */
export function getEnvVar(key: string): string {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}
