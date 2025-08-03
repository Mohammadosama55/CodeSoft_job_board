const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'interviewed', 'accepted', 'rejected'],
    default: 'pending'
  },
  coverLetter: {
    type: String,
    required: true,
    maxlength: 2000
  },
  resume: {
    filename: String,
    path: String
  },
  additionalDocuments: [{
    filename: String,
    path: String,
    description: String
  }],
  expectedSalary: {
    type: Number
  },
  availability: {
    type: String,
    enum: ['immediate', '2-weeks', '1-month', '3-months', 'flexible']
  },
  notes: {
    employer: String,
    candidate: String
  },
  isViewed: {
    type: Boolean,
    default: false
  },
  viewedAt: {
    type: Date
  },
  appliedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure unique application per candidate per job
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

// Method to mark as viewed
applicationSchema.methods.markAsViewed = function() {
  this.isViewed = true;
  this.viewedAt = new Date();
  return this.save();
};

// Method to update status
applicationSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  return this.save();
};

module.exports = mongoose.model('Application', applicationSchema); 