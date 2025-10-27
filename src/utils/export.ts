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
    // Get the viewport element that contains all nodes
    const viewport = reactFlowWrapper.querySelector('.react-flow__viewport') as HTMLElement;

    if (!viewport) {
      throw new Error('Org chart viewport not found');
    }

    // Store original transform to restore later
    const originalTransform = viewport.style.transform;

    // Temporarily reset transform to capture full chart
    viewport.style.transform = 'translate(0px, 0px) scale(1)';

    // Get all node elements to calculate bounds
    const nodes = viewport.querySelectorAll('.react-flow__node');
    if (nodes.length === 0) {
      throw new Error('No nodes found in org chart');
    }

    // Calculate bounding box of all nodes
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    nodes.forEach(node => {
      const rect = (node as HTMLElement).getBoundingClientRect();
      const viewportRect = viewport.getBoundingClientRect();

      const x = rect.left - viewportRect.left;
      const y = rect.top - viewportRect.top;

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + rect.width);
      maxY = Math.max(maxY, y + rect.height);
    });

    // Add padding
    const padding = 50;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    const width = maxX - minX;
    const height = maxY - minY;

    // Capture the viewport with adjusted position
    viewport.style.transform = `translate(${-minX}px, ${-minY}px) scale(1)`;

    // Small delay to let browser render
    await new Promise(resolve => setTimeout(resolve, 100));

    const canvas = await html2canvas(viewport, {
      backgroundColor: '#1e1e1e',
      scale: 1.5, // Good quality without being too large
      logging: false,
      width: width,
      height: height,
      x: 0,
      y: 0,
    });

    // Restore original transform
    viewport.style.transform = originalTransform;

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
export function exportEmployeeListToCSV(users: User[]): void {
  // Prepare data for CSV
  const csvData = Array.from(users).map(user => ({
    'Name': user.displayName,
    'Job Title': user.jobTitle || '',
    'Department': user.department || '',
    'Email': user.mail || '',
    'Phone': user.businessPhones?.[0] || '',
    'Office Location': user.officeLocation || '',
    'Manager': '', // Will be populated if we have manager data
  }));

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
