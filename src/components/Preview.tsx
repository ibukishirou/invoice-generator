import React, { useRef, useState } from 'react';
import styles from './Preview.module.css';
import { InvoiceData } from '../types';
import {
  calculateSubtotal,
  calculateTax,
  calculateTotal,
  calculateItemTotal,
  formatCurrency,
  getTaxTypeLabel,
} from '../utils/calculator';
import { formatDateJapanese } from '../utils/dateUtils';
import { getDocumentTypeName, generateFileName } from '../utils/fileUtils';
import { exportDocument, ExportFormat } from '../utils/exportUtils';
import { addToHistory } from '../utils/storage';

interface PreviewProps {
  data: InvoiceData;
}

const Preview: React.FC<PreviewProps> = ({ data }) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf');
  const [customFileName, setCustomFileName] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const subtotal = calculateSubtotal(data.items);
  const tax = calculateTax(subtotal, data.taxType);
  const total = calculateTotal(subtotal, data.taxType);

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

      // 履歴に追加
      addToHistory(data);

      alert('ダウンロードが完了しました');
    } catch (error) {
      console.error('Export failed:', error);
      alert('ダウンロードに失敗しました');
    } finally {
      setIsExporting(false);
    }
  };

  const getNotes = () => {
    let notes = data.documentInfo.notes || '';
    if (data.documentInfo.includePaymentNote) {
      if (notes) notes += '\n\n';
      notes += '恐れ入りますが振込手数料はご負担いただくようお願いいたします';
    }
    return notes;
  };

  return (
    <div className={styles.previewContainer}>
      <h2 className={styles.previewTitle}>プレビュー</h2>

      <div ref={previewRef} className={styles.previewDocument}>
        {/* ヘッダー */}
        <div className={styles.documentHeader}>
          <h1 className={styles.documentTitle}>
            {getDocumentTypeName(data.documentType)}
          </h1>
        </div>

        {/* 書類番号 */}
        {data.documentInfo.documentNumber && (
          <div className={styles.documentNumber}>
            No. {data.documentInfo.documentNumber}
          </div>
        )}

        {/* 取引先・自社情報 */}
        <div className={styles.documentBody}>
          <div className={styles.clientSection}>
            <div className={styles.sectionTitle}>請求先</div>
            {data.clientInfo.companyName && <div>{data.clientInfo.companyName}</div>}
            {data.clientInfo.address && <div>{data.clientInfo.address}</div>}
            <div>{data.clientInfo.contactPerson}</div>
          </div>

          <div className={styles.companySection}>
            <div className={styles.sectionTitle}>発行者</div>
            <div>{data.companyInfo.companyName}</div>
            {data.companyInfo.address && <div>{data.companyInfo.address}</div>}
            {data.companyInfo.phone && <div>TEL: {data.companyInfo.phone}</div>}
            {data.companyInfo.email && <div>Email: {data.companyInfo.email}</div>}
            {data.companyInfo.invoiceNumber && (
              <div>登録番号: {data.companyInfo.invoiceNumber}</div>
            )}
            {data.companyInfo.logoImage && (
              <img
                src={data.companyInfo.logoImage}
                alt="Company Logo"
                className={styles.companyLogo}
              />
            )}
          </div>
        </div>

        {/* 日付情報 */}
        <div className={styles.documentDates}>
          <div className={styles.dateItem}>
            <span className={styles.dateLabel}>発行日:</span>
            <span>{formatDateJapanese(data.documentInfo.issueDate)}</span>
          </div>
          <div className={styles.dateItem}>
            <span className={styles.dateLabel}>支払期限:</span>
            <span>{formatDateJapanese(data.documentInfo.paymentDueDate)}</span>
          </div>
        </div>

        {/* 明細テーブル */}
        <table className={styles.itemsTable}>
          <thead>
            <tr>
              <th style={{ width: '40%' }}>品目</th>
              <th style={{ width: '15%' }} className={styles.textRight}>数量</th>
              <th style={{ width: '15%' }} className={styles.textRight}>単価</th>
              <th style={{ width: '15%' }} className={styles.textRight}>金額</th>
              <th style={{ width: '15%' }}>備考</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => (
              <tr key={item.id}>
                <td>{item.itemName || '-'}</td>
                <td className={styles.textRight}>{item.quantity}</td>
                <td className={styles.textRight}>{formatCurrency(item.unitPrice)}</td>
                <td className={styles.textRight}>
                  {formatCurrency(calculateItemTotal(item))}
                </td>
                <td>{item.note || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 合計セクション */}
        <div className={styles.totalSection}>
          <div className={styles.totalRow}>
            <span>小計 ({getTaxTypeLabel(data.taxType)})</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className={styles.totalRow}>
            <span>消費税 (10%)</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className={`${styles.totalRow} ${styles.highlight}`}>
            <span>合計金額</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        {/* 振込先情報 */}
        <div className={styles.notesSection}>
          <div className={styles.notesTitle}>お振込先</div>
          <div>
            {data.companyInfo.bankName} {data.companyInfo.bankBranch}
          </div>
          <div>
            {data.companyInfo.accountType} {data.companyInfo.accountNumber}
          </div>
          <div>{data.companyInfo.accountHolder}</div>
        </div>

        {/* 備考 */}
        {getNotes() && (
          <div className={styles.notesSection}>
            <div className={styles.notesTitle}>備考</div>
            <div>{getNotes()}</div>
          </div>
        )}
      </div>

      {/* エクスポート設定 */}
      <div className={styles.exportSection}>
        <div className={styles.exportRow}>
          <input
            type="text"
            className={styles.fileNameInput}
            placeholder="ファイル名（未入力の場合は自動生成）"
            value={customFileName}
            onChange={(e) => setCustomFileName(e.target.value)}
          />
        </div>
        <div className={styles.formatSelector}>
          <button
            className={`${styles.formatButton} ${exportFormat === 'pdf' ? styles.active : ''}`}
            onClick={() => setExportFormat('pdf')}
          >
            PDF
          </button>
          <button
            className={`${styles.formatButton} ${exportFormat === 'jpg' ? styles.active : ''}`}
            onClick={() => setExportFormat('jpg')}
          >
            JPG
          </button>
          <button
            className={`${styles.formatButton} ${exportFormat === 'png' ? styles.active : ''}`}
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
      </div>
    </div>
  );
};

export default Preview;
