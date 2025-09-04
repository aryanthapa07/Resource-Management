import React from 'react';

const LoadingSpinner = ({ size = 'md', text = '', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-2">
        <div className={`loading-spinner ${sizeClasses[size]}`}></div>
        {text && (
          <p className="text-sm text-gray-600 animate-pulse">{text}</p>
        )}
      </div>
    </div>
  );
};

const PageLoader = ({ text = 'Loading...' }) => (
  <div className="flex items-center justify-center h-64 fade-in">
    <LoadingSpinner size="lg" text={text} />
  </div>
);

const ButtonLoader = ({ text = 'Loading...', size = 'sm' }) => (
  <span className="flex items-center">
    <LoadingSpinner size={size} className="mr-2" />
    {text}
  </span>
);

const FileUploadLoader = ({ progress = 0, fileName = '' }) => (
  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg fade-in">
    <LoadingSpinner size="sm" />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 truncate">
        {fileName ? `Uploading ${fileName}...` : 'Uploading files...'}
      </p>
      {progress > 0 && (
        <div className="mt-1">
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">{progress}% complete</p>
        </div>
      )}
    </div>
  </div>
);

const SkeletonLoader = ({ rows = 3, className = '' }) => (
  <div className={`animate-pulse space-y-3 ${className}`}>
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex space-x-3">
        <div className="rounded-full bg-gray-200 h-10 w-10"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    ))}
  </div>
);

const TableSkeletonLoader = ({ rows = 5, columns = 4 }) => (
  <div className="animate-pulse">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {[...Array(columns)].map((_, i) => (
              <th key={i} className="px-6 py-3">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {[...Array(rows)].map((_, rowIndex) => (
            <tr key={rowIndex}>
              {[...Array(columns)].map((_, colIndex) => (
                <td key={colIndex} className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default LoadingSpinner;
export { 
  PageLoader, 
  ButtonLoader, 
  FileUploadLoader, 
  SkeletonLoader, 
  TableSkeletonLoader 
};