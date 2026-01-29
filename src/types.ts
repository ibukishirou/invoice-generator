// 型定義ファイル

// 書類種別
export type DocumentType = '請求書' | '発注書' | '見積書' | '納品書';

// 消費税設定
export type TaxType = '内税' | '外税';

// 明細行
export interface InvoiceItem {
  id: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  note?: string;
}

// 自社情報
export interface CompanyInfo {
  companyName: string;
  address?: string;
  phone?: string;
  email?: string;
  bankName: string;
  bankBranch: string;
  accountType: string;
  accountNumber: string;
  accountHolder: string;
  invoiceNumber?: string;
}

// 取引先情報
export interface ClientInfo {
  companyName?: string;
  address?: string;
  contactPerson: string;
}

// 書類情報
export interface DocumentInfo {
  documentNumber: string;
  issueDate: string;
  paymentDueDate: string;
  subject?: string;
  notes?: string;
  includePaymentNote: boolean;
}

// 完全な請求書データ
export interface InvoiceData {
  id: string;
  documentType: DocumentType;
  taxType: TaxType;
  companyInfo: CompanyInfo;
  clientInfo: ClientInfo;
  documentInfo: DocumentInfo;
  items: InvoiceItem[];
  createdAt: string;
  fileName?: string;
}

// 保存された書類データ
export interface SavedDocument {
  id: string;
  name: string;
  data: InvoiceData;
  savedAt: string;
}

// 履歴データ
export interface DocumentHistory {
  id: string;
  documentType: DocumentType;
  clientName: string;
  createdAt: string;
  data: InvoiceData;
}

// 履歴アイテム（モーダル表示用）
export interface HistoryItem {
  id: string;
  name?: string;
  data: InvoiceData;
  savedAt: string;
}

// JSONデータ構造（アップロード/ダウンロード用）
export interface AppDataJSON {
  version: string;
  companyInfo: CompanyInfo;
  savedDocuments: SavedDocument[];
  downloadHistory: HistoryItem[];
}
