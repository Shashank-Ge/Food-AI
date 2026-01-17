import { useState, useEffect } from 'react'

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

  return (
    <div style = {{ padding : '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h2> AI Nutrition Analysis </h2>

      {/* Mode Selection */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => switchMode('upload')}
          style={{
            padding: '10px 20px',
            backgroundColor: analysisMode === 'upload' ? '#007bff' : '#f8f9fa',
            color: analysisMode === 'upload' ? 'white' : '#333',
            border: '2px solid #007bff',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          📁 Upload Image
        </button>
        <button
          onClick={() => switchMode('url')}
          style={{
            padding: '10px 20px',
            backgroundColor: analysisMode === 'url' ? '#007bff' : '#f8f9fa',
            color: analysisMode === 'url' ? 'white' : '#333',
            border: '2px solid #007bff',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🌐 Analyze URL
        </button>
      </div>

      {/* Upload Mode */}
      {analysisMode === 'upload' && (
        <div style={{ marginBottom: '15px' }}>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const selectedFile = e.target.files[0]
              setFile(selectedFile)
              if (selectedFile) {
                setPreviewUrl(URL.createObjectURL(selectedFile))
              }
            }}
            style={{
              padding: '10px',
              border: '2px dashed #007bff',
              borderRadius: '8px',
              width: '100%',
              maxWidth: '500px'
            }}
          />
        </div>
      )}

      {/* URL Mode */}
      {analysisMode === 'url' && (
        <div style={{ marginBottom: '15px' }}>
          <input
            type="url"
            placeholder="Paste image URL here (e.g., https://example.com/image.jpg)"
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
            style={{
              padding: '12px',
              border: `2px solid ${error && imageUrl.trim() ? '#dc3545' : '#007bff'}`,
              borderRadius: '8px',
              width: '100%',
              maxWidth: '500px',
              fontSize: '14px'
            }}
          />
          {imageUrl.trim() && !error && (
            <small style={{ color: '#28a745', display: 'block', marginTop: '5px' }}>
              ✓ Valid URL format
            </small>
          )}
          <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
            Supports JPG, PNG, GIF, WebP images up to 10MB
          </small>
          <details style={{ marginTop: '10px' }}>
            <summary style={{ cursor: 'pointer', color: '#007bff', fontSize: '14px' }}>
              💡 Need example URLs? Click here
            </summary>
            <div style={{ marginTop: '8px', fontSize: '13px', color: '#666' }}>
              <p>Try these working examples:</p>
              <div style={{ fontFamily: 'monospace', backgroundColor: '#f8f9fa', padding: '8px', borderRadius: '4px', marginTop: '5px' }}>
                <div style={{ marginBottom: '4px' }}>
                  <button 
                    onClick={() => setImageUrl('https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500')}
                    style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline', fontSize: '12px' }}
                  >
                    Coffee Latte (Unsplash)
                  </button>
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <button 
                    onClick={() => setImageUrl('https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500')}
                    style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline', fontSize: '12px' }}
                  >
                    Salad (Unsplash)
                  </button>
                </div>
                <div>
                  <button 
                    onClick={() => setImageUrl('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500')}
                    style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline', fontSize: '12px' }}
                  >
                    Burger (Unsplash)
                  </button>
                </div>
              </div>
            </div>
          </details>
        </div>
      )}

      {previewUrl && (
        <div
          style={{
            position: "relative",
            marginTop: "20px",
            maxWidth: "400px"
          }}
        >
          <img
            src={previewUrl}
            alt="preview"
            style={{
              width: "100%",
              borderRadius: "12px",
              border: "1px solid #ddd"
            }}
          />
          
          {isAnalyzing && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.7)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                color: "white",
                borderRadius: "12px"
              }}
            >
              {/* Scanning lines */}
              <div className="scan-line" />
              <div className="scan-line-2" />
              
              {/* Central AI icon with pulse */}
              <div className="ai-scanner">
                <div className="ai-core">
                  <div className="ai-pulse" />
                  <div className="ai-pulse-2" />
                  🤖
                </div>
              </div>
              
              {/* Progress dots */}
              <div className="progress-dots">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
              
              <p style={{ 
                marginTop: "15px", 
                fontSize: "16px", 
                fontWeight: "bold",
                textShadow: "0 0 10px rgba(0,255,255,0.5)"
              }}>
                AI ANALYZING...
              </p>
            </div>
          )}
        </div>
      )}

      <button 
        onClick={analysisMode === 'upload' ? handleUpload : handleUrlAnalysis} 
        disabled={loading || (analysisMode === 'upload' ? !file : !imageUrl.trim())}
        style={{
          padding: '12px 30px',
          backgroundColor: loading ? '#ccc' : '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          fontWeight: 'bold',
          transition: 'background-color 0.3s',
          marginTop: '15px'
        }}
      >
        {loading ? ' Analyzing...' : 
         analysisMode === 'upload' ? 'Upload & Analyze' : 'Analyze URL'}
      </button>

      {error && (
        <div style={{ marginTop: '20px', color: 'red', backgroundColor: '#fff5f5', padding: '15px', borderRadius: '8px', border: '1px solid #fed7d7' }}>
          <p><strong>Error:</strong> {error}</p>
          {(error.includes('URL') || error.includes('Network') || error.includes('connectivity')) && (
            <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
              <p><strong>💡 Recommended solution:</strong></p>
              <div style={{ backgroundColor: '#e8f4fd', padding: '10px', borderRadius: '6px', marginTop: '8px' }}>
                <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#1976d2' }}>
                  Use "📁 Upload Image" instead
                </p>
                <p style={{ margin: 0, fontSize: '13px' }}>
                  Right-click the image → "Save image as..." → Upload the saved file. 
                  This works 100% of the time and gives the same AI analysis results.
                </p>
              </div>
              <details style={{ marginTop: '10px' }}>
                <summary style={{ cursor: 'pointer', color: '#007bff', fontSize: '13px' }}>
                  Why URL analysis might fail
                </summary>
                <ul style={{ margin: '5px 0', paddingLeft: '20px', fontSize: '12px' }}>
                  <li>Website blocks server requests (CORS policy)</li>
                  <li>Network connectivity issues</li>
                  <li>URL points to a webpage, not direct image</li>
                  <li>Image requires authentication or cookies</li>
                </ul>
              </details>
            </div>
          )}
        </div>
      )}

      {response && (
        <div style = {{marginTop : '20px', border: '1px solid #ddd', padding: '15px', borderRadius: '8px'}}>
          <p><strong>Status:</strong> {response.message} </p>
          <p><strong>Source:</strong> {response.filename || (response.source_url ? `URL: ${response.source_url}` : 'Unknown')} </p>
          <p><strong>Size:</strong> {response.size} bytes </p>

        {response.analysis && (
          <div style={{ marginTop: '15px', backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
            <h3>AI Analysis</h3>
            <p><strong>Food Identified:</strong> {response.analysis.food}</p>
            <p><strong>Health Rating:</strong> <span style={{
              color: response.analysis.health === 'healthy' ? 'green' :
                     response.analysis.health === 'unhealthy' ? 'red' : 'orange'
            }}>{response.analysis.health}</span></p>
            <p><strong>Reason:</strong> {response.analysis.reason}</p>
            <p><strong>Next Meal Suggestion:</strong> {response.analysis.next_meal}</p>
            {response.source_url && (
              <p><strong>Source URL:</strong> <a href={response.source_url} target="_blank" rel="noopener noreferrer" style={{color: '#007bff', wordBreak: 'break-all'}}>View Original</a></p>
            )}
          </div>
        )}

        </div>
      )}

      {/* history div */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px' }}>
          <h3 style={{ margin: 0 }}> Recent Meals </h3>
          {history.length > 0 && (
            <button 
              onClick={clearHistory}
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Clear History
            </button>
          )}
        </div>

        {history.length === 0 && <p> No Meals yet </p> }
        
        <ul>
          {history.map((meal) => (
            <li
              key={meal._id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "12px",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "8px"
              }}
            >
              {meal.image_url && (
                <img
                  src={meal.image_url}
                  alt={meal.food}
                  width="80"
                  height="80"
                  style={{objectFit: "cover", borderRadius: "6px"}}
                />
              )}

              <div>
                <div><strong>{meal.food}</strong></div>
                <div style={{ color: 
                  meal.health === "healthy" ? "green" :
                  meal.health === "unhealthy" ? "red" : "orange" 
                }}>
                  {meal.health}
                </div>
                <small>{new Date(meal.created_at).toLocaleString()}</small>
                {meal.source_url ? (
                  <div>
                    <small style={{color: '#007bff'}}>🌐 From URL</small>
                    <div style={{fontSize: '11px', color: '#666', marginTop: '2px', wordBreak: 'break-all'}}>
                      {meal.source_url.length > 50 ? meal.source_url.substring(0, 50) + '...' : meal.source_url}
                    </div>
                  </div>
                ) : (
                  <div>
                    <small style={{color: '#28a745'}}>📁 Uploaded file</small>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <style>
      {`
      /* Scanning lines that move across the image */
      .scan-line {
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 2px;
        background: linear-gradient(90deg, transparent, #00ffff, transparent);
        animation: scan 2s linear infinite;
      }
      
      .scan-line-2 {
        position: absolute;
        bottom: 0;
        right: -100%;
        width: 100%;
        height: 2px;
        background: linear-gradient(90deg, transparent, #ff00ff, transparent);
        animation: scan-reverse 2.5s linear infinite;
      }
      
      @keyframes scan {
        0% { left: -100%; }
        100% { left: 100%; }
      }
      
      @keyframes scan-reverse {
        0% { right: -100%; }
        100% { right: 100%; }
      }
      
      /* AI Scanner with pulsing effect */
      .ai-scanner {
        position: relative;
        margin: 20px 0;
      }
      
      .ai-core {
        position: relative;
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        border: 2px solid #00ffff;
        border-radius: 50%;
        background: rgba(0,255,255,0.1);
        animation: rotate 3s linear infinite;
      }
      
      .ai-pulse {
        position: absolute;
        width: 80px;
        height: 80px;
        border: 2px solid #00ffff;
        border-radius: 50%;
        animation: pulse 1.5s ease-out infinite;
      }
      
      .ai-pulse-2 {
        position: absolute;
        width: 100px;
        height: 100px;
        border: 1px solid #ff00ff;
        border-radius: 50%;
        animation: pulse 2s ease-out infinite 0.5s;
      }
      
      @keyframes rotate {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      @keyframes pulse {
        0% {
          transform: scale(0.8);
          opacity: 1;
        }
        100% {
          transform: scale(1.5);
          opacity: 0;
        }
      }
      
      /* Progress dots */
      .progress-dots {
        display: flex;
        gap: 8px;
        margin-top: 20px;
      }
      
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #00ffff;
        animation: dot-pulse 1.4s ease-in-out infinite both;
      }
      
      .dot:nth-child(1) { animation-delay: -0.32s; }
      .dot:nth-child(2) { animation-delay: -0.16s; }
      .dot:nth-child(3) { animation-delay: 0s; }
      
      @keyframes dot-pulse {
        0%, 80%, 100% {
          transform: scale(0.5);
          opacity: 0.5;
        }
        40% {
          transform: scale(1);
          opacity: 1;
        }
      }
      `}
      </style>

    </div>
  )

}

export default App