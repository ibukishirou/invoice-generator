import React from 'react';
import { InvoiceData } from '../types';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: InvoiceData;
}

export default function SaveModal({isOpen, onClose, data}: SaveModalProps) {
  if (!isOpen) return null;
  return <div onClick={onClose}>SaveModal Component (data: {data.id})</div>
}
