import { useEffect, useState } from 'react';
import { FluentProvider, webLightTheme, webDarkTheme, Spinner, Text, makeStyles, tokens, MessageBar, MessageBarBody, Button, Menu, MenuTrigger, MenuPopover, MenuList, MenuItem } from '@fluentui/react-components';
import { WeatherMoon20Regular, WeatherSunny20Regular, PeopleTeam20Regular, ArrowDownload20Regular, DocumentPdf20Regular, DocumentCsv20Regular } from '@fluentui/react-icons';
import { useStore } from './store';
import { authService } from './services/auth';
import { graphService } from './services/graph';
import { storageService } from './services/storage';
import { isMockMode, mockUsers, buildMockOrgTree } from './mockData';
import OrgChart from './components/OrgChart';
import SearchBar from './components/SearchBar';
import PersonDetailPanel from './components/PersonDetailPanel';
import DepartmentFilter from './components/DepartmentFilter';
import ManagerSetup from './components/ManagerSetup';
import { exportOrgChartToPDF, exportEmployeeListToCSV } from './utils/export';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    backgroundColor: tokens.colorNeutralBackground1,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    backgroundColor: tokens.colorNeutralBackground2,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    gap: '16px',
  },
  title: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },
  content: {
    flex: 1,
    position: 'relative',
    width: '100%',
    minHeight: 0,
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: '16px',
  },
  error: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: '16px',
    padding: '20px',
    textAlign: 'center',
  },
});

