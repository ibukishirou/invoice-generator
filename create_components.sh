#!/bin/bash
cd /home/user/webapp

# App.tsxを上書き
cat > src/App.tsx << 'FILEEND'
import React, { useState, useEffect } from 'react';
import styles from './App.module.css';
import InputForm from './components/InputForm';
import Preview from './components/Preview';
import HistoryModal from './components/HistoryModal';
import SaveModal from './components/SaveModal';
import { InvoiceData, InvoiceItem } from './types';
import { getCurrentDate, getNextMonthEnd, generateDocumentNumber } from './utils/dateUtils';
import { loadCompanyInfo, saveCompanyInfo } from './utils/storage';

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
      documentType: 'invoice',
      taxType: 'tax-excluded',
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
        logoImage: '',
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

  useEffect(() => {
    saveCompanyInfo(data.companyInfo);
  }, [data.companyInfo]);

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
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>請求書自動作成ツール</h1>
        <p className={styles.subtitle}>
          必要な項目を入力するだけで、請求書・見積書・納品書を簡単に作成できます
        </p>
      </header>

      <div className={styles.mainContent}>
        <InputForm
          data={data}
          onChange={handleDataChange}
          onSave={handleSave}
          onLoadHistory={handleLoadHistory}
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
      />
    </div>
  );
}

export default App;
FILEEND

echo 'App.tsx created'
