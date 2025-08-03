const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    res.json({ user: req.user.getPublicProfile() });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
router.put('/profile', auth, [
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('phone').optional().trim(),
  body('location').optional().trim(),
  body('bio').optional().isLength({ max: 500 }),
  body('skills').optional().isArray(),
  body('experience').optional().isIn(['entry', 'mid', 'senior', 'executive']),
  body('education').optional().isIn(['high-school', 'bachelor', 'master', 'phd']),
  body('company').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updates = req.body;
    const allowedUpdates = [
      'firstName', 'lastName', 'phone', 'location', 'bio', 
      'skills', 'experience', 'education', 'company'
    ];
    
    allowedUpdates.forEach(update => {
      if (updates[update] !== undefined) {
        req.user[update] = updates[update];
      }
    });

    await req.user.save();

    res.json({ 
      message: 'Profile updated successfully',
      user: req.user.getPublicProfile()
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Upload resume (candidate only)
router.post('/resume', auth, async (req, res) => {
  try {
    if (req.user.role !== 'candidate') {
      return res.status(403).json({ message: 'Only candidates can upload resumes.' });
    }

    // In a real application, you would handle file upload here
    // For now, we'll just update the resume field
    const { filename, path } = req.body;

    req.user.resume = { filename, path };
    await req.user.save();

    res.json({
      message: 'Resume uploaded successfully',
      resume: req.user.resume
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user statistics
router.get('/stats', auth, async (req, res) => {
  try {
    let stats = {};

    if (req.user.role === 'employer') {
      // Employer statistics
      const Job = require('../models/Job');
      const Application = require('../models/Application');

      const totalJobs = await Job.countDocuments({ employer: req.user._id });
      const activeJobs = await Job.countDocuments({ 
        employer: req.user._id, 
        isActive: true 
      });
      const totalApplications = await Application.countDocuments({ employer: req.user._id });
      const recentApplications = await Application.countDocuments({
        employer: req.user._id,
        appliedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      });

      stats = {
        totalJobs,
        activeJobs,
        totalApplications,
        recentApplications
      };
    } else {
      // Candidate statistics
      const Application = require('../models/Application');

      const totalApplications = await Application.countDocuments({ candidate: req.user._id });
      const pendingApplications = await Application.countDocuments({ 
        candidate: req.user._id, 
        status: 'pending' 
      });
      const shortlistedApplications = await Application.countDocuments({ 
        candidate: req.user._id, 
        status: 'shortlisted' 
      });
      const acceptedApplications = await Application.countDocuments({ 
        candidate: req.user._id, 
        status: 'accepted' 
      });

      stats = {
        totalApplications,
        pendingApplications,
        shortlistedApplications,
        acceptedApplications
      };
    }

    res.json({ stats });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Search candidates (employer only)
router.get('/search-candidates', auth, async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ message: 'Only employers can search candidates.' });
    }

    const { search, skills, experience, location } = req.query;
    const filter = { role: 'candidate', isActive: true };

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (skills) {
      const skillArray = skills.split(',').map(skill => skill.trim());
      filter.skills = { $in: skillArray };
    }

    if (experience) {
      filter.experience = experience;
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    const candidates = await User.find(filter)
      .select('firstName lastName email location skills experience education bio')
      .limit(20);

    res.json({ candidates });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get candidate profile (public)
router.get('/candidate/:id', async (req, res) => {
  try {
    const candidate = await User.findById(req.params.id)
      .select('firstName lastName location skills experience education bio');

    if (!candidate || candidate.role !== 'candidate') {
      return res.status(404).json({ message: 'Candidate not found.' });
    }

    res.json({ candidate });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 