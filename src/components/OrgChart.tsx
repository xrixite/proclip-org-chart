import { makeStyles, Text } from '@fluentui/react-components';
import { useStore } from '../store';
import TreeView from './TreeView';
import D3TreeView from './D3TreeView';

const useStyles = makeStyles({
  container: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  empty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  viewContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    animationName: {
      from: { opacity: 0, transform: 'scale(0.98)' },
      to: { opacity: 1, transform: 'scale(1)' },
    },
    animationDuration: '300ms',
    animationTimingFunction: 'ease-out',
  },
});

export default function OrgChart() {
  const styles = useStyles();
  const { orgTree, viewMode } = useStore();

  console.log('OrgChart rendering, orgTree:', orgTree ? 'present' : 'null', 'viewMode:', viewMode);

  if (!orgTree) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <Text size={400}>No organization data available</Text>
        </div>
      </div>
    );
  }

  console.log('Rendering view:', viewMode);

  return (
    <div className={styles.container}>
      {viewMode === 'reactflow' && (
        <div key="reactflow" className={styles.viewContainer}>
          <TreeView orgTree={orgTree} />
        </div>
      )}
      {viewMode === 'd3-tree' && (
        <div key="d3-tree" className={styles.viewContainer}>
          <D3TreeView orgTree={orgTree} />
        </div>
      )}
      {viewMode === 'd3-radial' && (
        <div key="d3-radial" className={styles.viewContainer}>
          <div className={styles.empty}>
            <Text size={400}>D3 Radial view coming soon...</Text>
          </div>
        </div>
      )}
      {viewMode === 'list' && (
        <div key="list" className={styles.viewContainer}>
          <div className={styles.empty}>
            <Text size={400}>List view coming soon...</Text>
          </div>
        </div>
      )}
    </div>
  );
}
