import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import ResultsDisplay from './components/ResultsDisplay';
import './App.css';

function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [batchMode, setBatchMode] = useState(false);

  const handleUploadComplete = (data) => {
    setResults(data);
    setLoading(false);
    setError(null);
  };

  const handleUploadError = (err) => {
    setError(err);
    setLoading(false);
    setResults(null);
  };

  const handleUploadStart = () => {
    setLoading(true);
    setError(null);
    setResults(null);
  };

  const handleReset = () => {
    setResults(null);
    setError(null);
    setLoading(false);
  };

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1>Credit Card Statement Parser</h1>
          <p className="subtitle">Extract key data from credit card statements instantly</p>
        </header>

        <div className="mode-toggle">
          <button 
            className={!batchMode ? 'active' : ''} 
            onClick={() => { setBatchMode(false); handleReset(); }}
          >
            Single Statement
          </button>
          <button 
            className={batchMode ? 'active' : ''} 
            onClick={() => { setBatchMode(true); handleReset(); }}
          >
            Batch Processing
          </button>
        </div>

        <div className="content">
          {!results && (
            <FileUpload
              onUploadStart={handleUploadStart}
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
              loading={loading}
              batchMode={batchMode}
            />
          )}

          {error && (
            <div className="error-message">
              <h3>Error</h3>
              <p>{error}</p>
              <button onClick={handleReset}>Try Again</button>
            </div>
          )}

          {results && (
            <ResultsDisplay 
              results={results} 
              onReset={handleReset}
              batchMode={batchMode}
            />
          )}
        </div>

        <footer className="footer">
          <div className="supported-issuers">
            <h4>Supported Issuers:</h4>
            <div className="issuer-tags">
              <span>Chase</span>
              <span>American Express</span>
              <span>Citibank</span>
              <span>Capital One</span>
              <span>Discover</span>
              <span>Bank of America</span>
              <span>Wells Fargo</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
