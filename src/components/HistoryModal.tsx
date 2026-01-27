import { useState, useEffect } from 'react';
import { InvoiceData, HistoryItem } from '../types';
import { loadHistory, deleteHistoryItem, loadSavedDocuments, deleteSavedDocument } from '../utils/storage';
import styles from './Modal.module.css';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (data: InvoiceData) => void;
}

type TabType = 'history' | 'saved';

export default function HistoryModal({ isOpen, onClose, onLoad }: HistoryModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('history');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [savedDocs, setSavedDocs] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, activeTab]);

  const loadData = () => {
    if (activeTab === 'history') {
      setHistory(loadHistory());
    } else {
      setSavedDocs(loadSavedDocuments());
    }
  };

  const handleLoad = (item: HistoryItem) => {
    onLoad(item.data);
    onClose();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('このデータを削除しますか？')) {
      if (activeTab === 'history') {
        deleteHistoryItem(id);
      } else {
        deleteSavedDocument(id);
      }
      loadData();
    }
  };

  if (!isOpen) return null;

  const items = activeTab === 'history' ? history : savedDocs;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>データ読み込み</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="閉じる">
            ×
          </button>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'history' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('history')}
          >
            ダウンロード履歴
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'saved' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            保存データ
          </button>
        </div>

        <div className={styles.body}>
          {items.length === 0 ? (
            <div className={styles.emptyState}>
              {activeTab === 'history' ? 'ダウンロード履歴がありません' : '保存されたデータがありません'}
            </div>
          ) : (
            <ul className={styles.list}>
              {items.map((item) => (
                <li key={item.id} className={styles.listItem}>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemTitle}>
                      {item.name || `${item.data.documentType} - ${item.data.clientInfo.companyName || item.data.clientInfo.contactPerson}`}
                    </div>
                    <div className={styles.itemDate}>
                      {new Date(item.savedAt).toLocaleString('ja-JP')}
                    </div>
                    <div className={styles.itemDetails}>
                      書類番号: {item.data.documentInfo.documentNumber} | 取引先: {item.data.clientInfo.companyName || item.data.clientInfo.contactPerson}
                    </div>
                  </div>
                  <div className={styles.itemActions}>
                    <button
                      className={styles.loadButton}
                      onClick={() => handleLoad(item)}
                    >
                      読み込む
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDelete(item.id)}
                    >
                      削除
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
