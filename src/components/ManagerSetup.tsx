import { useState, useEffect } from 'react';
import {
  Button,
  Card,
  Text,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHeader,
  TableHeaderCell,
  makeStyles,
  tokens,
  Combobox,
  Option,
  Checkbox,
} from '@fluentui/react-components';
import { graphService } from '../services/graph';
import { storageService } from '../services/storage';
import { User } from '../types';

const useStyles = makeStyles({
  container: {
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    marginBottom: '24px',
  },
  card: {
    marginBottom: '16px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  tableContainer: {
    flex: 1,
    overflow: 'auto',
    maxHeight: 'calc(100vh - 300px)',
  },
  table: {
    width: '100%',
  },
  actions: {
    display: 'flex',
    gap: '8px',
    marginTop: '24px',
  },
  status: {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
  },
});

export default function ManagerSetup() {
  const styles = useStyles();
  const [users, setUsers] = useState<User[]>([]);
  const [managers, setManagers] = useState<Map<string, string>>(new Map());
  const [selectedManagers, setSelectedManagers] = useState<Map<string, string>>(new Map());
  const [excludedUsers, setExcludedUsers] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<string>('');

  // Load excluded users from storage service
  useEffect(() => {
    async function loadExcludedUsers() {
      try {
        const excluded = await storageService.getExcludedUsers();
        setExcludedUsers(excluded);
      } catch (error) {
        console.error('Failed to load excluded users:', error);
      }
    }
    loadExcludedUsers();
  }, []);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setIsLoading(true);
      const allUsers = await graphService.getAllUsers();
      setUsers(allUsers);

      // Load existing managers
      const managerMap = new Map<string, string>();
      for (const user of allUsers) {
        const manager = await graphService.getUserManager(user.id);
        if (manager) {
          managerMap.set(user.id, manager.id);
        }
      }
      setManagers(managerMap);
      setSelectedManagers(new Map(managerMap));
    } catch (error) {
      console.error('Failed to load users:', error);
      setStatus('Failed to load users. Please refresh and try again.');
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleUserExclusion(userId: string) {
    const newExcluded = new Set(excludedUsers);
    if (newExcluded.has(userId)) {
      newExcluded.delete(userId);
    } else {
      newExcluded.add(userId);
    }
    setExcludedUsers(newExcluded);

    // Save to storage service (with localStorage fallback)
    try {
      await storageService.saveExcludedUsers(newExcluded);
    } catch (error) {
      console.error('Failed to save excluded users:', error);
      // Error is already handled in storage service with fallback
    }
  }

  async function saveManagerRelationships() {
    try {
      setIsSaving(true);
      setStatus('Saving manager relationships and exclusions...');

      let successCount = 0;
      let errorCount = 0;

      // Process all users to handle both updates and deletions
      for (const user of users) {
        const currentManager = managers.get(user.id);
        const newManager = selectedManagers.get(user.id);

        // Check if there's a change
        if (currentManager === newManager || (currentManager === undefined && newManager === undefined)) {
          continue; // No change
        }

        try {
          if (newManager) {
            // Set or update manager
            await setUserManager(user.id, newManager);
          } else {
            // Remove manager (make this user a CEO)
            await removeUserManager(user.id);
          }
          successCount++;
        } catch (error) {
          console.error(`Failed to update manager for user ${user.id}:`, error);
          errorCount++;
        }
      }

      // Save excluded users to localStorage (already saved in toggleUserExclusion)
      setStatus(
        `✅ Saved ${successCount} manager relationships. ${excludedUsers.size} users excluded from chart. ${errorCount > 0 ? `❌ ${errorCount} failed.` : ''}`
      );

      // Reload to show updated state
      await loadUsers();
    } catch (error) {
      console.error('Failed to save manager relationships:', error);
      setStatus('❌ Failed to save manager relationships.');
    } finally {
      setIsSaving(false);
    }
  }

  async function setUserManager(userId: string, managerId: string) {
    // This requires direct Graph API call since the SDK doesn't have a helper
    const token = await graphService.getAccessToken();
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/users/${userId}/manager/$ref`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          '@odata.id': `https://graph.microsoft.com/v1.0/users/${managerId}`,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to set manager: ${response.statusText}`);
    }
  }

  async function removeUserManager(userId: string) {
    // Remove manager by using DELETE method
    const token = await graphService.getAccessToken();
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/users/${userId}/manager/$ref`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to remove manager: ${response.statusText}`);
    }
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Spinner size="large" label="Loading users..." />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Text size={800} weight="bold">
          Manager Relationship Setup
        </Text>
        <Text>
          Set up organizational manager relationships for your users. This is required for the org
          chart to work properly.
        </Text>
      </div>

      <Card className={styles.card}>
        <div className={styles.tableContainer}>
          <Table className={styles.table}>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Show</TableHeaderCell>
                <TableHeaderCell>Employee</TableHeaderCell>
                <TableHeaderCell>Job Title</TableHeaderCell>
                <TableHeaderCell>Department</TableHeaderCell>
                <TableHeaderCell>Manager</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Checkbox
                    checked={!excludedUsers.has(user.id)}
                    onChange={() => toggleUserExclusion(user.id)}
                    title="Show this user in the org chart"
                  />
                </TableCell>
                <TableCell>{user.displayName}</TableCell>
                <TableCell>{user.jobTitle || '-'}</TableCell>
                <TableCell>{user.department || '-'}</TableCell>
                <TableCell>
                  <Combobox
                    placeholder="Select manager"
                    value={
                      selectedManagers.get(user.id)
                        ? users.find((u) => u.id === selectedManagers.get(user.id))?.displayName
                        : 'None (CEO)'
                    }
                    onOptionSelect={(_, data) => {
                      const newMap = new Map(selectedManagers);
                      if (data.optionValue) {
                        newMap.set(user.id, data.optionValue);
                      } else {
                        newMap.delete(user.id);
                      }
                      setSelectedManagers(newMap);
                    }}
                  >
                    <Option text="None (CEO)" value="">None (CEO)</Option>
                    {users
                      .filter((u) => u.id !== user.id)
                      .map((manager) => (
                        <Option
                          key={manager.id}
                          value={manager.id}
                          text={`${manager.displayName}${manager.jobTitle ? ` - ${manager.jobTitle}` : ''}`}
                        >
                          {manager.displayName}
                          {manager.jobTitle ? ` - ${manager.jobTitle}` : ''}
                        </Option>
                      ))}
                  </Combobox>
                </TableCell>
              </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className={styles.actions}>
          <Button appearance="primary" onClick={saveManagerRelationships} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Manager Relationships'}
          </Button>
          <Button onClick={loadUsers} disabled={isSaving}>
            Refresh
          </Button>
        </div>

        {status && (
          <div className={styles.status}>
            <Text>{status}</Text>
          </div>
        )}
      </Card>
    </div>
  );
}
