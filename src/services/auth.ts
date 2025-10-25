import { app, authentication } from '@microsoft/teams-js';

/**
 * Authentication service for Microsoft Teams SSO
 */
class AuthService {
  private accessToken: string | null = null;

  /**
   * Initialize authentication with Teams SSO
   */
  async initialize(): Promise<void> {
    try {
      await app.initialize();
      console.log('Auth service initialized');
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      throw error;
    }
  }

  /**
   * Get access token for Microsoft Graph
   */
  async getAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    try {
      // Get token using Teams authentication
      const token = await authentication.getAuthToken({
        resources: ['https://graph.microsoft.com'],
        silent: false,
      });

      this.accessToken = token;
      return token;
    } catch (error) {
      console.error('Failed to get access token:', error);

      // Fallback: try interactive login
      try {
        await this.login();
        if (this.accessToken) {
          return this.accessToken;
        }
      } catch (loginError) {
        console.error('Login failed:', loginError);
      }

      throw error;
    }
  }

  /**
   * Login if not already authenticated
   */
  async login(): Promise<void> {
    try {
      const token = await authentication.authenticate({
        url: `${window.location.origin}/auth-start.html`,
        width: 600,
        height: 535,
      });

      if (token) {
        this.accessToken = token;
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      return !!token;
    } catch {
      return false;
    }
  }
}

export const authService = new AuthService();
