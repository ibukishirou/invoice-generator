import styles from './Modal.module.css';
import { downloadJSON } from '../utils/jsonManager';

interface ExitConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmExit: () => void;
}

export default function ExitConfirmModal({ isOpen, onClose, onConfirmExit }: ExitConfirmModalProps) {
  const handleDownloadAndExit = () => {
    downloadJSON();
    setTimeout(() => {
      onConfirmExit();
    }, 100);
  };

  const handleDownloadOnly = () => {
    downloadJSON();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>⚠️ データ保存のお願い</h2>
        </div>

        <div className={styles.body}>
          <div className={styles.warningBox}>
            <p className={styles.warningText}>
              ツールの使用を終了する場合は、データ保管のためJSONをダウンロードしてください。
            </p>
            <p className={styles.warningTextBold}>
              大事な情報が記載されています。<br />
              絶対に第三者にファイルを渡さないでください。
            </p>
          </div>

          <div className={styles.info}>
            <ul className={styles.infoList}>
              <li>自社情報（会社名、住所、銀行口座情報など）</li>
              <li>保存データ（最大30件）</li>
              <li>ダウンロード履歴（最大10件）</li>
            </ul>
            <p>これらのデータがJSONファイルに含まれます。</p>
          </div>

          <div className={styles.actions}>
            <button className={styles.cancelButton} onClick={onClose}>
              キャンセル
            </button>
            <button className={styles.downloadButton} onClick={handleDownloadOnly}>
              JSONダウンロード
            </button>
            <button className={styles.exitButton} onClick={handleDownloadAndExit}>
              JSONダウンロードして終了
            </button>
            <button className={styles.warningButton} onClick={onConfirmExit}>
              利用を終える（保存なし）
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
