import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              
              <Route
                path="clients"
                element={
                  <ProtectedRoute requiredRoles={['admin', 'engagement_manager']}>
                    <Clients />
                  </ProtectedRoute>
                }
              />
              <Route
                path="clients/:clientId"
                element={
                  <ProtectedRoute requiredRoles={['admin', 'engagement_manager']}>
                    <ClientDetail />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="users"
                element={
                  <ProtectedRoute requiredRoles={['admin']}>
                    <div className="text-center p-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Users Management</h2>
                      <p className="text-gray-600">This feature is coming soon!</p>
                    </div>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="departments"
                element={
                  <ProtectedRoute requiredRoles={['admin']}>
                    <div className="text-center p-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Departments Management</h2>
                      <p className="text-gray-600">This feature is coming soon!</p>
                    </div>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="reports"
                element={
                  <ProtectedRoute requiredRoles={['admin']}>
                    <div className="text-center p-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Reports</h2>
                      <p className="text-gray-600">This feature is coming soon!</p>
                    </div>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="team"
                element={
                  <ProtectedRoute requiredRoles={['resource_manager']}>
                    <div className="text-center p-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">My Team</h2>
                      <p className="text-gray-600">This feature is coming soon!</p>
                    </div>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="allocations"
                element={
                  <ProtectedRoute requiredRoles={['resource_manager']}>
                    <div className="text-center p-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Resource Allocations</h2>
                      <p className="text-gray-600">This feature is coming soon!</p>
                    </div>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="projects"
                element={
                  <ProtectedRoute requiredRoles={['admin', 'engagement_manager', 'resource_manager']}>
                    <Projects />
                  </ProtectedRoute>
                }
              />
              <Route
                path="projects/:projectId"
                element={
                  <ProtectedRoute requiredRoles={['admin', 'engagement_manager', 'resource_manager']}>
                    <ProjectDetail />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="resources"
                element={
                  <ProtectedRoute requiredRoles={['engagement_manager']}>
                    <div className="text-center p-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Resources</h2>
                      <p className="text-gray-600">This feature is coming soon!</p>
                    </div>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="requests"
                element={
                  <div className="text-center p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Requests</h2>
                    <p className="text-gray-600">This feature is coming soon!</p>
                  </div>
                }
              />
              
              <Route
                path="settings"
                element={
                  <div className="text-center p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
                    <p className="text-gray-600">This feature is coming soon!</p>
                  </div>
                }
              />
            </Route>
            
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;