import { app } from '@microsoft/teams-js';
import { PublicClientApplication, InteractionRequiredAuthError } from '@azure/msal-browser';
import { getEnvVar } from '../utils/env';

/**
 * Authentication service that supports both Teams SSO and browser-based MSAL authentication
 */
class AuthService {
  private accessToken: string | null = null;
  private msalInstance: PublicClientApplication | null = null;
  private isInTeams: boolean = false;
  private initializationPromise: Promise<void> | null = null;
  private tokenPromise: Promise<string> | null = null;

  /**
   * Initialize authentication - detects Teams vs browser environment
   */
  async initialize(): Promise<void> {
    // Prevent multiple simultaneous initializations (React StrictMode)
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      try {
        // Try to initialize Teams SDK
        await app.initialize();
        this.isInTeams = true;
        console.log('Running in Teams - using MSAL popup authentication');
      } catch (error) {
        // Not in Teams, use MSAL for browser authentication
        this.isInTeams = false;
        console.log('Running in browser - using MSAL authentication');
      }

      // Always initialize MSAL for Graph API access
      await this.initializeMsal();
    })();

    return this.initializationPromise;
  }

  /**
   * Initialize MSAL for browser-based authentication
   */
  private async initializeMsal(): Promise<void> {
    const clientId = getEnvVar('VITE_CLIENT_ID');
    const tenantId = getEnvVar('VITE_TENANT_ID');

    this.msalInstance = new PublicClientApplication({
      auth: {
        clientId,
        authority: `https://login.microsoftonline.com/${tenantId}`,
        redirectUri: window.location.origin,
      },
      cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: false,
      },
    });

    await this.msalInstance.initialize();
  }

  /**
   * Get access token for Microsoft Graph
   */
  async getAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    // Prevent multiple simultaneous token acquisitions (React StrictMode)
    if (this.tokenPromise) {
      return this.tokenPromise;
    }

    this.tokenPromise = (async () => {
      // Always use MSAL for Graph API access (works in both Teams and browser)
      return this.getMsalToken();
    })();

    try {
      const token = await this.tokenPromise;
      return token;
    } finally {
      this.tokenPromise = null;
    }
  }

  /**
   * Get token using MSAL (browser)
   */
  private async getMsalToken(): Promise<string> {
    if (!this.msalInstance) {
      throw new Error('MSAL not initialized');
    }

    // Check for redirect response first (after redirect back from login)
    try {
      const redirectResponse = await this.msalInstance.handleRedirectPromise();
      if (redirectResponse) {
        this.accessToken = redirectResponse.accessToken;
        return redirectResponse.accessToken;
      }
    } catch (error) {
      console.error('Error handling redirect:', error);
    }

    const accounts = this.msalInstance.getAllAccounts();
    const scopes = ['User.Read', 'User.ReadBasic.All', 'User.Read.All'];

    try {
      // Try silent token acquisition first
      if (accounts.length > 0) {
        const silentRequest = {
          scopes,
          account: accounts[0],
        };

        const response = await this.msalInstance.acquireTokenSilent(silentRequest);
        this.accessToken = response.accessToken;
        return response.accessToken;
      }
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        // Silent acquisition failed, need interactive login
        console.log('Interactive login required');
      }
    }

    // No accounts and no cached token - need to login
    // Use redirect for Teams desktop (popups are blocked), popup for browser
    if (this.isInTeams) {
      console.log('Using redirect authentication for Teams desktop...');
      await this.msalInstance.acquireTokenRedirect({ scopes });
      // This will redirect and never return
      throw new Error('Redirecting to login...');
    } else {
      console.log('Opening Microsoft login popup...');
      try {
        const response = await this.msalInstance.acquireTokenPopup({ scopes });
        this.accessToken = response.accessToken;
        return response.accessToken;
      } catch (popupError) {
        console.error('Popup login failed:', popupError);
        throw popupError;
      }
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

  /**
   * Logout
   */
  async logout(): Promise<void> {
    this.accessToken = null;

    if (!this.isInTeams && this.msalInstance) {
      const accounts = this.msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        await this.msalInstance.logoutPopup({ account: accounts[0] });
      }
    }
  }
}

export const authService = new AuthService();
