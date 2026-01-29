import React, { useState, useEffect } from 'react';
import styles from './App.module.css';
import InputForm from './components/InputForm';
import Preview from './components/Preview';
import HistoryModal from './components/HistoryModal';
import SaveModal from './components/SaveModal';
import UploadModal from './components/UploadModal';
import ExportModal from './components/ExportModal';
import { InvoiceData, InvoiceItem } from './types';
import { getCurrentDate, getNextMonthEnd, generateDocumentNumber } from './utils/dateUtils';
import { loadCompanyInfo, saveCompanyInfo } from './utils/storage';
import { initializeData, downloadJSON } from './utils/jsonManager';
import { DOCUMENT_TYPES, TAX_TYPES } from './config';

function App() {
  const [data, setData] = useState<InvoiceData>(() => {
    const savedCompanyInfo = loadCompanyInfo();

    const defaultItem: InvoiceItem = {
      id: Date.now().toString(),
      itemName: '',
      quantity: 1,
      unitPrice: 0,
      note: '',
    };

    return {
      id: Date.now().toString(),
      documentType: DOCUMENT_TYPES.INVOICE,
      taxType: TAX_TYPES.INTERNAL_TAX,
      companyInfo: savedCompanyInfo || {
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
      clientInfo: {
        companyName: '',
        address: '',
        contactPerson: '',
      },
      documentInfo: {
        documentNumber: generateDocumentNumber(),
        issueDate: getCurrentDate(),
        paymentDueDate: getNextMonthEnd(),
        notes: '',
        includePaymentNote: true,
      },
      items: [defaultItem],
      createdAt: new Date().toISOString(),
    };
  });

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(true);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    saveCompanyInfo(data.companyInfo);
  }, [data.companyInfo]);

  // beforeunloadは削除（ブラウザアラート不要）

  const handleDataChange = (newData: InvoiceData) => {
    setData(newData);
  };

  const handleLoadData = (loadedData: InvoiceData) => {
    setData(loadedData);
  };

  const handleSave = () => {
    setIsSaveModalOpen(true);
  };

  const handleLoadHistory = () => {
    setIsHistoryModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleUploadJSON = () => {
    setIsUploadModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleDownloadJSON = () => {
    downloadJSON();
    setIsMenuOpen(false);
  };

  const handleDataLoaded = () => {
    setIsDataLoaded(true);
    const companyInfo = loadCompanyInfo();
    if (companyInfo) {
      setData((prevData) => ({
        ...prevData,
        companyInfo,
      }));
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>請求書自動作成ツール</h1>
            <p className={styles.subtitle}>
              必要な項目を入力するだけで、請求書・見積書・納品書・発注書を簡単に作成できます
            </p>
          </div>
          <div className={styles.hamburgerMenu}>
            <button
              className={styles.hamburgerButton}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="メニュー"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
            {isMenuOpen && (
              <div className={styles.menuDropdown}>
                <button onClick={handleLoadHistory}>履歴から読み込む</button>
                <button onClick={handleUploadJSON}>JSONアップロード</button>
                <button onClick={handleDownloadJSON}>JSONダウンロード</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className={styles.mainContent}>
        <InputForm
          data={data}
          onChange={handleDataChange}
          onSave={handleSave}
          onExport={() => setIsExportModalOpen(true)}
        />
        <Preview data={data} />
      </div>

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onLoad={handleLoadData}
      />

      <SaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        data={data}
        onDownloadJSON={handleDownloadJSON}
      />

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onDataLoaded={handleDataLoaded}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        data={data}
        onSave={handleSave}
      />
    </div>
  );
}

export default App;
