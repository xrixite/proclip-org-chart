import { Card, Text, Avatar, makeStyles, tokens, Badge } from '@fluentui/react-components';
import { Handle, Position } from 'reactflow';
import { User } from '../types';
import { useStore } from '../store';
import { memo } from 'react';
import { getDepartmentColor } from '../utils/departmentColors';

const useStyles = makeStyles({
  card: {
    width: '200px',
    padding: '12px',
    cursor: 'pointer',
    transitionProperty: 'all',
    transitionDuration: '0.2s',
    transitionTimingFunction: 'ease',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: tokens.shadow8,
    },
  },
  cardSelected: {
    outlineColor: tokens.colorBrandBackground,
    outlineWidth: '2px',
    outlineStyle: 'solid',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  name: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    textAlign: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    width: '100%',
  },
  title: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    textAlign: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    width: '100%',
  },
  department: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground4,
    textAlign: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    width: '100%',
  },
  avatarContainer: {
    position: 'relative',
    display: 'inline-block',
  },
  reportsBadge: {
    position: 'absolute',
    bottom: '-4px',
    right: '-4px',
    minWidth: '20px',
  },
});

interface UserCardProps {
  user: User;
  isCurrentUser?: boolean;
  directReportsCount?: number; // Optional override for actual children count in the rendered tree
}

function UserCard({ user, isCurrentUser, directReportsCount: providedCount }: UserCardProps) {
  const styles = useStyles();
  const { selectedUserId, setSelectedUserId, getDirectReportsCount, isDarkMode } = useStore();
  const isSelected = selectedUserId === user.id;
  // Use provided count if available (from tree structure), otherwise fall back to store
  const directReportsCount = providedCount !== undefined ? providedCount : getDirectReportsCount(user.id);
  const departmentColor = getDepartmentColor(user.department, isDarkMode);

  const handleClick = () => {
    setSelectedUserId(user.id);
  };

  return (
    <>
      {/* Input handle (for edges coming from parent) */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#6b7280', border: '2px solid white' }}
      />

      <Card
        className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}
        onClick={handleClick}
        style={{
          backgroundColor: departmentColor.background,
          borderColor: departmentColor.border,
          borderWidth: '2px',
          borderStyle: 'solid',
        }}
      >
        <div className={styles.content}>
          <div className={styles.avatarContainer}>
            <Avatar
              name={user.displayName}
              size={48}
              badge={isCurrentUser ? { status: 'available' } : undefined}
              image={user.photoUrl ? { src: user.photoUrl } : undefined}
            />
            {directReportsCount > 0 && (
              <Badge
                className={styles.reportsBadge}
                appearance="filled"
                color="brand"
                size="small"
              >
                {directReportsCount}
              </Badge>
            )}
          </div>
          <Text className={styles.name} title={user.displayName}>
            {user.displayName}
          </Text>
          {user.jobTitle && (
            <Text className={styles.title} title={user.jobTitle}>
              {user.jobTitle}
            </Text>
          )}
          {user.department && (
            <Text className={styles.department} title={user.department}>
              {user.department}
            </Text>
          )}
        </div>
      </Card>

      {/* Output handle (for edges going to children) */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#6b7280', border: '2px solid white' }}
      />
    </>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(UserCard);
