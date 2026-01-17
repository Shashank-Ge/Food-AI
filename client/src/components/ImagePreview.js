// I keep image preview separate since it has its own state and logic
const ImagePreview = ({ previewUrl, isAnalyzing }) => {
  if (!previewUrl) return null;

  return (
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
  );
};

export default ImagePreview;