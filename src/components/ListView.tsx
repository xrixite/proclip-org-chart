import { useMemo } from 'react';
import {
  DataGrid,
  DataGridHeader,
  DataGridRow,
  DataGridHeaderCell,
  DataGridBody,
  DataGridCell,
  TableColumnDefinition,
  createTableColumn,
  makeStyles,
  tokens,
  Avatar,
  Text,
} from '@fluentui/react-components';
import { useStore } from '../store';
import { User } from '../types';

const useStyles = makeStyles({
  container: {
    width: '100%',
    height: '100%',
    overflow: 'auto',
    padding: '16px',
  },
  nameCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  clickable: {
    cursor: 'pointer',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
});

export default function ListView() {
  const styles = useStyles();
  const { users, setSelectedUserId, getFilteredUsers } = useStore();

  const filteredUsers = getFilteredUsers();

  const columns: TableColumnDefinition<User>[] = useMemo(
    () => [
      createTableColumn<User>({
        columnId: 'name',
        compare: (a, b) => a.displayName.localeCompare(b.displayName),
        renderHeaderCell: () => 'Name',
        renderCell: (user) => (
          <div className={styles.nameCell}>
            <Avatar
              name={user.displayName}
              size={32}
              image={user.photoUrl ? { src: user.photoUrl } : undefined}
            />
            <Text weight="semibold">{user.displayName}</Text>
          </div>
        ),
      }),
      createTableColumn<User>({
        columnId: 'jobTitle',
        compare: (a, b) => (a.jobTitle || '').localeCompare(b.jobTitle || ''),
        renderHeaderCell: () => 'Job Title',
        renderCell: (user) => user.jobTitle || '-',
      }),
      createTableColumn<User>({
        columnId: 'department',
        compare: (a, b) => (a.department || '').localeCompare(b.department || ''),
        renderHeaderCell: () => 'Department',
        renderCell: (user) => user.department || '-',
      }),
      createTableColumn<User>({
        columnId: 'email',
        compare: (a, b) => (a.mail || '').localeCompare(b.mail || ''),
        renderHeaderCell: () => 'Email',
        renderCell: (user) => user.mail || '-',
      }),
      createTableColumn<User>({
        columnId: 'phone',
        compare: (a, b) => (a.businessPhones?.[0] || '').localeCompare(b.businessPhones?.[0] || ''),
        renderHeaderCell: () => 'Phone',
        renderCell: (user) => user.businessPhones?.[0] || '-',
      }),
      createTableColumn<User>({
        columnId: 'location',
        compare: (a, b) => (a.officeLocation || '').localeCompare(b.officeLocation || ''),
        renderHeaderCell: () => 'Location',
        renderCell: (user) => user.officeLocation || '-',
      }),
    ],
    [styles.nameCell]
  );

  return (
    <div className={styles.container}>
      <DataGrid
        items={filteredUsers}
        columns={columns}
        sortable
        getRowId={(item) => item.id}
        focusMode="composite"
      >
        <DataGridHeader>
          <DataGridRow>
            {({ renderHeaderCell }) => (
              <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
            )}
          </DataGridRow>
        </DataGridHeader>
        <DataGridBody<User>>
          {({ item, rowId }) => (
            <DataGridRow<User>
              key={rowId}
              className={styles.clickable}
              onClick={() => setSelectedUserId(item.id)}
            >
              {({ renderCell }) => <DataGridCell>{renderCell(item)}</DataGridCell>}
            </DataGridRow>
          )}
        </DataGridBody>
      </DataGrid>
    </div>
  );
}
