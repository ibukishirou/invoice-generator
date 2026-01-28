import React from 'react';
import styles from './FloatingExportButton.module.css';

interface FloatingExportButtonProps {
  onClick: () => void;
}

const FloatingExportButton: React.FC<FloatingExportButtonProps> = ({ onClick }) => {
  return (
    <button className={styles.floatingButton} onClick={onClick}>
      出力
    </button>
  );
};

export default FloatingExportButton;
