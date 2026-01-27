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
