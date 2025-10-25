import { Dropdown, Option, makeStyles, Text, tokens } from '@fluentui/react-components';
import { useStore } from '../store';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  dropdown: {
    minWidth: '200px',
  },
  count: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    padding: '4px 8px',
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusSmall,
  },
});

export default function DepartmentFilter() {
  const styles = useStyles();
  const { departmentFilter, setDepartmentFilter, getAllDepartments, getFilteredUsers, users } = useStore();
  const departments = getAllDepartments();

  // Calculate count
  const filteredCount = departmentFilter ? getFilteredUsers().length : 0;
  const totalCount = users.size;

  return (
    <div className={styles.container}>
      <Dropdown
        className={styles.dropdown}
        placeholder="Filter by department"
        value={departmentFilter || ''}
        selectedOptions={departmentFilter ? [departmentFilter] : []}
        onOptionSelect={(_, data) => {
          const value = data.optionValue as string;
          setDepartmentFilter(value === 'all' ? null : value);
        }}
      >
        <Option key="all" value="all">
          All Departments
        </Option>
        {departments.map((dept) => (
          <Option key={dept} value={dept}>
            {dept}
          </Option>
        ))}
      </Dropdown>
      {departmentFilter && (
        <Text className={styles.count}>
          {filteredCount} of {totalCount}
        </Text>
      )}
    </div>
  );
}
