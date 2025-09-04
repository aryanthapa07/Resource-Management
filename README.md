# Resource Management System (MERN Stack)

A comprehensive resource management system built with MongoDB, Express.js, React, and Node.js, featuring JWT-based authentication and role-based access control.

## 🚀 Features

### Authentication & Authorization
- JWT-based authentication system
- Role-based access control (RBAC)
- User registration and login
- Protected routes
- Password hashing with bcrypt
- Token refresh mechanism

### User Roles
- **Admin**: Full system access, user management, department management, reports
- **Resource Manager**: Team management, resource allocation, request processing
- **Engagement Manager**: Project management, resource requests, team viewing

### Frontend Features
- Modern React application with hooks
- Responsive design with Tailwind CSS
- Toast notifications for user feedback
- Form validation and error handling
- Protected routing system
- Role-based navigation menus
- User profile management

### Backend Features
- RESTful API design
- MongoDB with Mongoose ODM
- Input validation with express-validator
- Rate limiting and security middleware
- CORS configuration
- Error handling middleware

## 🏗️ Project Structure

```
/
├── server/                 # Backend API
│   ├── config/            # Database & auth configuration
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Auth & RBAC middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   └── server.js         # Express server setup
│
└── client/                # React frontend
    ├── public/           # Static files
    └── src/
        ├── components/   # Reusable components
        ├── pages/        # Route components
        ├── context/      # React context providers
        ├── services/     # API services
        └── utils/        # Helper functions
```

## 📋 Prerequisites

- Node.js (version 21.3.0 recommended)
- MongoDB (local or MongoDB Atlas)
- npm or yarn package manager

## 🔧 Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd resource-management
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the server directory:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/resource_management
JWT_SECRET=your_jwt_secret_key_here_make_it_very_long_and_secure
JWT_EXPIRES_IN=7d
```

### 3. Frontend Setup
```bash
cd client
npm install
```

Create a `.env` file in the client directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🚀 Running the Application

### Start the Backend Server
```bash
cd server
npm run dev
```
The server will run on http://localhost:5000

### Start the Frontend
```bash
cd client
npm start
```
The React app will run on http://localhost:3000

## 📱 User Interface

### Authentication Pages
- **Login**: Clean login form with validation
- **Register**: User registration with role selection

### Dashboard
- Role-based dashboard content
- Quick action cards
- Statistics overview
- Responsive grid layout

### Profile Management
- View and edit profile information
- Skill management
- Password change functionality
- Availability status updates

### Navigation
- Role-based menu items
- User profile dropdown
- Responsive mobile menu
- Active route highlighting

## 🔐 API Endpoints

### Authentication Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Health Check
- `GET /api/health` - Server health status

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Input validation and sanitization
- Security headers with helmet
- Protected routes with middleware

## 🎨 Styling & Design

- **Tailwind CSS**: Utility-first CSS framework
- **Custom Components**: Reusable UI components
- **Responsive Design**: Mobile-first approach
- **Modern UI**: Clean, professional interface
- **Toast Notifications**: User feedback system
- **Form Validation**: Real-time validation with error states

## 📊 Data Models

### User Model
- Personal information (name, email, password)
- Role assignment (admin, resource_manager, engagement_manager)
- Profile details (skills, experience, availability)
- Department association
- Timestamps and status tracking

### Department Model
- Department information (name, code, description)
- Resource manager assignment
- Job titles and requirements
- Budget tracking
- Employee associations

## 🔄 State Management

- **React Context**: Global authentication state
- **useReducer**: Complex state updates
- **Local State**: Component-specific data
- **Persistent Storage**: JWT token in cookies

## 📈 Future Enhancements

- Project management features
- Resource allocation system
- Request and approval workflow
- Advanced reporting and analytics
- Real-time notifications
- File upload capabilities
- Advanced search and filtering
- Department management interface
- Team collaboration tools

## 🧪 Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Update CORS origins for production domains
3. Use production MongoDB instance
4. Deploy to your preferred platform (Heroku, AWS, etc.)

### Frontend Deployment
1. Update API URL for production
2. Build the production bundle: `npm run build`
3. Deploy to static hosting (Netlify, Vercel, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, please contact the development team or create an issue in the repository.