import { config, TAX_TYPES } from '../config';
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
    case TAX_TYPES.EXTERNAL_TAX:
      return Math.floor(subtotal * config.taxRate);
    case TAX_TYPES.INTERNAL_TAX:
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
    case TAX_TYPES.EXTERNAL_TAX:
      return subtotal + calculateTax(subtotal, taxType);
    case TAX_TYPES.INTERNAL_TAX:
      return subtotal;
    default:
      return subtotal;
  }
};

export const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString('ja-JP')}`;
};

export const getTaxTypeLabel = (taxType: TaxType): string => {
  return taxType;
};
