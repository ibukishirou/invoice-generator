// アプリケーション設定ファイル
export const config = {
  // 消費税率（変更しやすいように設定）
  taxRate: 0.1, // 10%

  // LocalStorage のキー
  storageKeys: {
    companyInfo: 'invoice_company_info',
    savedDocuments: 'invoice_saved_documents',
    documentHistory: 'invoice_document_history',
  },

  // 保存可能な最大件数
  maxSavedDocuments: 10,
  maxDocumentHistory: 10,
} as const;

// 書類種別の定義
export const DOCUMENT_TYPES = {
  INVOICE: '請求書',
  PURCHASE_ORDER: '発注書',
  ESTIMATE: '見積書',
  DELIVERY: '納品書',
} as const;

// 消費税設定の定義
export const TAX_TYPES = {
  INTERNAL_TAX: '内税',
  EXTERNAL_TAX: '外税',
} as const;
