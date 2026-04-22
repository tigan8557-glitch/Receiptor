import React, { useRef, useState, useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import './ReceiptInspectorTool.css';

export const ReceiptInspectorTool = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [inspectMode, setInspectMode] = useState(false);
  const [hoveredArea, setHoveredArea] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [textElements, setTextElements] = useState([]);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setImage(img);
          setInspectMode(true);
          setTextElements([]);
          setSelectedElement(null);
          
          // Analyze image for text regions
          analyzeImage(img);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Analyze image and create clickable regions
  const analyzeImage = (img) => {
    // Create a grid of clickable areas
    const regions = [];
    const regionSize = 80;
    
    for (let y = 0; y < img.height; y += regionSize) {
      for (let x = 0; x < img.width; x += regionSize) {
        regions.push({
          id: `${x}-${y}`,
          x,
          y,
          width: Math.min(regionSize, img.width - x),
          height: Math.min(regionSize, img.height - y),
          text: '',
        });
      }
    }
    
    setTextElements(regions);
  };

  // Handle canvas mouse move for hover effect
  const handleMouseMove = (e) => {
    if (!inspectMode || !image || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Scale coordinates to image size
    const scaleX = image.width / canvasRef.current.offsetWidth;
    const scaleY = image.height / canvasRef.current.offsetHeight;

    const imgX = x * scaleX;
    const imgY = y * scaleY;

    // Find which element is being hovered
    const hovered = textElements.find(
      (elem) =>
        imgX >= elem.x &&
        imgX <= elem.x + elem.width &&
        imgY >= elem.y &&
        imgY <= elem.y + elem.height
    );

    setHoveredArea(hovered || null);
  };

  // Handle canvas click to select element
  const handleCanvasClick = (e) => {
    if (!hoveredArea) return;

    setSelectedElement(hoveredArea);
    setEditValue(hoveredArea.text);
  };

  // Update element text
  const handleUpdateText = () => {
    if (!selectedElement) return;

    const updated = textElements.map((elem) =>
      elem.id === selectedElement.id ? { ...elem, text: editValue } : elem
    );

    setTextElements(updated);
    setSelectedElement({ ...selectedElement, text: editValue });
  };

  // Draw canvas with overlay
  const drawCanvas = () => {
    if (!canvasRef.current || !image) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = image.width;
    canvas.height = image.height;

    // Draw original image
    ctx.drawImage(image, 0, 0);

    // Draw hovered area outline
    if (hoveredArea) {
      ctx.strokeStyle = '#f0b90b';
      ctx.lineWidth = 3;
      ctx.strokeRect(
        hoveredArea.x,
        hoveredArea.y,
        hoveredArea.width,
        hoveredArea.height
      );

      // Draw label
      ctx.fillStyle = '#f0b90b';
      ctx.font = 'bold 14px Arial';
      ctx.fillText('Click to edit', hoveredArea.x + 5, hoveredArea.y + 20);
    }

    // Draw selected area with stronger highlight
    if (selectedElement) {
      ctx.strokeStyle = '#05b26d';
      ctx.lineWidth = 4;
      ctx.strokeRect(
        selectedElement.x,
        selectedElement.y,
        selectedElement.width,
        selectedElement.height
      );

      // Draw selection indicator
      ctx.fillStyle = '#05b26d';
      ctx.font = 'bold 16px Arial';
      ctx.fillText('SELECTED', selectedElement.x + 5, selectedElement.y + 25);
    }
  };

  React.useEffect(() => {
    drawCanvas();
  }, [image, hoveredArea, selectedElement]);

  // Export edited image
  const exportImage = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `receipt-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className={`inspector-tool-container ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="inspector-header">
        <h2>Receipt Inspector Tool</h2>
        {!inspectMode && (
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

      {!inspectMode ? (
        <div className="upload-area">
          <div className="upload-content">
            <span className="upload-icon">🔍</span>
            <h3>Upload a Receipt to Inspect</h3>
            <p>Click on any area of the image to edit text and digits</p>
            <button
              className="upload-btn-large"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose Receipt Image
            </button>
          </div>
        </div>
      ) : (
        <div className="inspector-main">
          <div className="canvas-area">
            <div className="canvas-wrapper">
              <canvas
                ref={canvasRef}
                className="receipt-canvas"
                onMouseMove={handleMouseMove}
                onClick={handleCanvasClick}
                onMouseLeave={() => setHoveredArea(null)}
                title="Hover over areas to inspect • Click to edit"
              />
            </div>
            <p className="canvas-hint">
              🔍 Hover over image areas to inspect • 👆 Click to edit text
            </p>
          </div>

          <div className="inspector-panel">
            <div className="panel-section">
              <h3>Inspector</h3>
              {hoveredArea ? (
                <div className="hovered-info">
                  <div className="info-item">
                    <span className="label">Position:</span>
                    <span className="value">
                      ({Math.round(hoveredArea.x)}, {Math.round(hoveredArea.y)})
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Size:</span>
                    <span className="value">
                      {Math.round(hoveredArea.width)} × {Math.round(hoveredArea.height)}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Current Text:</span>
                    <span className="value">
                      {hoveredArea.text || '(empty)'}
                    </span>
                  </div>
                  <p className="hint">Click to edit this area</p>
                </div>
              ) : (
                <div className="no-hover">
                  <p>Hover over the image to inspect areas</p>
                </div>
              )}
            </div>

            {selectedElement && (
              <div className="panel-section editing-section">
                <h3>Edit Selected Area</h3>

                <div className="edit-info">
                  <p className="selected-coords">
                    Position: ({Math.round(selectedElement.x)}, {Math.round(selectedElement.y)})
                  </p>
                </div>

                <div className="edit-form">
                  <label htmlFor="edit-input">Edit Text:</label>
                  <textarea
                    id="edit-input"
                    className="edit-input"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="Enter new text..."
                    rows="3"
                  />
                </div>

                <div className="button-group">
                  <button
                    className="action-btn save-btn"
                    onClick={handleUpdateText}
                  >
                    ✓ Save Changes
                  </button>
                  <button
                    className="action-btn cancel-btn"
                    onClick={() => {
                      setSelectedElement(null);
                      setEditValue('');
                    }}
                  >
                    ✕ Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="panel-section">
              <h3>Actions</h3>
              <button className="action-btn export-btn" onClick={exportImage}>
                📥 Download Image
              </button>
              <button
                className="action-btn reset-btn"
                onClick={() => {
                  setInspectMode(false);
                  setImage(null);
                  setTextElements([]);
                  setSelectedElement(null);
                  setEditValue('');
                }}
              >
                🔄 Start Over
              </button>
            </div>

            <div className="panel-section info-section">
              <h3>💡 How to Use</h3>
              <ul>
                <li>Hover over image areas</li>
                <li>Click to select an area</li>
                <li>Edit text in the form</li>
                <li>Click Save to apply</li>
                <li>Download when done</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};