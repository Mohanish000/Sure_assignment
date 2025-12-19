import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import './FileUpload.css';

function FileUpload({ onUploadStart, onUploadComplete, onUploadError, loading, batchMode }) {
  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    onUploadStart();

    const formData = new FormData();

    if (batchMode) {
      acceptedFiles.forEach(file => {
        formData.append('statements', file);
      });

      try {
        const response = await axios.post('/api/parse-batch', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (response.data.success) {
          onUploadComplete(response.data);
        } else {
          onUploadError(response.data.error || 'Failed to parse statements');
        }
      } catch (error) {
        onUploadError(error.response?.data?.error || error.message || 'Upload failed');
      }
    } else {
      formData.append('statement', acceptedFiles[0]);

      try {
        const response = await axios.post('/api/parse', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (response.data.success) {
          onUploadComplete(response.data);
        } else {
          onUploadError(response.data.error || 'Failed to parse statement');
        }
      } catch (error) {
        onUploadError(error.response?.data?.error || error.message || 'Upload failed');
      }
    }
  }, [batchMode, onUploadStart, onUploadComplete, onUploadError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: batchMode,
    disabled: loading
  });

  return (
    <div className="file-upload">
      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''} ${loading ? 'loading' : ''}`}>
        <input {...getInputProps()} />
        
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Processing {batchMode ? 'statements' : 'statement'}...</p>
          </div>
        ) : (
          <div className="upload-content">
            <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            
            {isDragActive ? (
              <p className="drag-text">Drop the PDF {batchMode ? 'files' : 'file'} here</p>
            ) : (
              <>
                <p className="upload-text">
                  Drag & drop {batchMode ? 'PDF files' : 'a PDF file'} here
                </p>
                <p className="upload-subtext">or click to select {batchMode ? 'files' : 'file'}</p>
                {batchMode && <p className="batch-hint">You can upload multiple statements at once</p>}
              </>
            )}
          </div>
        )}
      </div>

      <div className="features">
        <div className="feature">
          <div className="feature-icon">📄</div>
          <h4>Card Details</h4>
          <p>Last 4 digits & card variant</p>
        </div>
        <div className="feature">
          <div className="feature-icon">📅</div>
          <h4>Dates</h4>
          <p>Billing cycle & due date</p>
        </div>
        <div className="feature">
          <div className="feature-icon">💰</div>
          <h4>Balance</h4>
          <p>Total balance & amounts</p>
        </div>
        <div className="feature">
          <div className="feature-icon">🔄</div>
          <h4>Transactions</h4>
          <p>Recent transaction history</p>
        </div>
      </div>
    </div>
  );
}

export default FileUpload;
