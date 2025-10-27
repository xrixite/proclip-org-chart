import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Papa from 'papaparse';
import { User } from '../types';

/**
 * Export org chart as PDF
 */
export async function exportOrgChartToPDF(): Promise<void> {
  // Try to find the ReactFlow container
  const reactFlowWrapper = document.querySelector('.react-flow') as HTMLElement;

  if (!reactFlowWrapper) {
    throw new Error('Org chart element not found');
  }

  try {
    // Get all the elements
    const viewport = reactFlowWrapper.querySelector('.react-flow__viewport') as HTMLElement;
    const edgesLayer = reactFlowWrapper.querySelector('.react-flow__edges') as HTMLElement;

    if (!viewport) {
      throw new Error('Org chart viewport not found');
    }

    // Store original styles to restore later
    const originalTransform = viewport.style.transform;
    const originalWrapperStyle = {
      width: reactFlowWrapper.style.width,
      height: reactFlowWrapper.style.height,
      overflow: reactFlowWrapper.style.overflow,
    };

    // Get all node elements to calculate bounds
    const nodes = viewport.querySelectorAll('.react-flow__node');
    if (nodes.length === 0) {
      throw new Error('No nodes found in org chart');
    }

    // Calculate bounding box of all nodes using their transform positions
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    nodes.forEach(node => {
      const element = node as HTMLElement;
      const transform = element.style.transform;

      // Parse translate values from transform
      const match = transform.match(/translate\((-?\d+\.?\d*)px,\s*(-?\d+\.?\d*)px\)/);
      if (match) {
        const x = parseFloat(match[1]);
        const y = parseFloat(match[2]);
        const width = element.offsetWidth || 200;
        const height = element.offsetHeight || 100;

        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + width);
        maxY = Math.max(maxY, y + height);
      }
    });

    // Add padding
    const padding = 50;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    const width = maxX - minX;
    const height = maxY - minY;

    // Adjust the wrapper and viewport for capture
    viewport.style.transform = `translate(${-minX}px, ${-minY}px) scale(1)`;
    reactFlowWrapper.style.width = `${width}px`;
    reactFlowWrapper.style.height = `${height}px`;
    reactFlowWrapper.style.overflow = 'visible';

    // Small delay to let browser render
    await new Promise(resolve => setTimeout(resolve, 200));

    // Capture the entire ReactFlow wrapper (includes edges and nodes)
    const canvas = await html2canvas(reactFlowWrapper, {
      backgroundColor: '#ffffff', // Use white background for PDFs (better for printing)
      scale: 1.5, // Good quality without being too large
      logging: false,
      width: width,
      height: height,
      useCORS: true,
      allowTaint: true,
    });

    // Restore original styles
    viewport.style.transform = originalTransform;
    reactFlowWrapper.style.width = originalWrapperStyle.width;
    reactFlowWrapper.style.height = originalWrapperStyle.height;
    reactFlowWrapper.style.overflow = originalWrapperStyle.overflow;

    // Calculate PDF dimensions (landscape for wide charts)
    const pdf = new jsPDF({
      orientation: width > height ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth - 20; // 10mm margin on each side
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // If image is taller than page, scale it down
    let finalWidth = imgWidth;
    let finalHeight = imgHeight;

    if (imgHeight > pageHeight - 20) {
      finalHeight = pageHeight - 20;
      finalWidth = (canvas.width * finalHeight) / canvas.height;
    }

    const xOffset = (pageWidth - finalWidth) / 2;
    const yOffset = (pageHeight - finalHeight) / 2;

    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);

    // Download
    const date = new Date().toISOString().split('T')[0];
    pdf.save(`org-chart-${date}.pdf`);
  } catch (error) {
    console.error('Failed to export PDF:', error);
    throw error;
  }
}

/**
 * Export employee list as CSV
 */
export function exportEmployeeListToCSV(
  users: User[],
  getManager?: (userId: string) => User | undefined
): void {
  // Prepare data for CSV
  const csvData = Array.from(users).map(user => {
    const manager = getManager ? getManager(user.id) : undefined;
    return {
      'Name': user.displayName,
      'Job Title': user.jobTitle || '',
      'Department': user.department || '',
      'Email': user.mail || '',
      'Phone': user.businessPhones?.[0] || '',
      'Office Location': user.officeLocation || '',
      'Manager': manager?.displayName || '',
    };
  });

  // Convert to CSV
  const csv = Papa.unparse(csvData);

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  const date = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `employee-list-${date}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
