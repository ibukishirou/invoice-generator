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
