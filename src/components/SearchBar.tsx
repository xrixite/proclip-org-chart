import { SearchBox, makeStyles } from '@fluentui/react-components';
import { useStore } from '../store';

const useStyles = makeStyles({
  searchBox: {
    minWidth: '300px',
    maxWidth: '400px',
  },
});

export default function SearchBar() {
  const styles = useStyles();
  const { searchQuery, setSearchQuery } = useStore();

  return (
    <SearchBox
      className={styles.searchBox}
      placeholder="Search by name, title, or department..."
      value={searchQuery}
      onChange={(_, data) => setSearchQuery(data.value)}
    />
  );
}
