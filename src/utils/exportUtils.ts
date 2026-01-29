import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export type ExportFormat = 'pdf' | 'jpg' | 'png';

export const exportToPDF = async (
  element: HTMLElement,
  fileName: string
): Promise<void> => {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Canvas dimensions in pixels
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Convert pixels to mm (assuming 96 DPI)
    const mmPerPixel = 25.4 / 96;
    const imgWidthMM = canvasWidth * mmPerPixel;
    const imgHeightMM = canvasHeight * mmPerPixel;
    
    // Calculate scaling to fit within A4
    const ratio = Math.min(pdfWidth / imgWidthMM, pdfHeight / imgHeightMM);
    
    const finalWidth = imgWidthMM * ratio;
    const finalHeight = imgHeightMM * ratio;
    
    const x = (pdfWidth - finalWidth) / 2;
    const y = 0;

    pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error('Failed to export PDF:', error);
    throw error;
  }
};

export const exportToJPG = async (
  element: HTMLElement,
  fileName: string
): Promise<void> => {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}.jpg`;
        link.click();
        URL.revokeObjectURL(url);
      }
    }, 'image/jpeg', 0.95);
  } catch (error) {
    console.error('Failed to export JPG:', error);
    throw error;
  }
};

export const exportToPNG = async (
  element: HTMLElement,
  fileName: string
): Promise<void> => {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}.png`;
        link.click();
        URL.revokeObjectURL(url);
      }
    }, 'image/png');
  } catch (error) {
    console.error('Failed to export PNG:', error);
    throw error;
  }
};

export const exportDocument = async (
  element: HTMLElement,
  fileName: string,
  format: ExportFormat
): Promise<void> => {
  switch (format) {
    case 'pdf':
      await exportToPDF(element, fileName);
      break;
    case 'jpg':
      await exportToJPG(element, fileName);
      break;
    case 'png':
      await exportToPNG(element, fileName);
      break;
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
};
