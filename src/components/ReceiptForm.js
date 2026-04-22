import React, { useState, useContext } from 'react';
import { BinanceReceipt } from './BinanceReceipt';
import { MobileFrame } from './MobileFrame';
import { ThemeContext } from '../context/ThemeContext';
import './ReceiptForm.css';

export const ReceiptForm = () => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  const [deviceType, setDeviceType] = useState('android');
  const [platform, setPlatform] = useState('binance');

  // 🔥 NEW STATE
  const [statusState, setStatusState] = useState('idle'); 
  const [showReceipt, setShowReceipt] = useState(false);

  const [formData, setFormData] = useState({
    amountReceived: '71',
    currency: 'USDT',
    status: 'Completed',
    withdrawalAmount: '71',
    fee: '0',
    timestamp: '2026-03-25 09:03:29',
    network: 'TRX',
    withdrawalAccount: 'Spot Wallet',
    orderNumber: '699cb36bf26b7a0007ce81c3',
    address: 'TBWPAANQsmzCSXv8eoPmXi5L4ncnhAzhYE',
    txHash: '5245e6963e10ed364bd495c82f93eb54a8cad1cc544a46965cdcc7d64c0e2101',
    remarks: 'Off-chain Transfer 358295850674',
    confirmations: '10 / 1',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 🔥 GENERATE HANDLER
  const handleGenerate = () => {
    if (statusState === 'loading') return;

    setStatusState('loading');
    setShowReceipt(false);

    // simulate Binance delay
    setTimeout(() => {
      setStatusState('done');
      setShowReceipt(true);

      // reset button after a bit
      setTimeout(() => {
        setStatusState('idle');
      }, 2000);

    }, 1800);
  };

  // 🔥 BUTTON TEXT
  const getButtonText = () => {
    if (statusState === 'loading') return '⏳ Generating...';
    if (statusState === 'done') return '✅ Completed';
    return '🔄 Generate Receipt';
  };

  return (
    <div className={`form-container ${isDarkMode ? 'dark' : 'light'}`}>
      
      <div className="form-section">
        <div className="form-header">
          <h2>Crypto Receipt Generator</h2>
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            {isDarkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>

        <div className="control-group">
          <label>Device Type</label>
          <div className="button-group">
            <button
              className={`btn ${deviceType === 'iphone' ? 'active' : ''}`}
              onClick={() => setDeviceType('iphone')}
            >
              📱 iPhone
            </button>
            <button
              className={`btn ${deviceType === 'android' ? 'active' : ''}`}
              onClick={() => setDeviceType('android')}
            >
              🤖 Android
            </button>
          </div>
        </div>

        <div className="control-group">
          <label>Platform</label>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
            <option value="binance">Binance</option>
            <option value="okx">OKX</option>
            <option value="kraken">Kraken</option>
            <option value="revolut">Revolut</option>
          </select>
        </div>

        <div className="inputs-grid">
          <div className="input-group">
            <label>Amount</label>
            <input
              type="text"
              name="withdrawalAmount"
              value={formData.withdrawalAmount}
              onChange={handleInputChange}
            />
          </div>

          <div className="input-group">
            <label>Currency</label>
            <input
              type="text"
              name="currency"
              value={formData.currency}
              onChange={handleInputChange}
            />
          </div>

          <div className="input-group">
            <label>Network</label>
            <input
              type="text"
              name="network"
              value={formData.network}
              onChange={handleInputChange}
            />
          </div>

          <div className="input-group">
            <label>Network Fee</label>
            <input
              type="text"
              name="fee"
              value={formData.fee}
              onChange={handleInputChange}
            />
          </div>

          <div className="input-group">
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
            />
          </div>

          <div className="input-group">
            <label>Txid / Remarks</label>
            <input
              type="text"
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
            />
          </div>

          <div className="input-group">
            <label>Wallet</label>
            <input
              type="text"
              name="withdrawalAccount"
              value={formData.withdrawalAccount}
              onChange={handleInputChange}
            />
          </div>

          <div className="input-group">
            <label>Date & Time</label>
            <input
              type="text"
              name="timestamp"
              value={formData.timestamp}
              onChange={handleInputChange}
            />
          </div>

          <div className="input-group">
            <label>Status</label>
            <select 
              name="status" 
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>

        {/* 🔥 BUTTON */}
        <button 
          className={`generate-btn ${statusState}`}
          onClick={handleGenerate}
        >
          {getButtonText()}
        </button>
      </div>

      <div className="preview-section">
        <MobileFrame deviceType={deviceType} isDarkMode={isDarkMode}>
          
          {/* 🔥 ONLY SHOW AFTER GENERATE */}
          {showReceipt && (
            <BinanceReceipt 
              data={formData} 
              isDarkMode={isDarkMode} 
            />
          )}

        </MobileFrame>
      </div>
    </div>
  );
};