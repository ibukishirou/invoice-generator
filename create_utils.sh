#!/bin/bash

# calculator.ts
cat > src/utils/calculator.ts << 'EOF'
import { config } from '../config';
import { InvoiceItem, TaxType } from '../types';

export const calculateItemTotal = (item: InvoiceItem): number => {
  return item.quantity * item.unitPrice;
};

export const calculateSubtotal = (items: InvoiceItem[]): number => {
  return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
};

export const calculateTax = (
  subtotal: number,
  taxType: TaxType
): number => {
  switch (taxType) {
    case 'tax-excluded':
    case 'external-tax':
      return Math.floor(subtotal * config.taxRate);
    case 'tax-included':
    case 'internal-tax':
      return Math.floor(subtotal - subtotal / (1 + config.taxRate));
    default:
      return 0;
  }
};

export const calculateTotal = (
  subtotal: number,
  taxType: TaxType
): number => {
  switch (taxType) {
    case 'tax-excluded':
    case 'external-tax':
      return subtotal + calculateTax(subtotal, taxType);
    case 'tax-included':
    case 'internal-tax':
      return subtotal;
    default:
      return subtotal;
  }
};

export const formatCurrency = (amount: number): string => {
  return `¥${amount.toLocaleString('ja-JP')}`;
};

export const getTaxTypeLabel = (taxType: TaxType): string => {
  switch (taxType) {
    case 'tax-included':
      return '税込';
    case 'tax-excluded':
      return '税抜';
    case 'internal-tax':
      return '内税';
    case 'external-tax':
      return '外税';
    default:
      return '';
  }
};
EOF

# dateUtils.ts
cat > src/utils/dateUtils.ts << 'EOF'
export const getCurrentDate = (): string => {
  const now = new Date();
  return formatDateForInput(now);
};

export const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getNextMonthEnd = (): string => {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
  return formatDateForInput(nextMonth);
};

export const formatDateJapanese = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
};

export const generateDocumentNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
};
EOF

# fileUtils.ts
cat > src/utils/fileUtils.ts << 'EOF'
import { DocumentType } from '../types';

export const getDocumentTypeName = (type: DocumentType): string => {
  switch (type) {
    case 'invoice':
      return '請求書';
    case 'estimate':
      return '見積書';
    case 'delivery':
      return '納品書';
    default:
      return '書類';
  }
};

export const generateFileName = (
  documentType: DocumentType,
  clientName: string,
  customFileName?: string
): string => {
  if (customFileName && customFileName.trim()) {
    return customFileName.trim();
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const typeName = getDocumentTypeName(documentType);
  const safeClientName = clientName.trim() || '取引先';

  return `${typeName}_${year}${month}_${safeClientName}`;
};

export const convertImageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert image to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
EOF

# exportUtils.ts
cat > src/utils/exportUtils.ts << 'EOF'
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
EOF

