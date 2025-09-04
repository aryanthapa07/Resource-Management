const { validationResult } = require('express-validator');
const Project = require('../models/Project');
const Client = require('../models/Client');
const User = require('../models/User');

const createProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Validate client exists and user has access
    const client = await Client.findById(req.body.client);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Check if user has access to this client
    if (req.user.role === 'engagement_manager' && 
        client.engagementManager.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this client'
      });
    }

    // Validate project manager exists
    const projectManager = await User.findById(req.body.projectManager);
    if (!projectManager) {
      return res.status(404).json({
        success: false,
        message: 'Project manager not found'
      });
    }

    const projectData = {
      ...req.body,
      createdBy: req.user._id,
      budget: {
        allocated: req.body.budgetAllocated || 0,
        currency: req.body.budgetCurrency || client.currency || 'USD'
      }
    };

    const project = await Project.create(projectData);
    await project.populate([
      { path: 'client', select: 'name code currency' },
      { path: 'projectManager', select: 'name email role' },
      { path: 'createdBy', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project }
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating project'
    });
  }
};

const getProjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const search = req.query.search || '';
    const status = req.query.status || '';
    const client = req.query.client || '';
    const projectManager = req.query.projectManager || '';
    const priority = req.query.priority || '';
    const startDateFrom = req.query.startDateFrom;
    const startDateTo = req.query.startDateTo;
    const sortBy = req.query.sortBy || 'updatedAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    let query = {};

    // Search across project name and description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by client
    if (client) {
      query.client = client;
    }

    // Filter by project manager
    if (projectManager) {
      query.projectManager = projectManager;
    }

    // Filter by priority
    if (priority) {
      query.priority = priority;
    }

    // Filter by date range
    if (startDateFrom || startDateTo) {
      query.startDate = {};
      if (startDateFrom) query.startDate.$gte = new Date(startDateFrom);
      if (startDateTo) query.startDate.$lte = new Date(startDateTo);
    }

    // Role-based filtering
    if (req.user.role === 'engagement_manager') {
      // Get clients managed by this engagement manager
      const managedClients = await Client.find(
        { engagementManager: req.user._id },
        '_id'
      );
      const clientIds = managedClients.map(c => c._id);
      query.$or = [
        { client: { $in: clientIds } },
        { projectManager: req.user._id },
        { 'teamMembers.user': req.user._id }
      ];
    } else if (req.user.role === 'resource_manager') {
      query.$or = [
        { projectManager: req.user._id },
        { 'teamMembers.user': req.user._id }
      ];
    }

    const [projects, totalProjects] = await Promise.all([
      Project.find(query)
        .populate('client', 'name code currency status')
        .populate('projectManager', 'name email role')
        .populate('createdBy', 'name email')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Project.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalProjects / limit);

    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          currentPage: page,
          totalPages,
          totalProjects,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching projects'
    });
  }
};

const getProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const project = await Project.findById(projectId)
      .populate('client')
      .populate('projectManager', 'name email role profile')
      .populate('teamMembers.user', 'name email role')
      .populate('createdBy', 'name email')
      .populate('tasks.assignedTo', 'name email')
      .populate('tasks.createdBy', 'name email')
      .populate('notes.author', 'name email');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check access permissions
    const hasAccess = req.user.role === 'admin' ||
      project.projectManager._id.toString() === req.user._id.toString() ||
      project.teamMembers.some(member => member.user._id.toString() === req.user._id.toString()) ||
      (project.client.engagementManager && 
       project.client.engagementManager.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this project'
      });
    }

    res.json({
      success: true,
      data: { project }
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching project'
    });
  }
};

const updateProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permissions
    const hasEditAccess = req.user.role === 'admin' ||
      project.projectManager.toString() === req.user._id.toString() ||
      project.createdBy.toString() === req.user._id.toString();

    if (!hasEditAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to edit this project'
      });
    }

    // Update budget if provided
    if (req.body.budgetAllocated !== undefined) {
      if (!project.budget) project.budget = {};
      project.budget.allocated = req.body.budgetAllocated;
    }
    if (req.body.budgetCurrency !== undefined) {
      if (!project.budget) project.budget = {};
      project.budget.currency = req.body.budgetCurrency;
    }

    // Update other fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'budgetAllocated' && key !== 'budgetCurrency' && 
          req.body[key] !== undefined) {
        project[key] = req.body[key];
      }
    });

    await project.save();
    await project.populate([
      { path: 'client', select: 'name code currency' },
      { path: 'projectManager', select: 'name email role' },
      { path: 'createdBy', select: 'name email' }
    ]);

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: { project }
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating project'
    });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permissions - only admin or project creator can delete
    const hasDeleteAccess = req.user.role === 'admin' ||
      project.createdBy.toString() === req.user._id.toString();

    if (!hasDeleteAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to delete this project'
      });
    }

    await Project.findByIdAndDelete(projectId);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting project'
    });
  }
};

const updateProjectStatus = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permissions
    const hasAccess = req.user.role === 'admin' ||
      project.projectManager.toString() === req.user._id.toString();

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to update project status'
      });
    }

    await project.updateStatus(status);

    res.json({
      success: true,
      message: 'Project status updated successfully',
      data: { project }
    });
  } catch (error) {
    console.error('Update project status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating project status'
    });
  }
};

const addTeamMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId, role, hourlyRate } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permissions
    const hasAccess = req.user.role === 'admin' ||
      project.projectManager.toString() === req.user._id.toString();

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to modify team members'
      });
    }

    await project.addTeamMember(userId, role, hourlyRate);
    await project.populate('teamMembers.user', 'name email role');

    res.json({
      success: true,
      message: 'Team member added successfully',
      data: { project }
    });
  } catch (error) {
    console.error('Add team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding team member'
    });
  }
};

const removeTeamMember = async (req, res) => {
  try {
    const { projectId, userId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permissions
    const hasAccess = req.user.role === 'admin' ||
      project.projectManager.toString() === req.user._id.toString();

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to modify team members'
      });
    }

    await project.removeTeamMember(userId);

    res.json({
      success: true,
      message: 'Team member removed successfully',
      data: { project }
    });
  } catch (error) {
    console.error('Remove team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error removing team member'
    });
  }
};

const addProjectNote = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { content, isPrivate } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Note content is required'
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    await project.addNote(content.trim(), req.user._id, isPrivate);
    await project.populate('notes.author', 'name email');

    res.json({
      success: true,
      message: 'Note added successfully',
      data: { project }
    });
  } catch (error) {
    console.error('Add project note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding note'
    });
  }
};

const getProjectStats = async (req, res) => {
  try {
    let matchQuery = {};

    // Role-based filtering
    if (req.user.role === 'engagement_manager') {
      const managedClients = await Client.find(
        { engagementManager: req.user._id },
        '_id'
      );
      const clientIds = managedClients.map(c => c._id);
      matchQuery.$or = [
        { client: { $in: clientIds } },
        { projectManager: req.user._id },
        { 'teamMembers.user': req.user._id }
      ];
    } else if (req.user.role === 'resource_manager') {
      matchQuery.$or = [
        { projectManager: req.user._id },
        { 'teamMembers.user': req.user._id }
      ];
    }

    const stats = await Project.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          activeProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          completedProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          overdueProjects: {
            $sum: { 
              $cond: [
                { 
                  $and: [
                    { $ne: ['$status', 'completed'] },
                    { $lt: ['$endDate', new Date()] }
                  ]
                }, 
                1, 0
              ]
            }
          },
          totalBudgetAllocated: { $sum: '$budget.allocated' },
          totalBudgetSpent: { $sum: '$budget.spent' },
          averageProgress: { $avg: '$progress' }
        }
      }
    ]);

    const result = stats[0] || {
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      overdueProjects: 0,
      totalBudgetAllocated: 0,
      totalBudgetSpent: 0,
      averageProgress: 0
    };

    res.json({
      success: true,
      data: { stats: result }
    });
  } catch (error) {
    console.error('Get project stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching project statistics'
    });
  }
};

module.exports = {
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
};