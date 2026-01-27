import { useState, useEffect } from 'react';
import { InvoiceData } from '../types';
import { saveDocument } from '../utils/storage';
import styles from './Modal.module.css';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: InvoiceData;
}

const generateDefaultName = (data: InvoiceData): string => {
  const date = data.documentInfo.issueDate.replace(/-/g, '');
  const docType = data.documentType;
  const client = data.clientInfo.companyName || data.clientInfo.contactPerson;
  return `${date}_${docType}_${client}`;
};

export default function SaveModal({ isOpen, onClose, data }: SaveModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(generateDefaultName(data));
    }
  }, [isOpen, data]);

  const handleSave = () => {
    if (!name.trim()) {
      setError('保存名を入力してください');
      return;
    }

    try {
      saveDocument(data, name.trim());
      setName('');
      setError('');
      onClose();
    } catch (err) {
      setError('保存に失敗しました');
    }
  };

  const handleClose = () => {
    setName('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>データ保存</h2>
          <button className={styles.closeButton} onClick={handleClose} aria-label="閉じる">
            ×
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.inputGroup}>
            <label htmlFor="save-name" className={styles.label}>
              保存名 <span className={styles.required}>必須</span>
            </label>
            <input
              id="save-name"
              type="text"
              className={styles.input}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="例: 2026年1月 ABC株式会社"
              autoFocus
            />
            {error && <div className={styles.error}>{error}</div>}
          </div>

          <div className={styles.info}>
            <p>現在の入力内容を保存します。</p>
            <p>保存されたデータは「データ読み込み」から呼び出せます。</p>
            <p>最大10件まで保存できます。</p>
          </div>

          <div className={styles.actions}>
            <button className={styles.cancelButton} onClick={handleClose}>
              キャンセル
            </button>
            <button className={styles.saveButton} onClick={handleSave}>
              保存する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
