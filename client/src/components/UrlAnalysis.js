import { useState } from 'react';
import { API_BASE_URL } from '../config';

// I separate URL analysis to keep the logic focused and reusable
const UrlAnalysis = ({ onAnalysisComplete, onError, onUrlChange }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [validUrl, setValidUrl] = useState(false);

  const handleUrlChange = (url) => {
    setImageUrl(url);
    
    if (url.trim()) {
      try {
        new URL(url.trim());
        setValidUrl(true);
        onError(null); // Clear errors for valid URLs
        // Notify parent about URL change for preview
        if (onUrlChange) {
          onUrlChange(url.trim());
        }
      } catch {
        setValidUrl(false);
        if (url.trim()) {
          onError("Please enter a valid URL");
        }
      }
    } else {
      setValidUrl(false);
      onError(null);
      if (onUrlChange) {
        onUrlChange(null);
      }
    }
  };

  const handleAnalysis = async () => {
    if (!imageUrl.trim()) {
      alert("Please enter an image URL");
      return;
    }

    setLoading(true);
    onError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/analyze-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageUrl: imageUrl.trim() })
      });

      const data = await res.json();
      // URL analysis response received

      if (!res.ok) {
        throw new Error(data.error || 'URL analysis failed');
      }

      onAnalysisComplete(data);
    } catch (err) {
      console.error("URL analysis error:", err);
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="input-section-header">
        <h3 className="input-section-title">Analyze Image URL</h3>
        <p className="input-section-subtitle">Enter a direct link to an image file</p>
      </div>
      
      <div className="url-input-container">
        <input
          type="url"
          placeholder="https://example.com/image.jpg"
          value={imageUrl}
          onChange={(e) => handleUrlChange(e.target.value)}
          className={`url-input ${!validUrl && imageUrl.trim() ? 'error' : ''}`}
        />
      </div>
      
      {imageUrl.trim() && validUrl && (
        <p className="input-success">
          <span>✓</span>
          <span>Valid URL format detected</span>
        </p>
      )}
      
      <p className="input-hint">
        Direct image URLs • JPG, PNG, GIF, WebP • Maximum 10MB
      </p>
      
      <details className="example-urls">
        <summary>View example URLs</summary>
        <div className="example-urls-content">
          <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
            Test with these verified image URLs:
          </p>
          <button 
            onClick={() => handleUrlChange('https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500')}
            className="example-url-button"
          >
            Coffee Latte Sample
          </button>
          <button 
            onClick={() => handleUrlChange('https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500')}
            className="example-url-button"
          >
            Fresh Salad Sample
          </button>
          <button 
            onClick={() => handleUrlChange('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500')}
            className="example-url-button"
          >
            Burger Sample
          </button>
        </div>
      </details>

      <div className="action-button-group">
        <button 
          onClick={handleAnalysis} 
          disabled={loading || !imageUrl.trim()}
          className="action-button primary"
          style={{ width: '100%' }}
        >
          {loading ? 'Processing Analysis...' : 'Run AI Analysis'}
        </button>
      </div>
    </div>
  );
};

export default UrlAnalysis;