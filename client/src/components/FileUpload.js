import React, { useState, useRef } from 'react';
import { FileUploadLoader } from './LoadingSpinner';

const FileUpload = ({ onFilesSelect, maxFiles = 10, acceptedTypes = [], maxSize = 10 * 1024 * 1024, uploading = false, uploadProgress = 0 }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadingFile, setUploadingFile] = useState('');
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('word')) return '📝';
    if (type.includes('excel') || type.includes('sheet')) return '📊';
    if (type.includes('powerpoint') || type.includes('presentation')) return '📽️';
    if (type.includes('image')) return '🖼️';
    if (type.includes('zip') || type.includes('rar')) return '📦';
    if (type.includes('text')) return '📃';
    return '📎';
  };

  const validateFile = (file) => {
    const errors = [];

    if (maxSize && file.size > maxSize) {
      errors.push(`File size exceeds ${formatFileSize(maxSize)}`);
    }

    if (acceptedTypes.length > 0 && !acceptedTypes.includes(file.type)) {
      errors.push('File type not supported');
    }

    return errors;
  };

  const handleFiles = (files) => {
    const fileArray = Array.from(files);
    const validFiles = [];
    const errors = [];

    if (selectedFiles.length + fileArray.length > maxFiles) {
      errors.push(`Cannot upload more than ${maxFiles} files`);
      return;
    }

    fileArray.forEach((file, index) => {
      const fileErrors = validateFile(file);
      if (fileErrors.length > 0) {
        errors.push(`${file.name}: ${fileErrors.join(', ')}`);
      } else {
        validFiles.push({
          file,
          id: Date.now() + index,
          name: file.name,
          size: file.size,
          type: file.type,
          icon: getFileIcon(file.type)
        });
      }
    });

    if (errors.length > 0) {
      alert('File validation errors:\n' + errors.join('\n'));
      return;
    }

    const newFiles = [...selectedFiles, ...validFiles];
    setSelectedFiles(newFiles);
    onFilesSelect(newFiles.map(f => f.file));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (fileId) => {
    const newFiles = selectedFiles.filter(f => f.id !== fileId);
    setSelectedFiles(newFiles);
    onFilesSelect(newFiles.map(f => f.file));
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div
        className={`file-upload-zone border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${
          dragActive
            ? 'dragover border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        } ${uploading ? 'pointer-events-none opacity-75' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileSelector}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInputChange}
          accept={acceptedTypes.join(',')}
          className="hidden"
        />
        
        <div className="space-y-2">
          <div className={`text-4xl transition-all duration-300 ${dragActive ? 'scale-110' : 'scale-100'}`}>
            {uploading ? '⏳' : dragActive ? '📁' : '☁️'}
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              {uploading ? 'Uploading...' : dragActive ? 'Drop files here' : 'Upload files'}
            </p>
            <p className="text-sm text-gray-500">
              {uploading ? 'Please wait while files are being uploaded' : 'Drag and drop files here, or click to select files'}
            </p>
          </div>
          <div className="text-xs text-gray-400">
            <p>Maximum {maxFiles} files, {formatFileSize(maxSize)} per file</p>
            {acceptedTypes.length > 0 && (
              <p>Accepted types: {acceptedTypes.map(type => {
                const ext = type.split('/').pop();
                return ext.toUpperCase();
              }).join(', ')}</p>
            )}
          </div>
        </div>
      </div>

      {uploading && (
        <FileUploadLoader 
          progress={uploadProgress} 
          fileName={uploadingFile}
        />
      )}

      {selectedFiles.length > 0 && (
        <div className="space-y-2 fade-in">
          <h4 className="text-sm font-medium text-gray-900">
            Selected Files ({selectedFiles.length})
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 transition-all duration-300 hover:shadow-md zoom-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <span className="text-lg">{file.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                  className="ml-4 text-red-600 hover:text-red-800 text-sm transition-colors duration-200 hover:scale-110"
                  disabled={uploading}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;