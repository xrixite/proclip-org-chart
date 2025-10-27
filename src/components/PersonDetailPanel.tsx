import { useEffect, useMemo, useState } from 'react';
import {
  Drawer,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerBody,
  Button,
  Avatar,
  Text,
  makeStyles,
  tokens,
  Badge,
} from '@fluentui/react-components';
import { Dismiss24Regular, Call24Regular, Chat24Regular, Mail24Regular } from '@fluentui/react-icons';
import { chat, call } from '@microsoft/teams-js';
import { useStore } from '../store';
import { graphService } from '../services/graph';

const useStyles = makeStyles({
  drawer: {
    width: '380px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  profile: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    paddingTop: '8px',
  },
  name: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightSemibold,
    textAlign: 'center',
  },
  title: {
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground2,
    textAlign: 'center',
  },
  actions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
    width: '100%',
    marginTop: '8px',
  },
  infoSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  directReportsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '8px',
  },
  directReportItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px',
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
    cursor: 'pointer',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground2Hover,
    },
  },
  directReportInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
  },
  directReportName: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
  },
  directReportTitle: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  infoRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  label: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  value: {
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground1,
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flexWrap: 'wrap',
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    marginTop: '4px',
    justifyContent: 'center',
  },
  breadcrumbLink: {
    cursor: 'pointer',
    ':hover': {
      textDecoration: 'underline',
      color: tokens.colorBrandForeground1,
    },
  },
  breadcrumbSeparator: {
    color: tokens.colorNeutralForeground4,
  },
});

