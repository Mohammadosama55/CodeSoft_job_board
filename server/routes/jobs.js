const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Job = require('../models/Job');
const { auth, requireEmployer } = require('../middleware/auth');

const router = express.Router();

// Get all jobs with filtering and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('search').optional().trim(),
  query('location').optional().trim(),
  query('type').optional().isIn(['full-time', 'part-time', 'contract', 'internship', 'freelance']),
  query('experience').optional().isIn(['entry', 'mid', 'senior', 'executive']),
  query('category').optional().trim(),
  query('remote').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = 1,
      limit = 10,
      search,
      location,
      type,
      experience,
      category,
      remote
    } = req.query;

    const filter = { isActive: true };

    // Search functionality
    if (search) {
      filter.$text = { $search: search };
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (type) {
      filter.type = type;
    }

    if (experience) {
      filter.experience = experience;
    }

    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }

    if (remote !== undefined) {
      filter.isRemote = remote === 'true';
    }

    const skip = (page - 1) * limit;

    const jobs = await Job.find(filter)
      .populate('employer', 'firstName lastName company')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(filter);

    res.json({
      jobs,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get featured jobs
router.get('/featured', async (req, res) => {
  try {
    const featuredJobs = await Job.find({ isActive: true, isFeatured: true })
      .populate('employer', 'firstName lastName company')
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({ jobs: featuredJobs });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single job by ID
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('employer', 'firstName lastName company email phone location');

    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    if (job.isActive) {
      await job.incrementViews();
    }

    res.json({ job });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new job (employer only)
router.post('/', auth, requireEmployer, [
  body('title').trim().notEmpty(),
  body('description').notEmpty(),
  body('requirements').notEmpty(),
  body('responsibilities').notEmpty(),
  body('location').trim().notEmpty(),
  body('type').isIn(['full-time', 'part-time', 'contract', 'internship', 'freelance']),
  body('experience').isIn(['entry', 'mid', 'senior', 'executive']),
  body('education').isIn(['high-school', 'bachelor', 'master', 'phd']),
  body('salary.min').isNumeric(),
  body('salary.max').isNumeric(),
  body('category').trim().notEmpty(),
  body('industry').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const jobData = {
      ...req.body,
      employer: req.user._id,
      company: req.user.company || req.body.company
    };

    const job = new Job(jobData);
    await job.save();

    res.status(201).json({
      message: 'Job created successfully',
      job
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update job (employer only)
router.put('/:id', auth, requireEmployer, [
  body('title').optional().trim().notEmpty(),
  body('description').optional().notEmpty(),
  body('requirements').optional().notEmpty(),
  body('responsibilities').optional().notEmpty(),
  body('location').optional().trim().notEmpty(),
  body('type').optional().isIn(['full-time', 'part-time', 'contract', 'internship', 'freelance']),
  body('experience').optional().isIn(['entry', 'mid', 'senior', 'executive']),
  body('education').optional().isIn(['high-school', 'bachelor', 'master', 'phd']),
  body('salary.min').optional().isNumeric(),
  body('salary.max').optional().isNumeric(),
  body('category').optional().trim().notEmpty(),
  body('industry').optional().trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this job.' });
    }

    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        job[key] = req.body[key];
      }
    });

    await job.save();

    res.json({
      message: 'Job updated successfully',
      job
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete job (employer only)
router.delete('/:id', auth, requireEmployer, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this job.' });
    }

    await job.remove();

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get jobs by employer
router.get('/employer/my-jobs', auth, requireEmployer, async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ jobs });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Toggle job status (active/inactive)
router.patch('/:id/toggle-status', auth, requireEmployer, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this job.' });
    }

    job.isActive = !job.isActive;
    await job.save();

    res.json({
      message: `Job ${job.isActive ? 'activated' : 'deactivated'} successfully`,
      job
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 