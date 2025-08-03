import React from 'react';
import { useParams } from 'react-router-dom';

const JobDetail = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Job Details</h1>
            <p className="text-gray-600">Job ID: {id}</p>
            <p className="text-gray-600 mt-4">This page will show detailed job information and application form.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail; 