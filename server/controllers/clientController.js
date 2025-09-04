const { validationResult } = require('express-validator');
const Client = require('../models/Client');
const { deleteFile, getFileInfo, cleanupOrphanedFiles } = require('../middleware/upload');
const path = require('path');
const fs = require('fs-extra');

const createClient = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const clientData = {
      ...req.body,
      createdBy: req.user._id,
      engagementManager: req.body.engagementManager || req.user._id
    };

    if (req.files && req.files.length > 0) {
      clientData.documents = req.files.map(file => ({
        ...getFileInfo(file),
        uploadedBy: req.user._id,
        category: req.body.documentCategory || 'other',
        description: req.body.documentDescription || ''
      }));
    }

    const client = await Client.create(clientData);
    await client.populate(['createdBy', 'engagementManager']);

    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: { client }
    });
  } catch (error) {
    console.error('Create client error:', error);
    
    if (req.files) {
      for (const file of req.files) {
        await deleteFile(file.path);
      }
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Client code already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error creating client'
    });
  }
};

const getClients = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const search = req.query.search || '';
    const status = req.query.status || '';
    const currency = req.query.currency || '';
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.status = status;
    }

    if (currency) {
      query.currency = currency;
    }

    if (req.user.role === 'engagement_manager') {
      query.engagementManager = req.user._id;
    }

    const [clients, totalClients] = await Promise.all([
      Client.find(query)
        .populate('createdBy', 'name email')
        .populate('engagementManager', 'name email')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Client.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalClients / limit);

    res.json({
      success: true,
      data: {
        clients,
        pagination: {
          currentPage: page,
          totalPages,
          totalClients,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching clients'
    });
  }
};

const getClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    
    let query = { _id: clientId };
    
    if (req.user.role === 'engagement_manager') {
      query.engagementManager = req.user._id;
    }

    const client = await Client.findOne(query)
      .populate('createdBy', 'name email')
      .populate('engagementManager', 'name email')
      .populate('documents.uploadedBy', 'name email')
      .populate('notes.author', 'name email');

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.json({
      success: true,
      data: { client }
    });
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching client'
    });
  }
};

const updateClient = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { clientId } = req.params;
    
    let query = { _id: clientId };
    
    if (req.user.role === 'engagement_manager') {
      query.engagementManager = req.user._id;
    }

    const existingClient = await Client.findOne(query);
    
    if (!existingClient) {
      if (req.files) {
        for (const file of req.files) {
          await deleteFile(file.path);
        }
      }
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    const updateData = { ...req.body };
    
    if (req.files && req.files.length > 0) {
      const newDocuments = req.files.map(file => ({
        ...getFileInfo(file),
        uploadedBy: req.user._id,
        category: req.body.documentCategory || 'other',
        description: req.body.documentDescription || ''
      }));
      
      updateData.documents = [...existingClient.documents, ...newDocuments];
    }

    const client = await Client.findOneAndUpdate(
      query,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('engagementManager', 'name email')
      .populate('documents.uploadedBy', 'name email');

    res.json({
      success: true,
      message: 'Client updated successfully',
      data: { client }
    });
  } catch (error) {
    console.error('Update client error:', error);
    
    if (req.files) {
      for (const file of req.files) {
        await deleteFile(file.path);
      }
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Client code already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error updating client'
    });
  }
};

const deleteClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    
    let query = { _id: clientId };
    
    if (req.user.role === 'engagement_manager') {
      query.engagementManager = req.user._id;
    }

    const client = await Client.findOne(query);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    for (const document of client.documents) {
      await deleteFile(document.path);
    }

    await Client.findOneAndDelete(query);

    res.json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting client'
    });
  }
};

const uploadDocuments = async (req, res) => {
  try {
    const { clientId } = req.params;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    let query = { _id: clientId };
    
    if (req.user.role === 'engagement_manager') {
      query.engagementManager = req.user._id;
    }

    const client = await Client.findOne(query);
    
    if (!client) {
      for (const file of req.files) {
        await deleteFile(file.path);
      }
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    const newDocuments = req.files.map(file => ({
      ...getFileInfo(file),
      uploadedBy: req.user._id,
      category: req.body.category || 'other',
      description: req.body.description || ''
    }));

    client.documents.push(...newDocuments);
    await client.save();

    await client.populate('documents.uploadedBy', 'name email');

    res.json({
      success: true,
      message: 'Documents uploaded successfully',
      data: { 
        documents: newDocuments,
        client 
      }
    });
  } catch (error) {
    console.error('Upload documents error:', error);
    
    if (req.files) {
      for (const file of req.files) {
        await deleteFile(file.path);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error uploading documents'
    });
  }
};

const downloadDocument = async (req, res) => {
  try {
    const { clientId, documentId } = req.params;
    
    let query = { _id: clientId };
    
    if (req.user.role === 'engagement_manager') {
      query.engagementManager = req.user._id;
    }

    const client = await Client.findOne(query);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    const document = client.documents.find(doc => doc._id.toString() === documentId);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const filePath = document.path;
    
    if (!(await fs.pathExists(filePath))) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
    res.setHeader('Content-Type', document.mimetype);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Download document error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error downloading document'
    });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const { clientId, documentId } = req.params;
    
    let query = { _id: clientId };
    
    if (req.user.role === 'engagement_manager') {
      query.engagementManager = req.user._id;
    }

    const client = await Client.findOne(query);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    const document = client.documents.find(doc => doc._id.toString() === documentId);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    await deleteFile(document.path);
    
    client.documents = client.documents.filter(doc => doc._id.toString() !== documentId);
    await client.save();

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting document'
    });
  }
};

const addNote = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Note content is required'
      });
    }

    let query = { _id: clientId };
    
    if (req.user.role === 'engagement_manager') {
      query.engagementManager = req.user._id;
    }

    const client = await Client.findOne(query);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    await client.addNote(content.trim(), req.user._id);
    await client.populate('notes.author', 'name email');

    res.json({
      success: true,
      message: 'Note added successfully',
      data: { client }
    });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding note'
    });
  }
};

const getClientStats = async (req, res) => {
  try {
    let matchQuery = {};
    
    if (req.user.role === 'engagement_manager') {
      matchQuery.engagementManager = req.user._id;
    }

    const stats = await Client.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalClients: { $sum: 1 },
          activeClients: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          prospects: {
            $sum: { $cond: [{ $eq: ['$status', 'prospect'] }, 1, 0] }
          },
          totalRevenue: { $sum: '$metrics.totalRevenue' },
          totalDocuments: { $sum: { $size: '$documents' } },
          currencyBreakdown: {
            $push: '$currency'
          }
        }
      },
      {
        $addFields: {
          currencyStats: {
            $reduce: {
              input: '$currencyBreakdown',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    $arrayToObject: [[
                      { k: '$$this', v: { $add: [{ $ifNull: [{ $getField: { input: '$$value', field: '$$this' } }, 0] }, 1] } }
                    ]]
                  }
                ]
              }
            }
          }
        }
      },
      {
        $project: {
          totalClients: 1,
          activeClients: 1,
          prospects: 1,
          totalRevenue: 1,
          totalDocuments: 1,
          currencyStats: { $objectToArray: '$currencyStats' },
          _id: 0
        }
      }
    ]);

    const result = stats[0] || {
      totalClients: 0,
      activeClients: 0,
      prospects: 0,
      totalRevenue: 0,
      totalDocuments: 0,
      currencyStats: []
    };

    res.json({
      success: true,
      data: { stats: result }
    });
  } catch (error) {
    console.error('Get client stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching client statistics'
    });
  }
};

module.exports = {
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
};