function App() {
  const styles = useStyles();
  const [showManagerSetup, setShowManagerSetup] = useState(false);
  const {
    isLoading,
    error,
    selectedUserId,
    isDarkMode,
    users,
    setUsers,
    setOrgTree,
    setCurrentUserId,
    setLoading,
    setError,
    setDarkMode,
    setIsAdmin,
    isAdmin,
  } = useStore();

  const handleExportPDF = async () => {
    try {
      await exportOrgChartToPDF();
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  const handleExportCSV = () => {
    try {
      const userList = Array.from(users.values());
      exportEmployeeListToCSV(userList);
    } catch (error) {
      console.error('Failed to export CSV:', error);
      alert('Failed to export CSV. Please try again.');
    }
  };

  useEffect(() => {
    async function initializeApp() {
      try {
        setLoading(true);
        setError(null);

        // Check if we're in mock mode (development without Azure credentials)
        if (isMockMode()) {
          console.log('🧪 Running in MOCK MODE - Using sample data');

          // Use mock data
          setUsers(mockUsers);
          const mockTree = buildMockOrgTree();

          console.log('Mock users loaded:', mockUsers.length);
          console.log('Mock tree built:', mockTree);
          console.log('Mock tree children:', mockTree.children.length);

          setOrgTree(mockTree);
          setCurrentUserId('user-001'); // Sarah Chen (CEO)

          setLoading(false);
          return;
        }

        // Production mode - use real authentication and Graph API
        console.log('🔐 Running in PRODUCTION MODE - Using Azure AD');

        // Initialize authentication
        await authService.initialize();

        // Initialize Graph API client
        await graphService.initialize();

        // Get current user
        const currentUser = await graphService.getCurrentUser();
        setCurrentUserId(currentUser.id);

        // Check if user is admin
        const userIsAdmin = await graphService.isUserAdmin();
        console.log('User is admin:', userIsAdmin);
        setIsAdmin(userIsAdmin);

        // Fetch all users
        const allUsers = await graphService.getAllUsers();

        // Filter out excluded users using storage service
        const excludedUserIds = await storageService.getExcludedUsers();
        const visibleUsers = allUsers.filter(user => !excludedUserIds.has(user.id));

        setUsers(visibleUsers);

        // Build organization tree from visible users only
        const orgTree = await graphService.buildOrgTree(visibleUsers);
        setOrgTree(orgTree);

        setLoading(false);
      } catch (err) {
        console.error('Failed to initialize app:', err);

        // Provide specific error messages based on error type
        let errorMessage = 'Failed to load organization data';

        if (err instanceof Error) {
          if (err.message.includes('authentication') || err.message.includes('getAuthToken')) {
            errorMessage = 'Authentication failed. Please ensure you have the necessary permissions and try signing in again.';
          } else if (err.message.includes('Graph') || err.message.includes('API')) {
            errorMessage = 'Failed to fetch organization data from Microsoft Graph. Please check your permissions or contact your administrator.';
          } else if (err.message.includes('network') || err.message.includes('fetch')) {
            errorMessage = 'Network error. Please check your connection and try again.';
          } else if (err.message.includes('permission') || err.message.includes('403')) {
            errorMessage = 'You don\'t have permission to view organization data. Please contact your administrator.';
          } else {
            errorMessage = err.message;
          }
        }

        setError(errorMessage);
        setLoading(false);
      }
    }

    initializeApp();
  }, [setUsers, setOrgTree, setCurrentUserId, setLoading, setError]);

  const theme = isDarkMode ? webDarkTheme : webLightTheme;

  if (isLoading) {
    return (
      <FluentProvider theme={theme}>
        <div className={styles.container}>
          <div className={styles.loading}>
            <Spinner size="extra-large" label="Loading organization chart..." />
          </div>
        </div>
      </FluentProvider>
    );
  }

  if (error) {
    const isAuthError = error.includes('Authentication') || error.includes('permission');
    const isNetworkError = error.includes('Network') || error.includes('connection');

    return (
      <FluentProvider theme={theme}>
        <div className={styles.container}>
          <div className={styles.error}>
            <Text size={500} weight="semibold">Failed to load organization chart</Text>
            <Text>{error}</Text>

            {isAuthError && (
              <MessageBar intent="warning">
                <MessageBarBody>
                  Make sure you're signed into Microsoft Teams and have granted the app the necessary permissions.
                </MessageBarBody>
              </MessageBar>
            )}

            {isNetworkError && (
              <MessageBar intent="warning">
                <MessageBarBody>
                  Please check your internet connection and firewall settings.
                </MessageBarBody>
              </MessageBar>
            )}

            <Button appearance="primary" onClick={() => window.location.reload()}>
              Retry
            </Button>

            <Text size={300}>If the problem persists, please contact your administrator.</Text>
          </div>
        </div>
      </FluentProvider>
    );
  }

  return (
    <FluentProvider theme={theme}>
      <div className={styles.container}>
        {isMockMode() && (
          <MessageBar intent="info">
            <MessageBarBody>
              <strong>Development Mode:</strong> Using mock data. Configure Azure AD credentials in .env to use real data.
            </MessageBarBody>
          </MessageBar>
        )}
        <div className={styles.header}>
          <Text className={styles.title}>ProClip Organization Chart</Text>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Menu>
              <MenuTrigger disableButtonEnhancement>
                <Button
                  appearance="subtle"
                  icon={<ArrowDownload20Regular />}
                  title="Export"
                >
                  Export
                </Button>
              </MenuTrigger>
              <MenuPopover>
                <MenuList>
                  <MenuItem icon={<DocumentPdf20Regular />} onClick={handleExportPDF}>
                    Export as PDF
                  </MenuItem>
                  <MenuItem icon={<DocumentCsv20Regular />} onClick={handleExportCSV}>
                    Export as CSV
                  </MenuItem>
                </MenuList>
              </MenuPopover>
            </Menu>
            <Button
              appearance="subtle"
              icon={isDarkMode ? <WeatherSunny20Regular /> : <WeatherMoon20Regular />}
              onClick={() => setDarkMode(!isDarkMode)}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            />
            {!isMockMode() && isAdmin && (
              <Button
                appearance="subtle"
                icon={<PeopleTeam20Regular />}
                onClick={() => {
                  if (showManagerSetup) {
                    // Switching back to chart view - reload the page to refresh data
                    window.location.reload();
                  } else {
                    setShowManagerSetup(true);
                  }
                }}
                title="Setup Manager Relationships"
              >
                {showManagerSetup ? 'View Chart' : 'Setup Managers'}
              </Button>
            )}
            <DepartmentFilter />
            <SearchBar />
          </div>
        </div>
        <div className={styles.content}>
          {showManagerSetup ? (
            <ManagerSetup />
          ) : (
            <>
              <OrgChart />
              {selectedUserId && <PersonDetailPanel />}
            </>
          )}
        </div>
      </div>
    </FluentProvider>
  );
}

export default App;
