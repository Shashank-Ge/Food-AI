import { API_BASE_URL } from '../config';

// I separate history management to keep the main app cleaner
const MealHistory = ({ history, onClearHistory }) => {
  const handleClearHistory = async () => {
    const confirmClear = window.confirm("Are you sure you want to clear all history?");
    if (!confirmClear) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/history`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error("Failed to clear history");
      }

      onClearHistory(); // Notify parent to refresh
      alert('History cleared successfully!');
    } catch (err) {
      console.error("Failed to clear history:", err);
      alert(err.message);
    }
  };

  return (
    <div className="history-section">
      <div className="history-header">
        <h3 className="history-title">Analysis History</h3>
        {history.length > 0 && (
          <button 
            onClick={handleClearHistory}
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
  );
};

export default MealHistory;