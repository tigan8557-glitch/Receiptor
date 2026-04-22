App.js

import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ReceiptForm } from './components/ReceiptForm';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <ReceiptForm />
      </div>
    </ThemeProvider>
  );
}

export default App;
