import { useCallback, useMemo, useEffect, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  MarkerType,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { OrgNode, User } from '../types';
import { useStore } from '../store';
import UserCard from './UserCard';
import OrgChartEdge from './OrgChartEdge';

/**
 * Custom node component for React Flow
 */
function CustomNode({ data }: { data: { user: User; isCurrentUser: boolean } }) {
  return <UserCard user={data.user} isCurrentUser={data.isCurrentUser} />;
}

const nodeTypes = {
  userCard: CustomNode,
};

const edgeTypes = {
  orgChart: OrgChartEdge,
};

interface TreeViewProps {
  orgTree: OrgNode;
}

export default function TreeView({ orgTree }: TreeViewProps) {
  const { currentUserId, searchQuery, departmentFilter, getFilteredUsers, isDarkMode } = useStore();
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  /**
   * Convert OrgNode tree to React Flow nodes and edges
   */
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const horizontalSpacing = 240;
    const verticalSpacing = 200;
    const maxLeafNodesPerRow = 2; // 2 leaf nodes per row

    // Calculate the width needed for a subtree
    function getSubtreeWidth(node: OrgNode): number {
      if (node.children.length === 0) return 1;

      // Check if all children are leaf nodes
      const allChildrenAreLeaves = node.children.every(child => child.children.length === 0);

      if (allChildrenAreLeaves) {
        // For leaf children, calculate grid width
        const maxInRow = Math.min(node.children.length, maxLeafNodesPerRow);
        return maxInRow;
      }

      // Sum the widths of all children's subtrees
      const childrenWidth = node.children.reduce((sum, child) => {
        return sum + getSubtreeWidth(child);
      }, 0);

      return Math.max(1, childrenWidth);
    }

    // Calculate positions using a hybrid tree/grid layout
    function calculatePositions(node: OrgNode, x: number, y: number, level: number) {
      const nodeId = node.user.id;

      // Add node
      nodes.push({
        id: nodeId,
        type: 'userCard',
        position: { x, y },
        data: {
          user: node.user,
          isCurrentUser: nodeId === currentUserId,
        },
      });

      // Calculate children positions
      if (node.children.length > 0) {
        const childY = y + verticalSpacing;

        // Check if all children are leaf nodes (no grandchildren)
        const allChildrenAreLeaves = node.children.every(child => child.children.length === 0);

        if (allChildrenAreLeaves) {
          // Use grid layout for leaf nodes
          const numChildren = node.children.length;
          const childrenPerRow = Math.min(numChildren, maxLeafNodesPerRow);
          const numRows = Math.ceil(numChildren / childrenPerRow);

          let childIndex = 0;

          for (let row = 0; row < numRows; row++) {
            const childrenInThisRow = Math.min(
              childrenPerRow,
              numChildren - childIndex
            );

            const rowY = childY + (row * verticalSpacing);
            const rowWidth = (childrenInThisRow - 1) * horizontalSpacing;
            const startX = x - rowWidth / 2;

            for (let col = 0; col < childrenInThisRow; col++) {
              if (childIndex >= numChildren) break;

              const child = node.children[childIndex];
              const childX = startX + (col * horizontalSpacing);

              edges.push({
                id: `${nodeId}-${child.user.id}`,
                source: nodeId,
                target: child.user.id,
                type: 'orgChart',
                animated: false,
                style: { stroke: '#6b7280', strokeWidth: 2 },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  width: 20,
                  height: 20,
                  color: '#6b7280',
                },
                data: {
                  isGridLayout: true,
                  gridRow: row,
                  totalRows: numRows,
                },
              });

              calculatePositions(child, childX, rowY, level + 1);
              childIndex++;
            }
          }
        } else {
          // Use traditional tree layout for nodes with subtrees
          const totalWidth = node.children.reduce((sum, child) => {
            return sum + getSubtreeWidth(child) * horizontalSpacing;
          }, 0);

          let currentX = x - totalWidth / 2;

          node.children.forEach((child) => {
            edges.push({
              id: `${nodeId}-${child.user.id}`,
              source: nodeId,
              target: child.user.id,
              type: 'orgChart',
              animated: false,
              style: { stroke: '#6b7280', strokeWidth: 2 },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 20,
                height: 20,
                color: '#6b7280',
              },
            });

            const childWidth = getSubtreeWidth(child) * horizontalSpacing;
            const childX = currentX + childWidth / 2;

            calculatePositions(child, childX, childY, level + 1);
            currentX += childWidth;
          });
        }
      }
    }

    // Calculate the total width needed for the tree
    const totalTreeWidth = getSubtreeWidth(orgTree) * horizontalSpacing;

    // Start from the root (CEO) at the top center with calculated width
    const startX = Math.max(totalTreeWidth / 2, 500);
    calculatePositions(orgTree, startX, 50, 0);

    console.log(`Generated ${nodes.length} nodes and ${edges.length} edges`);
    console.log(`Tree width: ${totalTreeWidth}px, starting at x: ${startX}`);

    return { nodes, edges };
  }, [orgTree, currentUserId]);

  // Highlight matching nodes based on search and/or department filter
  const highlightedNodes = useMemo(() => {
    const hasFilter = searchQuery.trim() || departmentFilter;
    if (!hasFilter) return initialNodes;

    const filteredUsers = getFilteredUsers();
    const filteredUserIds = new Set(filteredUsers.map(u => u.id));

    return initialNodes.map(node => ({
      ...node,
      style: {
        ...node.style,
        opacity: filteredUserIds.has(node.id) ? 1 : 0.3,
        transition: 'opacity 0.3s ease',
      },
    }));
  }, [initialNodes, searchQuery, departmentFilter, getFilteredUsers]);

  const [nodes, setNodes, onNodesChange] = useNodesState(highlightedNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when search changes
  useEffect(() => {
    setNodes(highlightedNodes);
  }, [highlightedNodes, setNodes]);

  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
    // Fit view on initialization with a slight delay to show entire tree
    setTimeout(() => {
      instance.fitView({ padding: 0.15, duration: 800 });
    }, 200);
  }, []);

  // Zoom to first search/filter result
  useEffect(() => {
    const hasFilter = searchQuery.trim() || departmentFilter;
    if (!reactFlowInstance.current || !hasFilter) return;

    const filteredUsers = getFilteredUsers();
    if (filteredUsers.length > 0) {
      const firstMatch = filteredUsers[0];
      const node = nodes.find(n => n.id === firstMatch.id);

      if (node) {
        // Zoom to the matched node
        reactFlowInstance.current.setCenter(node.position.x + 100, node.position.y, {
          zoom: 1.2,
          duration: 800,
        });
      }
    }
  }, [searchQuery, departmentFilter, getFilteredUsers, nodes]);

  return (
    <div style={{
      width: '100%',
      height: 'calc(100vh - 120px)', // Viewport height minus header
      minHeight: '600px',
      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
    }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onInit={onInit}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.1}
        maxZoom={1.5}
        defaultEdgeOptions={{
          style: { strokeWidth: 2 },
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={12}
          size={1}
          color={isDarkMode ? '#4b5563' : '#d1d5db'}
        />
        <Controls />
      </ReactFlow>
    </div>
  );
}
