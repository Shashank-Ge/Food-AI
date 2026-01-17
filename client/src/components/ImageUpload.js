import { useState } from 'react';
import { API_BASE_URL } from '../config';

// I extract the upload logic to keep App.js focused on orchestration
const ImageUpload = ({ onAnalysisComplete, onError, onFileSelect }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    // Notify parent about file selection for preview
    if (onFileSelect) {
      onFileSelect(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Choose a file first");
      return;
    }

    setLoading(true);
    onError(null); // Clear any previous errors

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      // Upload response received

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      onAnalysisComplete(data);
    } catch (err) {
      console.error("Upload error:", err);
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="input-section-header">
        <h3 className="input-section-title">Upload Image</h3>
        <p className="input-section-subtitle">Select a food image from your device</p>
      </div>
      
      <div 
        className={`dropzone ${file ? 'active' : ''}`}
        onClick={() => document.getElementById('file-input').click()}
      >
        <div className="dropzone-icon">
          {file ? '✓' : '📁'}
        </div>
        <h3 className="dropzone-title">
          {file ? file.name : 'Choose Image File'}
        </h3>
        <p className="dropzone-subtitle">
          {file ? 'Click to select a different file' : 'Click to browse files or drag and drop'}
        </p>
        <input
          id="file-input"
          type="file"
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files[0])}
          className="file-input-hidden"
        />
      </div>
      
      <p className="input-hint">
        Supports JPG, PNG, GIF, WebP • Maximum 10MB
      </p>

      <div className="action-button-group">
        <button 
          onClick={handleUpload} 
          disabled={loading || !file}
          className="action-button primary"
          style={{ width: '100%' }}
        >
          {loading ? 'Processing Analysis...' : 'Run AI Analysis'}
        </button>
      </div>
    </div>
  );
};

export default ImageUpload;