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
    
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    
    const imgDisplayWidth = imgWidth * ratio;
    const imgDisplayHeight = imgHeight * ratio;
    
    const x = (pdfWidth - imgDisplayWidth) / 2;
    const y = 0;

    pdf.addImage(imgData, 'PNG', x, y, imgDisplayWidth, imgDisplayHeight);
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
