import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import './ReceiptForm.css';

export const ReceiptForm = () => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [deviceType, setDeviceType] = useState('android');
  const [platform, setPlatform] = useState('binance');

  const [statusState, setStatusState] = useState('idle');

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

  const handleGenerate = () => {
    if (statusState === 'loading') return;
    setStatusState('loading');

    setTimeout(() => {
      setStatusState('done');
      try { localStorage.setItem('latestReceiptData', JSON.stringify(formData)); } catch {}
      navigate('/receipt', { state: { receiptData: { ...formData, deviceType, platform } } });
      setTimeout(() => setStatusState('idle'), 800);
    }, 1100);
  };

  const getButtonText = () => {
    if (statusState === 'loading') return '⏳ Generating...';
    if (statusState === 'done') return '✅ Completed';
    return '🔄 Generate Receipt';
  };

  return (
    <div className={`form-container ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="form-section">
        <div className="content">
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
                type="button"
              >
                📱 iPhone
              </button>
              <button
                className={`btn ${deviceType === 'android' ? 'active' : ''}`}
                onClick={() => setDeviceType('android')}
                type="button"
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
              <input type="text" name="withdrawalAmount" value={formData.withdrawalAmount} onChange={handleInputChange} />
            </div>

            <div className="input-group">
              <label>Currency</label>
              <input type="text" name="currency" value={formData.currency} onChange={handleInputChange} />
            </div>

            <div className="input-group">
              <label>Network</label>
              <input type="text" name="network" value={formData.network} onChange={handleInputChange} />
            </div>

            <div className="input-group">
              <label>Network Fee</label>
              <input type="text" name="fee" value={formData.fee} onChange={handleInputChange} />
            </div>

            <div className="input-group">
              <label>Address</label>
              <input type="text" name="address" value={formData.address} onChange={handleInputChange} />
            </div>

            <div className="input-group">
              <label>Txid / Remarks</label>
              <input type="text" name="remarks" value={formData.remarks} onChange={handleInputChange} />
            </div>

            <div className="input-group">
              <label>Wallet</label>
              <input type="text" name="withdrawalAccount" value={formData.withdrawalAccount} onChange={handleInputChange} />
            </div>

            <div className="input-group">
              <label>Date & Time</label>
              <input type="text" name="timestamp" value={formData.timestamp} onChange={handleInputChange} />
            </div>

            <div className="input-group">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleInputChange}>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button className={`generate-btn ${statusState}`} onClick={handleGenerate} type="button">
            {getButtonText()}
          </button>
        </div>
      </div>

      <div className="preview-section">
        <div className="content">
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
            <p style={{ marginTop: 20 }}>Preview will appear on the Receipt page after you generate.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
