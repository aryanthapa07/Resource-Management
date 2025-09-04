const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Task title cannot be more than 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Task description cannot be more than 1000 characters']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'review', 'completed'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  dueDate: Date,
  completedAt: Date,
  estimatedHours: {
    type: Number,
    min: 0
  },
  actualHours: {
    type: Number,
    min: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const milestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Milestone title cannot be more than 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Milestone description cannot be more than 1000 characters']
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'overdue'],
    default: 'pending'
  },
  completedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const budgetSchema = new mongoose.Schema({
  allocated: {
    type: Number,
    min: 0,
    default: 0
  },
  spent: {
    type: Number,
    min: 0,
    default: 0
  },
  currency: {
    type: String,
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR', 'CNY'],
    default: 'USD'
  }
});

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [200, 'Project name cannot be more than 200 characters']
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client is required']
  },
  projectManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Project manager is required']
  },
  teamMembers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      default: 'team_member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    hourlyRate: {
      type: Number,
      min: 0
    }
  }],
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(endDate) {
        return !this.startDate || endDate >= this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  actualStartDate: Date,
  actualEndDate: Date,
  status: {
    type: String,
    enum: ['planning', 'active', 'on_hold', 'completed', 'cancelled'],
    default: 'planning'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  budget: budgetSchema,
  milestones: [milestoneSchema],
  tasks: [taskSchema],
  tags: [String],
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: [{
    content: {
      type: String,
      required: true,
      maxlength: [2000, 'Note cannot be more than 2000 characters']
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isPrivate: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  metrics: {
    totalHours: {
      type: Number,
      default: 0
    },
    completedTasks: {
      type: Number,
      default: 0
    },
    totalTasks: {
      type: Number,
      default: 0
    },
    overdueTasks: {
      type: Number,
      default: 0
    },
    budgetUtilization: {
      type: Number,
      default: 0
    }
  },
  settings: {
    isPublic: {
      type: Boolean,
      default: false
    },
    allowClientAccess: {
      type: Boolean,
      default: false
    },
    notifyOnUpdates: {
      type: Boolean,
      default: true
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better query performance
projectSchema.index({ client: 1 });
projectSchema.index({ projectManager: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ startDate: 1 });
projectSchema.index({ endDate: 1 });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ name: 'text', description: 'text' });

// Pre-save middleware
projectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Update progress based on completed tasks
  if (this.tasks && this.tasks.length > 0) {
    const completedTasks = this.tasks.filter(task => task.status === 'completed').length;
    this.progress = Math.round((completedTasks / this.tasks.length) * 100);
    this.metrics.totalTasks = this.tasks.length;
    this.metrics.completedTasks = completedTasks;
  }
  
  // Update budget utilization
  if (this.budget && this.budget.allocated > 0) {
    this.metrics.budgetUtilization = Math.round((this.budget.spent / this.budget.allocated) * 100);
  }
  
  next();
});

// Virtual fields
projectSchema.virtual('duration').get(function() {
  if (!this.startDate || !this.endDate) return 0;
  return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
});

projectSchema.virtual('isOverdue').get(function() {
  if (this.status === 'completed' || !this.endDate) return false;
  return new Date() > this.endDate;
});

projectSchema.virtual('daysRemaining').get(function() {
  if (!this.endDate || this.status === 'completed') return 0;
  const today = new Date();
  const timeDiff = this.endDate - today;
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
});

projectSchema.virtual('teamSize').get(function() {
  return this.teamMembers ? this.teamMembers.length : 0;
});

// Instance methods
projectSchema.methods.addTeamMember = function(userId, role = 'team_member', hourlyRate = 0) {
  const existingMember = this.teamMembers.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (!existingMember) {
    this.teamMembers.push({
      user: userId,
      role,
      hourlyRate
    });
  }
  
  return this.save();
};

projectSchema.methods.removeTeamMember = function(userId) {
  this.teamMembers = this.teamMembers.filter(member => 
    member.user.toString() !== userId.toString()
  );
  return this.save();
};

projectSchema.methods.addNote = function(content, authorId, isPrivate = false) {
  this.notes.push({
    content,
    author: authorId,
    isPrivate
  });
  return this.save();
};

projectSchema.methods.addMilestone = function(milestoneData) {
  this.milestones.push(milestoneData);
  return this.save();
};

projectSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  
  if (newStatus === 'active' && !this.actualStartDate) {
    this.actualStartDate = new Date();
  }
  
  if (newStatus === 'completed') {
    this.actualEndDate = new Date();
    this.progress = 100;
  }
  
  return this.save();
};

// Static methods
projectSchema.statics.getProjectsByManager = function(managerId) {
  return this.find({ projectManager: managerId })
    .populate('client', 'name code')
    .populate('projectManager', 'name email')
    .sort({ updatedAt: -1 });
};

projectSchema.statics.getProjectsByClient = function(clientId) {
  return this.find({ client: clientId })
    .populate('projectManager', 'name email')
    .sort({ updatedAt: -1 });
};

projectSchema.statics.getActiveProjects = function() {
  return this.find({ status: { $in: ['active', 'planning'] } })
    .populate('client', 'name code')
    .populate('projectManager', 'name email')
    .sort({ startDate: 1 });
};

// Transform output
projectSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Project', projectSchema);