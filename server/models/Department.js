const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Department name is required'],
    trim: true,
    unique: true,
    maxlength: [100, 'Department name cannot be more than 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Department code is required'],
    uppercase: true,
    unique: true,
    match: [/^[A-Z0-9]{2,10}$/, 'Department code must be 2-10 uppercase letters/numbers']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  resourceManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Resource manager is required']
  },
  jobTitles: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    level: {
      type: String,
      enum: ['junior', 'mid', 'senior', 'lead', 'principal'],
      default: 'junior'
    },
    requiredSkills: [String],
    description: String
  }],
  budget: {
    allocated: {
      type: Number,
      default: 0
    },
    used: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
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

departmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

departmentSchema.virtual('employees', {
  ref: 'User',
  localField: '_id',
  foreignField: 'department'
});

departmentSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Department', departmentSchema);