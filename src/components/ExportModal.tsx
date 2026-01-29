import React, { useState, useRef } from 'react';
import styles from './ExportModal.module.css';
import previewStyles from './Preview.module.css';
import { InvoiceData } from '../types';
import { generateFileName, getDocumentTypeName } from '../utils/fileUtils';
import { exportDocument } from '../utils/exportUtils';
import { addToHistory } from '../utils/storage';
import { calculateSubtotal, calculateTax, calculateTotal, calculateItemTotal, formatCurrency, getTaxTypeLabel } from '../utils/calculator';
import { formatDateJapanese } from '../utils/dateUtils';
import { DOCUMENT_TYPES } from '../config';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: InvoiceData;
  onSave: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, data, onSave }) => {
  const [customFileName, setCustomFileName] = useState('');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'jpg' | 'png'>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const subtotal = calculateSubtotal(data.items);
  const tax = calculateTax(subtotal, data.taxType);
  const total = calculateTotal(subtotal, data.taxType);

  const getNotes = () => {
    let notes = data.documentInfo.notes || '';
    if (data.documentType === DOCUMENT_TYPES.INVOICE && data.documentInfo.includePaymentNote) {
      if (notes) notes += '\n';
      notes += '恐れ入りますが振込手数料はご負担いただくようお願いいたします。';
    }
    return notes;
  };

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
            <div className={styles.fileNameRow}>
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
            
            <button className={styles.saveButton} onClick={onSave}>
              名前を付けて保存
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
        <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
          <div 
            ref={previewRef} 
            className={previewStyles.previewDocument}
            style={{ transform: 'scale(1)' }}
          >
            {/* ヘッダー */}
            <div className={previewStyles.documentHeader}>
              <h1 className={previewStyles.documentTitle}>
                {getDocumentTypeName(data.documentType)}
              </h1>
            </div>

            {/* 件名・書類番号・発行日を横並びに */}
            <div className={previewStyles.metaRow}>
              {data.documentInfo.subject && (
                <div className={previewStyles.subjectSection}>
                  <div className={previewStyles.subjectLabel}>件名</div>
                  <div className={previewStyles.subjectContent}>{data.documentInfo.subject}</div>
                </div>
              )}
              <div className={previewStyles.metaRight}>
                {data.documentInfo.documentNumber && (
                  <div className={previewStyles.documentNumber}>
                    No. {data.documentInfo.documentNumber}
                  </div>
                )}
                <div className={previewStyles.issueDate}>
                  発行日: {formatDateJapanese(data.documentInfo.issueDate)}
                </div>
              </div>
            </div>

            {/* 取引先・自社情報 */}
            <div className={previewStyles.documentBody}>
              <div className={previewStyles.clientSection}>
                <div className={previewStyles.sectionTitle}>
                  {data.documentType === DOCUMENT_TYPES.INVOICE && '請求先'}
                  {data.documentType === DOCUMENT_TYPES.PURCHASE_ORDER && '発注先'}
                  {data.documentType === DOCUMENT_TYPES.ESTIMATE && '見積先'}
                  {data.documentType === DOCUMENT_TYPES.DELIVERY && '納品先'}
                </div>
                <div className={previewStyles.sectionContent}>
                  {data.clientInfo.companyName && <div>{data.clientInfo.companyName}</div>}
                  {data.clientInfo.address && <div>{data.clientInfo.address}</div>}
                  <div>{data.clientInfo.contactPerson}</div>
                </div>
              </div>

              <div className={previewStyles.companySection}>
                <div className={previewStyles.sectionTitle}>発行者</div>
                <div className={previewStyles.sectionContent}>
                  <div>{data.companyInfo.companyName}</div>
                  {data.companyInfo.address && <div>{data.companyInfo.address}</div>}
                  {data.companyInfo.phone && <div>TEL: {data.companyInfo.phone}</div>}
                  {data.companyInfo.email && <div>Email: {data.companyInfo.email}</div>}
                  {data.documentType !== DOCUMENT_TYPES.PURCHASE_ORDER && data.companyInfo.invoiceNumber && (
                    <div>登録番号: {data.companyInfo.invoiceNumber}</div>
                  )}
                </div>
              </div>
            </div>

            {/* お振込先（支払期限/振込先/合計の統合テーブル） */}
            {data.documentType === DOCUMENT_TYPES.INVOICE && (
              <div className={previewStyles.bankInfoTable}>
                {data.documentInfo.paymentDueDate && (
                  <div className={previewStyles.bankInfoRow}>
                    <div className={previewStyles.bankInfoLabel}>支払期限</div>
                    <div className={previewStyles.bankInfoValue}>{formatDateJapanese(data.documentInfo.paymentDueDate)}</div>
                  </div>
                )}
                <div className={previewStyles.bankInfoRow}>
                  <div className={previewStyles.bankInfoLabel}>振込先</div>
                  <div className={previewStyles.bankInfoValue}>
                    <div>{data.companyInfo.bankName} {data.companyInfo.bankBranch}</div>
                    <div>{data.companyInfo.accountType} {data.companyInfo.accountNumber} {data.companyInfo.accountHolder}</div>
                  </div>
                </div>
                <div className={previewStyles.bankInfoRow}>
                  <div className={previewStyles.bankInfoLabel}>合計（{data.taxType}）</div>
                  <div className={previewStyles.bankInfoValue}>{formatCurrency(total)}円</div>
                </div>
              </div>
            )}

            {/* 支払期限/有効期限（請求書以外） */}
            {data.documentType !== DOCUMENT_TYPES.INVOICE && data.documentType !== DOCUMENT_TYPES.DELIVERY && data.documentInfo.paymentDueDate && (
              <div className={previewStyles.dueDateSection}>
                <div className={previewStyles.dueDateLabel}>
                  {data.documentType === DOCUMENT_TYPES.PURCHASE_ORDER || data.documentType === DOCUMENT_TYPES.ESTIMATE ? '有効期限' : '支払期限'}
                </div>
                <div className={previewStyles.dueDateValue}>{formatDateJapanese(data.documentInfo.paymentDueDate)}</div>
              </div>
            )}

            {/* 明細テーブル */}
            <table className={previewStyles.itemsTable}>
              <thead>
                <tr>
                  <th style={{ width: '50%' }}>品目</th>
                  <th style={{ width: '15%' }} className={previewStyles.textRight}>数量</th>
                  <th style={{ width: '20%' }} className={previewStyles.textRight}>単価</th>
                  <th style={{ width: '15%' }} className={previewStyles.textRight}>金額</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.itemName || '-'}</td>
                    <td className={previewStyles.textRight}>{item.quantity}</td>
                    <td className={previewStyles.textRight}>{formatCurrency(item.unitPrice)}</td>
                    <td className={previewStyles.textRight}>
                      {formatCurrency(calculateItemTotal(item))}
                    </td>
                  </tr>
                ))}
                {/* テーブル内に小計・消費税を追加 */}
                <tr className={previewStyles.subtotalRow}>
                  <td colSpan={3} className={previewStyles.textRight}>小計 ({getTaxTypeLabel(data.taxType)})</td>
                  <td className={previewStyles.textRight}>{formatCurrency(subtotal)}</td>
                </tr>
                <tr className={previewStyles.taxRow}>
                  <td colSpan={3} className={previewStyles.textRight}>消費税 (10%)</td>
                  <td className={previewStyles.textRight}>{formatCurrency(tax)}</td>
                </tr>
              </tbody>
            </table>

            {/* 備考 */}
            {getNotes() && (
              <div className={previewStyles.remarksSection}>
                <div className={previewStyles.remarksTitle}>備考</div>
                <div className={previewStyles.remarksContent}>{getNotes()}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
