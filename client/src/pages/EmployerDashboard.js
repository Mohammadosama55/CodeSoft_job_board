import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  Plus, 
  Briefcase, 
  Users, 
  TrendingUp, 
  Eye,
  Calendar,
  DollarSign,
  MapPin
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const EmployerDashboard = () => {
  const { user } = useAuth();

  const { data: stats } = useQuery('employerStats', async () => {
    const response = await api.get('/users/stats');
    return response.data.stats;
  });

  const { data: jobs } = useQuery('employerJobs', async () => {
    const response = await api.get('/jobs/employer/my-jobs');
    return response.data.jobs;
  });

  const { data: applications } = useQuery('employerApplications', async () => {
    const response = await api.get('/applications/employer/applications');
    return response.data.applications;
  });

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      shortlisted: 'bg-green-100 text-green-800',
      interviewed: 'bg-purple-100 text-purple-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      reviewed: 'Reviewed',
      shortlisted: 'Shortlisted',
      interviewed: 'Interviewed',
      accepted: 'Accepted',
      rejected: 'Rejected',
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Employer Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
            </div>
            <Link
              to="/employer/post-job"
              className="btn btn-primary flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Post New Job
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Briefcase className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalJobs || 0}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Eye className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.activeJobs || 0}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalApplications || 0}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Recent Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.recentApplications || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Jobs */}
          <div className="card">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Job Postings</h3>
                <Link to="/jobs" className="text-primary-600 hover:text-primary-700 text-sm">
                  View All
                </Link>
              </div>
              
              {jobs?.length > 0 ? (
                <div className="space-y-4">
                  {jobs.slice(0, 5).map((job) => (
                    <div key={job._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{job.title}</h4>
                          <p className="text-sm text-gray-600">{job.company}</p>
                          <div className="flex items-center mt-1">
                            <MapPin className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-500">{job.location}</span>
                            <span className="mx-2 text-gray-300">•</span>
                            <span className="text-xs text-gray-500">{job.type}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`badge ${job.isActive ? 'badge-success' : 'badge-error'}`}>
                            {job.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {job.applications} application{job.applications !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
                  <p className="text-gray-600 mb-4">Start by posting your first job opening</p>
                  <Link to="/employer/post-job" className="btn btn-primary">
                    Post Your First Job
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Applications */}
          <div className="card">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
                <Link to="/applications" className="text-primary-600 hover:text-primary-700 text-sm">
                  View All
                </Link>
              </div>
              
              {applications?.length > 0 ? (
                <div className="space-y-4">
                  {applications.slice(0, 5).map((application) => (
                    <div key={application._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {application.candidate.firstName} {application.candidate.lastName}
                          </h4>
                          <p className="text-sm text-gray-600">{application.job.title}</p>
                          <div className="flex items-center mt-1">
                            <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-500">
                              Applied {new Date(application.appliedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`badge ${getStatusColor(application.status)}`}>
                            {getStatusLabel(application.status)}
                          </span>
                          {!application.isViewed && (
                            <div className="w-2 h-2 bg-red-500 rounded-full mt-1 ml-auto"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                  <p className="text-gray-600">Applications will appear here once candidates start applying</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/employer/post-job"
              className="card hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-center">
                <Plus className="h-8 w-8 text-primary-600 mr-4" />
                <div>
                  <h4 className="font-medium text-gray-900">Post New Job</h4>
                  <p className="text-sm text-gray-600">Create a new job listing</p>
                </div>
              </div>
            </Link>

            <Link
              to="/applications"
              className="card hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600 mr-4" />
                <div>
                  <h4 className="font-medium text-gray-900">Review Applications</h4>
                  <p className="text-sm text-gray-600">Manage job applications</p>
                </div>
              </div>
            </Link>

            <Link
              to="/profile"
              className="card hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600 mr-4" />
                <div>
                  <h4 className="font-medium text-gray-900">Company Profile</h4>
                  <p className="text-sm text-gray-600">Update company information</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard; 