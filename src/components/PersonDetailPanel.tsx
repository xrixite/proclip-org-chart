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
  Divider,
} from '@fluentui/react-components';
import { Dismiss24Regular, Call24Regular, Chat24Regular, Mail24Regular } from '@fluentui/react-icons';
import { chat, call } from '@microsoft/teams-js';
import { useStore } from '../store';

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
    gap: '8px',
  },
  profile: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: '12px',
    paddingTop: '4px',
  },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },
  name: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
  },
  title: {
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground2,
  },
  actions: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    marginTop: '4px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  sectionTitle: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
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
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground2,
    marginTop: '2px',
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
  const { selectedUserId, getUserById, setSelectedUserId, getManagerChain, getDirectReportsCount } = useStore();

  if (!selectedUserId) return null;

  const user = getUserById(selectedUserId);

  if (!user) return null;

  const managerChain = getManagerChain(selectedUserId);
  const directReportsCount = getDirectReportsCount(selectedUserId);

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
        {/* Profile Section */}
        <div className={styles.profile}>
          <Avatar
            name={user.displayName}
            size={64}
            image={user.photoUrl ? { src: user.photoUrl } : undefined}
          />
          <div className={styles.profileInfo}>
            <Text className={styles.name}>{user.displayName}</Text>
            {user.jobTitle && <Text className={styles.title}>{user.jobTitle}</Text>}

            {/* Manager Chain Breadcrumb */}
            {managerChain.length > 0 && (
              <div className={styles.breadcrumb}>
                <Text size={100}>Reports to:</Text>
                {managerChain.slice(0, 3).map((manager, index) => (
                  <span key={manager.id}>
                    <Text
                      className={styles.breadcrumbLink}
                      size={100}
                      onClick={() => setSelectedUserId(manager.id)}
                    >
                      {manager.displayName}
                    </Text>
                    {index < Math.min(managerChain.length - 1, 2) && (
                      <Text className={styles.breadcrumbSeparator} size={100}> › </Text>
                    )}
                  </span>
                ))}
                {managerChain.length > 3 && (
                  <Text size={100} className={styles.breadcrumbSeparator}>
                    ... (+{managerChain.length - 3} more)
                  </Text>
                )}
              </div>
            )}

            {/* Action Buttons - moved under profile info */}
            <div className={styles.actions}>
              {user.userPrincipalName && (
                <>
                  <Button
                    appearance="primary"
                    icon={<Chat24Regular />}
                    onClick={handleChat}
                    size="small"
                  >
                    Chat
                  </Button>
                  <Button
                    appearance="secondary"
                    icon={<Call24Regular />}
                    onClick={handleCall}
                    size="small"
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
                  size="small"
                >
                  Email
                </Button>
              )}
            </div>
          </div>
        </div>

        <Divider />

        {/* Contact Information */}
        <div className={styles.section}>
          <Text className={styles.sectionTitle}>Contact Information</Text>

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
        </div>

        <Divider />

        {/* Organization Information */}
        <div className={styles.section}>
          <Text className={styles.sectionTitle}>Organization</Text>

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

          {directReportsCount > 0 && (
            <div className={styles.infoRow}>
              <Text className={styles.label}>Direct Reports</Text>
              <Text className={styles.value}>{directReportsCount} {directReportsCount === 1 ? 'person' : 'people'}</Text>
            </div>
          )}
        </div>
      </DrawerBody>
    </Drawer>
  );
}
