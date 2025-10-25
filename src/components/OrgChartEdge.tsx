import { EdgeProps } from 'reactflow';

/**
 * Custom edge for org chart with straight horizontal and vertical lines
 * For grid layouts, routes around cards in earlier rows
 */
export default function OrgChartEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  let midY = (sourceY + targetY) / 2;

  // For grid layouts with multiple rows, route the line lower to avoid overlapping with row 1
  if (data?.isGridLayout && data?.gridRow > 0) {
    // For second row and beyond, go down past the first row before going horizontal
    // The first row is at targetY - 200 (one verticalSpacing above), so we need to go below it
    const verticalSpacing = 200; // matches TreeView verticalSpacing
    const cardHeight = 120; // card height including padding and margin
    const clearance = 60; // extra space for visual separation

    // Calculate where the first row is and route below it
    const firstRowY = targetY - verticalSpacing;
    midY = firstRowY + cardHeight + clearance;
  }

  const edgePath = `
    M ${sourceX} ${sourceY}
    L ${sourceX} ${midY}
    L ${targetX} ${midY}
    L ${targetX} ${targetY}
  `;

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
        fill="none"
      />
    </>
  );
}
