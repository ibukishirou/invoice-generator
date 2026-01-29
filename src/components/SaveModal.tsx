import { useState, useEffect } from 'react';
import { InvoiceData } from '../types';
import { saveDocument } from '../utils/storage';
import styles from './ExportModal.module.css';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: InvoiceData;
  onDownloadJSON: () => void;
}

const generateDefaultName = (data: InvoiceData): string => {
  const date = data.documentInfo.issueDate.replace(/-/g, '');
  const docType = data.documentType;
  const client = data.clientInfo.companyName || data.clientInfo.contactPerson;
  return `${date}_${docType}_${client}`;
};

export default function SaveModal({ isOpen, onClose, data, onDownloadJSON }: SaveModalProps) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(generateDefaultName(data));
    }
  }, [isOpen, data]);

  const handleSave = () => {
    const saveName = name.trim() || generateDefaultName(data);
    saveDocument(data, saveName);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>保存</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <div className={styles.fileNameRow}>
              <label className={styles.label}>ファイル名:</label>
              <input
                type="text"
                className={styles.input}
                placeholder="未入力の場合は自動生成"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <button className={styles.saveButton} onClick={handleSave}>
              名前を付けて保存
            </button>
            
            <button className={styles.jsonButton} onClick={onDownloadJSON}>
              JSONダウンロード
            </button>
            
            <div className={styles.warning}>
              <p>ツールの使用を終了する場合は、データ保存のためJSONをダウンロードしてください。</p>
              <p className={styles.bold}>機微情報が含まれています。絶対に第三者にファイルを渡さないでください。</p>
              
              <div className={styles.infoBox}>
                <p className={styles.infoTitle}>▼JSONの内容</p>
                <ul className={styles.infoList}>
                  <li>自社情報（会社名、住所、銀行口座情報など）</li>
                  <li>保存データ（最大30件）</li>
                  <li>ダウンロード履歴（最大10件）</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
