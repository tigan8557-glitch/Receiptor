import React, { useRef, useState, useContext } from 'react';
import Tesseract from 'tesseract.js';
import { ThemeContext } from '../context/ThemeContext';
import './ReceiptInspector.css';

export const ReceiptInspector = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const canvasRef = useRef(null);
  const originalCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [image, setImage] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [detectedTexts, setDetectedTexts] = useState([]);
  const [selectedTextId, setSelectedTextId] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [newText, setNewText] = useState('');
  const [replacements, setReplacements] = useState({});

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setImage(img);
          setEditMode(true);
          setDetectedTexts([]);
          setSelectedTextId(null);
          setReplacements({});
          // Start text detection
          detectText(img);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Detect text using Tesseract OCR
  const detectText = async (img) => {
    setIsDetecting(true);
    try {
      const result = await Tesseract.recognize(img.src, 'eng', {
        logger: (m) => console.log(m),
      });

      const words = result.data.words.map((word, idx) => ({
        id: idx,
        text: word.text,
        confidence: word.confidence,
        bbox: word.bbox,
        x: word.bbox.x0,
        y: word.bbox.y0,
        width: word.bbox.x1 - word.bbox.x0,
        height: word.bbox.y1 - word.bbox.y0,
      }));

      // Filter out low confidence text and very small text
      const filteredTexts = words.filter(
        (word) => word.confidence > 30 && word.width > 10 && word.height > 5
      );

      setDetectedTexts(filteredTexts);
    } catch (error) {
      console.error('Text detection failed:', error);
      alert('Failed to detect text. Please try again.');
    } finally {
      setIsDetecting(false);
    }
  };

  // Draw original image with detected text boxes
  const drawOriginal = () => {
    if (!originalCanvasRef.current || !image) return;

    const canvas = originalCanvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = image.width;
    canvas.height = image.height;

    ctx.drawImage(image, 0, 0);

    // Draw detection boxes
    detectedTexts.forEach((textData) => {
      ctx.strokeStyle =
        selectedTextId === textData.id ? '#f0b90b' : 'rgba(240, 185, 11, 0.3)';
      ctx.lineWidth = selectedTextId === textData.id ? 3 : 1;
      ctx.strokeRect(textData.x, textData.y, textData.width, textData.height);

      // Draw text label
      if (selectedTextId === textData.id) {
        ctx.fillStyle = '#f0b90b';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(textData.text, textData.x, textData.y - 5);
      }
    });
  };

  // Draw edited image with replaced text
  const drawEdited = () => {
    if (!canvasRef.current || !image) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = image.width;
    canvas.height = image.height;

    ctx.drawImage(image, 0, 0);

    // Apply text replacements
    detectedTexts.forEach((textData) => {
      const replacement = replacements[textData.id];
      if (replacement && replacement !== textData.text) {
        // Draw semi-transparent white box to cover original text
        ctx.fillStyle = 'white';
        ctx.fillRect(
          textData.x - 2,
          textData.y - 2,
          textData.width + 4,
          textData.height + 4
        );

        // Draw new text
        ctx.fillStyle = '#000000';
        ctx.font = `${textData.height}px Arial`;
        ctx.textBaseline = 'top';
        ctx.fillText(replacement, textData.x, textData.y);
      }
    });
  };

  // Redraw canvas
  React.useEffect(() => {
    drawOriginal();
    drawEdited();
  }, [image, detectedTexts, selectedTextId, replacements]);

  // Update replacement text
  const handleReplaceText = () => {
    if (selectedTextId !== null && newText.trim()) {
      setReplacements({
        ...replacements,
        [selectedTextId]: newText,
      });
      setNewText('');
    }
  };

  // Undo replacement
  const handleUndo = () => {
    if (selectedTextId !== null) {
      const newReplacements = { ...replacements };
      delete newReplacements[selectedTextId];
      setReplacements(newReplacements);
    }
  };

  // Export edited image
  const exportImage = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `receipt-edited-${Date.now()}.png`;
    link.click();
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    if (!canvasRef.current) return;

    canvasRef.current.toBlob((blob) => {
      navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]).then(() => {
        alert('Edited receipt copied to clipboard!');
      });
    });
  };

  const selectedText = detectedTexts.find((t) => t.id === selectedTextId);

  return (
    <div className={`receipt-inspector-container ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="inspector-header">
        <h2>Receipt Inspector</h2>
        {!editMode && (
          <button
            className="upload-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            📤 Upload Receipt
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      />

      {!editMode ? (
        <div className="upload-placeholder">
          <div className="placeholder-content">
            <span className="placeholder-icon">🔍</span>
            <p>Upload a receipt to inspect and edit</p>
            <p className="placeholder-text">
              Click on detected text to edit it
            </p>
            <button
              className="upload-placeholder-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose Receipt
            </button>
          </div>
        </div>
      ) : (
        <div className="inspector-content">
          <div className="canvas-wrapper">
            <div className="canvas-section">
              <h3>Original with Detection</h3>
              <canvas
                ref={originalCanvasRef}
                className="inspector-canvas"
                onClick={(e) => {
                  const rect = originalCanvasRef.current.getBoundingClientRect();
                  const x = (e.clientX - rect.left) * (image.width / rect.width);
                  const y = (e.clientY - rect.top) * (image.height / rect.height);

                  // Find clicked text
                  const clicked = detectedTexts.find(
                    (t) =>
                      x >= t.x &&
                      x <= t.x + t.width &&
                      y >= t.y &&
                      y <= t.y + t.height
                  );

                  if (clicked) {
                    setSelectedTextId(clicked.id);
                    setNewText(replacements[clicked.id] || clicked.text);
                  }
                }}
                title="Click on detected text to select it"
              />
              <p className="canvas-info">
                ✏️ Click on text to select | {detectedTexts.length} texts detected
              </p>
            </div>

            <div className="canvas-section">
              <h3>Edited Preview</h3>
              <canvas ref={canvasRef} className="inspector-canvas" />
              <p className="canvas-info">
                📥 Download when ready
              </p>
            </div>
          </div>

          <div className="inspector-sidebar">
            <div className="sidebar-section">
              <h3>Detected Texts ({detectedTexts.length})</h3>
              <div className="texts-list">
                {detectedTexts.slice(0, 15).map((textData) => (
                  <div
                    key={textData.id}
                    className={`text-item ${
                      selectedTextId === textData.id ? 'active' : ''
                    }`}
                    onClick={() => {
                      setSelectedTextId(textData.id);
                      setNewText(
                        replacements[textData.id] || textData.text
                      );
                    }}
                  >
                    <div className="text-item-content">
                      <span className="text-original">{textData.text}</span>
                      {replacements[textData.id] && (
                        <>
                          <span className="text-arrow">→</span>
                          <span className="text-replaced">
                            {replacements[textData.id]}
                          </span>
                        </>
                      )}
                    </div>
                    <span className="text-confidence">
                      {Math.round(textData.confidence)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {selectedText && (
              <div className="sidebar-section">
                <h3>Edit Selected Text</h3>

                <div className="selected-info">
                  <p>
                    <strong>Original:</strong> {selectedText.text}
                  </p>
                  <p>
                    <strong>Confidence:</strong> {Math.round(selectedText.confidence)}%
                  </p>
                </div>

                <div className="form-group">
                  <label>Replace With:</label>
                  <input
                    type="text"
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder="Enter replacement text"
                  />
                </div>

                <div className="button-group">
                  <button
                    className="action-btn replace-btn"
                    onClick={handleReplaceText}
                  >
                    ✓ Replace
                  </button>
                  {replacements[selectedTextId] && (
                    <button
                      className="action-btn undo-btn"
                      onClick={handleUndo}
                    >
                      ↶ Undo
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="sidebar-section">
              <h3>Export</h3>
              <button
                className="action-btn download-btn"
                onClick={exportImage}
              >
                📥 Download PNG
              </button>
              <button
                className="action-btn copy-btn"
                onClick={copyToClipboard}
              >
                📋 Copy to Clipboard
              </button>
              <button
                className="action-btn reset-btn"
                onClick={() => {
                  setEditMode(false);
                  setImage(null);
                  setDetectedTexts([]);
                  setSelectedTextId(null);
                  setReplacements({});
                }}
              >
                🔄 Start Over
              </button>
            </div>

            {isDetecting && (
              <div className="sidebar-section loading">
                <p>🔍 Detecting text...</p>
                <div className="loading-bar"></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};