export default function PersonDetailPanel() {
  const styles = useStyles();
  const { selectedUserId, getUserById, setSelectedUserId, getManagerChain, getDirectReports } = useStore();
  const [userGroups, setUserGroups] = useState<string[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  if (!selectedUserId) return null;

  const user = getUserById(selectedUserId);

  if (!user) return null;

  const managerChain = getManagerChain(selectedUserId);
  const directReports = getDirectReports(selectedUserId);

  // Calculate tenure if hire date is available
  const tenure = useMemo(() => {
    if (!user.employeeHireDate) return null;
    const hireDate = new Date(user.employeeHireDate);
    const now = new Date();
    const years = now.getFullYear() - hireDate.getFullYear();
    const months = now.getMonth() - hireDate.getMonth();
    const totalMonths = years * 12 + months;

    if (totalMonths < 12) {
      return `${totalMonths} month${totalMonths !== 1 ? 's' : ''}`;
    } else {
      const y = Math.floor(totalMonths / 12);
      const m = totalMonths % 12;
      return m > 0 ? `${y} year${y !== 1 ? 's' : ''}, ${m} month${m !== 1 ? 's' : ''}` : `${y} year${y !== 1 ? 's' : ''}`;
    }
  }, [user.employeeHireDate]);

  // Load user groups when panel opens
  useEffect(() => {
    async function loadGroups() {
      if (!user.memberOf) {
        setLoadingGroups(true);
        try {
          const groups = await graphService.getUserGroups(selectedUserId);
          setUserGroups(groups);
        } catch (error) {
          console.error('Failed to load user groups:', error);
        } finally {
          setLoadingGroups(false);
        }
      } else {
        setUserGroups(user.memberOf);
      }
    }
    loadGroups();
  }, [selectedUserId, user.memberOf]);

  const handleClose = () => {
    setSelectedUserId(null);
  };

  const handleChat = () => {
    if (user.userPrincipalName) {
      chat.openChat({
        user: user.userPrincipalName,
      }).catch((error) => {
        console.error('Failed to open chat:', error);
      });
    }
  };

  const handleCall = () => {
    if (user.userPrincipalName) {
      call.startCall({
        targets: [user.userPrincipalName],
      }).catch((error) => {
        console.error('Failed to start call:', error);
      });
    }
  };

  const handleEmail = () => {
    if (user.mail) {
      window.open(`mailto:${user.mail}`, '_blank');
    }
  };

  return (
    <Drawer
      type="overlay"
      position="end"
      open={!!selectedUserId}
      onOpenChange={(_, { open }) => !open && handleClose()}
      className={styles.drawer}
    >
      <DrawerHeader>
        <DrawerHeaderTitle
          action={
            <Button
              appearance="subtle"
              icon={<Dismiss24Regular />}
              onClick={handleClose}
            />
          }
        >
          Profile
        </DrawerHeaderTitle>
      </DrawerHeader>

      <DrawerBody className={styles.body}>
        {/* Profile Section - Centered */}
        <div className={styles.profile}>
          <Avatar
            name={user.displayName}
            size={96}
            image={user.photoUrl ? { src: user.photoUrl } : undefined}
          />
          <Text className={styles.name}>{user.displayName}</Text>
          {user.jobTitle && <Text className={styles.title}>{user.jobTitle}</Text>}

          {/* Manager Chain Breadcrumb */}
          {managerChain.length > 0 && (
            <div className={styles.breadcrumb}>
              <Text size={200}>Reports to:</Text>
              {managerChain.slice(0, 3).map((manager, index) => (
                <span key={manager.id}>
                  <Text
                    className={styles.breadcrumbLink}
                    size={200}
                    onClick={() => setSelectedUserId(manager.id)}
                  >
                    {manager.displayName}
                  </Text>
                  {index < Math.min(managerChain.length - 1, 2) && (
                    <Text className={styles.breadcrumbSeparator} size={200}> › </Text>
                  )}
                </span>
              ))}
              {managerChain.length > 3 && (
                <Text size={200} className={styles.breadcrumbSeparator}>
                  ... (+{managerChain.length - 3} more)
                </Text>
              )}
            </div>
          )}

          {/* Action Buttons - Prominent Grid */}
          <div className={styles.actions}>
            {user.userPrincipalName && (
              <>
                <Button
                  appearance="primary"
                  icon={<Chat24Regular />}
                  onClick={handleChat}
                >
                  Chat
                </Button>
                <Button
                  appearance="secondary"
                  icon={<Call24Regular />}
                  onClick={handleCall}
                >
                  Call
                </Button>
              </>
            )}
            {user.mail && (
              <Button
                appearance="secondary"
                icon={<Mail24Regular />}
                onClick={handleEmail}
              >
                Email
              </Button>
            )}
          </div>
        </div>

        {/* All Information - no sections, no dividers */}
        {user.mail && (
          <div className={styles.infoRow}>
            <Text className={styles.label}>Email</Text>
            <Text className={styles.value}>{user.mail}</Text>
          </div>
        )}

        {user.mobilePhone && (
          <div className={styles.infoRow}>
            <Text className={styles.label}>Mobile Phone</Text>
            <Text className={styles.value}>{user.mobilePhone}</Text>
          </div>
        )}

        {user.businessPhones && user.businessPhones.length > 0 && (
          <div className={styles.infoRow}>
            <Text className={styles.label}>Business Phone</Text>
            <Text className={styles.value}>{user.businessPhones[0]}</Text>
          </div>
        )}

        {user.department && (
          <div className={styles.infoRow}>
            <Text className={styles.label}>Department</Text>
            <Text className={styles.value}>{user.department}</Text>
          </div>
        )}

        {user.officeLocation && (
          <div className={styles.infoRow}>
            <Text className={styles.label}>Office Location</Text>
            <Text className={styles.value}>{user.officeLocation}</Text>
          </div>
        )}

        {user.employeeHireDate && (
          <div className={styles.infoRow}>
            <Text className={styles.label}>Start Date</Text>
            <Text className={styles.value}>
              {new Date(user.employeeHireDate).toLocaleDateString()}
              {tenure && <Text size={200} style={{ color: tokens.colorNeutralForeground3, marginLeft: '8px' }}>({tenure})</Text>}
            </Text>
          </div>
        )}

        {user.skills && user.skills.length > 0 && (
          <div className={styles.infoRow}>
            <Text className={styles.label}>Skills</Text>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {user.skills.map((skill, index) => (
                <Badge key={index} appearance="tint" size="small">{skill}</Badge>
              ))}
            </div>
          </div>
        )}

        {userGroups.length > 0 && (
          <div className={styles.infoRow}>
            <Text className={styles.label}>Teams & Groups</Text>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {userGroups.slice(0, 5).map((group, index) => (
                <Text key={index} size={200}>{group}</Text>
              ))}
              {userGroups.length > 5 && (
                <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                  +{userGroups.length - 5} more
                </Text>
              )}
            </div>
          </div>
        )}

        {directReports.length > 0 && (
          <div className={styles.infoRow}>
            <Text className={styles.label}>Direct Reports ({directReports.length})</Text>
            <div className={styles.directReportsList}>
              {directReports.map((report) => (
                <div
                  key={report.id}
                  className={styles.directReportItem}
                  onClick={() => setSelectedUserId(report.id)}
                >
                  <Avatar
                    name={report.displayName}
                    size={32}
                    image={report.photoUrl ? { src: report.photoUrl } : undefined}
                  />
                  <div className={styles.directReportInfo}>
                    <Text className={styles.directReportName}>{report.displayName}</Text>
                    {report.jobTitle && (
                      <Text className={styles.directReportTitle}>{report.jobTitle}</Text>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DrawerBody>
    </Drawer>
  );
}
