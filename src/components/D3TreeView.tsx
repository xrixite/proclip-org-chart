import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { OrgNode } from '../types';
import { useStore } from '../store';
import { getDepartmentColor } from '../utils/departmentColors';

interface D3TreeViewProps {
  orgTree: OrgNode;
}

interface D3HierarchyNode extends d3.HierarchyPointNode<OrgNode> {
  x: number;
  y: number;
}

interface D3Link extends d3.HierarchyPointLink<OrgNode> {
  source: D3HierarchyNode;
  target: D3HierarchyNode;
}

export default function D3TreeView({ orgTree }: D3TreeViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { setSelectedUserId, currentUserId, searchQuery, departmentFilter, getFilteredUsers, isDarkMode } = useStore();

  useEffect(() => {
    if (!svgRef.current || !orgTree) return;

    const filteredUsers = getFilteredUsers();
    const filteredUserIds = new Set(filteredUsers.map(u => u.id));
    const hasFilter = searchQuery.trim().length > 0 || !!departmentFilter;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const width = 5000;  // Extra wide canvas
    const height = 2500;
    const margin = { top: 60, right: 300, bottom: 60, left: 300 };
    const nodeWidth = 180;

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('font-family', 'Segoe UI, sans-serif');

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Convert OrgNode to D3 hierarchy
    const hierarchy = d3.hierarchy(orgTree, (d) => d.children);

    // Use cluster layout (better for org charts) with aggressive spacing
    const treeLayout = d3
      .cluster<OrgNode>()
      .size([width - margin.left - margin.right, height - margin.top - margin.bottom])
      .separation((a, b) => {
        // Much more aggressive separation
        return a.parent === b.parent ? 4 : 5;
      });

    const treeData = treeLayout(hierarchy);

    // Calculate minimum spacing needed
    const minSpacing = nodeWidth * 1.2;

    // Post-process to ensure minimum spacing
    const allNodes = treeData.descendants();
    allNodes.forEach((node, i) => {
      allNodes.slice(i + 1).forEach((otherNode) => {
        if (node.depth === otherNode.depth) {
          const distance = Math.abs(node.x - otherNode.x);
          if (distance < minSpacing) {
            // Push nodes apart if too close
            if (node.x < otherNode.x) {
              otherNode.x += (minSpacing - distance) / 2;
              node.x -= (minSpacing - distance) / 2;
            } else {
              node.x += (minSpacing - distance) / 2;
              otherNode.x -= (minSpacing - distance) / 2;
            }
          }
        }
      });
    });

    // Add links (edges)
    const linkGenerator = d3
      .linkVertical<D3Link, D3HierarchyNode>()
      .x((d) => d.x)
      .y((d) => d.y);

    g.selectAll('.link')
      .data(treeData.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', '#6b7280')
      .attr('stroke-width', 2)
      .attr('d', linkGenerator);

    // Add nodes
    const node = g
      .selectAll('.node')
      .data(treeData.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d) => `translate(${d.x},${d.y})`)
      .style('cursor', 'pointer')
      .style('opacity', (d) => {
        // Highlight search/filter matches
        if (hasFilter) {
          return filteredUserIds.has(d.data.user.id) ? 1 : 0.3;
        }
        return 1;
      })
      .style('transition', 'opacity 0.3s ease')
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedUserId(d.data.user.id);
      });

    // Add rectangles for nodes
    node
      .append('rect')
      .attr('width', 180)
      .attr('height', 80)
      .attr('x', -90)
      .attr('y', -40)
      .attr('rx', 8)
      .attr('fill', (d) => {
        // Use department color for background
        const deptColor = getDepartmentColor(d.data.user.department, isDarkMode);
        return deptColor.background;
      })
      .attr('stroke', (d) => {
        // Highlight search/filter matches with blue border
        if (hasFilter && filteredUserIds.has(d.data.user.id)) {
          return '#6366f1';
        }
        // Use department color for border
        const deptColor = getDepartmentColor(d.data.user.department, isDarkMode);
        return deptColor.border;
      })
      .attr('stroke-width', (d) => {
        if (hasFilter && filteredUserIds.has(d.data.user.id)) {
          return 3;
        }
        return 2;
      })
      .style('filter', 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))');

    // Add avatar circle
    node
      .append('circle')
      .attr('cx', 0)
      .attr('cy', -18)
      .attr('r', 16)
      .attr('fill', '#e5e7eb')
      .attr('stroke', '#9ca3af')
      .attr('stroke-width', 1.5);

    // Add initials in avatar
    node
      .append('text')
      .attr('dy', -13)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', '600')
      .style('fill', '#374151')
      .text((d) => {
        const name = d.data.user.displayName;
        const parts = name.split(' ');
        return parts.length >= 2
          ? `${parts[0][0]}${parts[1][0]}`
          : name.substring(0, 2).toUpperCase();
      });

    // Add name
    node
      .append('text')
      .attr('dy', 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '13px')
      .style('font-weight', '600')
      .style('fill', '#111827')
      .text((d) => {
        const name = d.data.user.displayName;
        return name.length > 20 ? name.substring(0, 20) + '...' : name;
      });

    // Add job title
    node
      .append('text')
      .attr('dy', 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('fill', '#6b7280')
      .text((d) => {
        const title = d.data.user.jobTitle || '';
        return title.length > 22 ? title.substring(0, 22) + '...' : title;
      });

    // Add zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        g.attr('transform', event.transform.toString());
      });

    svg.call(zoom);

    // Initial zoom to fit or zoom to search/filter result
    const gNode = g.node();
    if (gNode) {
      if (hasFilter && filteredUsers.length > 0) {
        // Zoom to first search result
        const firstMatch = filteredUsers[0];
        const matchedNode = treeData.descendants().find(d => d.data.user.id === firstMatch.id);

        if (matchedNode) {
          const scale = 1.2;
          const translate = [
            width / 2 - scale * matchedNode.x,
            height / 2 - scale * matchedNode.y,
          ];

          svg
            .transition()
            .duration(800)
            .call(
              zoom.transform,
              d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
            );
        }
      } else {
        // Default fit view
        const bounds = gNode.getBBox();
        const fullWidth = bounds.width;
        const fullHeight = bounds.height;
        const midX = bounds.x + fullWidth / 2;
        const midY = bounds.y + fullHeight / 2;

        const scale = 0.8 / Math.max(fullWidth / width, fullHeight / height);
        const translate = [width / 2 - scale * midX, height / 2 - scale * midY];

        svg
          .transition()
          .duration(750)
          .call(
            zoom.transform,
            d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
          );
      }
    }
  }, [orgTree, currentUserId, setSelectedUserId, searchQuery, departmentFilter, getFilteredUsers, isDarkMode]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb',
      }}
    >
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
