import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ReceiptForm } from './components/ReceiptForm';
import ReceiptPage from './pages/ReceiptPage';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={<ReceiptForm />} />
          <Route path="/receipt" element={<ReceiptPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;
