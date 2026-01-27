import { AppDataJSON, CompanyInfo, SavedDocument, HistoryItem } from '../types';

const CURRENT_VERSION = '1.0';

// メモリ上のデータストア
let appData: AppDataJSON = {
  version: CURRENT_VERSION,
  companyInfo: {
    companyName: '',
    address: '',
    phone: '',
    email: '',
    bankName: '',
    bankBranch: '',
    accountType: '普通',
    accountNumber: '',
    accountHolder: '',
    invoiceNumber: '',
  },
  savedDocuments: [],
  downloadHistory: [],
};

// データの初期化
export const initializeData = (data?: AppDataJSON): void => {
  if (data) {
    appData = {
      ...data,
      version: CURRENT_VERSION,
    };
  } else {
    appData = {
      version: CURRENT_VERSION,
      companyInfo: {
        companyName: '',
        address: '',
        phone: '',
        email: '',
        bankName: '',
        bankBranch: '',
        accountType: '普通',
        accountNumber: '',
        accountHolder: '',
        invoiceNumber: '',
      },
      savedDocuments: [],
      downloadHistory: [],
    };
  }
};

// データの取得
export const getAppData = (): AppDataJSON => {
  return { ...appData };
};

// 自社情報の取得
export const getCompanyInfo = (): CompanyInfo => {
  return { ...appData.companyInfo };
};

// 自社情報の更新
export const updateCompanyInfo = (companyInfo: CompanyInfo): void => {
  appData.companyInfo = { ...companyInfo };
};

// 保存データの取得
export const getSavedDocuments = (): SavedDocument[] => {
  return [...appData.savedDocuments];
};

// 保存データの追加
export const addSavedDocument = (document: SavedDocument, maxCount: number): void => {
  appData.savedDocuments.unshift(document);
  if (appData.savedDocuments.length > maxCount) {
    appData.savedDocuments = appData.savedDocuments.slice(0, maxCount);
  }
};

// 保存データの削除
export const deleteSavedDocument = (id: string): void => {
  appData.savedDocuments = appData.savedDocuments.filter((doc) => doc.id !== id);
};

// ダウンロード履歴の取得
export const getDownloadHistory = (): HistoryItem[] => {
  return [...appData.downloadHistory];
};

// ダウンロード履歴の追加
export const addDownloadHistory = (item: HistoryItem, maxCount: number): void => {
  appData.downloadHistory.unshift(item);
  if (appData.downloadHistory.length > maxCount) {
    appData.downloadHistory = appData.downloadHistory.slice(0, maxCount);
  }
};

// ダウンロード履歴の削除
export const deleteDownloadHistory = (id: string): void => {
  appData.downloadHistory = appData.downloadHistory.filter((item) => item.id !== id);
};

// JSONファイルのエクスポート
export const exportToJSON = (): string => {
  return JSON.stringify(appData, null, 2);
};

// JSONファイルのダウンロード
export const downloadJSON = (): void => {
  const jsonStr = exportToJSON();
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `invoice-data-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// JSONファイルのインポート（バリデーション付き）
export const importFromJSON = (jsonStr: string): { success: boolean; error?: string; data?: AppDataJSON } => {
  try {
    const data = JSON.parse(jsonStr) as AppDataJSON;

    // バリデーション
    if (!data.version) {
      return { success: false, error: 'バージョン情報が見つかりません' };
    }

    if (!data.companyInfo) {
      return { success: false, error: '自社情報が見つかりません' };
    }

    if (!Array.isArray(data.savedDocuments)) {
      return { success: false, error: '保存データの形式が正しくありません' };
    }

    if (!Array.isArray(data.downloadHistory)) {
      return { success: false, error: 'ダウンロード履歴の形式が正しくありません' };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'JSONファイルの解析に失敗しました' };
  }
};

// JSONファイルの読み込み
export const loadJSONFile = (file: File): Promise<{ success: boolean; error?: string; data?: AppDataJSON }> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = importFromJSON(content);
      resolve(result);
    };

    reader.onerror = () => {
      resolve({ success: false, error: 'ファイルの読み込みに失敗しました' });
    };

    reader.readAsText(file);
  });
};
