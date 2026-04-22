import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ReceiptForm } from './components/ReceiptForm';
import { BinanceReceipt } from './components/BinanceReceipt';
import './App.css';

function App() {
  const [status, setStatus] = useState('idle'); // idle | generating | done
  const [formData, setFormData] = useState({});

  const handleGenerate = (data) => {
    setFormData(data);
    setStatus('generating');

    setTimeout(() => {
      setStatus('done');
    }, 1500); // simulate loading
  };

  return (
    <ThemeProvider>
      <div className="App">

        {/* FORM */}
        <ReceiptForm 
          onGenerate={handleGenerate}
          status={status}
        />

        {/* RECEIPT (only after complete) */}
        {status === 'done' && (
          <BinanceReceipt 
            data={formData}
          />
        )}

      </div>
    </ThemeProvider>
  );
}

export default App;