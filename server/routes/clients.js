const express = require('express');
const { body, param } = require('express-validator');
const {
  createClient,
  getClients,
  getClient,
  updateClient,
  deleteClient,
  uploadDocuments,
  downloadDocument,
  deleteDocument,
  addNote,
  getClientStats
} = require('../controllers/clientController');
const { auth } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { uploadMiddleware } = require('../middleware/upload');

const router = express.Router();

const clientValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Client name must be between 2 and 200 characters'),
  body('code')
    .trim()
    .matches(/^[A-Z0-9]{2,20}$/)
    .withMessage('Client code must be 2-20 uppercase letters/numbers'),
  body('currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR', 'CNY'])
    .withMessage('Invalid currency'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot be more than 1000 characters'),
  body('contactInfo.email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format'),
  body('primaryContact.email')
    .optional()
    .isEmail()
    .withMessage('Invalid primary contact email format'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'prospect', 'archived'])
    .withMessage('Invalid status'),
  body('businessInfo.size')
    .optional()
    .isIn(['startup', 'small', 'medium', 'large', 'enterprise'])
    .withMessage('Invalid business size')
];

const clientIdValidation = [
  param('clientId')
    .isMongoId()
    .withMessage('Invalid client ID')
];

const documentIdValidation = [
  param('documentId')
    .isMongoId()
    .withMessage('Invalid document ID')
];

const noteValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Note content must be between 1 and 1000 characters')
];

router.get(
  '/stats',
  auth,
  authorize('admin', 'engagement_manager'),
  getClientStats
);

router.get(
  '/',
  auth,
  authorize('admin', 'engagement_manager'),
  getClients
);

router.post(
  '/',
  auth,
  authorize('admin', 'engagement_manager'),
  uploadMiddleware.multiple('documents', 5),
  clientValidation,
  createClient
);

router.get(
  '/:clientId',
  auth,
  authorize('admin', 'engagement_manager'),
  clientIdValidation,
  getClient
);

router.put(
  '/:clientId',
  auth,
  authorize('admin', 'engagement_manager'),
  uploadMiddleware.multiple('documents', 5),
  clientIdValidation,
  clientValidation,
  updateClient
);

router.delete(
  '/:clientId',
  auth,
  authorize('admin', 'engagement_manager'),
  clientIdValidation,
  deleteClient
);

router.post(
  '/:clientId/documents',
  auth,
  authorize('admin', 'engagement_manager'),
  uploadMiddleware.multiple('documents', 10),
  clientIdValidation,
  uploadDocuments
);

router.get(
  '/:clientId/documents/:documentId/download',
  auth,
  authorize('admin', 'engagement_manager'),
  clientIdValidation,
  documentIdValidation,
  downloadDocument
);

router.delete(
  '/:clientId/documents/:documentId',
  auth,
  authorize('admin', 'engagement_manager'),
  clientIdValidation,
  documentIdValidation,
  deleteDocument
);

router.post(
  '/:clientId/notes',
  auth,
  authorize('admin', 'engagement_manager'),
  clientIdValidation,
  noteValidation,
  addNote
);

module.exports = router;