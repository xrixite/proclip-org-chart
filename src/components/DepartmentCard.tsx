import { Card, Text, makeStyles, tokens } from '@fluentui/react-components';
import { PeopleTeam24Regular } from '@fluentui/react-icons';
import { Handle, Position } from 'reactflow';
import { getDepartmentColor } from '../utils/departmentColors';

const useStyles = makeStyles({
  card: {
    width: '200px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: tokens.shadow16,
    },
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  icon: {
    fontSize: '24px',
  },
  name: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase300,
  },
  count: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
  },
});

interface DepartmentCardProps {
  departmentName: string;
  memberCount: number;
}

export default function DepartmentCard({ departmentName, memberCount }: DepartmentCardProps) {
  const styles = useStyles();
  const colors = getDepartmentColor(departmentName);

  return (
    <>
      {/* Input handle (for edges coming from parent) */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#6b7280', border: '2px solid white' }}
      />

      <Card
        className={styles.card}
        style={{
          backgroundColor: colors.background,
          borderLeft: `4px solid ${colors.border}`,
        }}
      >
        <div className={styles.header}>
          <PeopleTeam24Regular className={styles.icon} style={{ color: colors.border }} />
          <div>
            <Text className={styles.name}>{departmentName}</Text>
          </div>
        </div>
        <Text className={styles.count}>
          {memberCount} member{memberCount !== 1 ? 's' : ''}
        </Text>
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
