import React from 'react';
import styles from './DataSavePromptModal.module.css';
import { InvoiceData } from '../types';

interface DataSavePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: InvoiceData;
}

const DataSavePromptModal: React.FC<DataSavePromptModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  if (!isOpen) return null;

  const handleDownloadJSON = () => {
    try {
      const jsonData = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice_data_${new Date().getTime()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('JSONダウンロードエラー:', error);
    }
  };

  const handleClosePage = () => {
    window.close();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.icon}>⚠️</span>
          <h2 className={styles.title}>データ保存のお願い</h2>
        </div>

        <div className={styles.warning}>
          <p>ツールの使用を終了する場合は、データ保存のためJSONをダウンロードしてください。</p>
          <p className={styles.bold}>大事な情報が記載されています。</p>
          <p className={styles.bold}>絶対に第三者にファイルを渡さないでください。</p>
        </div>

        <div className={styles.infoSection}>
          <ul className={styles.infoList}>
            <li>自社情報（会社名、住所、銀行口座情報など）</li>
            <li>保存データ（最大30件）</li>
            <li>ダウンロード履歴（最大10件）</li>
          </ul>
          <p className={styles.note}>これらのデータがJSONファイルに含まれます。</p>
        </div>

        <div className={styles.buttonGroup}>
          <button className={styles.cancelButton} onClick={onClose}>
            キャンセル
          </button>
          <button className={styles.jsonButton} onClick={handleDownloadJSON}>
            JSONダウンロード
          </button>
          <button className={styles.closeButton} onClick={handleClosePage}>
            ページを閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataSavePromptModal;
