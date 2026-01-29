import React, { useRef, useState, useEffect } from 'react';
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
import { getDocumentTypeName } from '../utils/fileUtils';
import { DOCUMENT_TYPES } from '../config';

interface PreviewProps {
  data: InvoiceData;
  onExportClick: () => void;
}

const Preview: React.FC<PreviewProps> = ({ data, onExportClick }) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const subtotal = calculateSubtotal(data.items);
  const tax = calculateTax(subtotal, data.taxType);
  const total = calculateTotal(subtotal, data.taxType);

  // プレビューのスケール計算（高さ基準）
  useEffect(() => {
    const calculateScale = () => {
      if (!containerRef.current || window.innerWidth <= 768) {
        setScale(1);
        return;
      }

      const container = containerRef.current;
      const availableHeight = container.clientHeight - 60; // タイトル分を引く
      const availableWidth = container.clientWidth - 48; // padding分を引く
      
      const documentHeight = 1123;
      const documentWidth = 794;
      
      // 高さ基準でスケールを計算
      const scaleByHeight = availableHeight / documentHeight;
      const scaleByWidth = availableWidth / documentWidth;
      
      // 小さい方を採用（両方に収まるように）
      const newScale = Math.min(scaleByHeight, scaleByWidth, 1);
      
      setScale(newScale);
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, []);

  const getNotes = () => {
    let notes = data.documentInfo.notes || '';
    if (data.documentType === DOCUMENT_TYPES.INVOICE && data.documentInfo.includePaymentNote) {
      if (notes) notes += '\n';
      notes += '恐れ入りますが振込手数料はご負担いただくようお願いいたします。';
    }
    return notes;
  };

  return (
    <div className={styles.previewWrapper}>
      <div ref={containerRef} className={styles.previewContainer}>
        <h2 className={styles.previewTitle}>プレビュー</h2>
        <div className={styles.previewContent}>
          <div className={styles.previewScaler}>
            <div 
              ref={previewRef} 
              className={styles.previewDocument}
              style={{ transform: `scale(${scale})` }}
            >
        {/* ヘッダー */}
        <div className={styles.documentHeader}>
          <h1 className={styles.documentTitle}>
            {getDocumentTypeName(data.documentType)}
          </h1>
        </div>

        {/* 件名・書類番号・発行日を横並びに */}
        <div className={styles.metaRow}>
          {data.documentInfo.subject && (
            <div className={styles.subjectSection}>
              <div className={styles.subjectLabel}>件名</div>
              <div className={styles.subjectContent}>{data.documentInfo.subject}</div>
            </div>
          )}
          <div className={styles.metaRight}>
            {data.documentInfo.documentNumber && (
              <div className={styles.documentNumber}>
                No. {data.documentInfo.documentNumber}
              </div>
            )}
            <div className={styles.issueDate}>
              発行日: {formatDateJapanese(data.documentInfo.issueDate)}
            </div>
          </div>
        </div>

        {/* 取引先・自社情報 */}
        <div className={styles.documentBody}>
          <div className={styles.clientSection}>
            <div className={styles.sectionTitle}>
              {data.documentType === DOCUMENT_TYPES.INVOICE && '請求先'}
              {data.documentType === DOCUMENT_TYPES.PURCHASE_ORDER && '発注先'}
              {data.documentType === DOCUMENT_TYPES.ESTIMATE && '見積先'}
              {data.documentType === DOCUMENT_TYPES.DELIVERY && '納品先'}
            </div>
            <div className={styles.sectionContent}>
              {data.clientInfo.companyName && <div>{data.clientInfo.companyName}</div>}
              {data.clientInfo.address && <div>{data.clientInfo.address}</div>}
              <div>{data.clientInfo.contactPerson}</div>
            </div>
          </div>

          <div className={styles.companySection}>
            <div className={styles.sectionTitle}>発行者</div>
            <div className={styles.sectionContent}>
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
          <div className={styles.bankInfoTable}>
            {data.documentInfo.paymentDueDate && (
              <div className={styles.bankInfoRow}>
                <div className={styles.bankInfoLabel}>支払期限</div>
                <div className={styles.bankInfoValue}>{formatDateJapanese(data.documentInfo.paymentDueDate)}</div>
              </div>
            )}
            <div className={styles.bankInfoRow}>
              <div className={styles.bankInfoLabel}>振込先</div>
              <div className={styles.bankInfoValue}>
                <div>{data.companyInfo.bankName} {data.companyInfo.bankBranch}</div>
                <div>{data.companyInfo.accountType} {data.companyInfo.accountNumber} {data.companyInfo.accountHolder}</div>
              </div>
            </div>
            <div className={styles.bankInfoRow}>
              <div className={styles.bankInfoLabel}>合計（{data.taxType}）</div>
              <div className={styles.bankInfoValue}>{formatCurrency(total)}</div>
            </div>
          </div>
        )}

        {/* 支払期限/有効期限（請求書以外） */}
        {data.documentType !== DOCUMENT_TYPES.INVOICE && data.documentType !== DOCUMENT_TYPES.DELIVERY && data.documentInfo.paymentDueDate && (
          <div className={styles.dueDateSection}>
            <div className={styles.dueDateLabel}>
              {data.documentType === DOCUMENT_TYPES.PURCHASE_ORDER || data.documentType === DOCUMENT_TYPES.ESTIMATE ? '有効期限' : '支払期限'}
            </div>
            <div className={styles.dueDateValue}>{formatDateJapanese(data.documentInfo.paymentDueDate)}</div>
          </div>
        )}

        {/* 明細テーブル */}
        <table className={styles.itemsTable}>
          <thead>
            <tr>
              <th style={{ width: '50%' }}>品目</th>
              <th style={{ width: '15%' }} className={styles.textRight}>数量</th>
              <th style={{ width: '20%' }} className={styles.textRight}>単価</th>
              <th style={{ width: '15%' }} className={styles.textRight}>金額</th>
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
              </tr>
            ))}
            {/* テーブル内に小計・消費税を追加 */}
            <tr className={styles.subtotalRow}>
              <td colSpan={3} className={styles.textRight}>小計 ({getTaxTypeLabel(data.taxType)})</td>
              <td className={styles.textRight}>{formatCurrency(subtotal)}</td>
            </tr>
            <tr className={styles.taxRow}>
              <td colSpan={3} className={styles.textRight}>消費税 (10%)</td>
              <td className={styles.textRight}>{formatCurrency(tax)}</td>
            </tr>
          </tbody>
        </table>

        {/* 備考 */}
        {getNotes() && (
          <div className={styles.remarksSection}>
            <div className={styles.remarksTitle}>備考</div>
            <div className={styles.remarksContent}>{getNotes()}</div>
          </div>
        )}
            </div>
          </div>
        </div>
        
        {/* 出力ボタン */}
        <button 
          className={styles.floatingExportButton}
          onClick={onExportClick}
        >
          出力
        </button>
      </div>
    </div>
  );
};

export default Preview;
