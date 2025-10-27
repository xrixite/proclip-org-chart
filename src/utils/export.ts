import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Papa from 'papaparse';
import { User } from '../types';

/**
 * Export org chart as PDF
 */
export async function exportOrgChartToPDF(): Promise<void> {
  const chartElement = document.querySelector('.react-flow__viewport') as HTMLElement;

  if (!chartElement) {
    throw new Error('Org chart element not found');
  }

  try {
    // Capture the org chart as canvas
    const canvas = await html2canvas(chartElement, {
      backgroundColor: '#1e1e1e',
      scale: 2, // Higher quality
      logging: false,
    });

    // Calculate PDF dimensions
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Create PDF
    const pdf = new jsPDF({
      orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

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
