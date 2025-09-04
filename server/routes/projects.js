const express = require('express');
const { body, param } = require('express-validator');
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  updateProjectStatus,
  addTeamMember,
  removeTeamMember,
  addProjectNote,
  getProjectStats
} = require('../controllers/projectController');
const { auth } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();

const projectValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Project name must be between 2 and 200 characters'),
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description cannot be more than 2000 characters'),
  body('client')
    .isMongoId()
    .withMessage('Valid client ID is required'),
  body('projectManager')
    .isMongoId()
    .withMessage('Valid project manager ID is required'),
  body('startDate')
    .isISO8601()
    .withMessage('Valid start date is required'),
  body('endDate')
    .isISO8601()
    .withMessage('Valid end date is required')
    .custom((endDate, { req }) => {
      if (new Date(endDate) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('status')
    .optional()
    .isIn(['planning', 'active', 'on_hold', 'completed', 'cancelled'])
    .withMessage('Invalid project status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid priority level'),
  body('budgetAllocated')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Budget must be a positive number'),
  body('budgetCurrency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR', 'CNY'])
    .withMessage('Invalid currency')
];

const projectIdValidation = [
  param('projectId')
    .isMongoId()
    .withMessage('Invalid project ID')
];

const statusValidation = [
  body('status')
    .isIn(['planning', 'active', 'on_hold', 'completed', 'cancelled'])
    .withMessage('Invalid project status')
];

const teamMemberValidation = [
  body('userId')
    .isMongoId()
    .withMessage('Valid user ID is required'),
  body('role')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Role must be between 1 and 50 characters'),
  body('hourlyRate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Hourly rate must be a positive number')
];

const noteValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Note content must be between 1 and 2000 characters'),
  body('isPrivate')
    .optional()
    .isBoolean()
    .withMessage('isPrivate must be a boolean')
];

// Get project statistics
router.get(
  '/stats',
  auth,
  authorize('admin', 'engagement_manager', 'resource_manager'),
  getProjectStats
);

// Get all projects with filtering
router.get(
  '/',
  auth,
  authorize('admin', 'engagement_manager', 'resource_manager'),
  getProjects
);

// Create new project
router.post(
  '/',
  auth,
  authorize('admin', 'engagement_manager'),
  projectValidation,
  createProject
);

// Get specific project
router.get(
  '/:projectId',
  auth,
  authorize('admin', 'engagement_manager', 'resource_manager'),
  projectIdValidation,
  getProject
);

// Update project
router.put(
  '/:projectId',
  auth,
  authorize('admin', 'engagement_manager', 'resource_manager'),
  projectIdValidation,
  projectValidation,
  updateProject
);

// Delete project
router.delete(
  '/:projectId',
  auth,
  authorize('admin', 'engagement_manager'),
  projectIdValidation,
  deleteProject
);

// Update project status
router.patch(
  '/:projectId/status',
  auth,
  authorize('admin', 'engagement_manager', 'resource_manager'),
  projectIdValidation,
  statusValidation,
  updateProjectStatus
);

// Add team member to project
router.post(
  '/:projectId/team',
  auth,
  authorize('admin', 'engagement_manager', 'resource_manager'),
  projectIdValidation,
  teamMemberValidation,
  addTeamMember
);

// Remove team member from project
router.delete(
  '/:projectId/team/:userId',
  auth,
  authorize('admin', 'engagement_manager', 'resource_manager'),
  projectIdValidation,
  param('userId').isMongoId().withMessage('Invalid user ID'),
  removeTeamMember
);

// Add note to project
router.post(
  '/:projectId/notes',
  auth,
  authorize('admin', 'engagement_manager', 'resource_manager'),
  projectIdValidation,
  noteValidation,
  addProjectNote
);

module.exports = router;