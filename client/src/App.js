import { useState } from 'react';
import './App.css';

// Components
import ImageUpload from './components/ImageUpload';
import UrlAnalysis from './components/UrlAnalysis';
import ImagePreview from './components/ImagePreview';
import AnalysisResults from './components/AnalysisResults';
import MealHistory from './components/MealHistory';

// Custom hooks
import useAnalysis from './hooks/useAnalysis';

function App() {
  const [analysisMode, setAnalysisMode] = useState('upload'); // 'upload' or 'url'
  
  // I use a custom hook to manage all analysis-related state
  const {
    response,
    error,
    history,
    previewUrl,
    isAnalyzing,
    handleAnalysisComplete,
    handleAnalysisError,
    startAnalysis,
    clearHistory,
    resetAnalysis
  } = useAnalysis();

  // Handle mode switching with cleanup
  const switchMode = (mode) => {
    setAnalysisMode(mode);
    resetAnalysis(); // Clear previous state when switching modes
  };

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
              <ImageUpload 
                onAnalysisComplete={handleAnalysisComplete}
                onError={handleAnalysisError}
                onFileSelect={(file) => {
                  if (file) {
                    const objectUrl = URL.createObjectURL(file);
                    startAnalysis(objectUrl);
                  }
                }}
              />
            ) : (
              <UrlAnalysis 
                onAnalysisComplete={handleAnalysisComplete}
                onError={handleAnalysisError}
                onUrlChange={(url) => {
                  if (url) {
                    startAnalysis(url);
                  } else {
                    resetAnalysis();
                  }
                }}
              />
            )}
          </div>

          {/* Image Preview */}
          <ImagePreview 
            previewUrl={previewUrl} 
            isAnalyzing={isAnalyzing} 
          />

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
          <AnalysisResults response={response} />
        </div>

        {/* Sidebar Panel - History */}
        <div className="sidebar-panel">
          <MealHistory 
            history={history} 
            onClearHistory={clearHistory} 
          />
        </div>
      </div>
    </div>
  );
}

export default App;