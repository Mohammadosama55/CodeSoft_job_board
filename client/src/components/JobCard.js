import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, DollarSign, Clock, Building } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const JobCard = ({ job }) => {
  const formatSalary = (min, max, currency = 'USD') => {
    const formatNumber = (num) => {
      if (num >= 1000000) {
        return `$${(num / 1000000).toFixed(1)}M`;
      } else if (num >= 1000) {
        return `$${(num / 1000).toFixed(0)}K`;
      }
      return `$${num.toLocaleString()}`;
    };
    
    return `${formatNumber(min)} - ${formatNumber(max)}`;
  };

  const getExperienceLabel = (experience) => {
    const labels = {
      'entry': 'Entry Level',
      'mid': 'Mid Level',
      'senior': 'Senior Level',
      'executive': 'Executive'
    };
    return labels[experience] || experience;
  };

  const getJobTypeLabel = (type) => {
    const labels = {
      'full-time': 'Full Time',
      'part-time': 'Part Time',
      'contract': 'Contract',
      'internship': 'Internship',
      'freelance': 'Freelance'
    };
    return labels[type] || type;
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              <Link 
                to={`/jobs/${job._id}`}
                className="hover:text-primary-600 transition-colors"
              >
                {job.title}
              </Link>
            </h3>
            <div className="flex items-center text-gray-600 mb-2">
              <Building className="h-4 w-4 mr-1" />
              <span>{job.company}</span>
            </div>
            <div className="flex items-center text-gray-600 mb-3">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{job.location}</span>
              {job.isRemote && (
                <span className="ml-2 badge badge-primary">Remote</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-gray-600">
            <DollarSign className="h-4 w-4 mr-1" />
            <span className="text-sm">
              {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
            </span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-1" />
            <span className="text-sm">
              {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="badge badge-primary">
            {getJobTypeLabel(job.type)}
          </span>
          <span className="badge badge-secondary">
            {getExperienceLabel(job.experience)}
          </span>
          {job.skills?.slice(0, 2).map((skill, index) => (
            <span key={index} className="badge badge-outline">
              {skill}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <Link
            to={`/jobs/${job._id}`}
            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            View Details →
          </Link>
          {job.applications > 0 && (
            <span className="text-sm text-gray-500">
              {job.applications} application{job.applications !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard; 