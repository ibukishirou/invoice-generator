import React, { useState } from 'react';
import styles from './InputForm.module.css';
import {
  DocumentType,
  TaxType,
  InvoiceData,
  InvoiceItem,
  CompanyInfo,
  ClientInfo,
  DocumentInfo,
} from '../types';
import { getCurrentDate, getNextMonthEnd, generateDocumentNumber } from '../utils/dateUtils';
import { DOCUMENT_TYPES, TAX_TYPES } from '../config';

interface InputFormProps {
  data: InvoiceData;
  onChange: (data: InvoiceData) => void;
  onSave: () => void;
}

const InputForm: React.FC<InputFormProps> = ({ data, onChange, onSave }) => {

  const updateCompanyInfo = (updates: Partial<CompanyInfo>) => {
    onChange({
      ...data,
      companyInfo: { ...data.companyInfo, ...updates },
    });
  };

  const updateClientInfo = (updates: Partial<ClientInfo>) => {
    onChange({
      ...data,
      clientInfo: { ...data.clientInfo, ...updates },
    });
  };

  const updateDocumentInfo = (updates: Partial<DocumentInfo>) => {
    onChange({
      ...data,
      documentInfo: { ...data.documentInfo, ...updates },
    });
  };

  const updateItem = (index: number, updates: Partial<InvoiceItem>) => {
    const newItems = [...data.items];
    newItems[index] = { ...newItems[index], ...updates };
    onChange({ ...data, items: newItems });
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      itemName: '',
      quantity: 1,
      unitPrice: 0,
      note: '',
    };
    onChange({ ...data, items: [...data.items, newItem] });
  };

  const removeItem = (index: number) => {
    if (data.items.length <= 1) {
      alert('明細は最低1行必要です');
      return;
    }
    const newItems = data.items.filter((_, i) => i !== index);
    onChange({ ...data, items: newItems });
  };



  return (
    <div className={styles.formContainer}>
      {/* 書類種別選択 */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>書類種別</h2>
        <div className={styles.typeSelector}>
          <button
            className={`${styles.typeButton} ${data.documentType === DOCUMENT_TYPES.INVOICE ? styles.active : ''}`}
            onClick={() => onChange({ ...data, documentType: DOCUMENT_TYPES.INVOICE })}
          >
            請求書
          </button>
          <button
            className={`${styles.typeButton} ${data.documentType === DOCUMENT_TYPES.PURCHASE_ORDER ? styles.active : ''}`}
            onClick={() => onChange({ ...data, documentType: DOCUMENT_TYPES.PURCHASE_ORDER })}
          >
            発注書
          </button>
          <button
            className={`${styles.typeButton} ${data.documentType === DOCUMENT_TYPES.ESTIMATE ? styles.active : ''}`}
            onClick={() => onChange({ ...data, documentType: DOCUMENT_TYPES.ESTIMATE })}
          >
            見積書
          </button>
          <button
            className={`${styles.typeButton} ${data.documentType === DOCUMENT_TYPES.DELIVERY ? styles.active : ''}`}
            onClick={() => onChange({ ...data, documentType: DOCUMENT_TYPES.DELIVERY })}
          >
            納品書
          </button>
        </div>
      </div>

      {/* 消費税設定 */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>消費税設定</h2>
        <div className={styles.taxSelector}>
          <button
            className={`${styles.taxButton} ${data.taxType === TAX_TYPES.INTERNAL_TAX ? styles.active : ''}`}
            onClick={() => onChange({ ...data, taxType: TAX_TYPES.INTERNAL_TAX })}
          >
            内税
          </button>
          <button
            className={`${styles.taxButton} ${data.taxType === TAX_TYPES.EXTERNAL_TAX ? styles.active : ''}`}
            onClick={() => onChange({ ...data, taxType: TAX_TYPES.EXTERNAL_TAX })}
          >
            外税
          </button>
        </div>
      </div>

      {/* 自社情報 */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>自社情報</h2>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            会社名 / 屋号 / 個人名<span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            className={styles.input}
            value={data.companyInfo.companyName}
            onChange={(e) => updateCompanyInfo({ companyName: e.target.value })}
            placeholder="例：株式会社サンプル"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>住所</label>
          <input
            type="text"
            className={styles.input}
            value={data.companyInfo.address || ''}
            onChange={(e) => updateCompanyInfo({ address: e.target.value })}
            placeholder="例：東京都渋谷区〇〇1-2-3"
          />
        </div>
        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label className={styles.label}>電話番号</label>
            <input
              type="tel"
              className={styles.input}
              value={data.companyInfo.phone || ''}
              onChange={(e) => updateCompanyInfo({ phone: e.target.value })}
              placeholder="例：03-1234-5678"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>メールアドレス</label>
            <input
              type="email"
              className={styles.input}
              value={data.companyInfo.email || ''}
              onChange={(e) => updateCompanyInfo({ email: e.target.value })}
              placeholder="例：contact@example.com"
            />
          </div>
        </div>
        {data.documentType !== DOCUMENT_TYPES.PURCHASE_ORDER && (
          <div className={styles.formGroup}>
            <label className={styles.label}>インボイス登録番号</label>
            <input
              type="text"
              className={styles.input}
              value={data.companyInfo.invoiceNumber || ''}
              onChange={(e) => updateCompanyInfo({ invoiceNumber: e.target.value })}
              placeholder="例：T1234567890123"
            />
          </div>
        )}
        {data.documentType !== DOCUMENT_TYPES.PURCHASE_ORDER && (
          <div className={styles.formGroup}>
            <label className={styles.label}>
              振込先<span className={styles.required}>*</span>
            </label>
          <div className={styles.row}>
            <input
              type="text"
              className={styles.input}
              value={data.companyInfo.bankName}
              onChange={(e) => updateCompanyInfo({ bankName: e.target.value })}
              placeholder="銀行名"
            />
            <input
              type="text"
              className={styles.input}
              value={data.companyInfo.bankBranch}
              onChange={(e) => updateCompanyInfo({ bankBranch: e.target.value })}
              placeholder="支店名"
            />
          </div>
          <div className={styles.row} style={{ marginTop: '8px' }}>
            <select
              className={styles.select}
              value={data.companyInfo.accountType}
              onChange={(e) => updateCompanyInfo({ accountType: e.target.value })}
            >
              <option value="普通">普通</option>
              <option value="当座">当座</option>
            </select>
            <input
              type="text"
              className={styles.input}
              value={data.companyInfo.accountNumber}
              onChange={(e) => updateCompanyInfo({ accountNumber: e.target.value })}
              placeholder="口座番号"
            />
          </div>
          <input
            type="text"
            className={styles.input}
            style={{ marginTop: '8px' }}
            value={data.companyInfo.accountHolder}
            onChange={(e) => updateCompanyInfo({ accountHolder: e.target.value })}
            placeholder="口座名義"
          />
          </div>
        )}
      </div>

      {/* 取引先情報 */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>取引先情報</h2>
        <div className={styles.formGroup}>
          <label className={styles.label}>会社名</label>
          <input
            type="text"
            className={styles.input}
            value={data.clientInfo.companyName || ''}
            onChange={(e) => updateClientInfo({ companyName: e.target.value })}
            placeholder="例：〇〇株式会社"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>住所</label>
          <input
            type="text"
            className={styles.input}
            value={data.clientInfo.address || ''}
            onChange={(e) => updateClientInfo({ address: e.target.value })}
            placeholder="例：大阪府大阪市〇〇区1-2-3"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            担当者名<span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            className={styles.input}
            value={data.clientInfo.contactPerson}
            onChange={(e) => updateClientInfo({ contactPerson: e.target.value })}
            placeholder="例：山田太郎 様"
          />
        </div>
      </div>

      {/* 書類情報 */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>書類情報</h2>
        <div className={styles.formGroup}>
          <label className={styles.label}>書類番号</label>
          <input
            type="text"
            className={styles.input}
            value={data.documentInfo.documentNumber}
            onChange={(e) => updateDocumentInfo({ documentNumber: e.target.value })}
            placeholder="例：1"
          />
        </div>
        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              請求日<span className={styles.required}>*</span>
            </label>
            <input
              type="date"
              className={styles.input}
              value={data.documentInfo.issueDate}
              onChange={(e) => updateDocumentInfo({ issueDate: e.target.value })}
            />
          </div>
          {data.documentType !== DOCUMENT_TYPES.DELIVERY && (
            <div className={styles.formGroup}>
              <label className={styles.label}>
                {data.documentType === DOCUMENT_TYPES.INVOICE 
                  ? '支払期限' 
                  : '有効期限'}
                {data.documentType === DOCUMENT_TYPES.INVOICE && <span className={styles.required}>*</span>}
              </label>
              <input
                type="date"
                className={styles.input}
                value={data.documentInfo.paymentDueDate}
                onChange={(e) => updateDocumentInfo({ paymentDueDate: e.target.value })}
              />
            </div>
          )}
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>備考</label>
          <textarea
            className={styles.textarea}
            value={data.documentInfo.notes || ''}
            onChange={(e) => updateDocumentInfo({ notes: e.target.value })}
            placeholder="その他の備考を入力してください"
          />
          {data.documentType === DOCUMENT_TYPES.INVOICE && (
            <div className={styles.checkbox}>
              <input
                type="checkbox"
                id="payment-note"
                checked={data.documentInfo.includePaymentNote}
                onChange={(e) => updateDocumentInfo({ includePaymentNote: e.target.checked })}
              />
              <label htmlFor="payment-note">
                「恐れ入りますが振込手数料はご負担いただくようお願いいたします」を追加
              </label>
            </div>
          )}
        </div>
      </div>

      {/* 明細 */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>明細</h2>
        <div className={styles.itemsContainer}>
          {data.items.map((item, index) => (
            <div key={item.id} className={styles.itemRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>品目名</label>
                <input
                  type="text"
                  className={styles.input}
                  value={item.itemName}
                  onChange={(e) => updateItem(index, { itemName: e.target.value })}
                  placeholder="例：Webデザイン業務"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>数量</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className={styles.input}
                  value={item.quantity}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    updateItem(index, { quantity: Number(value) || 1 });
                  }}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>単価</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className={styles.input}
                  value={item.unitPrice}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    updateItem(index, { unitPrice: Number(value) || 0 });
                  }}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>備考</label>
                <input
                  type="text"
                  className={styles.input}
                  value={item.note || ''}
                  onChange={(e) => updateItem(index, { note: e.target.value })}
                  placeholder="任意"
                />
              </div>
              <button
                className={styles.removeButton}
                onClick={() => removeItem(index)}
              >
                削除
              </button>
            </div>
          ))}
          <button className={styles.addButton} onClick={addItem}>
            + 明細を追加
          </button>
        </div>
      </div>

      {/* アクションボタン */}
      <div className={styles.actionButtons}>
        <button className={styles.primaryButton} onClick={onSave}>
          名前を付けて保存
        </button>
      </div>
    </div>
  );
};

export default InputForm;
