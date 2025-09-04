import React from 'react';

const ConfirmDialog = ({
  isOpen = false,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmLabel,
  cancelLabel,
  confirmClass = 'bg-red-600 hover:bg-red-700',
  onConfirm,
  onCancel,
  type
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-600 text-xl">⚠️</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {title}
              </h3>
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-600">
              {message}
            </p>
          </div>
          
          <div className="flex justify-end space-x-4">
            <button
              onClick={onCancel}
              className="btn-secondary"
            >
              {cancelLabel || cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${confirmClass}`}
            >
              {confirmLabel || confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;