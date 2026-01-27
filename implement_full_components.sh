#!/bin/bash

# InputForm.tsx - 完全実装
cat > /home/user/webapp/src/components/InputForm.tsx << 'EOF'
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
import { convertImageToBase64 } from '../utils/fileUtils';

interface InputFormProps {
  data: InvoiceData;
  onChange: (data: InvoiceData) => void;
  onSave: () => void;
  onLoadHistory: () => void;
}

const InputForm: React.FC<InputFormProps> = ({ data, onChange, onSave, onLoadHistory }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await convertImageToBase64(file);
      setImageFile(file);
      updateCompanyInfo({ logoImage: base64 });
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('画像のアップロードに失敗しました');
    }
  };

  const removeImage = () => {
    setImageFile(null);
    updateCompanyInfo({ logoImage: undefined });
  };

  const handleGenerateDocumentNumber = () => {
    if (!data.documentInfo.documentNumber) {
      updateDocumentInfo({ documentNumber: generateDocumentNumber() });
    }
  };

  React.useEffect(() => {
    handleGenerateDocumentNumber();
  }, []);

  return (
    <div className={styles.formContainer}>
      {/* 書類種別選択 */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>書類種別</h2>
        <div className={styles.typeSelector}>
          <button
            className={`${styles.typeButton} ${data.documentType === 'invoice' ? styles.active : ''}`}
            onClick={() => onChange({ ...data, documentType: 'invoice' })}
          >
            請求書
          </button>
          <button
            className={`${styles.typeButton} ${data.documentType === 'estimate' ? styles.active : ''}`}
            onClick={() => onChange({ ...data, documentType: 'estimate' })}
          >
            見積書
          </button>
          <button
            className={`${styles.typeButton} ${data.documentType === 'delivery' ? styles.active : ''}`}
            onClick={() => onChange({ ...data, documentType: 'delivery' })}
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
            className={`${styles.taxButton} ${data.taxType === 'tax-excluded' ? styles.active : ''}`}
            onClick={() => onChange({ ...data, taxType: 'tax-excluded' })}
          >
            税抜
          </button>
          <button
            className={`${styles.taxButton} ${data.taxType === 'tax-included' ? styles.active : ''}`}
            onClick={() => onChange({ ...data, taxType: 'tax-included' })}
          >
            税込
          </button>
          <button
            className={`${styles.taxButton} ${data.taxType === 'internal-tax' ? styles.active : ''}`}
            onClick={() => onChange({ ...data, taxType: 'internal-tax' })}
          >
            内税
          </button>
          <button
            className={`${styles.taxButton} ${data.taxType === 'external-tax' ? styles.active : ''}`}
            onClick={() => onChange({ ...data, taxType: 'external-tax' })}
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
        <div className={styles.imageUpload}>
          <label className={styles.label}>ロゴ / 印鑑画像</label>
          <input
            type="file"
            id="logo-upload"
            className={styles.fileInput}
            accept="image/*"
            onChange={handleImageUpload}
          />
          <label htmlFor="logo-upload" className={styles.fileLabel}>
            画像を選択
          </label>
          {data.companyInfo.logoImage && (
            <div className={styles.imagePreview}>
              <img src={data.companyInfo.logoImage} alt="Logo" />
              <button className={styles.removeImageButton} onClick={removeImage}>
                削除
              </button>
            </div>
          )}
        </div>
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
            placeholder="未入力の場合は自動生成されます"
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
          <div className={styles.formGroup}>
            <label className={styles.label}>
              支払期限<span className={styles.required}>*</span>
            </label>
            <input
              type="date"
              className={styles.input}
              value={data.documentInfo.paymentDueDate}
              onChange={(e) => updateDocumentInfo({ paymentDueDate: e.target.value })}
            />
          </div>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>備考</label>
          <textarea
            className={styles.textarea}
            value={data.documentInfo.notes || ''}
            onChange={(e) => updateDocumentInfo({ notes: e.target.value })}
            placeholder="その他の備考を入力してください"
          />
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
                  type="number"
                  className={styles.input}
                  value={item.quantity}
                  onChange={(e) => updateItem(index, { quantity: Number(e.target.value) || 1 })}
                  min="1"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>単価</label>
                <input
                  type="number"
                  className={styles.input}
                  value={item.unitPrice}
                  onChange={(e) => updateItem(index, { unitPrice: Number(e.target.value) || 0 })}
                  min="0"
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
        <button className={styles.secondaryButton} onClick={onLoadHistory}>
          履歴から読み込む
        </button>
        <button className={styles.primaryButton} onClick={onSave}>
          名前を付けて保存
        </button>
      </div>
    </div>
  );
};

export default InputForm;
EOF

echo "InputForm.tsx created"
