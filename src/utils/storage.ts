import { config } from '../config';
import { CompanyInfo, SavedDocument, DocumentHistory, InvoiceData } from '../types';

// LocalStorage ユーティリティ

// 自社情報の保存
export const saveCompanyInfo = (companyInfo: CompanyInfo): void => {
  try {
    localStorage.setItem(
      config.storageKeys.companyInfo,
      JSON.stringify(companyInfo)
    );
  } catch (error) {
    console.error('Failed to save company info:', error);
  }
};

// 自社情報の読み込み
export const loadCompanyInfo = (): CompanyInfo | null => {
  try {
    const data = localStorage.getItem(config.storageKeys.companyInfo);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load company info:', error);
    return null;
  }
};

// 名前付き保存
export const saveDocument = (name: string, data: InvoiceData): void => {
  try {
    const saved = loadSavedDocuments();
    const newDocument: SavedDocument = {
      id: Date.now().toString(),
      name,
      data,
      savedAt: new Date().toISOString(),
    };

    saved.unshift(newDocument);

    // 最大件数を超えたら古いものを削除
    if (saved.length > config.maxSavedDocuments) {
      saved.splice(config.maxSavedDocuments);
    }

    localStorage.setItem(
      config.storageKeys.savedDocuments,
      JSON.stringify(saved)
    );
  } catch (error) {
    console.error('Failed to save document:', error);
  }
};

// 保存された書類一覧の読み込み
export const loadSavedDocuments = (): SavedDocument[] => {
  try {
    const data = localStorage.getItem(config.storageKeys.savedDocuments);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load saved documents:', error);
    return [];
  }
};

// 保存された書類の削除
export const deleteSavedDocument = (id: string): void => {
  try {
    const saved = loadSavedDocuments();
    const filtered = saved.filter((doc) => doc.id !== id);
    localStorage.setItem(
      config.storageKeys.savedDocuments,
      JSON.stringify(filtered)
    );
  } catch (error) {
    console.error('Failed to delete saved document:', error);
  }
};

// 履歴への追加（ダウンロード時に自動保存）
export const addToHistory = (data: InvoiceData): void => {
  try {
    const history = loadHistory();
    const newHistory: DocumentHistory = {
      id: Date.now().toString(),
      documentType: data.documentType,
      clientName: data.clientInfo.contactPerson,
      createdAt: new Date().toISOString(),
      data,
    };

    history.unshift(newHistory);

    // 最大件数を超えたら古いものを削除
    if (history.length > config.maxDocumentHistory) {
      history.splice(config.maxDocumentHistory);
    }

    localStorage.setItem(
      config.storageKeys.documentHistory,
      JSON.stringify(history)
    );
  } catch (error) {
    console.error('Failed to add to history:', error);
  }
};

// 履歴の読み込み
export const loadHistory = (): DocumentHistory[] => {
  try {
    const data = localStorage.getItem(config.storageKeys.documentHistory);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load history:', error);
    return [];
  }
};

// 履歴の削除
export const deleteHistoryItem = (id: string): void => {
  try {
    const history = loadHistory();
    const filtered = history.filter((item) => item.id !== id);
    localStorage.setItem(
      config.storageKeys.documentHistory,
      JSON.stringify(filtered)
    );
  } catch (error) {
    console.error('Failed to delete history item:', error);
  }
};
