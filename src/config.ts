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
