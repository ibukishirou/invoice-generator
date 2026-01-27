import { useState, useRef } from 'react';
import styles from './Modal.module.css';
import { loadJSONFile, initializeData } from '../utils/jsonManager';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: () => void;
}

export default function UploadModal({ isOpen, onClose, onDataLoaded }: UploadModalProps) {
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.includes('json')) {
      setError('JSONファイルを選択してください');
      return;
    }

    setError('');
    const result = await loadJSONFile(file);

    if (result.success && result.data) {
      initializeData(result.data);
      onDataLoaded();
      onClose();
    } else {
      setError(result.error || 'ファイルの読み込みに失敗しました');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSkip = () => {
    // 空のデータで初期化
    initializeData();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>データ読み込み</h2>
        </div>

        <div className={styles.body}>
          <p className={styles.uploadDescription}>
            前回保存したJSONファイルをアップロードして、データを復元できます。
          </p>

          <div
            className={`${styles.uploadArea} ${isDragging ? styles.dragging : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className={styles.uploadIcon}>📁</div>
            <p className={styles.uploadText}>
              クリックまたはファイルをドラッグ＆ドロップ
            </p>
            <p className={styles.uploadSubtext}>JSONファイルのみ対応</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <div className={styles.info}>
            <p>⚠️ 初回利用の方やJSONファイルをお持ちでない方は「アップせずに利用する」ボタンをクリックしてください。</p>
          </div>

          <div className={styles.actions}>
            <button className={styles.skipButton} onClick={handleSkip}>
              アップせずに利用する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
