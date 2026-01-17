// I keep results display separate so it's easier to modify the layout
const AnalysisResults = ({ response }) => {
  if (!response) return null;

  return (
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
  );
};

export default AnalysisResults;