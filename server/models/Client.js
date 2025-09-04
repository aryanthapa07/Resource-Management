const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  category: {
    type: String,
    enum: ['proposal', 'contract', 'sow', 'invoice', 'report', 'other'],
    default: 'other'
  }
});

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true,
    maxlength: [200, 'Client name cannot be more than 200 characters']
  },
  code: {
    type: String,
    required: [true, 'Client code is required'],
    uppercase: true,
    unique: true,
    match: [/^[A-Z0-9]{2,20}$/, 'Client code must be 2-20 uppercase letters/numbers']
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    uppercase: true,
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR', 'CNY'],
    default: 'USD'
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  contactInfo: {
    email: {
      type: String,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email'
      ]
    },
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String
    },
    website: String
  },
  primaryContact: {
    name: String,
    title: String,
    email: {
      type: String,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email'
      ]
    },
    phone: String
  },
  businessInfo: {
    industry: String,
    size: {
      type: String,
      enum: ['startup', 'small', 'medium', 'large', 'enterprise']
    },
    revenue: String,
    employees: Number
  },
  documents: [documentSchema],
  status: {
    type: String,
    enum: ['active', 'inactive', 'prospect', 'archived'],
    default: 'active'
  },
  engagementManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  billing: {
    taxId: String,
    billingCycle: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly', 'annually'],
      default: 'monthly'
    },
    paymentTerms: {
      type: Number,
      default: 30
    },
    discount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  tags: [String],
  notes: [{
    content: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  metrics: {
    totalRevenue: {
      type: Number,
      default: 0
    },
    totalProjects: {
      type: Number,
      default: 0
    },
    averageProjectValue: {
      type: Number,
      default: 0
    },
    lastEngagement: Date
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

clientSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

clientSchema.index({ name: 'text', description: 'text', code: 'text' });
clientSchema.index({ status: 1 });
clientSchema.index({ engagementManager: 1 });
clientSchema.index({ createdAt: -1 });

clientSchema.virtual('documentCount').get(function() {
  return this.documents.length;
});

clientSchema.virtual('activeProjects').get(function() {
  return this.projects.length;
});

clientSchema.methods.addDocument = function(documentData) {
  this.documents.push(documentData);
  return this.save();
};

clientSchema.methods.removeDocument = function(documentId) {
  this.documents.pull({ _id: documentId });
  return this.save();
};

clientSchema.methods.addNote = function(content, authorId) {
  this.notes.push({
    content,
    author: authorId
  });
  return this.save();
};

clientSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Client', clientSchema);