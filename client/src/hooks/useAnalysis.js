import { useState, useEffect } from 'react';

// I extract analysis state management to keep App.js focused on layout
const useAnalysis = () => {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Load history on mount
  const loadHistory = async () => {
    try {
      const res = await fetch('http://localhost:5000/history');
      const data = await res.json();
      setHistory(data.meals || []);
    } catch (err) {
      console.error("Failed to load history:", err);
      setHistory([]);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Handle successful analysis
  const handleAnalysisComplete = (data) => {
    setResponse(data);
    setIsAnalyzing(false);
    
    // Set preview URL based on response
    if (data.image_url) {
      setPreviewUrl(data.image_url);
    } else if (data.source_url) {
      setPreviewUrl(data.source_url);
    }
    
    // Reload history to show new entry
    loadHistory();
  };

  // Handle analysis errors
  const handleAnalysisError = (errorMessage) => {
    setError(errorMessage);
    setIsAnalyzing(false);
  };

  // Start analysis (called when user initiates)
  const startAnalysis = (imageUrl = null) => {
    setIsAnalyzing(true);
    setError(null);
    setResponse(null);
    
    if (imageUrl) {
      setPreviewUrl(imageUrl);
    }
  };

  // Clear history
  const clearHistory = () => {
    setHistory([]);
  };

  // Reset all state
  const resetAnalysis = () => {
    setResponse(null);
    setError(null);
    setPreviewUrl(null);
    setIsAnalyzing(false);
  };

  return {
    // State
    response,
    error,
    history,
    previewUrl,
    isAnalyzing,
    
    // Actions
    handleAnalysisComplete,
    handleAnalysisError,
    startAnalysis,
    clearHistory,
    resetAnalysis,
    loadHistory
  };
};

export default useAnalysis;