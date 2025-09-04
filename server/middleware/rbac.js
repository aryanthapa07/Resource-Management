const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}, your role: ${req.user.role}`
      });
    }

    next();
  };
};

const checkOwnership = (req, res, next) => {
  const resourceUserId = req.params.userId || req.body.userId;
  
  if (req.user.role === 'admin') {
    return next();
  }
  
  if (req.user.role === 'resource_manager') {
    return next();
  }
  
  if (req.user._id.toString() === resourceUserId) {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    message: 'Access denied. You can only access your own resources'
  });
};

const checkDepartmentAccess = async (req, res, next) => {
  try {
    const departmentId = req.params.departmentId || req.body.departmentId;
    
    if (req.user.role === 'admin') {
      return next();
    }
    
    if (req.user.role === 'resource_manager') {
      const Department = require('../models/Department');
      const department = await Department.findById(departmentId);
      
      if (!department) {
        return res.status(404).json({
          success: false,
          message: 'Department not found'
        });
      }
      
      if (department.resourceManager.toString() === req.user._id.toString()) {
        return next();
      }
    }
    
    if (req.user.department && req.user.department._id.toString() === departmentId) {
      return next();
    }
    
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your department resources'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking department access'
    });
  }
};

module.exports = {
  authorize,
  checkOwnership,
  checkDepartmentAccess
};