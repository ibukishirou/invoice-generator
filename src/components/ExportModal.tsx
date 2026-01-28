import React, { useState, useRef } from 'react';
import styles from './ExportModal.module.css';
import { InvoiceData } from '../types';
import { generateFileName } from '../utils/fileUtils';
import { exportDocument } from '../utils/exportUtils';
import { addToHistory } from '../utils/storage';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: InvoiceData;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, data }) => {
  const [customFileName, setCustomFileName] = useState('');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'jpg' | 'png'>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    if (!previewRef.current) return;

    setIsExporting(true);
    try {
      const fileName = generateFileName(
        data.documentType,
        data.clientInfo.contactPerson,
        customFileName
      );

      await exportDocument(previewRef.current, fileName, exportFormat);
      addToHistory(data);
      onClose();
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

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

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>出力</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>ファイル出力</h3>
            <div className={styles.formGroup}>
              <label className={styles.label}>ファイル名:</label>
              <input
                type="text"
                className={styles.input}
                placeholder="未入力の場合は自動生成"
                value={customFileName}
                onChange={(e) => setCustomFileName(e.target.value)}
              />
            </div>
            <div className={styles.formatSelector}>
              <button
                className={`${styles.formatButton} ${
                  exportFormat === 'pdf' ? styles.active : ''
                }`}
                onClick={() => setExportFormat('pdf')}
              >
                PDF
              </button>
              <button
                className={`${styles.formatButton} ${
                  exportFormat === 'jpg' ? styles.active : ''
                }`}
                onClick={() => setExportFormat('jpg')}
              >
                JPG
              </button>
              <button
                className={`${styles.formatButton} ${
                  exportFormat === 'png' ? styles.active : ''
                }`}
                onClick={() => setExportFormat('png')}
              >
                PNG
              </button>
            </div>
            <button
              className={styles.downloadButton}
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? 'ダウンロード中...' : 'ダウンロード'}
            </button>
            
            <button className={styles.jsonButton} onClick={handleDownloadJSON}>
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

        {/* 非表示のプレビュー */}
        <div ref={previewRef} style={{ position: 'absolute', left: '-9999px' }}>
          {/* Preview content will be rendered here */}
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
