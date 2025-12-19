import React, { useState } from 'react';
import './ResultsDisplay.css';

function ResultsDisplay({ results, onReset, batchMode }) {
  const [activeTab, setActiveTab] = useState(0);

  if (batchMode) {
    return (
      <div className="results-display">
        <div className="results-header">
          <h2>Batch Processing Results</h2>
          <button className="reset-btn" onClick={onReset}>Upload More</button>
        </div>

        <div className="batch-summary">
          <div className="summary-card success">
            <div className="summary-number">{results.successful}</div>
            <div className="summary-label">Successful</div>
          </div>
          <div className="summary-card total">
            <div className="summary-number">{results.total}</div>
            <div className="summary-label">Total Files</div>
          </div>
          <div className="summary-card failed">
            <div className="summary-number">{results.failed}</div>
            <div className="summary-label">Failed</div>
          </div>
        </div>

        <div className="batch-results">
          {results.results.map((result, index) => (
            <div key={index} className={`batch-item ${result.status}`}>
              <div className="batch-item-header">
                <h3>{result.filename}</h3>
                <span className={`status-badge ${result.status}`}>{result.status}</span>
              </div>
              
              {result.status === 'success' ? (
                <div className="batch-item-content">
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Issuer:</span>
                      <span className="value">{result.data.issuer}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Card:</span>
                      <span className="value">****{result.data.card_last_four_digits || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Due Date:</span>
                      <span className="value">{result.data.payment_due_date || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Transactions:</span>
                      <span className="value">{result.data.transactions?.length || 0}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="error-content">
                  <p>{result.error}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const data = results.data;

  const downloadJSON = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${results.filename.replace('.pdf', '')}_parsed.json`;
    link.click();
  };

  return (
    <div className="results-display">
      <div className="results-header">
        <h2>Extraction Results</h2>
        <div className="header-actions">
          <button className="download-btn" onClick={downloadJSON}>Download JSON</button>
          <button className="reset-btn" onClick={onReset}>Upload New</button>
        </div>
      </div>

      <div className="results-tabs">
        <button className={activeTab === 0 ? 'active' : ''} onClick={() => setActiveTab(0)}>
          Overview
        </button>
        <button className={activeTab === 1 ? 'active' : ''} onClick={() => setActiveTab(1)}>
          Transactions
        </button>
        <button className={activeTab === 2 ? 'active' : ''} onClick={() => setActiveTab(2)}>
          JSON
        </button>
      </div>

      <div className="results-content">
        {activeTab === 0 && (
          <div className="overview-tab">
            <div className="data-section">
              <h3>Card Information</h3>
              <div className="data-grid">
                <div className="data-item">
                  <span className="data-label">Issuer</span>
                  <span className="data-value issuer">{data.issuer}</span>
                </div>
                <div className="data-item">
                  <span className="data-label">Card Last 4 Digits</span>
                  <span className="data-value card-number">****{data.card_last_four_digits || 'N/A'}</span>
                </div>
                <div className="data-item">
                  <span className="data-label">Card Variant</span>
                  <span className="data-value">{data.card_variant || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="data-section">
              <h3>Billing Information</h3>
              <div className="data-grid">
                {data.billing_cycle && (
                  <>
                    {data.billing_cycle.start_date && (
                      <div className="data-item">
                        <span className="data-label">Billing Start</span>
                        <span className="data-value">{data.billing_cycle.start_date}</span>
                      </div>
                    )}
                    {data.billing_cycle.end_date && (
                      <div className="data-item">
                        <span className="data-label">Billing End</span>
                        <span className="data-value">{data.billing_cycle.end_date}</span>
                      </div>
                    )}
                    {data.billing_cycle.closing_date && (
                      <div className="data-item">
                        <span className="data-label">Closing Date</span>
                        <span className="data-value">{data.billing_cycle.closing_date}</span>
                      </div>
                    )}
                  </>
                )}
                <div className="data-item">
                  <span className="data-label">Payment Due Date</span>
                  <span className="data-value due-date">{data.payment_due_date || 'N/A'}</span>
                </div>
              </div>
            </div>

            {data.total_balance && (
              <div className="data-section">
                <h3>Balance Details</h3>
                <div className="balance-grid">
                  {Object.entries(data.total_balance).map(([key, value]) => (
                    <div key={key} className="balance-item">
                      <span className="balance-label">{key}</span>
                      <span className="balance-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 1 && (
          <div className="transactions-tab">
            <h3>Recent Transactions ({data.transactions?.length || 0})</h3>
            {data.transactions && data.transactions.length > 0 ? (
              <div className="transactions-list">
                {data.transactions.map((txn, index) => (
                  <div key={index} className="transaction-card">
                    <div className="transaction-header">
                      <span className="transaction-number">#{index + 1}</span>
                      <span className="transaction-amount">{txn.amount}</span>
                    </div>
                    <div className="transaction-details">
                      <p className="transaction-description">{txn.description}</p>
                      <div className="transaction-dates">
                        {txn.transaction_date && (
                          <span>Trans: {txn.transaction_date}</span>
                        )}
                        {txn.post_date && txn.post_date !== txn.transaction_date && (
                          <span>Post: {txn.post_date}</span>
                        )}
                        {txn.date && <span>{txn.date}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No transactions found</p>
            )}
          </div>
        )}

        {activeTab === 2 && (
          <div className="json-tab">
            <pre className="json-display">{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResultsDisplay;
