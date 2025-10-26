import { useCallback, useMemo, useEffect, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  MarkerType,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { OrgNode } from '../types';
import { useStore } from '../store';
import UserCard from './UserCard';
import DepartmentCard from './DepartmentCard';
import OrgChartEdge from './OrgChartEdge';

/**
 * Custom node component that renders either user or department cards
 */
function CustomNode({ data }: { data: any }) {
  // Check if this is a department node
  if (data.departmentName) {
    console.log(`[CustomNode] Rendering DEPARTMENT: ${data.departmentName}`);
    return <DepartmentCard departmentName={data.departmentName} memberCount={data.memberCount || 0} />;
  }

  // Otherwise render a user card
  console.log(`[CustomNode] Rendering USER: ${data.user?.displayName} with ${data.childrenCount} children`);
  return <UserCard
    user={data.user}
    isCurrentUser={data.isCurrentUser || false}
    directReportsCount={data.childrenCount || 0}
  />;
}

CustomNode.displayName = 'CustomNode';

// Define node types OUTSIDE component
const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  orgChart: OrgChartEdge,
};

console.log('[TreeView MODULE] nodeTypes defined:', Object.keys(nodeTypes));

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

      // Debug logging for department groups
      if (node.isDepartmentGroup) {
        console.log(`Rendering department group: ${node.departmentName} with ${node.children.length} children`);
        console.log(`  isDepartmentGroup: ${node.isDepartmentGroup}, departmentName: ${node.departmentName}`);
      }

      // Add node - all nodes use the same 'custom' type, but with different data
      if (node.isDepartmentGroup) {
        console.log(`  Adding DEPARTMENT node: ${node.departmentName} with ${node.totalMembers} total members`);
        // Use a unique ID for department nodes by prefixing with "dept-"
        nodes.push({
          id: `dept-${nodeId}`,
          type: 'custom',
          position: { x, y },
          data: {
            departmentName: node.departmentName!,
            memberCount: node.totalMembers || node.children.length, // Use totalMembers if available
          },
        });
      } else {
        // Calculate total descendants (entire team size), excluding department nodes
        const countAllDescendants = (n: OrgNode): number => {
          return n.children.reduce((sum, child) => {
            // Don't count department nodes as people, only count actual users
            const childCount = child.isDepartmentGroup ? 0 : 1;
            return sum + childCount + countAllDescendants(child);
          }, 0);
        };
        const totalTeamSize = countAllDescendants(node);

        nodes.push({
          id: nodeId,
          type: 'custom',
          position: { x, y },
          data: {
            user: node.user,
            isCurrentUser: nodeId === currentUserId,
            childrenCount: totalTeamSize, // Pass total team size (all descendants)
          },
        });
      }

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

              // Use dept- prefix for department node IDs
              const sourceId = node.isDepartmentGroup ? `dept-${nodeId}` : nodeId;
              const targetId = child.isDepartmentGroup ? `dept-${child.user.id}` : child.user.id;

              edges.push({
                id: `${sourceId}-${targetId}`,
                source: sourceId,
                target: targetId,
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
            // Use dept- prefix for department node IDs
            const sourceId = node.isDepartmentGroup ? `dept-${nodeId}` : nodeId;
            const targetId = child.isDepartmentGroup ? `dept-${child.user.id}` : child.user.id;

            edges.push({
              id: `${sourceId}-${targetId}`,
              source: sourceId,
              target: targetId,
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
    if (!hasFilter) {
      console.log('[TreeView] No filter, returning initialNodes');
      // Log first department node to verify data
      const deptNode = initialNodes.find(n => n.data?.departmentName);
      if (deptNode) {
        console.log('[TreeView] Department node in initialNodes:', deptNode.data);
      }
      return initialNodes;
    }

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

  // Force complete remount by including node types in key
  const reactFlowKey = useMemo(() => {
    const deptCount = highlightedNodes.filter(n => n.type === 'departmentCard').length;
    const userCount = highlightedNodes.filter(n => n.type === 'userCard').length;
    return `dept${deptCount}-user${userCount}-edges${initialEdges.length}`;
  }, [highlightedNodes, initialEdges.length]);

  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
    // Fit view on initialization with a slight delay to show entire tree
    setTimeout(() => {
      instance.fitView({ padding: 0.15, duration: 800 });
    }, 200);
  }, []);

  // Zoom to search/filter results
  useEffect(() => {
    const hasFilter = searchQuery.trim() || departmentFilter;
    if (!reactFlowInstance.current || !hasFilter) return;

    const filteredUsers = getFilteredUsers();
    if (filteredUsers.length > 0) {
      // Get all nodes that match the filter
      const matchingNodeIds = filteredUsers.map(u => u.id);

      // Fit view to show all matching nodes with padding
      setTimeout(() => {
        reactFlowInstance.current?.fitView({
          padding: 0.2,
          duration: 800,
          nodes: matchingNodeIds.map(id => ({ id })),
        });
      }, 100);
    }
  }, [searchQuery, departmentFilter, getFilteredUsers, highlightedNodes]);

  // Final check before passing to ReactFlow
  console.log('[TreeView] FINAL CHECK - highlightedNodes being passed to ReactFlow:', highlightedNodes.length);
  const deptNodesCount = highlightedNodes.filter(n => n.data?.departmentName).length;
  const userNodesCount = highlightedNodes.filter(n => n.data?.user).length;
  console.log('[TreeView] Node counts - department:', deptNodesCount, 'user:', userNodesCount);

  const finalDeptNode = highlightedNodes.find(n => n.data?.departmentName);
  const finalUserNode = highlightedNodes.find(n => n.data?.user);

  if (finalDeptNode) {
    console.log('[TreeView] FINAL - Department node FULL:', finalDeptNode);
  }

  if (finalUserNode) {
    console.log('[TreeView] FINAL - User node FULL:', finalUserNode);
  }

  console.log('[TreeView] ALL nodes being passed:', highlightedNodes);

  return (
    <div style={{
      width: '100%',
      height: 'calc(100vh - 120px)', // Viewport height minus header
      minHeight: '600px',
      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
    }}>
      <ReactFlow
        key={reactFlowKey}
        nodes={highlightedNodes}
        edges={initialEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onInit={onInit}
        fitView
        minZoom={0.1}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
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
