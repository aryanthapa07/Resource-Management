export const formatDate = (dateString) => {
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const formatSimpleDate = (dateString) => {
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const formatRole = (role) => {
  if (!role) return '';
  return role
    .split('_')
    .map(word => capitalizeFirst(word))
    .join(' ');
};

export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const getAvailabilityColor = (availability) => {
  switch (availability) {
    case 'available':
      return 'text-green-600 bg-green-50';
    case 'partially_available':
      return 'text-yellow-600 bg-yellow-50';
    case 'unavailable':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

export const getRoleColor = (role) => {
  switch (role) {
    case 'admin':
      return 'text-purple-600 bg-purple-50';
    case 'resource_manager':
      return 'text-blue-600 bg-blue-50';
    case 'engagement_manager':
      return 'text-green-600 bg-green-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};