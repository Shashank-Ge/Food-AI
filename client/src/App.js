import { useState, useEffect } from 'react'
import './App.css'

function App () {
  const [file , setFile] = useState (null)
  const [response, setResponse ] = useState (null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [history, setHistory] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [analysisMode, setAnalysisMode] = useState('upload') // 'upload' or 'url'

  const handleUpload = async () => {
    if (!file) return alert("Choose a file first")

    setLoading(true)
    setIsAnalyzing(true)
    setError(null)
    setResponse(null)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const res = await fetch ('http://localhost:5000/upload', {
        method : 'POST',
        body : formData,
      })

      const data = await res.json()
      console.log ("SERVER SAYS : ", data)

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setResponse (data)
      
      // Reload history after successful upload
      loadHistory()
    } catch (err) {
      console.error("Upload error:", err)
      setError(err.message)
    } finally {
      setLoading(false)
      setIsAnalyzing(false)
    }
  }

  const handleUrlAnalysis = async () => {
    if (!imageUrl.trim()) return alert("Please enter an image URL")

    setLoading(true)
    setIsAnalyzing(true)
    setError(null)
    setResponse(null)

    try {
      const res = await fetch('http://localhost:5000/analyze-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageUrl: imageUrl.trim() })
      })

      const data = await res.json()
      console.log("URL ANALYSIS RESULT:", data)

      if (!res.ok) {
        let errorMessage = data.error || 'URL analysis failed'
        
        // Handle specific network errors
        if (data.details && data.details.includes('EAI_AGAIN')) {
          errorMessage = "Network connectivity issue - unable to reach the image URL"
        } else if (data.details && data.details.includes('ENOTFOUND')) {
          errorMessage = "Domain not found - please check the URL"
        } else if (data.details && data.details.includes('403')) {
          errorMessage = "Access forbidden - website blocks direct image access"
        }
        
        throw new Error(errorMessage)
      }

      setResponse(data)
      setPreviewUrl(imageUrl.trim()) // Set preview to the URL
      
      // Reload history after successful analysis
      loadHistory()
    } catch (err) {
      console.error("URL analysis error:", err)
      setError(err.message)
    } finally {
      setLoading(false)
      setIsAnalyzing(false)
    }
  }

  const switchMode = (mode) => {
    setAnalysisMode(mode)
    setFile(null)
    setImageUrl('')
    setPreviewUrl(null)
    setResponse(null)
    setError(null)
  }

  const clearHistory = async () => {
    const confirmClear = window.confirm ("Are you sure you want to clear all history?");
    if (!confirmClear) return;
    
    try {
      const res = await fetch("http://localhost:5000/history", {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error("Failed to clear history");
      }

      setHistory([]);
      alert('History cleared successfully!');
    } catch (err) {
      console.error("Failed to clear history:", err);
      alert(err.message);
    }
  }; 

  const loadHistory = async () => {
    try {
      const res = await fetch('http://localhost:5000/history');
      const data = await res.json();
      setHistory(data.meals || [])
    } catch (err) {
      console.error("Failed to load history:", err)
      setHistory([])
    }
  }

  useEffect(() => {
    loadHistory();
  }, [])

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile)
    if (selectedFile) {
      setPreviewUrl(URL.createObjectURL(selectedFile))
    }
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <h1 className="app-title">Nutrition Intelligence Platform</h1>
        <p className="app-subtitle">Advanced AI-powered food analysis and nutritional assessment</p>
      </header>

      <div className="main-grid">
        {/* Main Content Panel */}
        <div className="content-panel">
          {/* Mode Selection */}
          <div style={{ padding: '2rem 2rem 0' }}>
            <div className="mode-selector">
              <button
                onClick={() => switchMode('upload')}
                className={`mode-button ${analysisMode === 'upload' ? 'active' : ''}`}
              >
                Upload Image
              </button>
              <button
                onClick={() => switchMode('url')}
                className={`mode-button ${analysisMode === 'url' ? 'active' : ''}`}
              >
                Analyze URL
              </button>
            </div>
          </div>

          {/* Input Section */}
          <div className="input-section">
            {analysisMode === 'upload' ? (
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
              </div>
            ) : (
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
                    onChange={(e) => {
                      setImageUrl(e.target.value)
                      if (e.target.value.trim()) {
                        // Basic URL validation
                        try {
                          new URL(e.target.value.trim())
                          setPreviewUrl(e.target.value.trim())
                          setError(null)
                        } catch {
                          setPreviewUrl(null)
                          if (e.target.value.trim()) {
                            setError("Please enter a valid URL")
                          }
                        }
                      } else {
                        setPreviewUrl(null)
                        setError(null)
                      }
                    }}
                    className={`url-input ${error && imageUrl.trim() ? 'error' : ''}`}
                  />
                </div>
                {imageUrl.trim() && !error && (
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
                      onClick={() => setImageUrl('https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500')}
                      className="example-url-button"
                    >
                      Coffee Latte Sample
                    </button>
                    <button 
                      onClick={() => setImageUrl('https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500')}
                      className="example-url-button"
                    >
                      Fresh Salad Sample
                    </button>
                    <button 
                      onClick={() => setImageUrl('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500')}
                      className="example-url-button"
                    >
                      Burger Sample
                    </button>
                  </div>
                </details>
              </div>
            )}

            <div className="action-button-group">
              <button 
                onClick={analysisMode === 'upload' ? handleUpload : handleUrlAnalysis} 
                disabled={loading || (analysisMode === 'upload' ? !file : !imageUrl.trim())}
                className="action-button primary"
                style={{ width: '100%' }}
              >
                {loading ? 'Processing Analysis...' : 'Run AI Analysis'}
              </button>
            </div>
          </div>

          {/* Image Preview - Hero Element */}
          {previewUrl && (
            <div className="image-preview-container">
              <div className="image-preview-wrapper">
                <img
                  src={previewUrl}
                  alt="Food analysis subject"
                  className="image-preview"
                />
                
                {isAnalyzing && (
                  <div className="analyzing-overlay">
                    <div className="analyzing-content">
                      <div className="analyzing-spinner"></div>
                      <p className="analyzing-text">PROCESSING IMAGE</p>
                      <p className="analyzing-subtext">AI models analyzing nutritional content...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div style={{ padding: '0 2rem 2rem' }}>
              <div className="error-container">
                <h4 className="error-title">Analysis Error</h4>
                <p className="error-message">{error}</p>
                {(error.includes('URL') || error.includes('Network') || error.includes('connectivity')) && (
                  <div className="error-solution">
                    <p className="error-solution-title">Recommended Solution</p>
                    <p className="error-solution-text">
                      Switch to "Upload Image" mode. Save the image locally, then upload the file directly. 
                      This method provides 100% reliability and identical analysis results.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Results Display */}
          {response && (
            <div className="results-container">
              <h3 className="results-header">Analysis Complete</h3>
              
              <div className="results-meta">
                <div className="meta-item">
                  <div className="meta-label">Status</div>
                  <div className="meta-value">{response.message}</div>
                </div>
                <div className="meta-item">
                  <div className="meta-label">Source</div>
                  <div className="meta-value">
                    {response.filename || (response.source_url ? 'URL Analysis' : 'Unknown')}
                  </div>
                </div>
                <div className="meta-item">
                  <div className="meta-label">File Size</div>
                  <div className="meta-value">{Math.round(response.size / 1024)} KB</div>
                </div>
              </div>

              {response.analysis && (
                <div className="analysis-container">
                  <h4 className="analysis-title">Nutritional Assessment</h4>
                  <div className="analysis-grid">
                    <div className="analysis-item">
                      <span className="analysis-label">Food Item</span>
                      <span className="analysis-value">{response.analysis.food}</span>
                    </div>
                    <div className="analysis-item">
                      <span className="analysis-label">Health Rating</span>
                      <span className={`health-badge ${response.analysis.health}`}>
                        {response.analysis.health}
                      </span>
                    </div>
                    <div className="analysis-item">
                      <span className="analysis-label">Assessment</span>
                      <span className="analysis-value">{response.analysis.reason}</span>
                    </div>
                    <div className="analysis-item">
                      <span className="analysis-label">Recommendation</span>
                      <span className="analysis-value">{response.analysis.next_meal}</span>
                    </div>
                    {response.source_url && (
                      <div className="analysis-item">
                        <span className="analysis-label">Source</span>
                        <a 
                          href={response.source_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="analysis-value"
                          style={{ color: 'var(--color-accent)', textDecoration: 'none' }}
                        >
                          View Original Image →
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Panel - History */}
        <div className="sidebar-panel">
          <div className="history-section">
            <div className="history-header">
              <h3 className="history-title">Analysis History</h3>
              {history.length > 0 && (
                <button 
                  onClick={clearHistory}
                  className="action-button danger"
                >
                  Clear
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="empty-state">
                <p className="empty-state-text">No analysis history yet</p>
              </div>
            ) : (
              <ul className="history-list">
                {history.map((meal) => (
                  <li key={meal._id} className="history-item">
                    {meal.image_url && (
                      <img
                        src={meal.image_url}
                        alt={meal.food}
                        className="history-image"
                      />
                    )}
                    <div className="history-content">
                      <h4 className="history-food">{meal.food}</h4>
                      <p className="history-date">
                        {new Date(meal.created_at).toLocaleDateString()} {new Date(meal.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                      <div className="history-source">
                        {meal.source_url ? (
                          <>
                            <span>🌐</span>
                            <span>URL</span>
                          </>
                        ) : (
                          <>
                            <span>📁</span>
                            <span>Upload</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="history-badge-container">
                      <span className={`health-badge ${meal.health}`}>
                        {meal.health}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App