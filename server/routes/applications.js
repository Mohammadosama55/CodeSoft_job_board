const express = require('express');
const { body, validationResult } = require('express-validator');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { auth, requireEmployer, requireCandidate } = require('../middleware/auth');

const router = express.Router();

// Apply for a job (candidate only)
router.post('/', auth, requireCandidate, [
  body('jobId').notEmpty(),
  body('coverLetter').notEmpty().isLength({ max: 2000 }),
  body('expectedSalary').optional().isNumeric(),
  body('availability').optional().isIn(['immediate', '2-weeks', '1-month', '3-months', 'flexible'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { jobId, coverLetter, expectedSalary, availability } = req.body;

    // Check if job exists and is active
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    if (!job.isActive) {
      return res.status(400).json({ message: 'This job is no longer accepting applications.' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      candidate: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job.' });
    }

    const application = new Application({
      job: jobId,
      candidate: req.user._id,
      employer: job.employer,
      coverLetter,
      expectedSalary,
      availability
    });

    await application.save();

    // Increment job applications count
    await job.incrementApplications();

    res.status(201).json({
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get applications by candidate
router.get('/my-applications', auth, requireCandidate, async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user._id })
      .populate('job', 'title company location type salary')
      .populate('employer', 'firstName lastName company')
      .sort({ appliedAt: -1 });

    res.json({ applications });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get applications for employer's jobs
router.get('/employer/applications', auth, requireEmployer, async (req, res) => {
  try {
    const applications = await Application.find({ employer: req.user._id })
      .populate('job', 'title company location type')
      .populate('candidate', 'firstName lastName email phone location skills experience')
      .sort({ appliedAt: -1 });

    res.json({ applications });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single application
router.get('/:id', auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job', 'title company location type salary description requirements')
      .populate('candidate', 'firstName lastName email phone location skills experience bio')
      .populate('employer', 'firstName lastName company email phone');

    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    // Check authorization
    if (application.candidate._id.toString() !== req.user._id.toString() &&
        application.employer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this application.' });
    }

    // Mark as viewed if employer is viewing
    if (application.employer._id.toString() === req.user._id.toString() && !application.isViewed) {
      await application.markAsViewed();
    }

    res.json({ application });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update application status (employer only)
router.patch('/:id/status', auth, requireEmployer, [
  body('status').isIn(['pending', 'reviewed', 'shortlisted', 'interviewed', 'accepted', 'rejected']),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, notes } = req.body;

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    if (application.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this application.' });
    }

    application.status = status;
    if (notes) {
      application.notes.employer = notes;
    }

    await application.save();

    res.json({
      message: 'Application status updated successfully',
      application
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add notes to application (both candidate and employer)
router.post('/:id/notes', auth, [
  body('notes').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { notes } = req.body;

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    // Check authorization
    if (application.candidate.toString() !== req.user._id.toString() &&
        application.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to add notes to this application.' });
    }

    if (application.candidate.toString() === req.user._id.toString()) {
      application.notes.candidate = notes;
    } else {
      application.notes.employer = notes;
    }

    await application.save();

    res.json({
      message: 'Notes added successfully',
      application
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Withdraw application (candidate only)
router.delete('/:id', auth, requireCandidate, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    if (application.candidate.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to withdraw this application.' });
    }

    await application.remove();

    res.json({ message: 'Application withdrawn successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get application statistics for employer
router.get('/employer/stats', auth, requireEmployer, async (req, res) => {
  try {
    const stats = await Application.aggregate([
      { $match: { employer: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalApplications = await Application.countDocuments({ employer: req.user._id });
    const recentApplications = await Application.countDocuments({
      employer: req.user._id,
      appliedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    res.json({
      stats,
      totalApplications,
      recentApplications
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 