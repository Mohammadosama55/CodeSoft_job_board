# Job Board Website

A comprehensive job board platform built with React, Node.js, and MongoDB. This application allows employers to post job openings and job seekers to search and apply for jobs.

## Features

### For Job Seekers
- **User Registration & Authentication**: Secure signup and login with role-based access
- **Job Search**: Advanced search functionality with filters (location, job type, experience level)
- **Job Applications**: Easy application process with resume upload
- **Application Tracking**: View and track application status
- **Profile Management**: Update personal information, skills, and experience
- **Dashboard**: Overview of applications and job recommendations

### For Employers
- **Job Posting**: Create and manage job listings with detailed requirements
- **Application Management**: Review and manage job applications
- **Candidate Search**: Search and filter candidates by skills and experience
- **Dashboard**: Analytics and overview of job postings and applications
- **Email Notifications**: Get notified of new applications

### General Features
- **Responsive Design**: Modern, mobile-friendly UI built with Tailwind CSS
- **Real-time Updates**: Live application status updates
- **Search & Filter**: Advanced job search with multiple filters
- **Security**: JWT authentication, password hashing, and input validation
- **Email Integration**: Automated email notifications for applications

## Tech Stack

### Backend
- **Node.js**: Server runtime
- **Express.js**: Web framework
- **MongoDB**: Database with Mongoose ODM
- **JWT**: Authentication
- **bcryptjs**: Password hashing
- **express-validator**: Input validation
- **multer**: File upload handling
- **nodemailer**: Email notifications
- **helmet**: Security middleware
- **cors**: Cross-origin resource sharing

### Frontend
- **React**: UI library
- **React Router**: Client-side routing
- **React Query**: Data fetching and caching
- **React Hook Form**: Form handling and validation
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Axios**: HTTP client
- **React Hot Toast**: Toast notifications

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd job_board
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

3. **Environment Setup**
   ```bash
   # Copy environment example file
   cp env.example .env
   
   # Edit .env file with your configuration
   nano .env
   ```

4. **Configure Environment Variables**
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/job-board
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   
   # Email Configuration (optional)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

5. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

6. **Run the application**
   ```bash
   # Development mode (runs both server and client)
   npm run dev
   
   # Or run separately:
   # Server only
   npm run server
   
   # Client only
   cd client && npm start
   ```

## Project Structure

```
job_board/
├── server/
│   ├── index.js              # Main server file
│   ├── models/               # Database models
│   │   ├── User.js
│   │   ├── Job.js
│   │   └── Application.js
│   ├── routes/               # API routes
│   │   ├── auth.js
│   │   ├── jobs.js
│   │   ├── applications.js
│   │   └── users.js
│   └── middleware/           # Custom middleware
│       └── auth.js
├── client/
│   ├── public/              # Static files
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React contexts
│   │   ├── utils/           # Utility functions
│   │   └── index.css        # Global styles
│   ├── package.json
│   └── tailwind.config.js
├── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Jobs
- `GET /api/jobs` - Get all jobs with filters
- `GET /api/jobs/featured` - Get featured jobs
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs` - Create job (employer only)
- `PUT /api/jobs/:id` - Update job (employer only)
- `DELETE /api/jobs/:id` - Delete job (employer only)

### Applications
- `POST /api/applications` - Apply for job
- `GET /api/applications/my-applications` - Get user applications
- `GET /api/applications/employer/applications` - Get employer applications
- `GET /api/applications/:id` - Get single application
- `PATCH /api/applications/:id/status` - Update application status

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/stats` - Get user statistics
- `GET /api/users/search-candidates` - Search candidates (employer only)

## Usage

### For Job Seekers
1. Register as a "Job Seeker"
2. Complete your profile with skills and experience
3. Browse available jobs using search and filters
4. Apply for jobs with a cover letter
5. Track your application status in the dashboard

### For Employers
1. Register as an "Employer"
2. Add your company information
3. Post job openings with detailed requirements
4. Review incoming applications
5. Manage application status and communicate with candidates

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@jobboard.com or create an issue in the repository.

## Future Enhancements

- [ ] Real-time chat between employers and candidates
- [ ] Advanced analytics and reporting
- [ ] Resume parsing and skill matching
- [ ] Video interview integration
- [ ] Multi-language support
- [ ] Mobile app development
- [ ] AI-powered job recommendations
- [ ] Integration with LinkedIn and other platforms 