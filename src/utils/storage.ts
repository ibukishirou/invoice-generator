import { config } from '../config';
import { CompanyInfo, SavedDocument, InvoiceData, HistoryItem } from '../types';
import * as jsonManager from './jsonManager';

// 自社情報の保存
export const saveCompanyInfo = (companyInfo: CompanyInfo): void => {
  try {
    jsonManager.updateCompanyInfo(companyInfo);
  } catch (error) {
    console.error('Failed to save company info:', error);
  }
};

// 自社情報の読み込み
export const loadCompanyInfo = (): CompanyInfo | null => {
  try {
    return jsonManager.getCompanyInfo();
  } catch (error) {
    console.error('Failed to load company info:', error);
    return null;
  }
};

// 名前付き保存
export const saveDocument = (data: InvoiceData, name: string): void => {
  try {
    const newDocument: SavedDocument = {
      id: Date.now().toString(),
      name,
      data,
      savedAt: new Date().toISOString(),
    };

    jsonManager.addSavedDocument(newDocument, config.maxSavedDocuments);
  } catch (error) {
    console.error('Failed to save document:', error);
  }
};

// 保存された書類一覧の読み込み
export const loadSavedDocuments = (): HistoryItem[] => {
  try {
    return jsonManager.getSavedDocuments();
  } catch (error) {
    console.error('Failed to load saved documents:', error);
    return [];
  }
};

// 保存された書類の削除
export const deleteSavedDocument = (id: string): void => {
  try {
    jsonManager.deleteSavedDocument(id);
  } catch (error) {
    console.error('Failed to delete saved document:', error);
  }
};

// 履歴への追加（ダウンロード時に自動保存）
export const addToHistory = (data: InvoiceData): void => {
  try {
    const newHistory: HistoryItem = {
      id: Date.now().toString(),
      data,
      savedAt: new Date().toISOString(),
    };

    jsonManager.addDownloadHistory(newHistory, config.maxDocumentHistory);
  } catch (error) {
    console.error('Failed to add to history:', error);
  }
};

// 履歴の読み込み
export const loadHistory = (): HistoryItem[] => {
  try {
    return jsonManager.getDownloadHistory();
  } catch (error) {
    console.error('Failed to load history:', error);
    return [];
  }
};

// 履歴の削除
export const deleteHistoryItem = (id: string): void => {
  try {
    jsonManager.deleteDownloadHistory(id);
  } catch (error) {
    console.error('Failed to delete history item:', error);
  }
};
