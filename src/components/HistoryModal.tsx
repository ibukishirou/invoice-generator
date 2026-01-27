import React from 'react';
import { InvoiceData } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (d: InvoiceData) => void;
}

export default function HistoryModal({isOpen, onClose, onLoad}: HistoryModalProps) {
  if (!isOpen) return null;
  return <div onClick={onClose}>HistoryModal Component</div>
}
